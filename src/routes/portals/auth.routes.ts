import { Router } from "express";
import authController from "@/controllers/portals/auths/authController";
import {
  validate,
  adminLoginSchema,
  adminRegisterSchema,
  adminRefreshTokenSchema,
} from "@/utils/validate/portal/auth.validate";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

/**
 * @swagger
 * /api/v1/auth/admin/sign-in:
 *   post:
 *     summary: Admin Sign In
 *     tags: [Auth]
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
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     admin:
 *                       type: object
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post("/admin/sign-in", validate(adminLoginSchema), authController.login);

/**
 * @swagger
 * /api/v1/auth/admin/register:
 *   post:
 *     summary: Admin Register
 *     tags: [Auth]
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
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       400:
 *         description: Admin already exists
 *       500:
 *         description: Internal server error
 */
router.post("/admin/register", validate(adminRegisterSchema), authController.register);

/**
 * @swagger
 * /api/v1/auth/admin/logout:
 *   post:
 *     summary: Admin Logout
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Internal server error
 */
router.post("/admin/logout", authController.logout);

/**
 * @swagger
 * /api/v1/auth/admin/refresh-token:
 *   post:
 *     summary: Refresh Access Token
 *     tags: [Auth]
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
router.post("/admin/refresh-token", validate(adminRefreshTokenSchema), authController.refreshToken);

export default router;
