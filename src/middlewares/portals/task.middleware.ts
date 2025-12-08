import { Request, Response, NextFunction } from 'express';
import Task from '@/models/portals/tasks/Task';
import { sendErrorResponse } from '@/utils/http/errors.response';

export const validateCreateTask = async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.body;

    // Basic validation implies required fields should be present. 
    // Mongoose schema handles 'required' generally, but explicit pre-check saves DB calls for unique fields.
    
    if (slug) {
        const existingTask = await Task.findOne({ slug });
        if (existingTask) {
            return sendErrorResponse({ res, message: 'Task with this slug already exists', status: 400 });
        }
    }
    next();
};
