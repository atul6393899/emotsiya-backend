import { StudentService } from '../../src/services/student.service';
import { User } from '../../src/models/user.model';
import { ApiError } from '../../src/utils/ApiError';
import { HTTP_STATUS } from '../../src/utils/constants';

jest.mock('../../src/models/user.model');

describe('StudentService', () => {
  let studentService: StudentService;

  beforeEach(() => {
    jest.clearAllMocks();
    studentService = new StudentService();
  });

  describe('getProfile', () => {
    it('should return student profile', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Satya',
        email: 'satya@example.com',
        role: 'student',
      };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await studentService.getProfile('507f1f77bcf86cd799439011');

      expect(result.name).toBe('Satya');
    });

    it('should throw 404 if student not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(studentService.getProfile('507f1f77bcf86cd799439011')).rejects.toThrow(ApiError);
      await expect(studentService.getProfile('507f1f77bcf86cd799439011')).rejects.toMatchObject({
        statusCode: HTTP_STATUS.NOT_FOUND,
      });
    });
  });

  describe('updateProfile', () => {
    it('should update student profile', async () => {
      const mockUser = { _id: '507f1f77bcf86cd799439011', name: 'Updated Satya' };
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUser);

      const result = await studentService.updateProfile('507f1f77bcf86cd799439011', {
        name: 'Updated Satya',
      });

      expect(result.name).toBe('Updated Satya');
    });

    it('should throw 404 if student not found', async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await expect(
        studentService.updateProfile('507f1f77bcf86cd799439011', { name: 'Test' }),
      ).rejects.toThrow(ApiError);
    });
  });

  describe('getDashboard', () => {
    it('should return student dashboard data', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Satya',
        email: 'satya@example.com',
        role: 'student',
        isActive: true,
        createdAt: new Date('2026-01-01'),
      };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await studentService.getDashboard('507f1f77bcf86cd799439011');

      expect(result.name).toBe('Satya');
      expect(result.role).toBe('student');
    });

    it('should throw 404 if student not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(studentService.getDashboard('507f1f77bcf86cd799439011')).rejects.toThrow(
        ApiError,
      );
    });
  });
});
