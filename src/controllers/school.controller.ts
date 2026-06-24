import { Request, Response, NextFunction } from 'express';
import { SchoolService } from '../services/school.service';
import { ApiResponse } from '../utils/ApiResponse';

const schoolService = new SchoolService();

export class SchoolController {
  static getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await schoolService.getDashboard();
      ApiResponse.success(res, stats, 'School dashboard fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await schoolService.getStudents(req.user!.userId, req.query);
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
      const student = await schoolService.getStudentById(req.params.id as string);
      ApiResponse.success(res, student, 'Student fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await schoolService.getProfile(req.user!.userId);
      ApiResponse.success(res, profile, 'Profile fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await schoolService.updateProfile(req.user!.userId, req.body);
      ApiResponse.success(res, profile, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  };
}
