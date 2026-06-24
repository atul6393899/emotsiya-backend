import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      statusCode: err.statusCode,
    });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const validationErr = err as Error & { errors: Record<string, { message: string }> };
    const messages = Object.values(validationErr.errors).map((e) => e.message);
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: messages,
      statusCode: 400,
    });
    return;
  }

  // Mongoose duplicate key error
  const mongoErr = err as Error & { code?: number; keyValue?: Record<string, unknown> };
  if (mongoErr.code === 11000) {
    const field = Object.keys(mongoErr.keyValue ?? {})[0];
    res.status(409).json({
      success: false,
      message: `Duplicate value for field: ${field}`,
      errors: [`${field} already exists`],
      statusCode: 409,
    });
    return;
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid resource ID',
      errors: ['The provided ID is not valid'],
      statusCode: 400,
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      errors: ['Authentication token is invalid'],
      statusCode: 401,
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expired',
      errors: ['Authentication token has expired'],
      statusCode: 401,
    });
    return;
  }

  // Unhandled errors
  logger.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    errors: process.env.NODE_ENV === 'development' ? [err.message] : [],
    statusCode: 500,
  });
};
