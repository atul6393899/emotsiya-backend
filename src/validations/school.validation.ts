import Joi from 'joi';

export const schoolStudentListQueryValidation = Joi.object({
  search: Joi.string().trim().allow('').optional(),
  page: Joi.number().integer().min(1).optional().messages({
    'number.base': 'page must be a number',
    'number.min': 'page must be at least 1',
  }),
  limit: Joi.number().integer().min(1).max(100).optional().messages({
    'number.base': 'limit must be a number',
    'number.min': 'limit must be at least 1',
    'number.max': 'limit must not exceed 100',
  }),
  status: Joi.string().valid('pending', 'active', 'inactive', 'suspended').optional().messages({
    'any.only': 'status must be one of pending, active, inactive, suspended',
  }),
  grade: Joi.string().trim().allow('').optional(),
  // Explicitly reject client-supplied schoolId for security
  schoolId: Joi.forbidden().messages({
    'any.unknown': 'schoolId cannot be provided; it is taken from the authenticated school',
  }),
});
