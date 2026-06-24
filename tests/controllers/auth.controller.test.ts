import { Request, Response, NextFunction } from 'express';
import { AuthController } from '../../src/controllers/auth.controller';
import { AuthService } from '../../src/services/auth.service';

jest.mock('../../src/services/auth.service');

describe('AuthController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('register', () => {
    it('should return 201 on successful registration', async () => {
      const mockResult = {
        user: { name: 'John Doe', email: 'john@example.com', role: 'student', isActive: true },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      mockReq = { body: { name: 'John Doe', email: 'john@example.com', password: '123456' } };
      (AuthService.prototype.register as jest.Mock).mockResolvedValue(mockResult);

      await AuthController.register(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, statusCode: 201 }),
      );
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Registration failed');
      mockReq = { body: {} };
      (AuthService.prototype.register as jest.Mock).mockRejectedValue(error);

      await AuthController.register(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('should return 200 on successful login', async () => {
      const mockResult = {
        user: { name: 'John Doe', email: 'john@example.com', role: 'student', isActive: true },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      mockReq = { body: { email: 'john@example.com', password: '123456' } };
      (AuthService.prototype.login as jest.Mock).mockResolvedValue(mockResult);

      await AuthController.login(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, statusCode: 200 }),
      );
    });
  });

  describe('logout', () => {
    it('should return 200 on successful logout', async () => {
      mockReq = {
        user: { userId: '507f1f77bcf86cd799439011', email: 'test@example.com', role: 'student' },
      } as Partial<Request>;
      (AuthService.prototype.logout as jest.Mock).mockResolvedValue(undefined);

      await AuthController.logout(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
