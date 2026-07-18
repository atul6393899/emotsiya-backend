import Joi from 'joi';
import { OTP } from '../utils/constants';

const email = Joi.string().email().lowercase().trim().messages({
  'string.email': 'email must be a valid email address',
});

const phone = Joi.string()
  .pattern(/^\d{10}$/)
  .messages({
    'string.pattern.base': 'phone must be a valid 10-digit phone number',
  });

const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    'string.pattern.base': 'userId must be a valid MongoDB ObjectId',
  });

export const sendOtpSchema = Joi.object({
  email,
  phone,
})
  .xor('email', 'phone')
  .messages({
    'object.xor': 'Provide either email or phone, not both',
    'object.missing': 'Either email or phone is required',
  });

export const resendOtpSchema = Joi.object({
  userId: objectId.required().messages({
    'any.required': 'userId is required',
  }),
});

export const verifyOtpSchema = Joi.object({
  userId: objectId.required().messages({
    'any.required': 'userId is required',
  }),
  otp: Joi.string()
    .length(OTP.LENGTH)
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.length': `otp must be exactly ${OTP.LENGTH} digits`,
      'string.pattern.base': 'otp must contain only digits',
      'any.required': 'otp is required',
    }),
});
