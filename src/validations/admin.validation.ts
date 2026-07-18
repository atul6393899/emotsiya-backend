import Joi from 'joi';

const email = Joi.string().email().lowercase().trim().required().messages({
  'string.email': 'email must be a valid email address',
  'any.required': 'email is required',
  'string.empty': 'email is required',
});

const phone = Joi.string()
  .pattern(/^\d{10}$/)
  .required()
  .messages({
    'string.pattern.base': 'phone must be a valid 10-digit phone number',
    'any.required': 'phone is required',
    'string.empty': 'phone is required',
  });

export const createSchoolValidation = Joi.object({
  institutionName: Joi.string().trim().required().messages({
    'any.required': 'institutionName is required',
    'string.empty': 'institutionName is required',
  }),
  principalName: Joi.string().trim().required().messages({
    'any.required': 'principalName is required',
    'string.empty': 'principalName is required',
  }),
  contactPerson: Joi.string().trim().required().messages({
    'any.required': 'contactPerson is required',
    'string.empty': 'contactPerson is required',
  }),
  email,
  phone,
  address: Joi.string().trim().required().messages({
    'any.required': 'address is required',
    'string.empty': 'address is required',
  }),
  city: Joi.string().trim().required().messages({
    'any.required': 'city is required',
    'string.empty': 'city is required',
  }),
  state: Joi.string().trim().required().messages({
    'any.required': 'state is required',
    'string.empty': 'state is required',
  }),
  institutionType: Joi.string()
    .valid('Government', 'Private', 'Semi-Government')
    .required()
    .messages({
      'any.only': 'institutionType must be one of Government, Private, Semi-Government',
      'any.required': 'institutionType is required',
      'string.empty': 'institutionType is required',
    }),
});

export const createGovernmentValidation = Joi.object({
  organizationName: Joi.string().trim().required().messages({
    'any.required': 'organizationName is required',
    'string.empty': 'organizationName is required',
  }),
  department: Joi.string().trim().required().messages({
    'any.required': 'department is required',
    'string.empty': 'department is required',
  }),
  contactPerson: Joi.string().trim().required().messages({
    'any.required': 'contactPerson is required',
    'string.empty': 'contactPerson is required',
  }),
  email,
  phone,
  city: Joi.string().trim().required().messages({
    'any.required': 'city is required',
    'string.empty': 'city is required',
  }),
});

const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .required()
  .messages({
    'string.pattern.base': 'id must be a valid MongoDB ObjectId',
    'any.required': 'id is required',
    'string.empty': 'id is required',
  });

export const approveUserParamsValidation = Joi.object({
  id: objectId,
});

export const onboardingListQueryValidation = Joi.object({
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
});
