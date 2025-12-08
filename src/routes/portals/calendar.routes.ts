import { Router } from 'express';
import calendarController from '@/controllers/portals/calendar/calendarController';
import { protect } from '@/middlewares/portals/auth.middleware';
import { validateId } from '@/middlewares/portals/validate.middleware';

const router = Router();

// Protect all calendar routes
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Calendar
 *   description: Calendar event management
 */

/**
 * @swagger
 * /api/v1/calendar:
 *   get:
 *     summary: Get all calendar events
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of events
 *   post:
 *     summary: Create a calendar event
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - start
 *               - createdBy
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               start:
 *                 type: string
 *                 format: date-time
 *               end:
 *                 type: string
 *                 format: date-time
 *               allDay:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Event created
 */
router.route('/')
    .get(calendarController.getAll)
    .post(calendarController.create);

/**
 * @swagger
 * /api/v1/calendar/{id}:
 *   put:
 *     summary: Update calendar event
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               start:
 *                 type: string
 *                 format: date-time
 *               end:
 *                 type: string
 *                 format: date-time
 *               allDay:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Event updated
 *   delete:
 *     summary: Delete calendar event
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted
 */
router.route('/:id')
    .put(validateId, calendarController.update)
    .delete(validateId, calendarController.delete);

export default router;
