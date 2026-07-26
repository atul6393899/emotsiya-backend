import { Request, Response, NextFunction } from 'express';
import {
  TaskSubmissionService,
  IRequester,
  ITaskSubmissionListQuery,
} from '../services/taskSubmission.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../utils/constants';
import { Role } from '../constants/roles';
import { TaskSubmissionStatus } from '../models/taskSubmission.model';

const taskSubmissionService = new TaskSubmissionService();

const getRequester = (req: Request): IRequester => {
  if (!req.user?.userId || !req.user?.role) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized');
  }
  return { userId: req.user.userId, role: req.user.role as Role };
};

const parseListQuery = (query: Request['query']): ITaskSubmissionListQuery => ({
  schoolId: query.schoolId as string | undefined,
  studentId: query.studentId as string | undefined,
  taskId: query.taskId as string | undefined,
  status: query.status as TaskSubmissionStatus | undefined,
  fromDate: query.fromDate as string | undefined,
  toDate: query.toDate as string | undefined,
  page: query.page ? Number(query.page) : undefined,
  limit: query.limit ? Number(query.limit) : undefined,
});

export class TaskSubmissionController {
  static submitTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentUserId = req.user?.userId;
      if (!studentUserId) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized');
      }

      const submission = await taskSubmissionService.submitTask(studentUserId, req.body);
      ApiResponse.created(res, submission, 'Task submitted successfully');
    } catch (error) {
      next(error);
    }
  };

  static getTaskSubmissions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await taskSubmissionService.getTaskSubmissions(
        getRequester(req),
        parseListQuery(req.query),
      );
      ApiResponse.success(res, result, 'Task submissions fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getTaskSubmissionById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const submission = await taskSubmissionService.getTaskSubmissionById(
        getRequester(req),
        req.params.id as string,
      );
      ApiResponse.success(res, submission, 'Task submission details fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static reviewTaskSubmission = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const schoolUserId = req.user?.userId;
      if (!schoolUserId) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized');
      }

      const submission = await taskSubmissionService.reviewTaskSubmission(
        schoolUserId,
        req.params.id as string,
        req.body,
      );
      ApiResponse.success(res, submission, 'Task submission reviewed successfully');
    } catch (error) {
      next(error);
    }
  };
}
