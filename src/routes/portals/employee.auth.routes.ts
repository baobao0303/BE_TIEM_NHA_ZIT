import { Router } from "express";
import employeeAuthController from "@/controllers/portals/employee/employeeAuthController";
import { protect } from "@/middlewares/portals/auth.middleware";
import {
  validate,
  employeeLoginSchema,
  employeeRegisterSchema,
  employeeCreateSchema,
  employeeRefreshTokenSchema,
} from "@/utils/validate/portal/auth.validate";

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
router.post("/employee/register", validate(employeeRegisterSchema), employeeAuthController.register);

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
router.post("/employee/sign-in", validate(employeeLoginSchema), employeeAuthController.login);

/**
 * @swagger
 * /api/v1/auth/employee/google-url:
 *   get:
 *     summary: Get Google Login URL
 *     tags: [Employee Auth]
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/employee/google-url", employeeAuthController.getGoogleUrl);

/**
 * @swagger
 * /api/v1/auth/employee/google/callback:
 *   get:
 *     summary: Google OAuth Callback
 *     tags: [Employee Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       302:
 *         description: Redirects to Frontend with temporary code
 */
router.get("/employee/google/callback", employeeAuthController.googleCallback);

/**
 * @swagger
 * /api/v1/auth/employee/exchange-code:
 *   post:
 *     summary: Exchange Temporary Code for Tokens
 *     tags: [Employee Auth]
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/employee/exchange-code", employeeAuthController.exchangeCode);

/**
 * @swagger
 * /api/v1/auth/employee/me:
 *   get:
 *     summary: Get current user and refresh access token
 *     tags: [Employee Auth]
 *     responses:
 *       200:
 *         description: User info with new access token
 *       401:
 *         description: Not authenticated
 */
router.get("/employee/me", employeeAuthController.getMe);

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
router.post("/employee/logout", employeeAuthController.logout);

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
router.post("/employee/refresh-token", validate(employeeRefreshTokenSchema), employeeAuthController.refreshToken);

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
router.post("/employee/create", protect, validate(employeeCreateSchema), employeeAuthController.createEmployee);

export default router;
