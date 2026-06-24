import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validate } from '../../src/middlewares/validation.middleware';
import { ApiError } from '../../src/utils/ApiError';

describe('Validation Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = { body: {}, params: {}, query: {} };
    mockRes = {};
    mockNext = jest.fn();
  });

  it('should pass validation with correct data', () => {
    const schema = {
      body: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
      }),
    };

    mockReq.body = { name: 'John', email: 'john@example.com' };

    const middleware = validate(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should throw ApiError for invalid body data', () => {
    const schema = {
      body: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
      }),
    };

    mockReq.body = { name: '' };

    const middleware = validate(schema);

    expect(() => middleware(mockReq as Request, mockRes as Response, mockNext)).toThrow(ApiError);
  });

  it('should validate params', () => {
    const schema = {
      params: Joi.object({
        id: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required(),
      }),
    };

    mockReq.params = { id: 'invalid-id' };

    const middleware = validate(schema);

    expect(() => middleware(mockReq as Request, mockRes as Response, mockNext)).toThrow(ApiError);
  });

  it('should validate query parameters', () => {
    const schema = {
      query: Joi.object({
        page: Joi.number().integer().min(1),
      }),
    };

    mockReq.query = { page: '-1' as any };

    const middleware = validate(schema);

    expect(() => middleware(mockReq as Request, mockRes as Response, mockNext)).toThrow(ApiError);
  });
});
