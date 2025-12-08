import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { sendErrorResponse } from '@/utils/http/errors.response';

export const validateId = (req: Request, res: Response, next: NextFunction) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return sendErrorResponse({ res, message: 'Invalid ID format', status: 400 });
    }
    next();
};
