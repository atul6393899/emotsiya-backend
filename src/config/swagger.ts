import swaggerJsdoc from 'swagger-jsdoc';
import os from 'os';

const PORT = process.env.PORT || 5000;

const getLanIp = (): string | null => {
  const nets = os.networkInterfaces();
  for (const entries of Object.values(nets)) {
    for (const net of entries ?? []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
};

const lanIp = getLanIp();

const servers: Array<{ url: string; description: string }> = [
  {
    url: `http://localhost:${PORT}`,
    description: 'Local development',
  },
];

if (lanIp) {
  servers.push({
    url: `http://${lanIp}:${PORT}`,
    description: 'LAN / network access',
  });
}

const ngrokUrl =
  process.env.NGROK_URL?.replace(/\/$/, '') || 'https://scoundrel-drinking-recycler.ngrok-free.dev';

servers.push({
  url: ngrokUrl,
  description: 'ngrok public URL',
});

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
    servers,
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
            admissionNumber: { type: 'string', example: 'ADM-2024-001' },
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
                students: { $ref: '#/components/schemas/RoleStatusSummary' },
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
        StudentListItem: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65a1b2c3d4e5f6a7b8c9d0e3' },
            fullName: { type: 'string', example: 'Rahul Sharma' },
            age: { type: 'integer', example: 14 },
            gender: { type: 'string', enum: ['Male', 'Female', 'Other'], example: 'Male' },
            classGrade: { type: 'string', example: '8' },
            schoolId: { type: 'string', example: '687b008cc16d670962ee7b09' },
            schoolName: { type: 'string', example: 'Green Valley School' },
            city: { type: 'string', example: 'Delhi' },
            admissionNumber: { type: 'string', example: 'ADM-2024-001' },
            email: { type: 'string', example: 'rahul@example.com' },
            phone: { type: 'string', example: '9876543211' },
            status: {
              type: 'string',
              enum: ['pending', 'active', 'inactive', 'suspended'],
              example: 'pending',
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        StudentDetails: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65a1b2c3d4e5f6a7b8c9d0e3' },
            fullName: { type: 'string', example: 'Rahul Sharma' },
            age: { type: 'integer', example: 14 },
            gender: { type: 'string', enum: ['Male', 'Female', 'Other'], example: 'Male' },
            classGrade: { type: 'string', example: '8' },
            schoolId: { type: 'string', example: '687b008cc16d670962ee7b09' },
            schoolName: { type: 'string', example: 'Green Valley School' },
            city: { type: 'string', example: 'Delhi' },
            admissionNumber: { type: 'string', example: 'ADM-2024-001' },
            email: { type: 'string', example: 'rahul@example.com' },
            phone: { type: 'string', example: '9876543211' },
            status: {
              type: 'string',
              enum: ['pending', 'active', 'inactive', 'suspended'],
              example: 'pending',
            },
            isVerified: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        StudentsListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Students fetched successfully' },
            data: {
              type: 'object',
              properties: {
                students: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/StudentListItem' },
                },
                pagination: { $ref: '#/components/schemas/PaginationMeta' },
              },
            },
            statusCode: { type: 'integer', example: 200 },
          },
        },
        StudentDetailsResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Student details fetched successfully' },
            data: { $ref: '#/components/schemas/StudentDetails' },
            statusCode: { type: 'integer', example: 200 },
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
            schoolId: { type: 'string', example: '687b008cc16d670962ee7b09' },
            role: { type: 'string', enum: ['admin', 'school', 'government', 'student'] },
            isVerified: { type: 'boolean' },
            profile: { $ref: '#/components/schemas/UserProfile' },
            status: { type: 'string', enum: ['pending', 'active', 'inactive', 'suspended'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        EventCategory: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65a1b2c3d4e5f6a7b8c9d0e1' },
            name: { type: 'string', example: 'Crime Reduction' },
            icon: { type: 'string', example: '🛡️' },
            description: { type: 'string', example: 'Events related to crime awareness' },
            color: { type: 'string', example: '#4F46E5' },
            is_active: { type: 'boolean', example: true },
            sort_order: { type: 'integer', example: 1 },
            created_by: { type: 'string', nullable: true },
            updated_by: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateEventCategoryRequest: {
          type: 'object',
          required: ['name', 'icon'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 100, example: 'Crime Reduction' },
            icon: { type: 'string', example: '🛡️' },
            description: { type: 'string', example: 'Events related to crime awareness' },
            color: { type: 'string', example: '#4F46E5' },
            sort_order: { type: 'integer', example: 1 },
          },
        },
        UpdateEventCategoryStatusRequest: {
          type: 'object',
          required: ['is_active'],
          properties: {
            is_active: { type: 'boolean', example: false },
          },
        },
        EventCategoryListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Categories fetched successfully' },
            data: {
              type: 'object',
              properties: {
                categories: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/EventCategory' },
                },
                pagination: { $ref: '#/components/schemas/PaginationMeta' },
              },
            },
            statusCode: { type: 'integer', example: 200 },
          },
        },
        EventCategoryDropdownItem: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Crime Reduction' },
            icon: { type: 'string', example: '🛡️' },
          },
        },
        CreateEventRequest: {
          type: 'object',
          required: ['title', 'description', 'categoryId', 'city', 'eventDate', 'eventType'],
          properties: {
            title: { type: 'string', maxLength: 200, example: 'Clean India Drive' },
            description: { type: 'string', example: 'City cleanliness awareness event.' },
            categoryId: { type: 'string', example: '687654987654987654987654' },
            city: { type: 'string', example: 'Jaipur' },
            eventDate: { type: 'string', format: 'date', example: '2026-07-25' },
            eventType: { type: 'string', enum: ['public', 'private'], example: 'public' },
            schoolIds: {
              type: 'array',
              items: { type: 'string' },
              example: ['687111111111111111111111'],
            },
            governmentIds: {
              type: 'array',
              items: { type: 'string' },
              example: ['688111111111111111111111'],
            },
          },
        },
        CreateMissionRequest: {
          type: 'object',
          required: ['title', 'eventId', 'rewardPoints', 'deadline', 'difficulty', 'description'],
          properties: {
            title: { type: 'string', maxLength: 200, example: 'Collect Plastic Waste' },
            eventId: { type: 'string', example: '687654987654987654987654' },
            rewardPoints: { type: 'integer', minimum: 1, example: 100 },
            deadline: { type: 'string', format: 'date', example: '2026-07-30' },
            difficulty: {
              type: 'string',
              enum: ['Easy', 'Medium', 'Hard'],
              example: 'Easy',
            },
            description: {
              type: 'string',
              example: 'Collect plastic waste around your locality.',
            },
            is_active: { type: 'boolean', example: true },
          },
        },
        MissionResponse: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            rewardPoints: { type: 'integer' },
            deadline: { type: 'string', format: 'date-time' },
            difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
            description: { type: 'string' },
            is_active: { type: 'boolean' },
            event: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                title: { type: 'string' },
                eventDate: { type: 'string', format: 'date-time' },
              },
            },
            created_by: { type: 'string', nullable: true },
            updated_by: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        TaskSubmissionProof: {
          type: 'object',
          required: ['fileName', 'originalName', 'fileUrl', 'fileType', 'fileSize'],
          properties: {
            fileName: { type: 'string', example: 'tree.jpg' },
            originalName: { type: 'string', example: 'tree.jpg' },
            fileUrl: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/uploads/tree.jpg',
            },
            fileType: { type: 'string', example: 'image/jpeg' },
            fileSize: { type: 'integer', minimum: 0, example: 254210 },
          },
        },
        SubmitTaskRequest: {
          type: 'object',
          required: ['taskId', 'description', 'proof'],
          properties: {
            taskId: { type: 'string', example: '66ab123456789012345678ab' },
            description: {
              type: 'string',
              maxLength: 2000,
              example: 'I planted 10 trees in my locality.',
            },
            proof: { $ref: '#/components/schemas/TaskSubmissionProof' },
          },
        },
        ReviewTaskSubmissionRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['under_review', 'approved', 'rejected'],
              example: 'approved',
            },
            reviewComment: { type: 'string', maxLength: 2000, example: 'Excellent work.' },
            rejectionReason: {
              type: 'string',
              maxLength: 2000,
              description: 'Required when status is rejected',
              example: 'Uploaded image is unclear.',
            },
            pointsEarned: { type: 'integer', minimum: 0, example: 50 },
            badgeAwarded: { type: 'boolean', example: true },
          },
        },
        TaskSubmissionResponse: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            student: {
              type: 'object',
              nullable: true,
              properties: {
                _id: { type: 'string' },
                fullName: { type: 'string' },
                email: { type: 'string' },
                schoolId: { type: 'string', nullable: true },
              },
            },
            studentName: { type: 'string' },
            task: {
              type: 'object',
              nullable: true,
              properties: {
                _id: { type: 'string' },
                title: { type: 'string' },
              },
            },
            taskTitle: { type: 'string' },
            description: { type: 'string' },
            proof: { $ref: '#/components/schemas/TaskSubmissionProof' },
            status: {
              type: 'string',
              enum: ['pending', 'under_review', 'approved', 'rejected'],
            },
            reviewedBy: {
              type: 'object',
              nullable: true,
              properties: {
                _id: { type: 'string' },
                fullName: { type: 'string' },
                email: { type: 'string' },
              },
            },
            reviewedAt: { type: 'string', format: 'date-time', nullable: true },
            reviewComment: { type: 'string', nullable: true },
            rejectionReason: { type: 'string', nullable: true },
            pointsEarned: { type: 'integer' },
            badgeAwarded: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        EventResponse: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            city: { type: 'string' },
            eventDate: { type: 'string', format: 'date-time' },
            eventType: { type: 'string', enum: ['public', 'private'] },
            is_active: { type: 'boolean' },
            category: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                icon: { type: 'string' },
              },
            },
            schools: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  school_name: { type: 'string' },
                },
              },
            },
            governmentOrganizations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  organization_name: { type: 'string' },
                },
              },
            },
          },
        },
        StudentEventResponse: {
          type: 'object',
          properties: {
            eventId: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            eventDate: { type: 'string', format: 'date-time' },
            city: { type: 'string' },
            status: {
              type: 'string',
              enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
            },
            totalParticipants: { type: 'integer' },
          },
        },
        JoinedEventResponse: {
          type: 'object',
          properties: {
            event: {
              type: 'object',
              nullable: true,
              properties: {
                _id: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                eventDate: { type: 'string', format: 'date-time' },
                city: { type: 'string' },
                status: {
                  type: 'string',
                  enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
                },
                totalParticipants: { type: 'integer' },
              },
            },
            joinedAt: { type: 'string', format: 'date-time' },
            attendanceStatus: {
              type: 'string',
              enum: ['registered', 'attended', 'absent'],
            },
          },
        },
        CreateExpertSessionRequest: {
          type: 'object',
          required: [
            'title',
            'description',
            'expertName',
            'sessionDate',
            'startTime',
            'endTime',
            'zoomLink',
          ],
          properties: {
            title: {
              type: 'string',
              maxLength: 200,
              example: 'Career Guidance with Industry Experts',
            },
            description: {
              type: 'string',
              example: 'An interactive session on building a career in tech.',
            },
            expertName: { type: 'string', example: 'Dr. Anita Rao' },
            sessionDate: {
              type: 'string',
              format: 'date',
              description: 'Must fall on a Saturday or Sunday',
              example: '2026-08-01',
            },
            startTime: { type: 'string', example: '10:00', description: 'HH:mm (24-hour)' },
            endTime: { type: 'string', example: '11:30', description: 'HH:mm (24-hour)' },
            zoomLink: { type: 'string', format: 'uri', example: 'https://zoom.us/j/1234567890' },
            zoomMeetingId: { type: 'string', example: '123 4567 890' },
            zoomPassword: { type: 'string', example: 'expert123' },
          },
        },
        UpdateExpertSessionRequest: {
          type: 'object',
          properties: {
            title: { type: 'string', maxLength: 200 },
            description: { type: 'string' },
            expertName: { type: 'string' },
            sessionDate: {
              type: 'string',
              format: 'date',
              description: 'Must fall on a Saturday or Sunday',
            },
            startTime: { type: 'string', description: 'HH:mm (24-hour)' },
            endTime: { type: 'string', description: 'HH:mm (24-hour)' },
            zoomLink: { type: 'string', format: 'uri' },
            zoomMeetingId: { type: 'string' },
            zoomPassword: { type: 'string' },
            status: {
              type: 'string',
              enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
            },
            is_active: { type: 'boolean' },
          },
        },
        ExpertSessionResponse: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            expertName: { type: 'string' },
            sessionDate: { type: 'string', format: 'date-time' },
            startTime: { type: 'string' },
            endTime: { type: 'string' },
            zoomLink: { type: 'string' },
            zoomMeetingId: { type: 'string', nullable: true },
            zoomPassword: {
              type: 'string',
              nullable: true,
              description: 'Returned in details only',
            },
            status: {
              type: 'string',
              enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
            },
            is_active: { type: 'boolean' },
            totalJoined: {
              type: 'integer',
              example: 25,
              description: 'Total number of users who have joined this session',
            },
            hasJoined: {
              type: 'boolean',
              example: false,
              description: 'Whether the currently authenticated user has joined this session',
            },
            created_by: { type: 'string', nullable: true },
            updated_by: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        JoinExpertSessionResponse: {
          type: 'object',
          properties: {
            sessionId: { type: 'string' },
            joinedAt: { type: 'string', format: 'date-time' },
            totalJoined: { type: 'integer', example: 25 },
          },
        },
        ExpertSessionJoinCountResponse: {
          type: 'object',
          properties: {
            sessionId: { type: 'string' },
            title: { type: 'string' },
            totalJoined: { type: 'integer', example: 25 },
          },
        },
        ExpertSessionParticipantItem: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            userName: { type: 'string', example: 'Rahul Sharma' },
            userRole: {
              type: 'string',
              enum: ['admin', 'school', 'government', 'student'],
            },
            joinedAt: { type: 'string', format: 'date-time' },
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
      { name: 'Event Categories', description: 'Event category management endpoints' },
      { name: 'Events', description: 'Event management endpoints' },
      {
        name: 'Event Participation',
        description: 'Student event participation endpoints (join, upcoming, joined)',
      },
      { name: 'Missions', description: 'Mission management endpoints' },
      { name: 'Task Submissions', description: 'Task submission and review endpoints' },
      {
        name: 'Expert Sessions',
        description:
          'Expert session management, join tracking, and participant counts (admin CRUD; all roles can view/join)',
      },
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
            'Returns total, approved (active), and pending counts for schools, governments, and students. Requires Admin JWT.',
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
            'Creates a pending student account linked to an active school via schoolId. Validates the school exists and is a school-role user. Public endpoint.',
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
      '/api/v1/student': {
        get: {
          summary: 'List students (admin or student)',
          description:
            'Paginated student users with optional search, status, grade, and schoolId filters. Sorted newest first.',
          tags: ['Student'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'search',
              in: 'query',
              required: false,
              description: 'Search by full name, email, phone, class grade, school name, or city',
              schema: { type: 'string', example: 'Rahul' },
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
              name: 'grade',
              in: 'query',
              required: false,
              description: 'Filter by class/grade (matches classGrade)',
              schema: { type: 'string', example: '10' },
            },
            {
              name: 'schoolId',
              in: 'query',
              required: false,
              description: 'Filter students by associated school ObjectId',
              schema: { type: 'string', example: '687b008cc16d670962ee7b09' },
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
              description: 'Students fetched successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/StudentsListResponse' },
                },
              },
            },
            400: { description: 'Validation failed' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin or student only' },
          },
        },
      },
      '/api/v1/student/{id}': {
        get: {
          summary: 'Get student details by ID (admin or student)',
          description: 'Returns complete student profile details. Requires Admin or Student JWT.',
          tags: ['Student'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Student user MongoDB ObjectId',
              schema: { type: 'string', example: '65a1b2c3d4e5f6a7b8c9d0e3' },
            },
          ],
          responses: {
            200: {
              description: 'Student details fetched successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/StudentDetailsResponse' },
                },
              },
            },
            400: { description: 'Invalid ObjectId or invalid role' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin or student only' },
            404: { description: 'User not found' },
          },
        },
      },
      '/api/v1/student/{id}/approve': {
        patch: {
          summary: 'Approve a pending student (admin only)',
          description:
            'Sets student status to active and isVerified to true. Only pending student users can be approved.',
          tags: ['Student'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Student user MongoDB ObjectId',
              schema: { type: 'string', example: '65a1b2c3d4e5f6a7b8c9d0e3' },
            },
          ],
          responses: {
            200: {
              description: 'Student approved successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApproveUserResponse' },
                },
              },
            },
            400: {
              description: 'Validation failed, invalid role, or student already approved',
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
            404: { description: 'User not found' },
          },
        },
      },

      // ──────────── School ────────────
      '/api/v1/school/students': {
        get: {
          summary: 'List students for the logged-in school',
          description:
            'Returns only students whose schoolId matches the authenticated school user. schoolId cannot be passed by the client. Supports search, status, grade filters and pagination.',
          tags: ['School'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'search',
              in: 'query',
              required: false,
              description: 'Search by student name, student ID, admission number, email, or phone',
              schema: { type: 'string', example: 'Rahul' },
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
              name: 'grade',
              in: 'query',
              required: false,
              description: 'Filter by class/grade (matches classGrade)',
              schema: { type: 'string', example: '10' },
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
              description: 'Students fetched successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/StudentsListResponse' },
                },
              },
            },
            400: { description: 'Validation failed (e.g. client sent schoolId)' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — school only' },
          },
        },
      },
      '/api/v1/school/events': {
        get: {
          summary: 'List events for the logged-in school',
          description:
            'Returns public events and private events where schoolIds contains the authenticated school userId. Supports search, filters, sorting, and pagination.',
          tags: ['School'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Search title, description, city',
            },
            { name: 'categoryId', in: 'query', schema: { type: 'string' } },
            { name: 'city', in: 'query', schema: { type: 'string' } },
            { name: 'fromDate', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'toDate', in: 'query', schema: { type: 'string', format: 'date' } },
            {
              name: 'eventType',
              in: 'query',
              schema: { type: 'string', enum: ['public', 'private'] },
            },
            {
              name: 'sortBy',
              in: 'query',
              schema: { type: 'string', enum: ['eventDate', 'createdAt', 'title'] },
            },
            {
              name: 'sortOrder',
              in: 'query',
              schema: { type: 'string', enum: ['asc', 'desc'] },
            },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            },
          ],
          responses: {
            200: { description: 'School events fetched successfully' },
            400: { description: 'Validation failed' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — school only' },
          },
        },
      },
      '/api/v1/government/events': {
        get: {
          summary: 'List events for the logged-in government organization',
          description:
            'Returns public events and private events where governmentIds contains the authenticated government userId.',
          tags: ['Government'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Search title, description, city',
            },
            { name: 'categoryId', in: 'query', schema: { type: 'string' } },
            { name: 'city', in: 'query', schema: { type: 'string' } },
            { name: 'fromDate', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'toDate', in: 'query', schema: { type: 'string', format: 'date' } },
            {
              name: 'eventType',
              in: 'query',
              schema: { type: 'string', enum: ['public', 'private'] },
            },
            {
              name: 'sortBy',
              in: 'query',
              schema: { type: 'string', enum: ['eventDate', 'createdAt', 'title'] },
            },
            {
              name: 'sortOrder',
              in: 'query',
              schema: { type: 'string', enum: ['asc', 'desc'] },
            },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            },
          ],
          responses: {
            200: { description: 'Government events fetched successfully' },
            400: { description: 'Validation failed' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — government only' },
          },
        },
      },
      '/api/v1/student/events': {
        get: {
          summary: 'List events for the logged-in student',
          description:
            'Returns public events and private events assigned to the student school (schoolIds contains student.schoolId).',
          tags: ['Student'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Search title, description, city',
            },
            { name: 'categoryId', in: 'query', schema: { type: 'string' } },
            { name: 'city', in: 'query', schema: { type: 'string' } },
            { name: 'fromDate', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'toDate', in: 'query', schema: { type: 'string', format: 'date' } },
            {
              name: 'eventType',
              in: 'query',
              schema: { type: 'string', enum: ['public', 'private'] },
            },
            {
              name: 'sortBy',
              in: 'query',
              schema: { type: 'string', enum: ['eventDate', 'createdAt', 'title'] },
            },
            {
              name: 'sortOrder',
              in: 'query',
              schema: { type: 'string', enum: ['asc', 'desc'] },
            },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            },
          ],
          responses: {
            200: { description: 'Student events fetched successfully' },
            400: { description: 'Validation failed or student not linked to a school' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — student only' },
          },
        },
      },

      // ──────────── Event Categories ────────────
      '/api/v1/event-categories': {
        post: {
          summary: 'Create event category (admin only)',
          tags: ['Event Categories'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateEventCategoryRequest' },
              },
            },
          },
          responses: {
            201: { description: 'Category created successfully' },
            400: { description: 'Validation failed' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
            409: { description: 'Category name already exists' },
          },
        },
        get: {
          summary: 'List event categories (admin only)',
          description:
            'Paginated listing with search, is_active filter, and sorting. Default sort: sort_order ASC, createdAt DESC.',
          tags: ['Event Categories'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'search',
              in: 'query',
              required: false,
              schema: { type: 'string', example: 'Crime' },
            },
            {
              name: 'is_active',
              in: 'query',
              required: false,
              schema: { type: 'boolean', example: true },
            },
            {
              name: 'page',
              in: 'query',
              required: false,
              schema: { type: 'integer', minimum: 1, default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            },
            {
              name: 'sort_by',
              in: 'query',
              required: false,
              schema: {
                type: 'string',
                enum: ['name', 'sort_order', 'createdAt', 'updatedAt', 'is_active'],
              },
            },
            {
              name: 'sort_order',
              in: 'query',
              required: false,
              schema: { type: 'string', enum: ['asc', 'desc'] },
            },
          ],
          responses: {
            200: {
              description: 'Categories fetched successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/EventCategoryListResponse' },
                },
              },
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
          },
        },
      },
      '/api/v1/event-categories/dropdown': {
        get: {
          summary: 'Active categories dropdown (authenticated)',
          description:
            'Returns only active categories sorted by sort_order ASC for event creation.',
          tags: ['Event Categories'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Category dropdown fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/EventCategoryDropdownItem' },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/v1/event-categories/{id}': {
        get: {
          summary: 'Get category details (admin only)',
          tags: ['Event Categories'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: { description: 'Category details fetched successfully' },
            400: { description: 'Invalid ObjectId' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
            404: { description: 'Category not found' },
          },
        },
        put: {
          summary: 'Update category (admin only)',
          tags: ['Event Categories'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateEventCategoryRequest' },
              },
            },
          },
          responses: {
            200: { description: 'Category updated successfully' },
            400: { description: 'Validation failed' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
            404: { description: 'Category not found' },
            409: { description: 'Category name already exists' },
          },
        },
        delete: {
          summary: 'Delete category (admin only)',
          description: 'Permanently deletes a category if it is not referenced by any event.',
          tags: ['Event Categories'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: { description: 'Category deleted successfully' },
            400: { description: 'Category is associated with events' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
            404: { description: 'Category not found' },
          },
        },
      },
      '/api/v1/event-categories/{id}/status': {
        patch: {
          summary: 'Activate or deactivate category (admin only)',
          tags: ['Event Categories'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateEventCategoryStatusRequest' },
              },
            },
          },
          responses: {
            200: { description: 'Category activated/deactivated successfully' },
            400: { description: 'Validation failed' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
            404: { description: 'Category not found' },
          },
        },
      },

      // ──────────── Events ────────────
      '/api/v1/events/mission-dropdown': {
        get: {
          summary: 'Mission event dropdown (admin only)',
          description:
            'Returns active events whose eventDate falls within the last 7 days up to now. Sorted by eventDate newest first. Supports search by title and pagination.',
          tags: ['Events', 'Missions'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          ],
          responses: {
            200: { description: 'Mission event dropdown fetched successfully' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
          },
        },
      },
      '/api/v1/events': {
        post: {
          summary: 'Create event (admin only)',
          tags: ['Events'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CreateEventRequest' } },
            },
          },
          responses: {
            201: { description: 'Event created successfully' },
            400: { description: 'Validation failed or invalid references' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
          },
        },
        get: {
          summary: 'List events (admin only)',
          tags: ['Events'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'categoryId', in: 'query', schema: { type: 'string' } },
            { name: 'city', in: 'query', schema: { type: 'string' } },
            { name: 'eventDate', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'schoolId', in: 'query', schema: { type: 'string' } },
            { name: 'governmentId', in: 'query', schema: { type: 'string' } },
            {
              name: 'eventType',
              in: 'query',
              schema: { type: 'string', enum: ['public', 'private'] },
            },
            { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
            {
              name: 'sort_by',
              in: 'query',
              schema: { type: 'string', enum: ['eventDate', 'createdAt', 'title'] },
            },
            {
              name: 'sort_order',
              in: 'query',
              schema: { type: 'string', enum: ['asc', 'desc'] },
            },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          ],
          responses: {
            200: { description: 'Events fetched successfully' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
          },
        },
      },
      '/api/v1/events/{id}': {
        get: {
          summary: 'Get event details (admin only)',
          tags: ['Events'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Event details fetched successfully' },
            404: { description: 'Event not found' },
          },
        },
        put: {
          summary: 'Update event (admin only)',
          tags: ['Events'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CreateEventRequest' } },
            },
          },
          responses: {
            200: { description: 'Event updated successfully' },
            404: { description: 'Event not found' },
          },
        },
        delete: {
          summary: 'Delete event (admin only)',
          tags: ['Events'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Event deleted successfully' },
            404: { description: 'Event not found' },
          },
        },
      },
      // ──────────── Student Event Participation ────────────
      '/api/v1/events/student/events': {
        get: {
          summary: 'List upcoming/ongoing events for the student\u2019s school (student only)',
          description:
            "Returns only upcoming and ongoing events belonging to the logged-in student's school, sorted by nearest event date.",
          tags: ['Event Participation'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Student events fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/StudentEventResponse' },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — student only' },
          },
        },
      },
      '/api/v1/events/student/events/my-events': {
        get: {
          summary: 'List events joined by the student (student only)',
          description:
            'Returns all events the logged-in student has joined, with joined date and attendance status.',
          tags: ['Event Participation'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Joined events fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/JoinedEventResponse' },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — student only' },
          },
        },
      },
      '/api/v1/events/student/events/{id}/join': {
        post: {
          summary: 'Join an event (student only)',
          description:
            "Registers the logged-in student for an event of their school. The event must belong to the student's school and must not be completed or cancelled.",
          tags: ['Event Participation'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Event ID',
            },
          ],
          responses: {
            200: {
              description: 'Event joined successfully.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Event joined successfully.' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid ObjectId, validation failed, or event completed/cancelled',
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — student only, or event not in student\u2019s school' },
            404: { description: 'Event not found' },
            409: { description: 'Already joined or maximum participants reached' },
          },
        },
      },
      '/api/v1/government/dropdown': {
        get: {
          summary: 'Government organizations dropdown (authenticated)',
          description:
            'Paginated active government organizations with search and filters. Defaults to active only.',
          tags: ['Government'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'city', in: 'query', schema: { type: 'string' } },
            { name: 'department', in: 'query', schema: { type: 'string' } },
            { name: 'state', in: 'query', schema: { type: 'string' } },
            { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          ],
          responses: {
            200: { description: 'Government organizations fetched successfully' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/v1/government/schools': {
        get: {
          summary: 'List all schools (government only)',
          description:
            'Paginated schools list for government users. Defaults to active schools. Supports search, city, and state filters.',
          tags: ['Government'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Search by school name, full name, email, or city',
            },
            { name: 'city', in: 'query', schema: { type: 'string' } },
            { name: 'state', in: 'query', schema: { type: 'string' } },
            { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          ],
          responses: {
            200: { description: 'Schools fetched successfully' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — government only' },
          },
        },
      },

      // ──────────── Missions ────────────
      '/api/v1/missions': {
        post: {
          summary: 'Create mission (admin only)',
          tags: ['Missions'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CreateMissionRequest' } },
            },
          },
          responses: {
            201: { description: 'Mission created successfully' },
            400: {
              description: 'Validation failed, event not found, inactive, or older than 7 days',
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
          },
        },
        get: {
          summary: 'List missions (admin only)',
          tags: ['Missions'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Search mission title, description, or event title',
            },
            {
              name: 'difficulty',
              in: 'query',
              schema: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
            },
            { name: 'eventId', in: 'query', schema: { type: 'string' } },
            { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
            {
              name: 'fromDate',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Filter by deadline from date',
            },
            {
              name: 'toDate',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Filter by deadline to date',
            },
            { name: 'minRewardPoints', in: 'query', schema: { type: 'integer', minimum: 1 } },
            { name: 'maxRewardPoints', in: 'query', schema: { type: 'integer', minimum: 1 } },
            {
              name: 'sortBy',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['createdAt', 'deadline', 'rewardPoints', 'title'],
              },
            },
            {
              name: 'sortOrder',
              in: 'query',
              schema: { type: 'string', enum: ['asc', 'desc'] },
            },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          ],
          responses: {
            200: { description: 'Mission list fetched successfully' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
          },
        },
      },
      '/api/v1/missions/student': {
        get: {
          summary: 'List missions of the student\u2019s school events (student only)',
          description:
            "Returns active missions attached to events associated with the logged-in student's school (public events or events privately linked to their school). Automatically scoped to the student's school.",
          tags: ['Missions'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Search mission title, description, or event title',
            },
            {
              name: 'difficulty',
              in: 'query',
              schema: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
            },
            { name: 'eventId', in: 'query', schema: { type: 'string' } },
            {
              name: 'fromDate',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Filter by deadline from date',
            },
            {
              name: 'toDate',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Filter by deadline to date',
            },
            { name: 'minRewardPoints', in: 'query', schema: { type: 'integer', minimum: 1 } },
            { name: 'maxRewardPoints', in: 'query', schema: { type: 'integer', minimum: 1 } },
            {
              name: 'sortBy',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['createdAt', 'deadline', 'rewardPoints', 'title'],
              },
            },
            {
              name: 'sortOrder',
              in: 'query',
              schema: { type: 'string', enum: ['asc', 'desc'] },
            },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          ],
          responses: {
            200: { description: 'Student missions fetched successfully' },
            400: { description: 'Student is not linked to a school' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — student only' },
          },
        },
      },
      '/api/v1/missions/{id}': {
        get: {
          summary: 'Get mission details (admin only)',
          tags: ['Missions'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'Mission details fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: { $ref: '#/components/schemas/MissionResponse' },
                    },
                  },
                },
              },
            },
            404: { description: 'Mission not found' },
          },
        },
        put: {
          summary: 'Update mission (admin only)',
          tags: ['Missions'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CreateMissionRequest' } },
            },
          },
          responses: {
            200: { description: 'Mission updated successfully' },
            400: {
              description: 'Validation failed, event not found, inactive, or older than 7 days',
            },
            404: { description: 'Mission not found' },
          },
        },
        delete: {
          summary: 'Delete mission (admin only)',
          tags: ['Missions'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Mission deleted successfully' },
            404: { description: 'Mission not found' },
          },
        },
      },
      // ──────────── Task Submissions ────────────
      '/api/v1/task-submissions': {
        post: {
          summary: 'Submit a task (student only)',
          description:
            'Submit a task with a proof image. Send as multipart/form-data; the `proof` image is uploaded to AWS S3 and its metadata is stored on the submission.',
          tags: ['Task Submissions'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['taskId', 'description', 'proof'],
                  properties: {
                    taskId: { type: 'string', example: '66ab123456789012345678ab' },
                    description: {
                      type: 'string',
                      maxLength: 2000,
                      example: 'I planted 10 trees in my locality.',
                    },
                    proof: {
                      type: 'string',
                      format: 'binary',
                      description: 'Proof image file (jpeg, png, webp, gif — max 5 MB)',
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Task submitted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: { $ref: '#/components/schemas/TaskSubmissionResponse' },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation failed or invalid ObjectId' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — student only, or task does not belong to student' },
            404: { description: 'Task not found' },
            409: { description: 'Duplicate submission — task already submitted' },
          },
        },
        get: {
          summary: 'List task submissions (admin: all, school: own students, student: own)',
          tags: ['Task Submissions'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'schoolId',
              in: 'query',
              schema: { type: 'string' },
              description: 'Admin only — filter by school',
            },
            {
              name: 'studentId',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filter by student (admin / school)',
            },
            { name: 'taskId', in: 'query', schema: { type: 'string' } },
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['pending', 'under_review', 'approved', 'rejected'],
              },
            },
            {
              name: 'fromDate',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Filter by submission date from',
            },
            {
              name: 'toDate',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Filter by submission date to',
            },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          ],
          responses: {
            200: {
              description: 'Task submissions fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: {
                        type: 'object',
                        properties: {
                          submissions: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/TaskSubmissionResponse' },
                          },
                          pagination: {
                            type: 'object',
                            properties: {
                              page: { type: 'integer' },
                              limit: { type: 'integer' },
                              total: { type: 'integer' },
                              totalPages: { type: 'integer' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' },
          },
        },
      },
      '/api/v1/task-submissions/{id}': {
        get: {
          summary: 'Get task submission details (role-scoped access)',
          tags: ['Task Submissions'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'Task submission details fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: { $ref: '#/components/schemas/TaskSubmissionResponse' },
                    },
                  },
                },
              },
            },
            400: { description: 'Invalid ObjectId' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — not permitted to access this submission' },
            404: { description: 'Task submission not found' },
          },
        },
      },
      '/api/v1/task-submissions/{id}/review': {
        patch: {
          summary: 'Review a task submission (school only)',
          tags: ['Task Submissions'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReviewTaskSubmissionRequest' },
              },
            },
          },
          responses: {
            200: {
              description: 'Task submission reviewed successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: { $ref: '#/components/schemas/TaskSubmissionResponse' },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation failed or invalid ObjectId' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — school only, or student does not belong to school' },
            404: { description: 'Task submission not found' },
            409: { description: 'Submission already reviewed and can no longer be reviewed' },
          },
        },
      },
      // ──────────── Expert Sessions ────────────
      '/api/v1/expert-sessions': {
        post: {
          summary: 'Create expert session (admin only)',
          description:
            'Creates an expert session. sessionDate must fall on a Saturday or Sunday, zoomLink must be a valid URL, and endTime must be greater than startTime.',
          tags: ['Expert Sessions'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateExpertSessionRequest' },
              },
            },
          },
          responses: {
            201: {
              description: 'Expert session created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: { $ref: '#/components/schemas/ExpertSessionResponse' },
                    },
                  },
                },
              },
            },
            400: {
              description:
                'Validation failed, sessionDate not on Saturday/Sunday, invalid Zoom link, or endTime <= startTime',
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
          },
        },
        get: {
          summary: 'List expert sessions (all roles)',
          description:
            'Returns expert sessions to any authenticated user. Non-admin roles only see active sessions. Sorted by nearest sessionDate.',
          tags: ['Expert Sessions'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Search title, description, or expertName',
            },
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
              },
            },
            {
              name: 'fromDate',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Filter by sessionDate from',
            },
            {
              name: 'toDate',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Filter by sessionDate to',
            },
            {
              name: 'is_active',
              in: 'query',
              schema: { type: 'boolean' },
              description: 'Admin only — non-admins are always scoped to active',
            },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          ],
          responses: {
            200: {
              description: 'Expert sessions fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: {
                        type: 'object',
                        properties: {
                          sessions: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/ExpertSessionResponse' },
                          },
                          pagination: {
                            type: 'object',
                            properties: {
                              page: { type: 'integer' },
                              limit: { type: 'integer' },
                              total: { type: 'integer' },
                              totalPages: { type: 'integer' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' },
          },
        },
      },
      '/api/v1/expert-sessions/{id}': {
        get: {
          summary: 'Get expert session details (all roles)',
          tags: ['Expert Sessions'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'Expert session details fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: { $ref: '#/components/schemas/ExpertSessionResponse' },
                    },
                  },
                },
              },
            },
            400: { description: 'Invalid ObjectId' },
            401: { description: 'Unauthorized' },
            404: { description: 'Expert session not found' },
          },
        },
        put: {
          summary: 'Update expert session (admin only)',
          tags: ['Expert Sessions'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateExpertSessionRequest' },
              },
            },
          },
          responses: {
            200: {
              description: 'Expert session updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: { $ref: '#/components/schemas/ExpertSessionResponse' },
                    },
                  },
                },
              },
            },
            400: {
              description:
                'Validation failed, sessionDate not on Saturday/Sunday, invalid Zoom link, or endTime <= startTime',
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
            404: { description: 'Expert session not found' },
          },
        },
        delete: {
          summary: 'Delete expert session (admin only)',
          tags: ['Expert Sessions'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Expert session deleted successfully' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
            404: { description: 'Expert session not found' },
          },
        },
      },
      '/api/v1/expert-sessions/{id}/join': {
        post: {
          summary: 'Join an expert session (all roles)',
          description:
            'Registers the authenticated user for an expert session. Session must be active and status must be UPCOMING or ONGOING. Duplicate joins are rejected.',
          tags: ['Expert Sessions'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'Joined expert session successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: { $ref: '#/components/schemas/JoinExpertSessionResponse' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid ObjectId, session inactive, completed, or cancelled',
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' },
            404: { description: 'Expert session not found' },
            409: { description: 'Already joined this session' },
          },
        },
      },
      '/api/v1/expert-sessions/{id}/join-count': {
        get: {
          summary: 'Get expert session join count (all roles)',
          tags: ['Expert Sessions'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'Join count fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: { $ref: '#/components/schemas/ExpertSessionJoinCountResponse' },
                    },
                  },
                },
              },
            },
            400: { description: 'Invalid ObjectId' },
            401: { description: 'Unauthorized' },
            404: { description: 'Expert session not found' },
          },
        },
      },
      '/api/v1/expert-sessions/{id}/participants': {
        get: {
          summary: 'List session participants (admin only)',
          description:
            'Returns paginated participants for an expert session. Supports filtering by role and searching by userName.',
          tags: ['Expert Sessions'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
            {
              name: 'role',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['admin', 'school', 'government', 'student'],
              },
            },
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Search by userName',
            },
          ],
          responses: {
            200: {
              description: 'Session participants fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: {
                        type: 'object',
                        properties: {
                          participants: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/ExpertSessionParticipantItem' },
                          },
                          pagination: {
                            type: 'object',
                            properties: {
                              page: { type: 'integer' },
                              limit: { type: 'integer' },
                              total: { type: 'integer' },
                              totalPages: { type: 'integer' },
                            },
                          },
                          totalJoined: { type: 'integer' },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: 'Invalid ObjectId or validation failed' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — admin only' },
            404: { description: 'Expert session not found' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
