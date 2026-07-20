import { StudentService, IStudentListQuery, IStudentListResponse } from './student.service';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../utils/constants';

const studentService = new StudentService();

export class SchoolService {
  /**
   * Lists students belonging only to the authenticated school.
   * schoolId is taken from JWT (req.user.userId) — never from the client.
   */
  async getStudents(
    schoolUserId: string,
    query: Omit<IStudentListQuery, 'schoolId'> = {},
  ): Promise<IStudentListResponse> {
    if (!schoolUserId) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'School user not found in token');
    }

    return studentService.getStudents({
      search: query.search,
      page: query.page,
      limit: query.limit,
      status: query.status,
      grade: query.grade,
      schoolId: schoolUserId,
    });
  }
}
