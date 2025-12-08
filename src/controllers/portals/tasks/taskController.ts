import { RequestHandler } from 'express';
import { CustomRequest } from '@/utils/http/req.response';
import Task from '../../../models/portals/tasks/Task';
import { sendSuccessResponse } from '@/utils/http/res.response';
import { sendErrorResponse } from '@/utils/http/errors.response';
import { asyncHandler } from '@/utils/asyncHandler';

class TaskController {
    // Create a new task
    public create: RequestHandler = asyncHandler(async (req: CustomRequest, res) => {
        const { name, slug, description, budget, startDate, endDate, status, members, files } = req.body;
        const createdBy = req.user?._id;

// Validation moved to middleware

        // Sanitize members
        let validMembers = members;
        if (Array.isArray(members)) {
            // Filter out empty strings
            validMembers = members.filter((m: any) => m && typeof m === 'string' && m.trim() !== '');
        }

        const task = new Task({
            name,
            slug,
            description,
            budget,
            startDate,
            endDate,
            status,
            members: validMembers,
            createdBy,
            files
        });
        await task.save();

        return sendSuccessResponse({ res, message: 'Task created successfully', data: task, status: 201 });
    });

    // Get all tasks with pagination and simple search
    public getAll: RequestHandler = asyncHandler(async (req, res) => {
        const { page = 1, limit = 10, search } = req.query;
        const query: any = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const tasks = await Task.find(query)
            .populate('members', 'name image role')
            .populate('createdBy', 'name email')
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 });

        const count = await Task.countDocuments(query);

        return sendSuccessResponse({ 
            res, 
            message: 'Tasks fetched successfully', 
            data: {
                tasks,
                totalPages: Math.ceil(count / Number(limit)),
                currentPage: page,
                totalTasks: count
            }
        });
    });

    // Get Kanban Board Data
    public getKanban: RequestHandler = asyncHandler(async (req, res) => {
        // Group 1: Upcoming (Waiting, Pending)
        const upcoming = await Task.find({ status: { $in: ['Waiting', 'Pending'] } })
            .populate('members', 'name image role');
        
        // Group 2: In Progress (Approved)
        const inProgress = await Task.find({ status: 'Approved' })
            .populate('members', 'name image role');

        // Group 3: Completed (Complete)
        const completed = await Task.find({ status: 'Complete' })
            .populate('members', 'name image role');

        return sendSuccessResponse({ 
            res, 
            message: 'Kanban data fetched successfully', 
            data: {
                upcoming,
                inProgress,
                completed
            }
        });
    });

    // Get Task Statistics (Monthly Completion)
    // Get Task Statistics (Monthly Completion vs All Tasks)
    public getStats: RequestHandler = asyncHandler(async (req, res) => {
        const stats = await Task.aggregate([
            {
                $facet: {
                    complete: [
                        { $match: { status: 'Complete' } },
                        {
                            $group: {
                                _id: { $month: "$updatedAt" },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    all: [
                        {
                            $group: {
                                _id: { $month: "$createdAt" },
                                count: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ]);

        const result = stats[0];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const completeData = months.map((_, index) => {
            const found = result.complete.find((s: any) => s._id === index + 1);
            return found ? found.count : 0;
        });

        const allData = months.map((_, index) => {
            const found = result.all.find((s: any) => s._id === index + 1);
            return found ? found.count : 0;
        });

        const totalTasks = await Task.countDocuments();
        const completedTasks = await Task.countDocuments({ status: 'Complete' });

        return sendSuccessResponse({ 
            res, 
            message: 'Stats fetched successfully', 
            data: {
                chartSeries: [
                    { name: 'Completed Tasks', type: 'column', data: completeData },
                    { name: 'All Tasks', type: 'line', data: allData }
                ],
                overview: {
                    total: totalTasks,
                    completed: completedTasks,
                    rate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
                }
            }
        });
    });

    // Get Recent Tasks
    public getRecent: RequestHandler = asyncHandler(async (req, res) => {
        const tasks = await Task.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('members', 'name image');
        
        return sendSuccessResponse({ res, message: 'Recent tasks fetched successfully', data: tasks });
    });

    public update: RequestHandler = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updates = req.body;

        const task = await Task.findByIdAndUpdate(id, updates, { new: true });
        if (!task) {
            return sendErrorResponse({ res, message: 'Task not found', status: 404 });
        }
        return sendSuccessResponse({ res, message: 'Task updated successfully', data: task });
    });

    public delete: RequestHandler = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const task = await Task.findByIdAndDelete(id);
        if (!task) {
            return sendErrorResponse({ res, message: 'Task not found', status: 404 });
        }
        return sendSuccessResponse({ res, message: 'Task deleted successfully', data: null });
    });
}

export default new TaskController();
