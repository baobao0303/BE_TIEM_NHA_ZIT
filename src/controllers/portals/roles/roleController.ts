import { RequestHandler } from 'express';
import Role from '../../../models/portals/auths/Role';
import { sendSuccessResponse } from '@/utils/http/res.response';
import { sendErrorResponse } from '@/utils/http/errors.response';
import { asyncHandler } from '@/utils/asyncHandler';

class RoleController {
    public create: RequestHandler = asyncHandler(async (req, res) => {
        const { name, slug, description, permissions, isDefault } = req.body;

        const existingRole = await Role.findOne({ slug });
        if (existingRole) {
            return sendErrorResponse({ res, message: 'Role with this slug already exists', status: 400 });
        }

        const role = new Role({ name, slug, description, permissions, isDefault });
        await role.save();

        return sendSuccessResponse({ res, message: 'Role created successfully', data: role, status: 201 });
    });

    public getAll: RequestHandler = asyncHandler(async (req, res) => {
        const roles = await Role.find();
        return sendSuccessResponse({ res, message: 'Roles fetched successfully', data: roles });
    });

    public getOne: RequestHandler = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const role = await Role.findById(id);
        if (!role) {
            return sendErrorResponse({ res, message: 'Role not found', status: 404 });
        }
        return sendSuccessResponse({ res, message: 'Role fetched successfully', data: role });
    });

    public update: RequestHandler = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updates = req.body;

        const role = await Role.findByIdAndUpdate(id, updates, { new: true });
        if (!role) {
            return sendErrorResponse({ res, message: 'Role not found', status: 404 });
        }
        return sendSuccessResponse({ res, message: 'Role updated successfully', data: role });
    });

    public delete: RequestHandler = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const role = await Role.findByIdAndDelete(id);
        if (!role) {
            return sendErrorResponse({ res, message: 'Role not found', status: 404 });
        }
        return sendSuccessResponse({ res, message: 'Role deleted successfully', data: null });
    });
}

export default new RoleController();
