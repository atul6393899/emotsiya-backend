import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS, AUTH_MESSAGES } from '../utils/constants';

/**
 * Common JWT authentication middleware for all roles.
 * Verifies the Bearer token and attaches the decoded payload to req.user.
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.TOKEN_REQUIRED);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.TOKEN_EXPIRED);
    }
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.INVALID_TOKEN);
  }
};
