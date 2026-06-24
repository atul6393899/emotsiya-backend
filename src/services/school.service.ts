import { User, IUserDocument } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../utils/constants';
import { getPaginationParams, buildPaginationMeta } from '../utils/helpers';

export class SchoolService {
  async getStudents(
    schoolUserId: string,
    queryParams: { page?: number; limit?: number; search?: string },
  ) {
    const { skip, limit, page } = getPaginationParams(queryParams.page, queryParams.limit);

    const filter: Record<string, unknown> = { role: 'student' };

    if (queryParams.search) {
      filter.$or = [
        { name: { $regex: queryParams.search, $options: 'i' } },
        { email: { $regex: queryParams.search, $options: 'i' } },
      ];
    }

    const [students, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      User.countDocuments(filter).exec(),
    ]);

    return { students, pagination: buildPaginationMeta(total, page, limit) };
  }

  async getStudentById(studentId: string): Promise<IUserDocument> {
    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Student not found');
    }
    return student;
  }

  async getProfile(userId: string): Promise<IUserDocument> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'School profile not found');
    }
    return user;
  }

  async updateProfile(userId: string, updateData: { name?: string }): Promise<IUserDocument> {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'School profile not found');
    }
    return user;
  }

  async getDashboard() {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeStudents = await User.countDocuments({ role: 'student', isActive: true });

    return {
      totalStudents,
      activeStudents,
      inactiveStudents: totalStudents - activeStudents,
    };
  }
}
