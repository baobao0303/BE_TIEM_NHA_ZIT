import 'dotenv/config';
import express from 'express';
import { PORT, CLIENT_URL } from '@/config';
import { connectDB } from '@/utils/db';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import { specs } from '@/config/swagger';

import authRouter from '@/routes/portals/auth.routes';
import employeeAuthRouter from '@/routes/portals/employee.auth.routes';
import roleRouter from '@/routes/portals/role.routes';
import locationRouter from '@/routes/portals/location.routes';
import taskRouter from '@/routes/portals/task.routes';
import projectRouter from '@/routes/portals/project.routes';
import calendarRouter from '@/routes/portals/calendar.routes';
import chatRouter from '@/routes/portals/chat.routes';

import { createServer } from 'http';
import { Server } from 'socket.io';
import { initializeSocket } from './socket';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: [CLIENT_URL, 'http://localhost:5000', 'http://localhost:4200'],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: [CLIENT_URL, 'http://localhost:5000', 'http://localhost:4200'],
    credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/auth', employeeAuthRouter);
app.use('/api/v1/roles', roleRouter);
app.use('/api/v1/locations', locationRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/calendar', calendarRouter);
app.use('/api/v1/chat', chatRouter);

// Initialize Socket.io
initializeSocket(io);

// Swagger Documentation
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [System]
 *     description: Check if the server is running
 *     responses:
 *       200:
 *         description: Server is up and running
 */
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Connect to Database
connectDB();

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});