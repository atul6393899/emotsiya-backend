import { User, IUserDocument } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../utils/constants';

export class StudentService {
  async getProfile(userId: string): Promise<IUserDocument> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Student profile not found');
    }
    return user;
  }

  async updateProfile(userId: string, updateData: { name?: string }): Promise<IUserDocument> {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Student profile not found');
    }
    return user;
  }

  async getDashboard(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Student not found');
    }

    return {
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      memberSince: user.createdAt,
    };
  }
}
