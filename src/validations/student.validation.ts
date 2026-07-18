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

export const registerStudentValidation = Joi.object({
  fullName: Joi.string().trim().required().messages({
    'any.required': 'fullName is required',
    'string.empty': 'fullName is required',
  }),
  age: Joi.number().integer().min(5).max(100).required().messages({
    'number.base': 'age must be a number',
    'number.min': 'age must be at least 5',
    'number.max': 'age must be at most 100',
    'any.required': 'age is required',
  }),
  gender: Joi.string().valid('Male', 'Female', 'Other').required().messages({
    'any.only': 'gender must be one of Male, Female, Other',
    'any.required': 'gender is required',
    'string.empty': 'gender is required',
  }),
  classGrade: Joi.string().trim().required().messages({
    'any.required': 'classGrade is required',
    'string.empty': 'classGrade is required',
  }),
  schoolId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'schoolId must be a valid MongoDB ObjectId',
      'any.required': 'schoolId is required',
      'string.empty': 'schoolId is required',
    }),
  city: Joi.string().trim().required().messages({
    'any.required': 'city is required',
    'string.empty': 'city is required',
  }),
  email,
  phone,
});
