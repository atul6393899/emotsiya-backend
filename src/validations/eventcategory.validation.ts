import Joi from 'joi';

const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .required()
  .messages({
    'string.pattern.base': 'id must be a valid MongoDB ObjectId',
    'any.required': 'id is required',
    'string.empty': 'id is required',
  });

const hexColor = Joi.string()
  .trim()
  .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
  .allow('', null)
  .optional()
  .messages({
    'string.pattern.base': 'color must be a valid hex color (e.g. #4F46E5)',
  });

export const createCategoryValidation = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'name is required',
    'string.empty': 'name is required',
    'string.min': 'name must be at least 2 characters',
    'string.max': 'name must not exceed 100 characters',
  }),
  icon: Joi.string().trim().required().messages({
    'any.required': 'icon is required',
    'string.empty': 'icon is required',
  }),
  description: Joi.string().trim().allow('').optional(),
  color: hexColor,
  sort_order: Joi.number().integer().min(0).optional().messages({
    'number.base': 'sort_order must be a number',
    'number.min': 'sort_order must be at least 0',
  }),
});

export const updateCategoryValidation = createCategoryValidation;

export const updateCategoryStatusValidation = Joi.object({
  is_active: Joi.boolean().required().messages({
    'any.required': 'is_active is required',
    'boolean.base': 'is_active must be a boolean',
  }),
});

export const categoryIdParamsValidation = Joi.object({
  id: objectId,
});

export const categoryListQueryValidation = Joi.object({
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
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'is_active must be a boolean',
  }),
  sort_by: Joi.string()
    .trim()
    .valid('name', 'sort_order', 'createdAt', 'updatedAt', 'is_active')
    .optional()
    .messages({
      'any.only': 'sort_by must be one of name, sort_order, createdAt, updatedAt, is_active',
    }),
  sort_order: Joi.string().trim().valid('asc', 'desc').optional().messages({
    'any.only': 'sort_order must be asc or desc',
  }),
});
