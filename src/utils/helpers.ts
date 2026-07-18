import mongoose from 'mongoose';
import crypto from 'crypto';
import { PAGINATION, OTP } from './constants';

export const generateOtp = (): { otp: string; otpExpiry: Date } => {
  const otp = crypto.randomInt(100000, 1000000).toString();
  const otpExpiry = new Date(Date.now() + OTP.EXPIRY_MINUTES * 60 * 1000);
  return { otp, otpExpiry };
};

export const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const maskPhone = (phone?: string): string | undefined => {
  if (!phone || phone.length < 4) {
    return undefined;
  }
  return `${phone.slice(0, 2)}${'*'.repeat(phone.length - 4)}${phone.slice(-2)}`;
};

export const getPaginationParams = (
  page?: number,
  limit?: number,
): { skip: number; limit: number; page: number } => {
  const currentPage = Math.max(page || PAGINATION.DEFAULT_PAGE, 1);
  const currentLimit = Math.min(
    Math.max(limit || PAGINATION.DEFAULT_LIMIT, 1),
    PAGINATION.MAX_LIMIT,
  );
  const skip = (currentPage - 1) * currentLimit;

  return { skip, limit: currentLimit, page: currentPage };
};

export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number,
): {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export const excludeFields = <T extends Record<string, unknown>>(
  obj: T,
  fields: string[],
): Partial<T> => {
  const result = { ...obj };
  fields.forEach((field) => delete result[field]);
  return result;
};
