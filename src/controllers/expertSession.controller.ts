import { Request, Response, NextFunction } from 'express';
import {
  ExpertSessionService,
  IExpertSessionListQuery,
  IExpertSessionParticipantsQuery,
} from '../services/expertSession.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../utils/constants';
import { ROLES, Role } from '../constants/roles';
import { ExpertSessionStatus } from '../models/expertSession.model';

const expertSessionService = new ExpertSessionService();

const parseBooleanQuery = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (value === true || value === 'true') {
    return true;
  }
  if (value === false || value === 'false') {
    return false;
  }
  return undefined;
};

const parseListQuery = (query: Request['query']): IExpertSessionListQuery => ({
  search: query.search as string | undefined,
  page: query.page ? Number(query.page) : undefined,
  limit: query.limit ? Number(query.limit) : undefined,
  status: query.status as ExpertSessionStatus | undefined,
  fromDate: query.fromDate as string | undefined,
  toDate: query.toDate as string | undefined,
  is_active: parseBooleanQuery(query.is_active),
});

const parseParticipantsQuery = (query: Request['query']): IExpertSessionParticipantsQuery => ({
  page: query.page ? Number(query.page) : undefined,
  limit: query.limit ? Number(query.limit) : undefined,
  role: query.role as Role | undefined,
  search: query.search as string | undefined,
});

export class ExpertSessionController {
  static createExpertSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const session = await expertSessionService.createExpertSession(req.body, req.user?.userId);
      ApiResponse.created(res, session, 'Expert session created successfully.');
    } catch (error) {
      next(error);
    }
  };

  static getExpertSessions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const isAdmin = req.user?.role === ROLES.ADMIN;
      const result = await expertSessionService.getExpertSessions(
        parseListQuery(req.query),
        isAdmin,
        req.user?.userId,
      );
      ApiResponse.success(res, result, 'Expert sessions fetched successfully.');
    } catch (error) {
      next(error);
    }
  };

  static getExpertSessionById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const session = await expertSessionService.getExpertSessionById(
        req.params.id as string,
        req.user?.userId,
      );
      ApiResponse.success(res, session, 'Expert session details fetched successfully.');
    } catch (error) {
      next(error);
    }
  };

  static updateExpertSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const session = await expertSessionService.updateExpertSession(
        req.params.id as string,
        req.body,
        req.user?.userId,
      );
      ApiResponse.success(res, session, 'Expert session updated successfully.');
    } catch (error) {
      next(error);
    }
  };

  static deleteExpertSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await expertSessionService.deleteExpertSession(req.params.id as string);
      ApiResponse.success(res, null, 'Expert session deleted successfully.');
    } catch (error) {
      next(error);
    }
  };

  static joinExpertSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      if (!userId || !userRole) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized');
      }

      const result = await expertSessionService.joinExpertSession(
        req.params.id as string,
        userId,
        userRole,
      );
      ApiResponse.success(res, result, 'Joined expert session successfully.');
    } catch (error) {
      next(error);
    }
  };

  static getExpertSessionJoinCount = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await expertSessionService.getExpertSessionJoinCount(req.params.id as string);
      ApiResponse.success(res, result, 'Join count fetched successfully.');
    } catch (error) {
      next(error);
    }
  };

  static getExpertSessionParticipants = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await expertSessionService.getExpertSessionParticipants(
        req.params.id as string,
        parseParticipantsQuery(req.query),
      );
      ApiResponse.success(res, result, 'Session participants fetched successfully.');
    } catch (error) {
      next(error);
    }
  };
}
