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

export const createMissionValidation = Joi.object({
  title: Joi.string().trim().max(200).required().messages({
    'any.required': 'title is required',
    'string.empty': 'title is required',
    'string.max': 'title must not exceed 200 characters',
  }),
  eventId: objectId.required().messages({
    'any.required': 'eventId is required',
    'string.empty': 'eventId is required',
    'string.pattern.base': 'eventId must be a valid MongoDB ObjectId',
  }),
  rewardPoints: Joi.number().integer().min(1).required().messages({
    'any.required': 'rewardPoints is required',
    'number.base': 'rewardPoints must be a number',
    'number.integer': 'rewardPoints must be an integer',
    'number.min': 'rewardPoints must be greater than zero',
  }),
  deadline: Joi.date().iso().required().messages({
    'any.required': 'deadline is required',
    'date.base': 'deadline must be a valid date',
  }),
  difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').required().messages({
    'any.required': 'difficulty is required',
    'any.only': 'difficulty must be Easy, Medium, or Hard',
    'string.empty': 'difficulty is required',
  }),
  description: Joi.string().trim().required().messages({
    'any.required': 'description is required',
    'string.empty': 'description is required',
  }),
  is_active: Joi.boolean().optional(),
});

export const updateMissionValidation = createMissionValidation.keys({
  is_active: Joi.boolean().optional(),
});

export const missionIdParamsValidation = Joi.object({
  id: objectIdRequired,
});

export const missionListQueryValidation = Joi.object({
  search: Joi.string().trim().allow('').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').optional().messages({
    'any.only': 'difficulty must be Easy, Medium, or Hard',
  }),
  eventId: objectId.optional(),
  is_active: Joi.boolean().optional(),
  fromDate: Joi.date().iso().optional().messages({
    'date.base': 'fromDate must be a valid date',
  }),
  toDate: Joi.date().iso().optional().messages({
    'date.base': 'toDate must be a valid date',
  }),
  minRewardPoints: Joi.number().integer().min(1).optional(),
  maxRewardPoints: Joi.number().integer().min(1).optional(),
  sortBy: Joi.string()
    .trim()
    .valid('createdAt', 'deadline', 'rewardPoints', 'title')
    .optional()
    .messages({
      'any.only': 'sortBy must be one of createdAt, deadline, rewardPoints, title',
    }),
  sortOrder: Joi.string().trim().valid('asc', 'desc').optional(),
  sort_by: Joi.string().trim().valid('createdAt', 'deadline', 'rewardPoints', 'title').optional(),
  sort_order: Joi.string().trim().valid('asc', 'desc').optional(),
});

export const missionEventDropdownQueryValidation = Joi.object({
  search: Joi.string().trim().allow('').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});
