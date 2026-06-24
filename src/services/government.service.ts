import { User } from '../models/user.model';
import { IUserDocument } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../utils/constants';
import { getPaginationParams, buildPaginationMeta } from '../utils/helpers';

export class GovernmentService {
  async getAllUsers(queryParams: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) {
    const { skip, limit, page } = getPaginationParams(queryParams.page, queryParams.limit);

    const filter: Record<string, unknown> = {};

    if (queryParams.role) {
      filter.role = queryParams.role;
    }

    if (queryParams.search) {
      filter.$or = [
        { name: { $regex: queryParams.search, $options: 'i' } },
        { email: { $regex: queryParams.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      User.countDocuments(filter).exec(),
    ]);

    return { users, pagination: buildPaginationMeta(total, page, limit) };
  }

  async getSchools(queryParams: { page?: number; limit?: number; search?: string }) {
    const { skip, limit, page } = getPaginationParams(queryParams.page, queryParams.limit);

    const filter: Record<string, unknown> = { role: 'school' };

    if (queryParams.search) {
      filter.$or = [
        { name: { $regex: queryParams.search, $options: 'i' } },
        { email: { $regex: queryParams.search, $options: 'i' } },
      ];
    }

    const [schools, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      User.countDocuments(filter).exec(),
    ]);

    return { schools, pagination: buildPaginationMeta(total, page, limit) };
  }

  async getProfile(userId: string): Promise<IUserDocument> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Government profile not found');
    }
    return user;
  }

  async getDashboard() {
    const [totalUsers, totalSchools, totalStudents, totalGovernment] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'school' }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'government' }),
    ]);

    return {
      totalUsers,
      totalSchools,
      totalStudents,
      totalGovernment,
    };
  }
}
