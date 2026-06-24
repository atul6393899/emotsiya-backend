import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';
import { AUTH_MESSAGES } from '../utils/constants';

const authService = new AuthService();

export class AuthController {
  static register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.register(req.body);
      ApiResponse.created(res, result, AUTH_MESSAGES.REGISTER_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  static login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.login(req.body);
      ApiResponse.success(res, result, AUTH_MESSAGES.LOGIN_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  static refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);
      ApiResponse.success(res, tokens, AUTH_MESSAGES.TOKEN_REFRESHED);
    } catch (error) {
      next(error);
    }
  };

  static logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await authService.logout(req.user!.userId);
      ApiResponse.success(res, null, AUTH_MESSAGES.LOGOUT_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  static getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await authService.getProfile(req.user!.userId);
      ApiResponse.success(res, user, 'Profile fetched successfully');
    } catch (error) {
      next(error);
    }
  };
}
