import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { HTTP_STATUS, AUTH_MESSAGES, OTP } from '../utils/constants';
import { logger } from '../config/logger';

/**
 * Rate limiter for OTP endpoints (send & re-send).
 * Max 5 requests per user (email/phone/userId) or IP within 15 minutes.
 */
export const otpRateLimiter = rateLimit({
  windowMs: OTP.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  max: OTP.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    const identifier = req.body?.email || req.body?.phone || req.body?.userId;
    if (identifier) {
      return `otp:${String(identifier).toLowerCase()}`;
    }
    return `otp:${req.ip ?? 'unknown'}`;
  },
  handler: (req: Request, res: Response): void => {
    logger.warn(`OTP rate limit exceeded for ${req.ip} (${JSON.stringify(req.body)})`);
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: AUTH_MESSAGES.TOO_MANY_OTP_REQUESTS,
      errors: [],
      statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
    });
  },
});
