import { RequestHandler } from 'express';
import Employee from '@/models/portals/auths/Employee';
import { sendSuccessResponse } from '@/utils/http/res.response';
import { sendErrorResponse } from '@/utils/http/errors.response';
import { hashPassword, comparePassword, generateToken, generateRefreshToken, verifyRefreshToken } from '@/utils/auth';
import { JwtPayload } from 'jsonwebtoken';
import { asyncHandler } from '@/utils/asyncHandler';

class EmployeeAuthController {

    public register: RequestHandler = asyncHandler(async (req, res) => {
        const { name, email, password, role } = req.body;

        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
                return sendErrorResponse({ res, message: 'Employee already exists', status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        const newEmployee = new Employee({
            name,
            email,
            password: hashedPassword,
            role: role || 'employee'
        });

        await newEmployee.save();

        return sendSuccessResponse({ res, message: 'Employee registered successfully', status: 201 });
    });

    public login: RequestHandler = asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        const employee = await Employee.findOne({ email });
        if (!employee) {
            return sendErrorResponse({ res, message: 'Invalid credentials', status: 400 });
        }

        const isMatch = await comparePassword(password, employee.password);
        if (!isMatch) {
            return sendErrorResponse({ res, message: 'Invalid credentials', status: 400 });
        }

        const accessToken = generateToken({ id: employee._id, role: employee.role });
        const refreshToken = generateRefreshToken({ id: employee._id, role: employee.role });

        return sendSuccessResponse({ res, message: 'Login successful', data: { accessToken, refreshToken, employee: { id: employee._id, name: employee.name, email: employee.email, role: employee.role } } });
    });

    public refreshToken: RequestHandler = asyncHandler(async (req, res) => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return sendErrorResponse({ res, message: 'Refresh Token is required', status: 400 });
        }

        try {
            const decoded = verifyRefreshToken(refreshToken) as JwtPayload;
            const accessToken = generateToken({ id: decoded.id, role: decoded.role });
            
            return sendSuccessResponse({ res, message: 'Token refreshed successfully', data: { accessToken } });

        } catch (err) {
            return sendErrorResponse({ res, message: 'Invalid or expired refresh token', status: 403 });
        }
    });

    public createEmployee: RequestHandler = asyncHandler(async (req, res) => {
        const { name, email, password, role, department, jobTitle } = req.body;

        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return sendErrorResponse({ res, message: 'Employee with this email already exists', status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        const newEmployee = new Employee({
            name,
            email,
            password: hashedPassword,
            role: role || 'employee',
            department,
            jobTitle
        });

        await newEmployee.save();

        return sendSuccessResponse({ res, message: 'Employee created successfully', data: newEmployee, status: 201 });
    });

    public logout: RequestHandler = asyncHandler(async (req, res) => {
        // For cookie based handling
        res.clearCookie('token'); 
        return sendSuccessResponse({ res, message: 'Logout successful' });
    });
}

export default new EmployeeAuthController();
