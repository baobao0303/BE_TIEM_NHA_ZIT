import { Response, NextFunction } from 'express';
import { CustomRequest } from '@/utils/http/req.response';
import { sendErrorResponse } from '@/utils/http/errors.response';
import { verifyToken } from '@/utils/auth';
import Admin from '@/models/portals/auths/Admin';
import Employee from '@/models/portals/auths/Employee';
import Role from '@/models/portals/auths/Role';
import { JwtPayload } from 'jsonwebtoken';

export const hasPermission = (permission: string) => {
    return async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                 return sendErrorResponse({ res, message: 'Not authorized', status: 401 });
            }

            // If user is Employee, they might rely on Role too, or just Admin. 
            // The original code checked req.user.role (slug).
            // Both Admin and Employee models have 'role' field as string (slug).
            
            const role = await Role.findOne({ slug: req.user.role });
            if (!role) {
                return sendErrorResponse({ res, message: 'Role not found', status: 403 });
            }

            if (!role.permissions.includes(permission) && !role.permissions.includes('*')) {
                 return sendErrorResponse({ res, message: 'You do not have permission to perform this action', status: 403 });
            }

            next();
        } catch (error) {
            console.error(error);
             return sendErrorResponse({ res, message: 'Authorization error', status: 500 });
        }
    }
};

export const protect = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        let token;
        let decoded: JwtPayload | undefined; // Initialize decoded

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return sendErrorResponse({ res, message: 'Not authorized to access this route', status: 401 });
        }

        decoded = verifyToken(token) as JwtPayload; // Assign decoded here

        if (!decoded) { // Now check if decoded is valid
            return sendErrorResponse({ res, message: 'Not authorized to access this route', status: 401 });
        }

        // Check if user is Admin
        let user: any = await Admin.findById((decoded as any).id);
        
        // If not Admin, check if Employee
        if (!user) {
            user = await Employee.findById((decoded as any).id);
        }

        if (!user) {
            return sendErrorResponse({ res, message: 'No user found with this id', status: 404 });
        }

        (req as CustomRequest).user = user;
        next();

    } catch (error) {
        return sendErrorResponse({ res, message: 'Not authorized to access this route', status: 401 });
    }
};
