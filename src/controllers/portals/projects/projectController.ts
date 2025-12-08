import { RequestHandler } from 'express';
import Project from '../../../models/portals/projects/Project';
import { sendSuccessResponse } from '@/utils/http/res.response';
import { sendErrorResponse } from '@/utils/http/errors.response';
import { asyncHandler } from '@/utils/asyncHandler';

class ProjectController {
    // Create a new project
    public create: RequestHandler = asyncHandler(async (req, res) => {
        const { name, description, image, status, visibility, startDate, dueDate, members, files, createdBy } = req.body;

        const project = new Project({
            name,
            description,
            image,
            status,
            visibility,
            startDate,
            dueDate,
            members,
            files,
            createdBy
        });
        await project.save();

        return sendSuccessResponse({ res, message: 'Project created successfully', data: project, status: 201 });
    });

    // Get all projects with pagination, search, and filters
    public getAll: RequestHandler = asyncHandler(async (req, res) => {
        const { page = 1, limit = 10, search, status } = req.query;
        const query: any = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (status) {
            query.status = status;
        }

        const projects = await Project.find(query)
            .populate('members', 'name image role')
            .populate('createdBy', 'name email')
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 });

        const count = await Project.countDocuments(query);

        return sendSuccessResponse({ 
            res, 
            message: 'Projects fetched successfully', 
            data: {
                projects,
                totalPages: Math.ceil(count / Number(limit)),
                currentPage: page,
                totalProjects: count
            }
        });
    });

    // Get single project details
    public getOne: RequestHandler = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const project = await Project.findById(id)
            .populate('members', 'name image role')
            .populate('createdBy', 'name email');
        
        if (!project) {
            return sendErrorResponse({ res, message: 'Project not found', status: 404 });
        }
        return sendSuccessResponse({ res, message: 'Project fetched successfully', data: project });
    });

    // Get Project Statistics
    public getStats: RequestHandler = asyncHandler(async (req, res) => {
        // Aggregate counts by status
        const statusStats = await Project.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Transform into object
        const statusCounts: any = {};
        statusStats.forEach(stat => {
            statusCounts[stat._id] = stat.count;
        });

        // Dummy chart data for "Overview"
        const overviewChart = [40, 55, 40, 65, 25, 42, 58, 38, 62];

        return sendSuccessResponse({ 
            res, 
            message: 'Project stats fetched successfully', 
            data: {
                statusCounts,
                overviewChart,
                totalProjects: await Project.countDocuments()
            }
        });
    });

    public update: RequestHandler = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updates = req.body;

        const project = await Project.findByIdAndUpdate(id, updates, { new: true });
        if (!project) {
            return sendErrorResponse({ res, message: 'Project not found', status: 404 });
        }
        return sendSuccessResponse({ res, message: 'Project updated successfully', data: project });
    });

    public delete: RequestHandler = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const project = await Project.findByIdAndDelete(id);
        if (!project) {
            return sendErrorResponse({ res, message: 'Project not found', status: 404 });
        }
        return sendSuccessResponse({ res, message: 'Project deleted successfully', data: null });
    });
}

export default new ProjectController();
