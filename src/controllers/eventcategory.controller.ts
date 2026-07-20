import { Request, Response, NextFunction } from 'express';
import { EventCategoryService } from '../services/eventcategory.service';
import { ApiResponse } from '../utils/ApiResponse';

const eventCategoryService = new EventCategoryService();

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
  is_active: parseBooleanQuery(query.is_active),
  sort_by: query.sort_by as string | undefined,
  sort_order: query.sort_order as 'asc' | 'desc' | undefined,
});

export class EventCategoryController {
  static createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const category = await eventCategoryService.createCategory(req.body, req.user?.userId);
      ApiResponse.created(res, category, 'Category created successfully');
    } catch (error) {
      next(error);
    }
  };

  static getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await eventCategoryService.getCategories(parseListQuery(req.query));
      ApiResponse.success(res, result, 'Categories fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getDropdown = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await eventCategoryService.getDropdown();
      ApiResponse.success(res, categories, 'Category dropdown fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static getCategoryById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const category = await eventCategoryService.getCategoryById(req.params.id as string);
      ApiResponse.success(res, category, 'Category details fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  static updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const category = await eventCategoryService.updateCategory(
        req.params.id as string,
        req.body,
        req.user?.userId,
      );
      ApiResponse.success(res, category, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  };

  static updateCategoryStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await eventCategoryService.updateCategoryStatus(
        req.params.id as string,
        req.body.is_active,
        req.user?.userId,
      );
      const message = result.is_active
        ? 'Category activated successfully'
        : 'Category deactivated successfully';
      ApiResponse.success(res, result, message);
    } catch (error) {
      next(error);
    }
  };

  static deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await eventCategoryService.deleteCategory(req.params.id as string);
      ApiResponse.success(res, null, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
