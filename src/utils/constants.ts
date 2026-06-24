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

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const AUTH_MESSAGES = {
  REGISTER_SUCCESS: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'You do not have permission to perform this action',
  EMAIL_EXISTS: 'Email already exists',
  USER_NOT_FOUND: 'User not found',
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_REQUIRED: 'Access token is required',
} as const;

export const USER_MESSAGES = {
  FETCH_SUCCESS: 'Users fetched successfully',
  FETCH_ONE_SUCCESS: 'User fetched successfully',
  UPDATE_SUCCESS: 'User updated successfully',
  DELETE_SUCCESS: 'User deleted successfully',
  NOT_FOUND: 'User not found',
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: 'is required',
  INVALID_EMAIL: 'must be a valid email',
  MIN_PASSWORD: 'must be at least 8 characters',
  INVALID_OBJECT_ID: 'must be a valid MongoDB ObjectId',
} as const;
