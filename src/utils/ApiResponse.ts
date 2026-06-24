import { Response } from 'express';

export class ApiResponse {
  static success(res: Response, data: unknown, message: string, statusCode = 200): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      statusCode,
    });
  }

  static created(res: Response, data: unknown, message: string): Response {
    return ApiResponse.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static error(res: Response, message: string, statusCode = 500, errors: string[] = []): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      statusCode,
    });
  }
}
