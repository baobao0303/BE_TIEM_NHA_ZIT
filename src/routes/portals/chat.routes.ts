import { Router } from 'express';
import chatController from '@/controllers/portals/chat/chatController';
import { protect } from '@/middlewares/portals/auth.middleware';
import { 
    validateAccessChat, 
    validateCreateGroupChat, 
    validateSendMessage, 
    validateReactToMessage,
    validateUpdateChat 
} from '@/middlewares/portals/chat.middleware';

const router = Router();

// Protect all chat routes
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat and Messaging
 */

/**
 * @swagger
 * /api/v1/chat/contacts:
 *   get:
 *     summary: Get all contacts (Admins & Employees)
 *     tags: [Chat]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of contacts
 */
router.get('/contacts', chatController.getContacts);

/**
 * @swagger
 * /api/v1/chat/access:
 *   post:
 *     summary: Access or create a one-on-one chat
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, onModel]
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Target user ID
 *               onModel:
 *                 type: string
 *                 enum: [admins, employees]
 *     responses:
 *       200:
 *         description: Chat object
 */
router.post('/access', validateAccessChat, chatController.accessChat);

/**
 * @swagger
 * /api/v1/chat:
 *   get:
 *     summary: Fetch all conversations
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: List of conversations
 */
router.get('/', chatController.fetchChats);

/**
 * @swagger
 * /api/v1/chat/group:
 *   post:
 *     summary: Create a group chat
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, participants]
 *             properties:
 *               name:
 *                 type: string
 *               participants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                     onModel:
 *                       type: string
 *     responses:
 *       201:
 *         description: Group Chat created
 */
router.post('/group', validateCreateGroupChat, chatController.createGroupChat);

/**
 * @swagger
 * /api/v1/chat/message:
 *   post:
 *     summary: Send a message
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [chatId]
 *             properties:
 *               chatId:
 *                 type: string
 *               content:
 *                 type: string
 *               attachments:
 *                 type: array
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post('/message', validateSendMessage, chatController.sendMessage);

/**
 * @swagger
 * /api/v1/chat/message/react:
 *   put:
 *     summary: React to a message (Toggle)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messageId
 *               - emoji
 *             properties:
 *               messageId:
 *                 type: string
 *               emoji:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reaction updated
 *       404:
 *         description: Message not found
 */
router.put('/message/react', validateReactToMessage, chatController.reactToMessage);

/**
 * @swagger
 * /api/v1/chat/message/{chatId}:
 *   get:
 *     summary: Get all messages for a chat
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get('/message/:chatId', chatController.allMessages);

/**
 * @swagger
 * /api/v1/chat/{chatId}:
 *   put:
 *     summary: Update chat (e.g. change emoji)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emoji:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat updated
 *       404:
 *         description: Chat not found
 */
router.put('/:chatId', validateUpdateChat, chatController.updateChat);

export default router;
