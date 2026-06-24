import mongoose from 'mongoose';
import { PAGINATION } from './constants';

export const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
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
