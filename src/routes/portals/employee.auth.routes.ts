import { Router } from 'express';
import employeeAuthController from '@/controllers/portals/employee/employeeAuthController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Employee Auth
 *   description: Employee Authentication
 */

/**
 * @swagger
 * /api/v1/auth/employee/register:
 *   post:
 *     summary: Register a new employee
 *     tags: [Employee Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Employee registered successfully
 *       400:
 *         description: Employee already exists
 *       500:
 *         description: Internal server error
 */
router.post('/employee/register', employeeAuthController.register);

/**
 * @swagger
 * /api/v1/auth/employee/sign-in:
 *   post:
 *     summary: Employee Login
 *     tags: [Employee Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post('/employee/sign-in', employeeAuthController.login);

/**
 * @swagger
 * /api/v1/auth/employee/logout:
 *   post:
 *     summary: Employee Logout
 *     tags: [Employee Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Internal server error
 */
router.post('/employee/logout', employeeAuthController.logout);

/**
 * @swagger
 * /api/v1/auth/employee/refresh-token:
 *   post:
 *     summary: Refresh Access Token
 *     tags: [Employee Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New Access Token
 *       403:
 *         description: Invalid or expired refresh token
 */
router.post('/employee/refresh-token', employeeAuthController.refreshToken);

/**
 * @swagger
 * /api/v1/auth/employee/create:
 *   post:
 *     summary: Create a new employee (Admin Only)
 *     tags: [Employee Auth]
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
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *               department:
 *                 type: string
 *               jobTitle:
 *                 type: string
 *     responses:
 *       201:
 *         description: Employee created successfully
 *       400:
 *         description: Employee already exists
 *       401:
 *         description: Unauthorized
 */
import { protect } from '@/middlewares/portals/auth.middleware';
router.post('/employee/create', protect, employeeAuthController.createEmployee);

export default router;
