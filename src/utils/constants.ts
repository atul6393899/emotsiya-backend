export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ROLES = {
  ADMIN: 'admin',
  SCHOOL: 'school',
  GOVERNMENT: 'government',
  STUDENT: 'student',
} as const;

export const OTP = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
  EXPIRY_SECONDS: 600,
  MAX_REQUESTS: 5,
  RATE_LIMIT_WINDOW_MINUTES: 15,
} as const;

export const JWT = {
  EXPIRY: '7d',
  EXPIRY_SECONDS: 604800,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  INVALID_CREDENTIALS: 'Invalid credentials',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'You do not have permission to perform this action',
  USER_NOT_FOUND: 'User not found',
  INVALID_TOKEN: 'Invalid token',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_REQUIRED: 'Access token is required',
  OTP_SENT: 'OTP sent successfully',
  OTP_RESENT: 'OTP resent successfully',
  OTP_VERIFIED: 'OTP verified successfully',
  INVALID_OTP: 'Invalid OTP',
  OTP_EXPIRED: 'OTP has expired',
  OTP_ALREADY_USED: 'OTP has already been used',
  OTP_NOT_FOUND: 'No OTP found. Please request a new OTP',
  ACCOUNT_INACTIVE: 'Account is inactive',
  ACCOUNT_SUSPENDED: 'Account is suspended',
  TOO_MANY_OTP_REQUESTS: 'Too many OTP requests. Please try again after 15 minutes',
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: 'is required',
  INVALID_EMAIL: 'must be a valid email',
  INVALID_OBJECT_ID: 'must be a valid MongoDB ObjectId',
} as const;
