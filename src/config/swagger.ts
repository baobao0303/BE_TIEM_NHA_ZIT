import swaggerJsdoc from 'swagger-jsdoc';
import { PORT, CLIENT_URL } from '@/config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portal API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Portal application',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
      {
         url: CLIENT_URL,
         description: 'Client URL'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: []
    }], // Optional: Apply globally or just keep it for specific routes. Better to keep specific. 
    // Actually, user wants it for protected routes. defining it here makes it available.
  },
  apis: ['./src/routes/**/*.ts', './src/server.ts'], // Look for docs in routes and server file
};

export const specs = swaggerJsdoc(options);
