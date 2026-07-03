const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tomua Map Travel API',
      version: '1.0.0',
      description: 'API for Tomua Tourism Digital Map - Xã Tô Múa, Sơn La',
      contact: {
        name: 'godBuddha',
        url: 'https://github.com/godBuddha/tomua-map-travel'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.tomua.travel',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Destination: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            slug: { type: 'string' },
            name: { type: 'object', description: 'Multi-language name object' },
            type: { type: 'string', enum: ['waterfall', 'cave', 'historical', 'spiritual', 'other'] },
            region: { type: 'string' },
            description: { type: 'object', description: 'Multi-language description' },
            lat: { type: 'number' },
            lng: { type: 'number' },
            status: { type: 'string', enum: ['draft', 'pending', 'published', 'archived'] }
          }
        },
        Route: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            slug: { type: 'string' },
            name: { type: 'object' },
            transport: { type: 'string', enum: ['walk', 'bike', 'car', 'bus'] },
            duration: { type: 'string', enum: ['half_day', 'full_day', 'two_day', 'custom'] },
            difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
            distance_km: { type: 'number' },
            status: { type: 'string', enum: ['draft', 'pending', 'published'] }
          }
        },
        Event: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            slug: { type: 'string' },
            name: { type: 'object' },
            type: { type: 'string', enum: ['festival', 'season', 'experience', 'cultural', 'sport', 'food', 'other'] },
            start_date: { type: 'string', format: 'date' },
            end_date: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['draft', 'pending', 'published'] }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            username: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'collaborator'] },
            status: { type: 'string', enum: ['active', 'inactive'] }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Destinations', description: 'Destination management' },
      { name: 'Routes', description: 'Route management' },
      { name: 'Events', description: 'Event management' },
      { name: 'Users', description: 'User management (Admin only)' },
      { name: 'MFA', description: 'Multi-factor authentication' },
      { name: 'i18n', description: 'Internationalization' },
      { name: 'Upload', description: 'File upload' },
      { name: 'Settings', description: 'System settings' }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
