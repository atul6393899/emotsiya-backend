import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { ApiResponse } from '../utils/ApiResponse';
import { UserStatus } from '../models/user.model';

const adminService = new AdminService();

const parseListQuery = (query: Request['query']) => ({
  search: query.search as string | undefined,
  page: query.page ? Number(query.page) : undefined,
  limit: query.limit ? Number(query.limit) : undefined,
  status: query.status as UserStatus | undefined,
});

export class AdminController {
  static createSchool = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await adminService.createSchool(req.body);
      ApiResponse.created(res, user, 'User registered successfully.');
    } catch (error) {
      next(error);
    }
  };

  static createGovernment = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await adminService.createGovernment(req.body);
      ApiResponse.created(res, user, 'User registered successfully.');
    } catch (error) {
      next(error);
    }
  };

  static getOnboardingDashboardSummary = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const summary = await adminService.getOnboardingDashboardSummary();
      ApiResponse.success(res, summary, 'Dashboard summary fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getOnboardingSchools = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await adminService.getOnboardingSchools(parseListQuery(req.query));
      ApiResponse.success(res, result, 'Schools fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getOnboardingGovernments = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await adminService.getOnboardingGovernments(parseListQuery(req.query));
      ApiResponse.success(res, result, 'Governments fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getSchoolById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const school = await adminService.getSchoolById(req.params.id as string);
      ApiResponse.success(res, school, 'School details fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getGovernmentById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const government = await adminService.getGovernmentById(req.params.id as string);
      ApiResponse.success(res, government, 'Government details fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static approveSchool = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await adminService.approveSchool(req.params.id as string);
      ApiResponse.success(res, null, 'School approved successfully.');
    } catch (error) {
      next(error);
    }
  };

  static approveGovernment = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await adminService.approveGovernment(req.params.id as string);
      ApiResponse.success(res, null, 'Government approved successfully.');
    } catch (error) {
      next(error);
    }
  };
}
