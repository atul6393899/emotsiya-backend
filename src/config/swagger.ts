import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Emotsiya Backend API',
      version: '1.0.0',
      description: 'Production-ready REST API with Express, TypeScript, MongoDB, JWT Auth & RBAC',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
            statusCode: { type: 'integer' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'string' } },
            statusCode: { type: 'integer' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', minLength: 6, example: '123456' },
            role: {
              type: 'string',
              enum: ['admin', 'school', 'government', 'student'],
              example: 'student',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', example: '123456' },
          },
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'school', 'government', 'student'] },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Updated Name' },
          },
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Updated Name' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['admin', 'school', 'government', 'student'] },
            isActive: { type: 'boolean' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Admin', description: 'Admin management endpoints' },
      { name: 'School', description: 'School role endpoints' },
      { name: 'Government', description: 'Government role endpoints' },
      { name: 'Student', description: 'Student role endpoints' },
    ],
    paths: {
      // ──────────── Auth ────────────
      '/api/v1/auth/register': {
        post: {
          summary: 'Register a new user',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } },
            },
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
            409: {
              description: 'Email already exists',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
          },
        },
      },
      '/api/v1/auth/login': {
        post: {
          summary: 'Login user',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } },
              },
            },
            401: {
              description: 'Invalid credentials',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
          },
        },
      },
      '/api/v1/auth/refresh-token': {
        post: {
          summary: 'Refresh access token',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/RefreshTokenRequest' } },
            },
          },
          responses: {
            200: { description: 'Token refreshed successfully' },
            401: { description: 'Invalid refresh token' },
          },
        },
      },
      '/api/v1/auth/logout': {
        post: {
          summary: 'Logout user',
          tags: ['Auth'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Logout successful' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/v1/auth/me': {
        get: {
          summary: 'Get current user profile',
          tags: ['Auth'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Profile fetched',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } },
              },
            },
            401: { description: 'Unauthorized' },
          },
        },
      },

      // ──────────── Admin ────────────
      '/api/v1/admin/dashboard': {
        get: {
          summary: 'Get admin dashboard stats',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Dashboard stats fetched' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
          },
        },
      },
      '/api/v1/admin/users': {
        get: {
          summary: 'Get all users (paginated)',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'search', schema: { type: 'string' } },
            {
              in: 'query',
              name: 'role',
              schema: { type: 'string', enum: ['admin', 'school', 'government', 'student'] },
            },
            { in: 'query', name: 'sortBy', schema: { type: 'string', default: 'createdAt' } },
            {
              in: 'query',
              name: 'sortOrder',
              schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            },
          ],
          responses: {
            200: { description: 'Users fetched successfully' },
          },
        },
      },
      '/api/v1/admin/users/{id}': {
        get: {
          summary: 'Get user by ID',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'User fetched' },
            404: { description: 'User not found' },
          },
        },
        put: {
          summary: 'Update user',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UpdateUserRequest' } },
            },
          },
          responses: {
            200: { description: 'User updated' },
            404: { description: 'User not found' },
          },
        },
        delete: {
          summary: 'Soft delete user',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'User deleted' },
            404: { description: 'User not found' },
          },
        },
      },

      // ──────────── School ────────────
      '/api/v1/school/dashboard': {
        get: {
          summary: 'Get school dashboard stats',
          tags: ['School'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Dashboard fetched' } },
        },
      },
      '/api/v1/school/students': {
        get: {
          summary: 'Get students list',
          tags: ['School'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'search', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Students fetched' } },
        },
      },
      '/api/v1/school/students/{id}': {
        get: {
          summary: 'Get student by ID',
          tags: ['School'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Student fetched' },
            404: { description: 'Student not found' },
          },
        },
      },
      '/api/v1/school/profile': {
        get: {
          summary: 'Get school profile',
          tags: ['School'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Profile fetched' } },
        },
        put: {
          summary: 'Update school profile',
          tags: ['School'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileRequest' } },
            },
          },
          responses: { 200: { description: 'Profile updated' } },
        },
      },

      // ──────────── Government ────────────
      '/api/v1/government/dashboard': {
        get: {
          summary: 'Get government dashboard stats',
          tags: ['Government'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Dashboard fetched' } },
        },
      },
      '/api/v1/government/users': {
        get: {
          summary: 'Get all users',
          tags: ['Government'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'role', schema: { type: 'string' } },
            { in: 'query', name: 'search', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Users fetched' } },
        },
      },
      '/api/v1/government/schools': {
        get: {
          summary: 'Get all schools',
          tags: ['Government'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'search', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Schools fetched' } },
        },
      },
      '/api/v1/government/profile': {
        get: {
          summary: 'Get government profile',
          tags: ['Government'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Profile fetched' } },
        },
      },

      // ──────────── Student ────────────
      '/api/v1/student/dashboard': {
        get: {
          summary: 'Get student dashboard',
          tags: ['Student'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Dashboard fetched' } },
        },
      },
      '/api/v1/student/profile': {
        get: {
          summary: 'Get student profile',
          tags: ['Student'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Profile fetched' } },
        },
        put: {
          summary: 'Update student profile',
          tags: ['Student'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileRequest' } },
            },
          },
          responses: { 200: { description: 'Profile updated' } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
