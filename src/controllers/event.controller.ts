import { Request, Response, NextFunction } from 'express';
import { EventService } from '../services/event.service';
import { ApiResponse } from '../utils/ApiResponse';

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

const parseListQuery = (query: Request['query']) => ({
  search: query.search as string | undefined,
  page: query.page ? Number(query.page) : undefined,
  limit: query.limit ? Number(query.limit) : undefined,
  categoryId: query.categoryId as string | undefined,
  city: query.city as string | undefined,
  eventDate: query.eventDate as string | undefined,
  schoolId: query.schoolId as string | undefined,
  governmentId: query.governmentId as string | undefined,
  eventType: query.eventType as 'public' | 'private' | undefined,
  is_active: parseBooleanQuery(query.is_active),
  sort_by: query.sort_by as 'eventDate' | 'createdAt' | 'title' | undefined,
  sort_order: query.sort_order as 'asc' | 'desc' | undefined,
});

export class EventController {
  static createEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const event = await eventService.createEvent(req.body, req.user?.userId);
      ApiResponse.created(res, event, 'Event created successfully');
    } catch (error) {
      next(error);
    }
  };

  static getEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await eventService.getEvents(parseListQuery(req.query));
      ApiResponse.success(res, result, 'Events fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getEventById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const event = await eventService.getEventById(req.params.id as string);
      ApiResponse.success(res, event, 'Event details fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static updateEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const event = await eventService.updateEvent(
        req.params.id as string,
        req.body,
        req.user?.userId,
      );
      ApiResponse.success(res, event, 'Event updated successfully');
    } catch (error) {
      next(error);
    }
  };

  static deleteEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await eventService.deleteEvent(req.params.id as string);
      ApiResponse.success(res, null, 'Event deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
