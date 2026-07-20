import Joi from 'joi';

const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    'string.pattern.base': 'must be a valid MongoDB ObjectId',
  });

const objectIdRequired = objectId.required().messages({
  'any.required': 'id is required',
  'string.empty': 'id is required',
});

const objectIdArray = Joi.array().items(objectId.required()).optional().default([]);

export const createEventValidation = Joi.object({
  title: Joi.string().trim().max(200).required().messages({
    'any.required': 'title is required',
    'string.empty': 'title is required',
    'string.max': 'title must not exceed 200 characters',
  }),
  description: Joi.string().trim().required().messages({
    'any.required': 'description is required',
    'string.empty': 'description is required',
  }),
  categoryId: objectId.required().messages({
    'any.required': 'categoryId is required',
    'string.empty': 'categoryId is required',
    'string.pattern.base': 'categoryId must be a valid MongoDB ObjectId',
  }),
  city: Joi.string().trim().required().messages({
    'any.required': 'city is required',
    'string.empty': 'city is required',
  }),
  eventDate: Joi.date().iso().required().messages({
    'any.required': 'eventDate is required',
    'date.base': 'eventDate must be a valid date',
  }),
  eventType: Joi.string().valid('public', 'private').required().messages({
    'any.required': 'eventType is required',
    'any.only': 'eventType must be public or private',
    'string.empty': 'eventType is required',
  }),
  schoolIds: objectIdArray.messages({
    'string.pattern.base': 'each schoolId must be a valid MongoDB ObjectId',
  }),
  governmentIds: objectIdArray.messages({
    'string.pattern.base': 'each governmentId must be a valid MongoDB ObjectId',
  }),
  is_active: Joi.boolean().optional(),
});

export const updateEventValidation = createEventValidation;

export const eventIdParamsValidation = Joi.object({
  id: objectIdRequired,
});

export const eventListQueryValidation = Joi.object({
  search: Joi.string().trim().allow('').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  categoryId: objectId.optional(),
  city: Joi.string().trim().allow('').optional(),
  eventDate: Joi.date().iso().optional(),
  schoolId: objectId.optional(),
  governmentId: objectId.optional(),
  eventType: Joi.string().valid('public', 'private').optional().messages({
    'any.only': 'eventType must be public or private',
  }),
  is_active: Joi.boolean().optional(),
  sort_by: Joi.string().trim().valid('eventDate', 'createdAt', 'title').optional().messages({
    'any.only': 'sort_by must be one of eventDate, createdAt, title',
  }),
  sort_order: Joi.string().trim().valid('asc', 'desc').optional(),
});

/** Shared listing query for school / government / student event APIs */
export const roleEventListQueryValidation = Joi.object({
  search: Joi.string().trim().allow('').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  categoryId: objectId.optional(),
  city: Joi.string().trim().allow('').optional(),
  fromDate: Joi.date().iso().optional().messages({
    'date.base': 'fromDate must be a valid date',
  }),
  toDate: Joi.date().iso().optional().messages({
    'date.base': 'toDate must be a valid date',
  }),
  eventType: Joi.string().valid('public', 'private').optional().messages({
    'any.only': 'eventType must be public or private',
  }),
  sortBy: Joi.string().trim().valid('eventDate', 'createdAt', 'title').optional().messages({
    'any.only': 'sortBy must be one of eventDate, createdAt, title',
  }),
  sortOrder: Joi.string().trim().valid('asc', 'desc').optional(),
  // Accept snake_case aliases used elsewhere
  sort_by: Joi.string().trim().valid('eventDate', 'createdAt', 'title').optional(),
  sort_order: Joi.string().trim().valid('asc', 'desc').optional(),
});

export const governmentDropdownQueryValidation = Joi.object({
  search: Joi.string().trim().allow('').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  city: Joi.string().trim().allow('').optional(),
  department: Joi.string().trim().allow('').optional(),
  state: Joi.string().trim().allow('').optional(),
  is_active: Joi.boolean().optional(),
});

export const governmentSchoolsQueryValidation = Joi.object({
  search: Joi.string().trim().allow('').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  city: Joi.string().trim().allow('').optional(),
  state: Joi.string().trim().allow('').optional(),
  is_active: Joi.boolean().optional(),
});
