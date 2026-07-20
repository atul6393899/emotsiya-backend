import { Request, Response, NextFunction } from 'express';
import { GovernmentService } from '../services/government.service';
import { EventService } from '../services/event.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../utils/constants';
import { EventType } from '../models/event.model';

const governmentService = new GovernmentService();
const eventService = new EventService();

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

export class GovernmentController {
  static getDropdown = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await governmentService.getDropdown({
        search: req.query.search as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        city: req.query.city as string | undefined,
        department: req.query.department as string | undefined,
        state: req.query.state as string | undefined,
        is_active: parseBooleanQuery(req.query.is_active),
      });
      ApiResponse.success(res, result, 'Government organizations fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getSchools = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await governmentService.getSchools({
        search: req.query.search as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        city: req.query.city as string | undefined,
        state: req.query.state as string | undefined,
        is_active: parseBooleanQuery(req.query.is_active),
      });
      ApiResponse.success(res, result, 'Schools fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const governmentUserId = req.user?.userId;
      if (!governmentUserId) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized');
      }

      const result = await eventService.getEventsForGovernment(
        governmentUserId,
        parseRoleEventListQuery(req.query),
      );
      ApiResponse.success(res, result, 'Government events fetched successfully');
    } catch (error) {
      next(error);
    }
  };
}
