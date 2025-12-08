import { Router } from 'express';
import locationController from '@/controllers/masterData/locations/locationController';
import { protect, hasPermission } from '@/middlewares/portals/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: Administrative units
 */

/**
 * @swagger
 * /api/v1/locations/sync:
 *   post:
 *     summary: Sync locations from Open API
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sync successful
 *       500:
 *         description: Sync failed
 */
router.post('/sync', protect, hasPermission('*'), locationController.sync); // Restricted to Super Admin

/**
 * @swagger
 * /api/v1/locations/provinces:
 *   get:
 *     summary: Get all provinces
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: List of provinces
 */
router.get('/provinces', locationController.getProvinces);

/**
 * @swagger
 * /api/v1/locations/districts/{provinceCode}:
 *   get:
 *     summary: Get districts by province
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: provinceCode
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of districts
 */
router.get('/districts/:provinceCode', locationController.getDistricts);

/**
 * @swagger
 * /api/v1/locations/wards/{districtCode}:
 *   get:
 *     summary: Get wards by district
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: districtCode
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of wards
 */
router.get('/wards/:districtCode', locationController.getWards);

export default router;
