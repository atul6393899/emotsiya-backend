export class ApiError extends Error {
  public statusCode: number;
  public errors: string[];
  public isOperational: boolean;

  constructor(statusCode: number, message: string, errors: string[] = [], isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
