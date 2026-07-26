import { Types } from 'mongoose';
import {
  TaskSubmission,
  ITaskSubmissionDocument,
  ITaskSubmissionProof,
  TaskSubmissionStatus,
} from '../models/taskSubmission.model';
import { Mission } from '../models/mission.model';
import { User } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../utils/constants';
import { ROLES, Role } from '../constants/roles';
import { isValidObjectId, getPaginationParams, buildPaginationMeta } from '../utils/helpers';

const POPULATE_STUDENT = '_id fullName email schoolId';
const POPULATE_TASK = '_id title';
const POPULATE_REVIEWER = '_id fullName email';

export interface IRequester {
  userId: string;
  role: Role;
}

export interface ISubmitTaskRequest {
  taskId: string;
  description: string;
  proof: ITaskSubmissionProof;
}

export interface IReviewTaskSubmissionRequest {
  status: 'under_review' | 'approved' | 'rejected';
  reviewComment?: string;
  rejectionReason?: string;
  pointsEarned?: number;
  badgeAwarded?: boolean;
}

export interface ITaskSubmissionListQuery {
  schoolId?: string;
  studentId?: string;
  taskId?: string;
  status?: TaskSubmissionStatus;
  fromDate?: string | Date;
  toDate?: string | Date;
  page?: number;
  limit?: number;
}

export interface IStudentSummary {
  _id: string;
  fullName: string;
  email?: string;
  schoolId?: string | null;
}

export interface ITaskSummary {
  _id: string;
  title: string;
}

export interface IReviewerSummary {
  _id: string;
  fullName: string;
  email?: string;
}

export interface ITaskSubmissionResponse {
  _id: string;
  student: IStudentSummary | null;
  studentName: string;
  task: ITaskSummary | null;
  taskTitle: string;
  description: string;
  proof: ITaskSubmissionProof;
  status: TaskSubmissionStatus;
  reviewedBy: IReviewerSummary | null;
  reviewedAt?: Date | string | null;
  reviewComment?: string | null;
  rejectionReason?: string | null;
  pointsEarned: number;
  badgeAwarded: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ITaskSubmissionListResponse {
  submissions: ITaskSubmissionResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class TaskSubmissionService {
  async submitTask(
    studentUserId: string,
    data: ISubmitTaskRequest,
  ): Promise<ITaskSubmissionResponse> {
    const student = await this.getStudentOrThrow(studentUserId);
    const task = await this.getTaskOrThrow(data.taskId);

    await this.assertNoDuplicateSubmission(student._id.toString(), task._id.toString());

    let submission: ITaskSubmissionDocument;
    try {
      submission = await TaskSubmission.create({
        studentId: student._id,
        studentName: student.fullName,
        taskId: task._id,
        taskTitle: task.title,
        description: data.description.trim(),
        proof: {
          fileName: data.proof.fileName.trim(),
          originalName: data.proof.originalName.trim(),
          fileUrl: data.proof.fileUrl.trim(),
          fileType: data.proof.fileType.trim(),
          fileSize: data.proof.fileSize,
        },
        status: 'pending',
      });
    } catch (error) {
      // Guard against a race condition hitting the unique (studentId, taskId) index.
      if ((error as { code?: number }).code === 11000) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'You have already submitted this task');
      }
      throw error;
    }

    return this.getById(submission._id.toString());
  }

  async getTaskSubmissions(
    requester: IRequester,
    query: ITaskSubmissionListQuery = {},
  ): Promise<ITaskSubmissionListResponse> {
    const { skip, limit, page } = getPaginationParams(query.page, query.limit);
    const filter = await this.buildListFilter(requester, query);

    const [submissions, total] = await Promise.all([
      TaskSubmission.find(filter)
        .populate('studentId', POPULATE_STUDENT)
        .populate('taskId', POPULATE_TASK)
        .populate('reviewedBy', POPULATE_REVIEWER)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TaskSubmission.countDocuments(filter),
    ]);

    const meta = buildPaginationMeta(total, page, limit);

    return {
      submissions: submissions.map((submission) => this.mapSubmission(submission)),
      pagination: {
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
        totalPages: meta.totalPages,
      },
    };
  }

  async getTaskSubmissionById(requester: IRequester, id: string): Promise<ITaskSubmissionResponse> {
    const submission = await this.findPopulatedSubmissionOrThrow(id);
    await this.assertCanAccessSubmission(requester, submission);
    return this.mapSubmission(submission);
  }

  async reviewTaskSubmission(
    schoolUserId: string,
    id: string,
    data: IReviewTaskSubmissionRequest,
  ): Promise<ITaskSubmissionResponse> {
    const submission = await this.findSubmissionOrThrow(id);

    await this.assertStudentBelongsToSchool(submission.studentId.toString(), schoolUserId);

    if (submission.status !== 'pending' && submission.status !== 'under_review') {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `Submission has already been ${submission.status} and can no longer be reviewed`,
      );
    }

    submission.status = data.status;
    submission.reviewedBy = new Types.ObjectId(schoolUserId);
    submission.reviewedAt = new Date();

    if (data.reviewComment !== undefined) {
      submission.reviewComment = data.reviewComment.trim() || null;
    }

    if (data.status === 'rejected') {
      submission.rejectionReason = data.rejectionReason?.trim() || null;
      // A rejected submission earns nothing.
      submission.pointsEarned = 0;
      submission.badgeAwarded = false;
    } else {
      submission.rejectionReason = null;
      if (data.pointsEarned !== undefined) {
        submission.pointsEarned = data.pointsEarned;
      }
      if (data.badgeAwarded !== undefined) {
        submission.badgeAwarded = data.badgeAwarded;
      }
    }

    await submission.save();

    return this.getById(id);
  }

  private async getById(id: string): Promise<ITaskSubmissionResponse> {
    const submission = await this.findPopulatedSubmissionOrThrow(id);
    return this.mapSubmission(submission);
  }

  private async getStudentOrThrow(studentUserId: string) {
    if (!studentUserId) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized');
    }
    if (!isValidObjectId(studentUserId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid ObjectId');
    }

    const student = await User.findById(studentUserId).select('_id fullName role schoolId').lean();
    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    if (student.role !== ROLES.STUDENT) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Only students can submit tasks');
    }

    return student;
  }

  private async getTaskOrThrow(taskId: string) {
    if (!isValidObjectId(taskId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid taskId');
    }

    const task = await Mission.findById(taskId).select('_id title').lean();
    if (!task) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Task not found');
    }

    return task;
  }

  private async assertNoDuplicateSubmission(studentId: string, taskId: string): Promise<void> {
    const existing = await TaskSubmission.findOne({
      studentId: new Types.ObjectId(studentId),
      taskId: new Types.ObjectId(taskId),
    })
      .select('_id')
      .lean();

    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'You have already submitted this task');
    }
  }

  private async findSubmissionOrThrow(id: string): Promise<ITaskSubmissionDocument> {
    if (!isValidObjectId(id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid ObjectId');
    }

    const submission = await TaskSubmission.findById(id);
    if (!submission) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Task submission not found');
    }

    return submission;
  }

  private async findPopulatedSubmissionOrThrow(id: string): Promise<Record<string, unknown>> {
    if (!isValidObjectId(id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid ObjectId');
    }

    const submission = await TaskSubmission.findById(id)
      .populate('studentId', POPULATE_STUDENT)
      .populate('taskId', POPULATE_TASK)
      .populate('reviewedBy', POPULATE_REVIEWER)
      .lean();

    if (!submission) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Task submission not found');
    }

    return submission;
  }

  private async assertCanAccessSubmission(
    requester: IRequester,
    submission: Record<string, unknown>,
  ): Promise<void> {
    if (requester.role === ROLES.ADMIN) {
      return;
    }

    const studentId = this.extractStudentId(submission);

    if (requester.role === ROLES.STUDENT) {
      if (studentId !== requester.userId) {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You can only access your own submissions');
      }
      return;
    }

    if (requester.role === ROLES.SCHOOL) {
      await this.assertStudentBelongsToSchool(studentId, requester.userId);
      return;
    }

    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      'You do not have permission to access this submission',
    );
  }

  private extractStudentId(submission: Record<string, unknown>): string {
    const student = submission.studentId as
      | { _id?: { toString(): string } }
      | Types.ObjectId
      | null
      | undefined;

    if (student && typeof student === 'object' && '_id' in student && student._id) {
      return student._id.toString();
    }
    return student ? (student as Types.ObjectId).toString() : '';
  }

  private async assertStudentBelongsToSchool(
    studentId: string,
    schoolUserId: string,
  ): Promise<void> {
    if (!isValidObjectId(studentId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid ObjectId');
    }

    const student = await User.findById(studentId).select('_id role schoolId').lean();
    if (!student || student.role !== ROLES.STUDENT) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Student not found');
    }

    if (!student.schoolId || student.schoolId.toString() !== schoolUserId) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'This student does not belong to your school');
    }
  }

  private async buildListFilter(
    requester: IRequester,
    query: ITaskSubmissionListQuery,
  ): Promise<Record<string, unknown>> {
    const filter: Record<string, unknown> = {};

    if (query.taskId && isValidObjectId(query.taskId)) {
      filter.taskId = new Types.ObjectId(query.taskId);
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.fromDate || query.toDate) {
      const dateRange: Record<string, Date> = {};
      if (query.fromDate) {
        const from = new Date(query.fromDate);
        from.setHours(0, 0, 0, 0);
        dateRange.$gte = from;
      }
      if (query.toDate) {
        const to = new Date(query.toDate);
        to.setHours(23, 59, 59, 999);
        dateRange.$lte = to;
      }
      filter.createdAt = dateRange;
    }

    await this.applyScopeFilter(requester, query, filter);

    return filter;
  }

  /**
   * Restricts the result set to what the requester is allowed to see:
   * - Student: only their own submissions.
   * - School: only submissions from students of their school.
   * - Admin: everything, with optional schoolId/studentId filters.
   */
  private async applyScopeFilter(
    requester: IRequester,
    query: ITaskSubmissionListQuery,
    filter: Record<string, unknown>,
  ): Promise<void> {
    if (requester.role === ROLES.STUDENT) {
      filter.studentId = new Types.ObjectId(requester.userId);
      return;
    }

    if (requester.role === ROLES.SCHOOL) {
      const studentIds = await this.getStudentIdsOfSchool(requester.userId);
      const allowed = this.intersectStudentFilter(studentIds, query.studentId);
      filter.studentId = { $in: allowed };
      return;
    }

    // Admin
    if (query.schoolId && isValidObjectId(query.schoolId)) {
      const studentIds = await this.getStudentIdsOfSchool(query.schoolId);
      const allowed = this.intersectStudentFilter(studentIds, query.studentId);
      filter.studentId = { $in: allowed };
      return;
    }

    if (query.studentId && isValidObjectId(query.studentId)) {
      filter.studentId = new Types.ObjectId(query.studentId);
    }
  }

  private intersectStudentFilter(
    schoolStudentIds: Types.ObjectId[],
    requestedStudentId?: string,
  ): Types.ObjectId[] {
    if (requestedStudentId && isValidObjectId(requestedStudentId)) {
      const requested = requestedStudentId.toString();
      return schoolStudentIds.filter((id) => id.toString() === requested);
    }
    return schoolStudentIds;
  }

  private async getStudentIdsOfSchool(schoolUserId: string): Promise<Types.ObjectId[]> {
    const students = await User.find({
      role: ROLES.STUDENT,
      schoolId: new Types.ObjectId(schoolUserId),
    })
      .select('_id')
      .lean();

    return students.map((student) => student._id);
  }

  private mapSubmission(submission: Record<string, unknown>): ITaskSubmissionResponse {
    const task = this.mapTask(submission.taskId);
    // Prefer the live task title resolved from taskId; fall back to the
    // stored snapshot only when the referenced task has been deleted.
    const taskTitle = task?.title || (submission.taskTitle as string);

    return {
      _id: (submission._id as { toString(): string }).toString(),
      student: this.mapStudent(submission.studentId),
      studentName: submission.studentName as string,
      task,
      taskTitle,
      description: submission.description as string,
      proof: submission.proof as ITaskSubmissionProof,
      status: submission.status as TaskSubmissionStatus,
      reviewedBy: this.mapReviewer(submission.reviewedBy),
      reviewedAt: (submission.reviewedAt as Date | null) ?? null,
      reviewComment: (submission.reviewComment as string | null) ?? null,
      rejectionReason: (submission.rejectionReason as string | null) ?? null,
      pointsEarned: (submission.pointsEarned as number) ?? 0,
      badgeAwarded: (submission.badgeAwarded as boolean) ?? false,
      createdAt: submission.createdAt as Date | undefined,
      updatedAt: submission.updatedAt as Date | undefined,
    };
  }

  private mapStudent(value: unknown): IStudentSummary | null {
    if (!value) {
      return null;
    }
    if (
      typeof value === 'object' &&
      '_id' in (value as Record<string, unknown>) &&
      'fullName' in (value as Record<string, unknown>)
    ) {
      const student = value as {
        _id: { toString(): string };
        fullName?: string;
        email?: string;
        schoolId?: { toString(): string } | null;
      };
      return {
        _id: student._id.toString(),
        fullName: student.fullName ?? '',
        email: student.email,
        schoolId: student.schoolId ? student.schoolId.toString() : null,
      };
    }
    return {
      _id: (value as Types.ObjectId).toString(),
      fullName: '',
    };
  }

  private mapTask(value: unknown): ITaskSummary | null {
    if (!value) {
      return null;
    }
    if (
      typeof value === 'object' &&
      '_id' in (value as Record<string, unknown>) &&
      'title' in (value as Record<string, unknown>)
    ) {
      const task = value as { _id: { toString(): string }; title?: string };
      return {
        _id: task._id.toString(),
        title: task.title ?? '',
      };
    }
    return {
      _id: (value as Types.ObjectId).toString(),
      title: '',
    };
  }

  private mapReviewer(value: unknown): IReviewerSummary | null {
    if (!value) {
      return null;
    }
    if (
      typeof value === 'object' &&
      '_id' in (value as Record<string, unknown>) &&
      'fullName' in (value as Record<string, unknown>)
    ) {
      const reviewer = value as { _id: { toString(): string }; fullName?: string; email?: string };
      return {
        _id: reviewer._id.toString(),
        fullName: reviewer.fullName ?? '',
        email: reviewer.email,
      };
    }
    return {
      _id: (value as Types.ObjectId).toString(),
      fullName: '',
    };
  }
}
