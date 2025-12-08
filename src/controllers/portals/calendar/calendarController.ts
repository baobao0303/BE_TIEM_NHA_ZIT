import { RequestHandler } from 'express';
import CalendarEvent from '@/models/portals/calendar/CalendarEvent';
import { sendSuccessResponse } from '@/utils/http/res.response';
import { sendErrorResponse } from '@/utils/http/errors.response';
import { asyncHandler } from '@/utils/asyncHandler';

class CalendarController {
    // Get all events
    public getAll: RequestHandler = asyncHandler(async (req, res) => {
        const events = await CalendarEvent.find().sort({ start: 1 });
        return sendSuccessResponse({ res, message: 'Events fetched successfully', data: events });
    });

    // Create a new event
    public create: RequestHandler = asyncHandler(async (req, res) => {
        const { title, category, start, end, allDay, description } = req.body;
        const createdBy = (req as any).user._id;

        const event = new CalendarEvent({
            title,
            category,
            start,
            end,
            allDay,
            description,
            createdBy
        });
        await event.save();

        return sendSuccessResponse({ res, message: 'Event created successfully', data: event, status: 201 });
    });

    // Update an event
    public update: RequestHandler = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updates = req.body;

        const event = await CalendarEvent.findByIdAndUpdate(id, updates, { new: true });
        if (!event) {
            return sendErrorResponse({ res, message: 'Event not found', status: 404 });
        }
        return sendSuccessResponse({ res, message: 'Event updated successfully', data: event });
    });

    // Delete an event
    public delete: RequestHandler = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const event = await CalendarEvent.findByIdAndDelete(id);
        if (!event) {
            return sendErrorResponse({ res, message: 'Event not found', status: 404 });
        }
        return sendSuccessResponse({ res, message: 'Event deleted successfully', data: null });
    });
}

export default new CalendarController();
