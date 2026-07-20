import { Request, Response, NextFunction } from 'express';
import { StudentService } from '../services/student.service';
import { EventService } from '../services/event.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../utils/constants';
import { UserStatus } from '../models/user.model';
import { EventType } from '../models/event.model';

const studentService = new StudentService();
const eventService = new EventService();

const parseListQuery = (query: Request['query']) => ({
  search: query.search as string | undefined,
  page: query.page ? Number(query.page) : undefined,
  limit: query.limit ? Number(query.limit) : undefined,
  status: query.status as UserStatus | undefined,
  grade: query.grade as string | undefined,
  schoolId: query.schoolId as string | undefined,
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

export class StudentController {
  static registerStudent = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const student = await studentService.registerStudent(req.body);
      ApiResponse.created(res, student, 'Student registered successfully.');
    } catch (error) {
      next(error);
    }
  };

  static getEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentUserId = req.user?.userId;
      if (!studentUserId) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized');
      }

      const result = await eventService.getEventsForStudent(
        studentUserId,
        parseRoleEventListQuery(req.query),
      );
      ApiResponse.success(res, result, 'Student events fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await studentService.getStudents(parseListQuery(req.query));
      ApiResponse.success(res, result, 'Students fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getStudentById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const student = await studentService.getStudentById(req.params.id as string);
      ApiResponse.success(res, student, 'Student details fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static approveStudent = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await studentService.approveStudent(req.params.id as string);
      ApiResponse.success(res, null, 'Student approved successfully.');
    } catch (error) {
      next(error);
    }
  };

  static getSchoolDropdown = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const schools = await studentService.getSchoolDropdown();
      ApiResponse.success(res, schools, 'Schools fetched successfully');
    } catch (error) {
      next(error);
    }
  };
}
