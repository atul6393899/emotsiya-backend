import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../src/middlewares/auth.middleware';
import { authorizeRoles } from '../../src/middlewares/role.middleware';
import { ApiError } from '../../src/utils/ApiError';

jest.mock('../../src/utils/jwt', () => ({
  verifyAccessToken: jest.fn((token: string) => {
    if (token === 'valid-token') {
      return { userId: '507f1f77bcf86cd799439011', email: 'test@example.com', role: 'student' };
    }
    throw new Error('Invalid token');
  }),
}));

describe('Auth Middleware', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('authenticate', () => {
    it('should authenticate with valid token', () => {
      mockReq.headers = { authorization: 'Bearer valid-token' };

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user!.email).toBe('test@example.com');
    });

    it('should throw error if no authorization header', () => {
      mockReq.headers = {};

      expect(() => authenticate(mockReq as Request, mockRes as Response, mockNext)).toThrow(
        ApiError,
      );
    });

    it('should throw error if token format is invalid', () => {
      mockReq.headers = { authorization: 'InvalidFormat token123' };

      expect(() => authenticate(mockReq as Request, mockRes as Response, mockNext)).toThrow(
        ApiError,
      );
    });

    it('should throw error if token is invalid', () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };

      expect(() => authenticate(mockReq as Request, mockRes as Response, mockNext)).toThrow(
        ApiError,
      );
    });
  });
});

describe('Role Middleware', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('authorizeRoles', () => {
    it('should allow authorized roles', () => {
      mockReq.user = {
        userId: '507f1f77bcf86cd799439011',
        email: 'admin@example.com',
        role: 'admin',
      };

      const middleware = authorizeRoles('admin', 'school');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny unauthorized roles', () => {
      mockReq.user = {
        userId: '507f1f77bcf86cd799439011',
        email: 'student@example.com',
        role: 'student',
      };

      const middleware = authorizeRoles('admin');

      expect(() => middleware(mockReq as Request, mockRes as Response, mockNext)).toThrow(ApiError);
    });

    it('should throw if no user on request', () => {
      const middleware = authorizeRoles('admin');

      expect(() => middleware(mockReq as Request, mockRes as Response, mockNext)).toThrow(ApiError);
    });
  });
});
