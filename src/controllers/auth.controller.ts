import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { HTTP_STATUS, AUTH_MESSAGES } from '../utils/constants';

const authService = new AuthService();

export class AuthController {
  static sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.sendOtp(req.body);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: AUTH_MESSAGES.OTP_SENT,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  static resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.resendOtp(req.body.userId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: AUTH_MESSAGES.OTP_RESENT,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  static verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.verifyOtp(req.body);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  static logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await authService.logout(req.user!.userId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: AUTH_MESSAGES.LOGOUT_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  };
}
