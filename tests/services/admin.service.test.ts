import { AdminService } from '../../src/services/admin.service';
import { User } from '../../src/models/user.model';
import { ApiError } from '../../src/utils/ApiError';
import { HTTP_STATUS } from '../../src/utils/constants';

jest.mock('../../src/models/user.model');

describe('AdminService', () => {
  let adminService: AdminService;

  beforeEach(() => {
    jest.clearAllMocks();
    adminService = new AdminService();
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
      };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await adminService.getUserById('507f1f77bcf86cd799439011');

      expect(result.name).toBe('John Doe');
      expect(User.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw 404 if user not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(adminService.getUserById('507f1f77bcf86cd799439011')).rejects.toThrow(ApiError);
      await expect(adminService.getUserById('507f1f77bcf86cd799439011')).rejects.toMatchObject({
        statusCode: HTTP_STATUS.NOT_FOUND,
      });
    });
  });

  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      const mockUser = { _id: '507f1f77bcf86cd799439011', name: 'Updated Name' };
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUser);

      const result = await adminService.updateUser('507f1f77bcf86cd799439011', {
        name: 'Updated Name',
      });

      expect(result.name).toBe('Updated Name');
    });

    it('should throw 404 if user not found', async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await expect(
        adminService.updateUser('507f1f77bcf86cd799439011', { name: 'Test' }),
      ).rejects.toThrow(ApiError);
    });
  });

  describe('deleteUser', () => {
    it('should soft delete a user', async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        isDeleted: true,
      });

      await expect(adminService.deleteUser('507f1f77bcf86cd799439011')).resolves.toBeUndefined();
    });

    it('should throw 404 if user not found', async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await expect(adminService.deleteUser('507f1f77bcf86cd799439011')).rejects.toThrow(ApiError);
    });
  });
});
