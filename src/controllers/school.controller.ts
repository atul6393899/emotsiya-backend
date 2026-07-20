import { Request, Response, NextFunction } from 'express';
import { SchoolService } from '../services/school.service';
import { EventService } from '../services/event.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../utils/constants';
import { UserStatus } from '../models/user.model';
import { EventType } from '../models/event.model';

const schoolService = new SchoolService();
const eventService = new EventService();

const parseStudentListQuery = (query: Request['query']) => ({
  search: query.search as string | undefined,
  page: query.page ? Number(query.page) : undefined,
  limit: query.limit ? Number(query.limit) : undefined,
  status: query.status as UserStatus | undefined,
  grade: query.grade as string | undefined,
});

const parseRoleEventListQuery = (query: Request['query']) => ({
  search: query.search as string | undefined,
  page: query.page ? Number(query.page) : undefined,
  limit: query.limit ? Number(query.limit) : undefined,
  categoryId: query.categoryId as string | undefined,
  city: query.city as string | undefined,
  fromDate: query.fromDate as string | undefined,
  toDate: query.toDate as string | undefined,
  eventType: query.eventType as EventType | undefined,
  sortBy: (query.sortBy || query.sort_by) as 'eventDate' | 'createdAt' | 'title' | undefined,
  sortOrder: (query.sortOrder || query.sort_order) as 'asc' | 'desc' | undefined,
});

export class SchoolController {
  static getStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolUserId = req.user?.userId;
      if (!schoolUserId) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized');
      }

      const result = await schoolService.getStudents(
        schoolUserId,
        parseStudentListQuery(req.query),
      );
      ApiResponse.success(res, result, 'Students fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schoolUserId = req.user?.userId;
      if (!schoolUserId) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized');
      }

      const result = await eventService.getEventsForSchool(
        schoolUserId,
        parseRoleEventListQuery(req.query),
      );
      ApiResponse.success(res, result, 'School events fetched successfully');
    } catch (error) {
      next(error);
    }
  };
}
