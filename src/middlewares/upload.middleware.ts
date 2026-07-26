import { Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../utils/constants';
import { uploadToS3 } from '../config/s3';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];

const storage = multer.memoryStorage();

const imageUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(
      new ApiError(HTTP_STATUS.BAD_REQUEST, 'Only image files are allowed (jpeg, png, webp, gif)'),
    );
  },
});

const runMulter = (fieldName: string, req: Request, res: Response): Promise<void> =>
  new Promise((resolve, reject) => {
    imageUpload.single(fieldName)(req, res, (error: unknown) => {
      if (error instanceof MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          reject(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Image must not exceed 5 MB'));
          return;
        }
        reject(new ApiError(HTTP_STATUS.BAD_REQUEST, error.message));
        return;
      }
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

/**
 * Accepts a single image in the given multipart field, uploads it to S3,
 * and attaches the resulting file metadata to `req.body[targetField]`.
 * The field is required — a missing file results in a 400.
 */
export const uploadImageToS3 = (fieldName: string, folder: string, targetField = fieldName) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await runMulter(fieldName, req, res);

      if (!req.file) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, `${fieldName} image is required`);
      }

      const uploaded = await uploadToS3(
        {
          buffer: req.file.buffer,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
        },
        folder,
      );

      req.body = { ...req.body, [targetField]: uploaded };
      next();
    } catch (error) {
      next(error);
    }
  };
};
