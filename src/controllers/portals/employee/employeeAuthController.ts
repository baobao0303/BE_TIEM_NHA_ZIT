import { RequestHandler } from "express";
import Employee from "@/models/portals/auths/Employee";
import { sendSuccessResponse } from "@/utils/http/res.response";
import { sendErrorResponse } from "@/utils/http/errors.response";
import { hashPassword, comparePassword, generateToken, generateRefreshToken, verifyRefreshToken } from "@/utils/auth";
import { JwtPayload } from "jsonwebtoken";
import { asyncHandler } from "@/utils/asyncHandler";
import { OAuth2Client } from "google-auth-library";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } from "@/config";

const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

class EmployeeAuthController {
  public register: RequestHandler = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return sendErrorResponse({ res, message: "Nhân viên đã tồn tại", status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const newEmployee = new Employee({
      name,
      email,
      password: hashedPassword,
      role: role || "employee",
    });

    await newEmployee.save();

    return sendSuccessResponse({ res, message: "Đăng ký nhân viên thành công", status: 201 });
  });

  public login: RequestHandler = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ email });
    if (!employee) {
      return sendErrorResponse({ res, message: "Email hoặc mật khẩu không chính xác", status: 400 });
    }

    const isMatch = await comparePassword(password, employee.password);
    if (!isMatch) {
      return sendErrorResponse({ res, message: "Email hoặc mật khẩu không chính xác", status: 400 });
    }

    const accessToken = generateToken({ id: employee._id, role: employee.role });
    const refreshToken = generateRefreshToken({ id: employee._id, role: employee.role });

    // Lưu refreshToken vào HttpOnly cookie
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    return sendSuccessResponse({
      res,
      message: "Đăng nhập thành công",
      data: {
        accessToken,
        // Không trả refreshToken trong body nữa
        employee: { id: employee._id, name: employee.name, email: employee.email, role: employee.role },
      },
    });
  });

  // In-memory store for temporary codes (Production should use Redis)
  private tempAuthCodes = new Map<string, { userId: string; expires: number }>();

  public getGoogleUrl: RequestHandler = (req, res) => {
    const redirectUrl = client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
    });
    return sendSuccessResponse({ res, message: "Đã tạo URL xác thực Google", data: { url: redirectUrl } });
  };

  public exchangeCode: RequestHandler = asyncHandler(async (req, res) => {
    // Chỉ lấy code từ cookie, không nhận từ body nữa
    const code = (req as any).cookies?.temp_auth_code as string | undefined;

    if (!code || !this.tempAuthCodes.has(code)) {
      return sendErrorResponse({ res, message: "Mã không hợp lệ hoặc đã hết hạn", status: 400 });
    }

    const data = this.tempAuthCodes.get(code)!;

    if (Date.now() > data.expires) {
      this.tempAuthCodes.delete(code);
      res.clearCookie("temp_auth_code");
      return sendErrorResponse({ res, message: "Mã đã hết hạn", status: 400 });
    }

    const employee = await Employee.findById(data.userId);
    this.tempAuthCodes.delete(code); // Consume code
    res.clearCookie("temp_auth_code");

    if (!employee) {
      return sendErrorResponse({ res, message: "Không tìm thấy người dùng", status: 404 });
    }

    const accessToken = generateToken({ id: employee._id, role: employee.role });
    const refreshToken = generateRefreshToken({ id: employee._id, role: employee.role });

    // Lưu refreshToken vào HttpOnly cookie
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    return sendSuccessResponse({
      res,
      message: "Đăng nhập thành công",
      data: {
        accessToken,
        // Không trả refreshToken trong body nữa
        employee: {
          id: employee._id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          image: employee.image,
        },
      },
    });
  });

  public getMe: RequestHandler = asyncHandler(async (req, res) => {
    // Lấy refreshToken từ cookie
    const refreshToken = (req as any).cookies?.refreshToken;

    if (!refreshToken) {
      return sendErrorResponse({ res, message: "Chưa đăng nhập", status: 401 });
    }

    try {
      const decoded = verifyRefreshToken(refreshToken) as JwtPayload;

      // Tìm user
      const employee = await Employee.findById(decoded.id);
      if (!employee) {
        return sendErrorResponse({ res, message: "Không tìm thấy người dùng", status: 404 });
      }

      // Tạo accessToken mới
      const accessToken = generateToken({ id: employee._id, role: employee.role });

      return sendSuccessResponse({
        res,
        message: "Xác thực thành công",
        data: {
          accessToken,
          employee: {
            id: employee._id,
            name: employee.name,
            email: employee.email,
            role: employee.role,
            image: employee.image,
          },
        },
      });
    } catch (err) {
      res.clearCookie("refreshToken");
      return sendErrorResponse({ res, message: "Token không hợp lệ", status: 403 });
    }
  });

  public refreshToken: RequestHandler = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendErrorResponse({ res, message: "Cần có Refresh Token", status: 400 });
    }

    try {
      const decoded = verifyRefreshToken(refreshToken) as JwtPayload;
      const accessToken = generateToken({ id: decoded.id, role: decoded.role });

      return sendSuccessResponse({ res, message: "Làm mới token thành công", data: { accessToken } });
    } catch (err) {
      return sendErrorResponse({ res, message: "Refresh token không hợp lệ hoặc đã hết hạn", status: 403 });
    }
  });

  public createEmployee: RequestHandler = asyncHandler(async (req, res) => {
    const { name, email, password, role, department, jobTitle } = req.body;

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return sendErrorResponse({ res, message: "Nhân viên với email này đã tồn tại", status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const newEmployee = new Employee({
      name,
      email,
      password: hashedPassword,
      role: role || "employee",
      department,
      jobTitle,
    });

    await newEmployee.save();

    return sendSuccessResponse({ res, message: "Tạo nhân viên thành công", data: newEmployee, status: 201 });
  });

  public logout: RequestHandler = asyncHandler(async (req, res) => {
    // Clear cookies
    res.clearCookie("refreshToken");
    res.clearCookie("temp_auth_code");
    return sendSuccessResponse({ res, message: "Đăng xuất thành công" });
  });
}

export default new EmployeeAuthController();
