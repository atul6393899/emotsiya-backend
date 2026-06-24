import { Request, Response, NextFunction } from 'express';
import { StudentService } from '../services/student.service';
import { ApiResponse } from '../utils/ApiResponse';

const studentService = new StudentService();

export class StudentController {
  static getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await studentService.getDashboard(req.user!.userId);
      ApiResponse.success(res, stats, 'Student dashboard fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await studentService.getProfile(req.user!.userId);
      ApiResponse.success(res, profile, 'Profile fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await studentService.updateProfile(req.user!.userId, req.body);
      ApiResponse.success(res, profile, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  };
}
