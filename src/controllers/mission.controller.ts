import { Request, Response, NextFunction } from 'express';
import { MissionService } from '../services/mission.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../utils/constants';
import { MissionDifficulty } from '../models/mission.model';

const missionService = new MissionService();

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

const parseListQuery = (query: Request['query']) => ({
  search: query.search as string | undefined,
  page: query.page ? Number(query.page) : undefined,
  limit: query.limit ? Number(query.limit) : undefined,
  difficulty: query.difficulty as MissionDifficulty | undefined,
  eventId: query.eventId as string | undefined,
  is_active: parseBooleanQuery(query.is_active),
  fromDate: query.fromDate as string | undefined,
  toDate: query.toDate as string | undefined,
  minRewardPoints: query.minRewardPoints ? Number(query.minRewardPoints) : undefined,
  maxRewardPoints: query.maxRewardPoints ? Number(query.maxRewardPoints) : undefined,
  sortBy: (query.sortBy || query.sort_by) as
    | 'createdAt'
    | 'deadline'
    | 'rewardPoints'
    | 'title'
    | undefined,
  sortOrder: (query.sortOrder || query.sort_order) as 'asc' | 'desc' | undefined,
});

export class MissionController {
  static getMissionEventDropdown = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await missionService.getMissionEventDropdown({
        search: req.query.search as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      });
      ApiResponse.success(res, result, 'Mission event dropdown fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static createMission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const mission = await missionService.createMission(req.body, req.user?.userId);
      ApiResponse.created(res, mission, 'Mission created successfully');
    } catch (error) {
      next(error);
    }
  };

  static getMissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await missionService.getMissions(parseListQuery(req.query));
      ApiResponse.success(res, result, 'Mission list fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getStudentMissions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const studentUserId = req.user?.userId;
      if (!studentUserId) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized');
      }

      const result = await missionService.getMissionsForStudent(
        studentUserId,
        parseListQuery(req.query),
      );
      ApiResponse.success(res, result, 'Student missions fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getMissionById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const mission = await missionService.getMissionById(req.params.id as string);
      ApiResponse.success(res, mission, 'Mission details fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static updateMission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const mission = await missionService.updateMission(
        req.params.id as string,
        req.body,
        req.user?.userId,
      );
      ApiResponse.success(res, mission, 'Mission updated successfully');
    } catch (error) {
      next(error);
    }
  };

  static deleteMission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await missionService.deleteMission(req.params.id as string);
      ApiResponse.success(res, null, 'Mission deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
