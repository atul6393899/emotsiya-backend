import { Request, Response, NextFunction } from 'express';
import { GovernmentService } from '../services/government.service';
import { ApiResponse } from '../utils/ApiResponse';

const governmentService = new GovernmentService();

export class GovernmentController {
  static getDashboard = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await governmentService.getDashboard();
      ApiResponse.success(res, stats, 'Government dashboard fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await governmentService.getAllUsers(req.query);
      ApiResponse.success(res, result, 'Users fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getSchools = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await governmentService.getSchools(req.query);
      ApiResponse.success(res, result, 'Schools fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await governmentService.getProfile(req.user!.userId);
      ApiResponse.success(res, profile, 'Profile fetched successfully');
    } catch (error) {
      next(error);
    }
  };
}
