import { Request, Response, NextFunction } from 'express';
import { errorMiddleware } from '../../src/middlewares/error.middleware';
import { ApiError } from '../../src/utils/ApiError';

describe('Error Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should handle ApiError correctly', () => {
    const error = new ApiError(400, 'Validation failed', ['Name is required']);

    errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Validation failed',
        errors: ['Name is required'],
        statusCode: 400,
      }),
    );
  });

  it('should handle unknown errors with 500', () => {
    const error = new Error('Something went wrong');

    errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, statusCode: 500 }),
    );
  });

  it('should handle JWT errors', () => {
    const error = new Error('jwt malformed');
    error.name = 'JsonWebTokenError';

    errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  it('should handle token expiration errors', () => {
    const error = new Error('jwt expired');
    error.name = 'TokenExpiredError';

    errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  it('should handle MongoDB cast errors', () => {
    const error = new Error('Cast to ObjectId failed');
    error.name = 'CastError';

    errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it('should handle MongoDB duplicate key errors', () => {
    const error: any = new Error('Duplicate key');
    error.code = 11000;
    error.keyValue = { email: 'test@example.com' };

    errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(409);
  });
});
