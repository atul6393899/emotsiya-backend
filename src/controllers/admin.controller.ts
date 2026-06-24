import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { ApiResponse } from '../utils/ApiResponse';

const adminService = new AdminService();

export class AdminController {
  static getDashboard = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await adminService.getDashboardStats();
      ApiResponse.success(res, stats, 'Dashboard stats fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await adminService.getAllUsers(req.query);
      ApiResponse.success(res, result, 'Users fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await adminService.getUserById(req.params.id as string);
      ApiResponse.success(res, user, 'User fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await adminService.updateUser(req.params.id as string, req.body);
      ApiResponse.success(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  };

  static deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await adminService.deleteUser(req.params.id as string);
      ApiResponse.success(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
