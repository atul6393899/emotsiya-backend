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
        UserProfile: {
          type: 'object',
          properties: {
            schoolName: { type: 'string', example: 'Green Valley School' },
            institutionName: { type: 'string', example: 'Green Valley School' },
            institutionType: {
              type: 'string',
              enum: ['Government', 'Private', 'Semi-Government'],
            },
            principalName: { type: 'string', example: 'Dr. Rakesh Sharma' },
            contactPerson: { type: 'string', example: 'John Doe' },
            address: { type: 'string', example: '221 Central Ave' },
            city: { type: 'string', example: 'Delhi' },
            state: { type: 'string', example: 'Delhi' },
            organizationName: { type: 'string', example: 'Delhi Civic Office' },
            department: { type: 'string', example: 'Urban Welfare' },
            permissions: { type: 'array', items: { type: 'string' }, example: ['all'] },
          },
        },
        CreateSchoolRequest: {
          type: 'object',
          required: [
            'institutionName',
            'principalName',
            'contactPerson',
            'email',
            'phone',
            'address',
            'city',
            'state',
            'institutionType',
          ],
          properties: {
            institutionName: { type: 'string', example: 'Green Valley School' },
            principalName: { type: 'string', example: 'Dr. Rakesh Sharma' },
            contactPerson: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'school@example.com' },
            phone: { type: 'string', example: '9876543210' },
            address: { type: 'string', example: '221 Central Ave' },
            city: { type: 'string', example: 'Delhi' },
            state: { type: 'string', example: 'Delhi' },
            institutionType: {
              type: 'string',
              enum: ['Government', 'Private', 'Semi-Government'],
              example: 'Private',
            },
          },
        },
        CreateGovernmentRequest: {
          type: 'object',
          required: ['organizationName', 'department', 'contactPerson', 'email', 'phone', 'city'],
          properties: {
            organizationName: { type: 'string', example: 'Delhi Civic Office' },
            department: { type: 'string', example: 'Urban Welfare' },
            contactPerson: { type: 'string', example: 'Gov Officer' },
            email: { type: 'string', format: 'email', example: 'gov@example.com' },
            phone: { type: 'string', example: '9811111111' },
            city: { type: 'string', example: 'Delhi' },
          },
        },
        RegisteredUserResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User registered successfully.' },
            data: {
              type: 'object',
              properties: {
                _id: { type: 'string', example: '65a1b2c3d4e5f6a7b8c9d0e1' },
                role: { type: 'string', enum: ['school', 'government'], example: 'school' },
                status: { type: 'string', example: 'active' },
                email: { type: 'string', example: 'school@example.com' },
              },
            },
            statusCode: { type: 'integer', example: 201 },
          },
        },
        SchoolOnboardingItem: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65a1b2c3d4e5f6a7b8c9d0e1' },
            institutionName: { type: 'string', example: 'Green Valley School' },
            principalName: { type: 'string', example: 'Dr. Rakesh Sharma' },
            city: { type: 'string', example: 'Delhi' },
            state: { type: 'string', example: 'Delhi' },
            email: { type: 'string', example: 'school@example.com' },
            phone: { type: 'string', example: '9876543280' },
            status: {
              type: 'string',
              enum: ['pending', 'active', 'inactive', 'suspended'],
              example: 'active',
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        GovernmentOnboardingItem: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65a1b2c3d4e5f6a7b8c9d0e2' },
            organizationName: { type: 'string', example: 'Delhi Civic Office' },
            department: { type: 'string', example: 'Urban Welfare' },
            contactPerson: { type: 'string', example: 'Gov Officer' },
            city: { type: 'string', example: 'Delhi' },
            state: { type: 'string', example: 'Delhi' },
            email: { type: 'string', example: 'gov@example.com' },
            phone: { type: 'string', example: '9811111111' },
            status: {
              type: 'string',
              enum: ['pending', 'active', 'inactive', 'suspended'],
              example: 'pending',
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        RoleStatusSummary: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 9 },
            approved: { type: 'integer', example: 8 },
            pending: { type: 'integer', example: 1 },
          },
        },
        OnboardingDashboardSummaryResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Dashboard summary fetched successfully' },
            data: {
              type: 'object',
              properties: {
                schools: { $ref: '#/components/schemas/RoleStatusSummary' },
                governments: { $ref: '#/components/schemas/RoleStatusSummary' },
              },
            },
            statusCode: { type: 'integer', example: 200 },
          },
        },
        OnboardingSchoolsListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Schools fetched successfully' },
            data: {
              type: 'object',
              properties: {
                schools: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/SchoolOnboardingItem' },
                },
                pagination: { $ref: '#/components/schemas/PaginationMeta' },
              },
            },
            statusCode: { type: 'integer', example: 200 },
          },
        },
        OnboardingGovernmentsListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Governments fetched successfully' },
            data: {
              type: 'object',
              properties: {
                governments: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/GovernmentOnboardingItem' },
                },
                pagination: { $ref: '#/components/schemas/PaginationMeta' },
              },
            },
            statusCode: { type: 'integer', example: 200 },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 25 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            totalPages: { type: 'integer', example: 3 },
          },
        },
        SchoolDetails: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65a1b2c3d4e5f6a7b8c9d0e1' },
            institutionName: { type: 'string', example: 'Green Valley School' },
            institutionType: {
              type: 'string',
              enum: ['Government', 'Private', 'Semi-Government'],
              example: 'Private',
            },
            principalName: { type: 'string', example: 'Dr. Rakesh Sharma' },
            contactPerson: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'school@example.com' },
            phone: { type: 'string', example: '9876543210' },
            address: { type: 'string', example: '221 Central Ave' },
            city: { type: 'string', example: 'Delhi' },
            state: { type: 'string', example: 'Delhi' },
            status: {
              type: 'string',
              enum: ['pending', 'active', 'inactive', 'suspended'],
              example: 'active',
            },
            isVerified: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        GovernmentDetails: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65a1b2c3d4e5f6a7b8c9d0e2' },
            organizationName: { type: 'string', example: 'Delhi Civic Office' },
            department: { type: 'string', example: 'Urban Welfare' },
            contactPerson: { type: 'string', example: 'Gov Officer' },
            email: { type: 'string', example: 'gov@example.com' },
            phone: { type: 'string', example: '9811111111' },
            city: { type: 'string', example: 'Delhi' },
            status: {
              type: 'string',
              enum: ['pending', 'active', 'inactive', 'suspended'],
              example: 'active',
            },
            isVerified: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        SchoolDetailsResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'School details fetched successfully' },
            data: { $ref: '#/components/schemas/SchoolDetails' },
            statusCode: { type: 'integer', example: 200 },
          },
        },
        GovernmentDetailsResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Government details fetched successfully' },
            data: { $ref: '#/components/schemas/GovernmentDetails' },
            statusCode: { type: 'integer', example: 200 },
          },
        },
        ApproveUserResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'School approved successfully.' },
            data: { type: 'object', nullable: true, example: null },
            statusCode: { type: 'integer', example: 200 },
          },
        },
        RegisterStudentRequest: {
          type: 'object',
          required: [
            'fullName',
            'age',
            'gender',
            'classGrade',
            'schoolId',
            'city',
            'email',
            'phone',
          ],
          properties: {
            fullName: { type: 'string', example: 'Rahul Sharma' },
            age: { type: 'integer', example: 15, minimum: 5, maximum: 100 },
            gender: { type: 'string', enum: ['Male', 'Female', 'Other'], example: 'Male' },
            classGrade: { type: 'string', example: 'Class 9' },
            schoolId: { type: 'string', example: '64d2f3b0b2b9c12345678901' },
            city: { type: 'string', example: 'Delhi' },
            email: { type: 'string', format: 'email', example: 'rahul@example.com' },
            phone: { type: 'string', example: '9876543210' },
          },
        },
        SchoolDropdownItem: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '64d2f3b0b2b9c12345678901' },
            institutionName: { type: 'string', example: 'Green Valley School' },
          },
        },
        SendOtpRequest: {
          type: 'object',
          description: 'Provide either email or phone (not both)',
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            phone: { type: 'string', example: '9876543210' },
          },
        },
        ResendOtpRequest: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string', example: '65a1b2c3d4e5f6a7b8c9d0e1' },
          },
        },
        VerifyOtpRequest: {
          type: 'object',
          required: ['userId', 'otp'],
          properties: {
            userId: { type: 'string', example: '65a1b2c3d4e5f6a7b8c9d0e1' },
            otp: { type: 'string', example: '123456' },
          },
        },
        SendOtpResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'OTP sent successfully' },
            userId: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'school', 'government', 'student'] },
            maskedPhone: { type: 'string', example: '98******10' },
            email: { type: 'string', example: 'user@example.com' },
            expiresIn: { type: 'integer', example: 600 },
            otp: { type: 'string', example: '123456' },
          },
        },
        VerifyOtpResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
            expiresIn: { type: 'integer', example: 604800 },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            fullName: { type: 'string' },
            age: { type: 'integer' },
            gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
            classGrade: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'school', 'government', 'student'] },
            isVerified: { type: 'boolean' },
            profile: { $ref: '#/components/schemas/UserProfile' },
            status: { type: 'string', enum: ['pending', 'active', 'inactive', 'suspended'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
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
      // ──────────── Auth (unified for all roles) ────────────
      '/api/auth/send-otp': {
        post: {
          summary: 'Send OTP via email or phone (all roles)',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/SendOtpRequest' } },
            },
          },
          responses: {
            200: {
              description: 'OTP sent successfully',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/SendOtpResponse' } },
              },
            },
            400: { description: 'Validation error' },
            403: { description: 'Account inactive or suspended' },
            404: { description: 'User not found' },
            429: { description: 'Too many OTP requests' },
          },
        },
      },
      '/api/auth/re-send-otp': {
        post: {
          summary: 'Re-send OTP (invalidates previous unused OTP)',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ResendOtpRequest' } },
            },
          },
          responses: {
            200: { description: 'OTP resent successfully' },
            400: { description: 'Validation error' },
            403: { description: 'Account inactive or suspended' },
            404: { description: 'User not found' },
            429: { description: 'Too many OTP requests' },
          },
        },
      },
      '/api/auth/verify-otp': {
        post: {
          summary: 'Verify OTP and receive a 7-day JWT',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/VerifyOtpRequest' } },
            },
          },
          responses: {
            200: {
              description: 'OTP verified, token issued',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/VerifyOtpResponse' } },
              },
            },
            400: { description: 'Invalid, expired, or already used OTP' },
            403: { description: 'Account inactive or suspended' },
            404: { description: 'User not found' },
          },
        },
      },
      '/api/auth/logout': {
        post: {
          summary: 'Logout (invalidates the current session)',
          tags: ['Auth'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Logged out successfully' },
            401: { description: 'Unauthorized' },
          },
        },
      },

      // ──────────── Admin ────────────
      '/api/v1/admin/onboarding/dashboard': {
        get: {
          summary: 'Get onboarding dashboard summary (admin only)',
          description:
            'Returns total, approved (active), and pending counts for schools and governments. Requires Admin JWT.',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Dashboard summary fetched successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/OnboardingDashboardSummaryResponse' },
                },
              },
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
          },
        },
      },
      '/api/v1/admin/onboarding/schools': {
        get: {
          summary: 'List onboarding schools (admin only)',
          description:
            'Paginated school users with optional search and status filter. Sorted newest first. Requires Admin JWT.',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'search',
              in: 'query',
              required: false,
              description:
                'Search by institution name, principal name, email, phone, city, or state',
              schema: { type: 'string', example: 'Green Valley' },
            },
            {
              name: 'status',
              in: 'query',
              required: false,
              description: 'Filter by account status',
              schema: {
                type: 'string',
                enum: ['pending', 'active', 'inactive', 'suspended'],
                example: 'pending',
              },
            },
            {
              name: 'page',
              in: 'query',
              required: false,
              schema: { type: 'integer', minimum: 1, default: 1, example: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 10, example: 10 },
            },
          ],
          responses: {
            200: {
              description: 'Schools fetched successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/OnboardingSchoolsListResponse' },
                },
              },
            },
            400: { description: 'Validation failed' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
          },
        },
      },
      '/api/v1/admin/onboarding/governments': {
        get: {
          summary: 'List onboarding governments (admin only)',
          description:
            'Paginated government users with optional search and status filter. Sorted newest first. Requires Admin JWT.',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'search',
              in: 'query',
              required: false,
              description:
                'Search by organization name, contact person, department, email, phone, city, or state',
              schema: { type: 'string', example: 'Delhi' },
            },
            {
              name: 'status',
              in: 'query',
              required: false,
              description: 'Filter by account status',
              schema: {
                type: 'string',
                enum: ['pending', 'active', 'inactive', 'suspended'],
                example: 'pending',
              },
            },
            {
              name: 'page',
              in: 'query',
              required: false,
              schema: { type: 'integer', minimum: 1, default: 1, example: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 10, example: 10 },
            },
          ],
          responses: {
            200: {
              description: 'Governments fetched successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/OnboardingGovernmentsListResponse' },
                },
              },
            },
            400: { description: 'Validation failed' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
          },
        },
      },
      '/api/v1/admin/schools': {
        post: {
          summary: 'Register a school user (admin only)',
          description:
            'Creates an active, verified school account in the users collection. Requires Admin JWT.',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CreateSchoolRequest' } },
            },
          },
          responses: {
            201: {
              description: 'School user registered successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/RegisteredUserResponse' },
                },
              },
            },
            400: { description: 'Validation failed' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
            409: { description: 'Email or phone number already exists' },
          },
        },
      },
      '/api/v1/admin/schools/{id}': {
        get: {
          summary: 'Get school details by ID (admin only)',
          description: 'Returns complete school profile details. Requires Admin JWT.',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'School user MongoDB ObjectId',
              schema: { type: 'string', example: '65a1b2c3d4e5f6a7b8c9d0e1' },
            },
          ],
          responses: {
            200: {
              description: 'School details fetched successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SchoolDetailsResponse' },
                },
              },
            },
            400: { description: 'Invalid ObjectId or invalid role' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
            404: { description: 'User not found' },
          },
        },
      },
      '/api/v1/admin/schools/{id}/approve': {
        patch: {
          summary: 'Approve a pending school (admin only)',
          description:
            'Sets school status to active and isVerified to true. Only pending school users can be approved.',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'School user MongoDB ObjectId',
              schema: { type: 'string', example: '65a1b2c3d4e5f6a7b8c9d0e1' },
            },
          ],
          responses: {
            200: {
              description: 'School approved successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApproveUserResponse' },
                },
              },
            },
            400: {
              description: 'Validation failed, invalid role, or school already approved',
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
            404: { description: 'User not found' },
          },
        },
      },
      '/api/v1/admin/governments': {
        post: {
          summary: 'Register a government user (admin only)',
          description:
            'Creates an active, verified government account in the users collection. Requires Admin JWT.',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateGovernmentRequest' },
              },
            },
          },
          responses: {
            201: {
              description: 'Government user registered successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/RegisteredUserResponse' },
                },
              },
            },
            400: { description: 'Validation failed' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
            409: { description: 'Email or phone number already exists' },
          },
        },
      },
      '/api/v1/admin/governments/{id}': {
        get: {
          summary: 'Get government details by ID (admin only)',
          description: 'Returns complete government profile details. Requires Admin JWT.',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Government user MongoDB ObjectId',
              schema: { type: 'string', example: '65a1b2c3d4e5f6a7b8c9d0e2' },
            },
          ],
          responses: {
            200: {
              description: 'Government details fetched successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/GovernmentDetailsResponse' },
                },
              },
            },
            400: { description: 'Invalid ObjectId or invalid role' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
            404: { description: 'User not found' },
          },
        },
      },
      '/api/v1/admin/governments/{id}/approve': {
        patch: {
          summary: 'Approve a pending government (admin only)',
          description:
            'Sets government status to active and isVerified to true. Only pending government users can be approved.',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Government user MongoDB ObjectId',
              schema: { type: 'string', example: '65a1b2c3d4e5f6a7b8c9d0e2' },
            },
          ],
          responses: {
            200: {
              description: 'Government approved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApproveUserResponse' },
                      {
                        type: 'object',
                        properties: {
                          message: {
                            type: 'string',
                            example: 'Government approved successfully.',
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            400: {
              description: 'Validation failed, invalid role, or government already approved',
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
            404: { description: 'User not found' },
          },
        },
      },

      // ──────────── Student ────────────
      '/api/v1/student/register': {
        post: {
          summary: 'Register a student',
          description:
            'Creates a pending student account linked to an active school. Public endpoint.',
          tags: ['Student'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterStudentRequest' },
              },
            },
          },
          responses: {
            201: { description: 'Student registered successfully' },
            400: { description: 'Validation failed or school is inactive' },
            404: { description: 'School not found' },
            409: { description: 'Email or phone number already exists' },
          },
        },
      },
      '/api/v1/student/schools': {
        get: {
          summary: 'Get active schools for dropdown',
          description:
            'Returns active school users with id and institutionName only. Public endpoint.',
          tags: ['Student'],
          responses: {
            200: {
              description: 'Schools fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/SchoolDropdownItem' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
