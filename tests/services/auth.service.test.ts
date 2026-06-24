import { AuthService } from '../../src/services/auth.service';
import { User } from '../../src/models/user.model';
import { ApiError } from '../../src/utils/ApiError';
import { HTTP_STATUS } from '../../src/utils/constants';

jest.mock('../../src/models/user.model');
jest.mock('../../src/utils/jwt', () => ({
  generateTokenPair: jest.fn().mockReturnValue({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  }),
  verifyRefreshToken: jest.fn().mockReturnValue({
    userId: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    role: 'student',
  }),
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
  });

  describe('register', () => {
    const registerData = { name: 'John Doe', email: 'john@example.com', password: '123456' };

    it('should register a new user successfully', async () => {
      const mockUser = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student',
        isActive: true,
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.register(registerData);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('john@example.com');
    });

    it('should throw error if email already exists', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ email: 'john@example.com' });

      await expect(authService.register(registerData)).rejects.toThrow(ApiError);
      await expect(authService.register(registerData)).rejects.toMatchObject({
        statusCode: HTTP_STATUS.CONFLICT,
      });
    });
  });

  describe('login', () => {
    const loginData = { email: 'john@example.com', password: '123456' };

    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.login(loginData);

      expect(result).toHaveProperty('accessToken');
      expect(result.user.email).toBe('john@example.com');
    });

    it('should throw error with invalid email', async () => {
      (User.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

      await expect(authService.login(loginData)).rejects.toThrow(ApiError);
      await expect(authService.login(loginData)).rejects.toMatchObject({
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      });
    });

    it('should throw error with invalid password', async () => {
      const mockUser = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        email: 'john@example.com',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(authService.login(loginData)).rejects.toThrow(ApiError);
    });

    it('should throw error if account is deactivated', async () => {
      const mockUser = { email: 'john@example.com', isActive: false };
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(authService.login(loginData)).rejects.toThrow(ApiError);
      await expect(authService.login(loginData)).rejects.toMatchObject({
        statusCode: HTTP_STATUS.FORBIDDEN,
      });
    });
  });

  describe('logout', () => {
    it('should clear refresh token', async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

      await authService.logout('507f1f77bcf86cd799439011');

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('507f1f77bcf86cd799439011', {
        refreshToken: null,
      });
    });
  });
});
