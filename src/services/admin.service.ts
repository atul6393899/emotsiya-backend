import { User, IUserDocument } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../utils/constants';
import { getPaginationParams, buildPaginationMeta } from '../utils/helpers';
import { FilterQuery, SortOrder } from 'mongoose';

export interface IQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class AdminService {
  async getAllUsers(queryParams: IQueryParams) {
    const { skip, limit, page } = getPaginationParams(queryParams.page, queryParams.limit);

    const filter: FilterQuery<IUserDocument> = {};

    if (queryParams.search) {
      filter.$or = [
        { name: { $regex: queryParams.search, $options: 'i' } },
        { email: { $regex: queryParams.search, $options: 'i' } },
      ];
    }

    if (queryParams.role) {
      filter.role = queryParams.role;
    }

    if (queryParams.isActive !== undefined) {
      filter.isActive = queryParams.isActive;
    }

    const sortField = queryParams.sortBy || 'createdAt';
    const sortOrder: SortOrder = queryParams.sortOrder === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),
      User.countDocuments(filter).exec(),
    ]);

    return { users, pagination: buildPaginationMeta(total, page, limit) };
  }

  async getUserById(id: string): Promise<IUserDocument> {
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    return user;
  }

  async updateUser(id: string, updateData: Record<string, unknown>): Promise<IUserDocument> {
    const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await User.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
      isActive: false,
    });
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }
  }

  async getDashboardStats() {
    const [totalUsers, activeUsers, roleCounts] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      roleCounts: roleCounts.reduce(
        (acc: Record<string, number>, item: { _id: string; count: number }) => {
          acc[item._id] = item.count;
          return acc;
        },
        {},
      ),
    };
  }
}
