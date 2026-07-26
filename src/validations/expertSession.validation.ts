import Joi from 'joi';
import { EXPERT_SESSION_STATUSES } from '../models/expertSession.model';
import { ALL_ROLES } from '../constants/roles';

const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    'string.pattern.base': 'must be a valid MongoDB ObjectId',
  });

const objectIdRequired = objectId.required().messages({
  'any.required': 'id is required',
  'string.empty': 'id is required',
});

// 24-hour HH:mm time (e.g. 09:30, 23:59)
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const timeField = Joi.string().trim().pattern(TIME_PATTERN).messages({
  'string.pattern.base': 'must be a valid time in HH:mm (24-hour) format',
});

/** sessionDate must be a valid ISO date that falls on Saturday or Sunday. */
const weekendDate = Joi.date()
  .iso()
  .custom((value, helpers) => {
    const day = new Date(value).getUTCDay(); // 0 = Sunday, 6 = Saturday
    if (day !== 0 && day !== 6) {
      return helpers.error('date.weekend');
    }
    return value;
  })
  .messages({
    'date.base': 'sessionDate must be a valid date',
    'date.format': 'sessionDate must be a valid ISO date',
    'date.weekend': 'sessionDate must fall on a Saturday or Sunday',
  });

/** Ensures endTime is strictly greater than startTime when both are present. */
const assertEndAfterStart = (
  value: { startTime?: string; endTime?: string },
  helpers: Joi.CustomHelpers,
) => {
  const { startTime, endTime } = value;
  if (startTime && endTime && endTime <= startTime) {
    return helpers.error('any.invalid');
  }
  return value;
};

export const createExpertSessionValidation = Joi.object({
  title: Joi.string().trim().max(200).required().messages({
    'any.required': 'title is required',
    'string.empty': 'title is required',
    'string.max': 'title must not exceed 200 characters',
  }),
  description: Joi.string().trim().required().messages({
    'any.required': 'description is required',
    'string.empty': 'description is required',
  }),
  expertName: Joi.string().trim().required().messages({
    'any.required': 'expertName is required',
    'string.empty': 'expertName is required',
  }),
  sessionDate: weekendDate.required().messages({
    'any.required': 'sessionDate is required',
  }),
  startTime: timeField.required().messages({
    'any.required': 'startTime is required',
    'string.empty': 'startTime is required',
  }),
  endTime: timeField.required().messages({
    'any.required': 'endTime is required',
    'string.empty': 'endTime is required',
  }),
  zoomLink: Joi.string().trim().uri().required().messages({
    'any.required': 'zoomLink is required',
    'string.empty': 'zoomLink is required',
    'string.uri': 'zoomLink must be a valid URL',
  }),
  zoomMeetingId: Joi.string().trim().allow('').optional(),
  zoomPassword: Joi.string().trim().allow('').optional(),
})
  .custom(assertEndAfterStart)
  .messages({
    'any.invalid': 'endTime must be greater than startTime',
  });

export const updateExpertSessionValidation = Joi.object({
  title: Joi.string().trim().max(200).messages({
    'string.empty': 'title cannot be empty',
    'string.max': 'title must not exceed 200 characters',
  }),
  description: Joi.string().trim().messages({
    'string.empty': 'description cannot be empty',
  }),
  expertName: Joi.string().trim().messages({
    'string.empty': 'expertName cannot be empty',
  }),
  sessionDate: weekendDate,
  startTime: timeField,
  endTime: timeField,
  zoomLink: Joi.string().trim().uri().messages({
    'string.empty': 'zoomLink cannot be empty',
    'string.uri': 'zoomLink must be a valid URL',
  }),
  zoomMeetingId: Joi.string().trim().allow('').optional(),
  zoomPassword: Joi.string().trim().allow('').optional(),
  status: Joi.string()
    .valid(...EXPERT_SESSION_STATUSES)
    .messages({
      'any.only': `status must be one of ${EXPERT_SESSION_STATUSES.join(', ')}`,
    }),
  is_active: Joi.boolean(),
})
  .min(1)
  .custom(assertEndAfterStart)
  .messages({
    'object.min': 'At least one field must be provided to update',
    'any.invalid': 'endTime must be greater than startTime',
  });

export const expertSessionIdParamsValidation = Joi.object({
  id: objectIdRequired,
});

/** Params validation for join / join-count / participants (`:id`). */
export const joinExpertSessionValidation = Joi.object({
  id: objectIdRequired,
});

export const expertSessionListQueryValidation = Joi.object({
  search: Joi.string().trim().allow('').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  status: Joi.string()
    .valid(...EXPERT_SESSION_STATUSES)
    .optional()
    .messages({
      'any.only': `status must be one of ${EXPERT_SESSION_STATUSES.join(', ')}`,
    }),
  fromDate: Joi.date().iso().optional().messages({
    'date.base': 'fromDate must be a valid date',
  }),
  toDate: Joi.date().iso().optional().messages({
    'date.base': 'toDate must be a valid date',
  }),
  is_active: Joi.boolean().optional(),
});

export const expertSessionParticipantsQueryValidation = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  role: Joi.string()
    .valid(...ALL_ROLES)
    .optional()
    .messages({
      'any.only': `role must be one of ${ALL_ROLES.join(', ')}`,
    }),
  search: Joi.string().trim().allow('').optional(),
});
