import { Request, Response, NextFunction } from 'express';
import { sendErrorResponse } from '@/utils/http/errors.response';
import Message from '@/models/portals/chat/Message';

export const validateAccessChat = (req: Request, res: Response, next: NextFunction) => {
    const { userId, onModel } = req.body;
    if (!userId || !onModel) {
        return sendErrorResponse({ res, message: 'UserId and onModel params not sent with request', status: 400 });
    }
    next();
};

export const validateCreateGroupChat = (req: Request, res: Response, next: NextFunction) => {
    const { participants, name } = req.body;
    if (!participants || !name) {
        return sendErrorResponse({ res, message: 'Please fill all the fields', status: 400 });
    }
    next();
};

export const validateSendMessage = async (req: Request, res: Response, next: NextFunction) => {
    const { content, chatId, attachments, replyToId } = req.body;

    if (!chatId) {
        return sendErrorResponse({ res, message: 'Chat ID is missing', status: 400 });
    }

    if (!content && (!attachments || attachments.length === 0)) {
        return sendErrorResponse({ res, message: 'Message content or attachment is required', status: 400 });
    }

    if (replyToId) {
        const originalMessage = await Message.findById(replyToId);
        if (!originalMessage) {
            return sendErrorResponse({ res, message: 'Original message not found', status: 404 });
        }
    }
    next();
};

export const validateUpdateChat = (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.params;
    if (!chatId) {
         return sendErrorResponse({ res, message: 'Chat ID is required', status: 400 });
    }
    next();
};

export const validateReactToMessage = (req: Request, res: Response, next: NextFunction) => {
    const { messageId, emoji } = req.body;
    if (!messageId || !emoji) {
        return sendErrorResponse({ res, message: 'Message ID and Emoji are required', status: 400 });
    }
    next();
};
