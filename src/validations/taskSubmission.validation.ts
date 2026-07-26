import Joi from 'joi';
import { TASK_SUBMISSION_STATUSES } from '../models/taskSubmission.model';

const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    'string.pattern.base': 'must be a valid MongoDB ObjectId',
  });

const objectIdRequired = objectId.required().messages({
  'any.required': 'id is required',
  'string.empty': 'id is required',
});

// Statuses a school can move a submission into during review.
const REVIEW_STATUSES = ['under_review', 'approved', 'rejected'] as const;

const proofValidation = Joi.object({
  fileName: Joi.string().trim().required().messages({
    'any.required': 'proof.fileName is required',
    'string.empty': 'proof.fileName is required',
  }),
  originalName: Joi.string().trim().required().messages({
    'any.required': 'proof.originalName is required',
    'string.empty': 'proof.originalName is required',
  }),
  fileUrl: Joi.string().trim().uri().required().messages({
    'any.required': 'proof.fileUrl is required',
    'string.empty': 'proof.fileUrl is required',
    'string.uri': 'proof.fileUrl must be a valid URL',
  }),
  fileType: Joi.string().trim().required().messages({
    'any.required': 'proof.fileType is required',
    'string.empty': 'proof.fileType is required',
  }),
  fileSize: Joi.number().integer().min(0).required().messages({
    'any.required': 'proof.fileSize is required',
    'number.base': 'proof.fileSize must be a number',
    'number.integer': 'proof.fileSize must be an integer',
    'number.min': 'proof.fileSize must be zero or greater',
  }),
})
  .required()
  .messages({
    'any.required': 'proof is required',
    'object.base': 'proof must be an object',
  });

export const submitTaskValidation = Joi.object({
  taskId: objectId.required().messages({
    'any.required': 'taskId is required',
    'string.empty': 'taskId is required',
    'string.pattern.base': 'taskId must be a valid MongoDB ObjectId',
  }),
  description: Joi.string().trim().max(2000).required().messages({
    'any.required': 'description is required',
    'string.empty': 'description is required',
    'string.max': 'description must not exceed 2000 characters',
  }),
  proof: proofValidation,
});

export const reviewTaskSubmissionValidation = Joi.object({
  status: Joi.string()
    .valid(...REVIEW_STATUSES)
    .required()
    .messages({
      'any.required': 'status is required',
      'any.only': `status must be one of ${REVIEW_STATUSES.join(', ')}`,
      'string.empty': 'status is required',
    }),
  reviewComment: Joi.string().trim().max(2000).allow('').optional(),
  rejectionReason: Joi.when('status', {
    is: 'rejected',
    then: Joi.string().trim().max(2000).required().messages({
      'any.required': 'rejectionReason is required when status is rejected',
      'string.empty': 'rejectionReason is required when status is rejected',
    }),
    otherwise: Joi.string().trim().max(2000).allow('').optional(),
  }),
  pointsEarned: Joi.number().integer().min(0).optional().messages({
    'number.base': 'pointsEarned must be a number',
    'number.integer': 'pointsEarned must be an integer',
    'number.min': 'pointsEarned must be zero or greater',
  }),
  badgeAwarded: Joi.boolean().optional(),
});

export const taskSubmissionIdParamsValidation = Joi.object({
  id: objectIdRequired,
});

export const taskSubmissionListQueryValidation = Joi.object({
  schoolId: objectId.optional(),
  studentId: objectId.optional(),
  taskId: objectId.optional(),
  status: Joi.string()
    .valid(...TASK_SUBMISSION_STATUSES)
    .optional()
    .messages({
      'any.only': `status must be one of ${TASK_SUBMISSION_STATUSES.join(', ')}`,
    }),
  fromDate: Joi.date().iso().optional().messages({
    'date.base': 'fromDate must be a valid date',
  }),
  toDate: Joi.date().iso().optional().messages({
    'date.base': 'toDate must be a valid date',
  }),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});
