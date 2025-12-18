import { Router } from "express";
import taskController from "@/controllers/portals/tasks/taskController";
import { protect } from "@/middlewares/portals/auth.middleware";
import { validateId } from "@/middlewares/portals/validate.middleware";
import {
  validate,
  taskCreateSchema,
  taskUpdateSchema,
  validateCreateTask,
} from "@/utils/validate/portal/task.validate";

const router = Router();

// Protect all task routes
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management
 */

// ... swagger docs omitted for brevity ...
/**
 * @swagger
 * /api/v1/tasks/kanban:
 *   get:
 *     summary: Get tasks grouped by status for Kanban board
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kanban board data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     upcoming:
 *                       type: array
 *                     inProgress:
 *                       type: array
 *                     completed:
 *                       type: array
 */
router.get("/kanban", taskController.getKanban);

/**
 * @swagger
 * /api/v1/tasks/stats:
 *   get:
 *     summary: Get task statistics
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task statistics
 */
router.get("/stats", taskController.getStats);

/**
 * @swagger
 * /api/v1/tasks/recent:
 *   get:
 *     summary: Get recent tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent tasks
 */
router.get("/recent", taskController.getRecent);

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get all tasks with pagination
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tasks
 *   post:
 *     summary: Create a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               budget:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [Waiting, Pending, Approved, Complete]
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               files:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     url:
 *                       type: string
 *                     size:
 *                       type: string
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Task created
 */
router
  .route("/")
  .get(taskController.getAll)
  .post(validate(taskCreateSchema), validateCreateTask, taskController.create);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update task
 *     tags: [Tasks]
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
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Waiting, Pending, Approved, Complete]
 *               budget:
 *                 type: number
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               files:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     url:
 *                       type: string
 *                     size:
 *                       type: string
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Task updated
 *   delete:
 *     summary: Delete task
 *     tags: [Tasks]
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
 *         description: Task deleted
 */
router
  .route("/:id")
  .put(validateId, validate(taskUpdateSchema), taskController.update)
  .delete(validateId, taskController.delete);

export default router;
