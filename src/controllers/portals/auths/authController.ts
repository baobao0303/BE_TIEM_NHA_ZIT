import { RequestHandler } from 'express';
import Admin from '@/models/portals/auths/Admin';
import { sendSuccessResponse } from '@/utils/http/res.response';
import { sendErrorResponse } from '@/utils/http/errors.response';
import { hashPassword, comparePassword, generateToken, generateRefreshToken, verifyRefreshToken } from '@/utils/auth';
import { JwtPayload } from 'jsonwebtoken';

class AuthController {
    public register: RequestHandler = async (req, res) => {
        try {
            const { name, email, password, role } = req.body;

            // Check if admin already exists
            const existingAdmin = await Admin.findOne({ email });
            if (existingAdmin) {
                 return sendErrorResponse({ res, message: 'Admin already exists', status: 400 });
            }

            // Hash password
            const hashedPassword = await hashPassword(password);

            // Create new admin
            const newAdmin = new Admin({
                name,
                email,
                password: hashedPassword,
                role
            });

            await newAdmin.save();

            return sendSuccessResponse({ res, message: 'Admin registered successfully', status: 201 });

        } catch (error) {
            console.error(error);
            return sendErrorResponse({ res, message: 'Internal server error', status: 500 });
        }
    }

    public login: RequestHandler = async (req, res) => {
        try {
            const { email, password } = req.body;

            // Check if admin exists
            const admin = await Admin.findOne({ email });
            if (!admin) {
                return sendErrorResponse({ res, message: 'Invalid credentials', status: 400 });
            }

            // Check password
            const isMatch = await comparePassword(password, admin.password);
            if (!isMatch) {
                return sendErrorResponse({ res, message: 'Invalid credentials', status: 400 });
            }

            // Generate Tokens
            const accessToken = generateToken({ id: admin._id, role: admin.role }); // 1h
            const refreshToken = generateRefreshToken({ id: admin._id, role: admin.role }); // 7d

            return sendSuccessResponse({ res, message: 'Login successful', data: { accessToken, refreshToken, admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } } });

        } catch (error) {
             console.error(error);
             return sendErrorResponse({ res, message: 'Internal server error', status: 500 });
        }
    }

    public refreshToken: RequestHandler = async (req, res) => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return sendErrorResponse({ res, message: 'Refresh Token is required', status: 400 });
            }

            try {
                const decoded = verifyRefreshToken(refreshToken) as JwtPayload;
                
                // Optional: Check if user still exists/is active
                // const admin = await Admin.findById(decoded.id);
                // if (!admin) return sendErrorResponse({ res, message: 'User not found', status: 404 });

                // Generate new Access Token
                const accessToken = generateToken({ id: decoded.id, role: decoded.role });
                
                return sendSuccessResponse({ res, message: 'Token refreshed successfully', data: { accessToken } });

            } catch (err) {
                return sendErrorResponse({ res, message: 'Invalid or expired refresh token', status: 403 });
            }
        } catch (error) {
            console.error(error);
            return sendErrorResponse({ res, message: 'Internal server error', status: 500 });
        }
    }

    public logout: RequestHandler = async (req, res) => {
        try {
            res.clearCookie('token'); // Matching the cookie name implied, usually handled by client in bearer auth but good for completeness if cookies used later
            return sendSuccessResponse({ res, message: 'Logout successful' });
        } catch (error) {
            console.error(error);
            return sendErrorResponse({ res, message: 'Internal server error', status: 500 });
        }
    }
}

export default new AuthController();
