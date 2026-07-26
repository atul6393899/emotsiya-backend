import crypto from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from './logger';

dotenv.config();

const AWS_REGION = process.env.AWS_REGION;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

const isS3Configured = Boolean(
  AWS_REGION && AWS_BUCKET_NAME && AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY,
);

export const s3Client = isS3Configured
  ? new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID as string,
        secretAccessKey: AWS_SECRET_ACCESS_KEY as string,
      },
    })
  : null;

export interface IUploadedFile {
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export interface IUploadInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
}

const buildObjectKey = (folder: string, originalName: string): string => {
  const extension = originalName.includes('.') ? originalName.split('.').pop() : '';
  const unique = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  const safeFolder = folder.replace(/^\/+|\/+$/g, '');
  return extension ? `${safeFolder}/${unique}.${extension}` : `${safeFolder}/${unique}`;
};

const buildPublicUrl = (key: string): string =>
  `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;

/**
 * Uploads a file buffer to S3 and returns its metadata.
 * @param file   the file buffer and its attributes
 * @param folder the S3 "folder" (key prefix) to store the object under
 */
export const uploadToS3 = async (
  file: IUploadInput,
  folder = 'uploads',
): Promise<IUploadedFile> => {
  if (!s3Client) {
    throw new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'File storage is not configured. Missing AWS credentials.',
    );
  }

  const key = buildObjectKey(folder, file.originalName);

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimeType,
        ContentLength: file.size,
      }),
    );
  } catch (error) {
    const err = error as { name?: string; message?: string; Code?: string; $metadata?: unknown };
    logger.error('S3 upload failed', {
      name: err.name,
      code: err.Code,
      message: err.message,
      bucket: AWS_BUCKET_NAME,
      region: AWS_REGION,
      key,
      metadata: err.$metadata,
    });
    throw new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'Failed to upload file to storage',
      err.message ? [err.message] : [],
    );
  }

  return {
    fileName: key,
    originalName: file.originalName,
    fileUrl: buildPublicUrl(key),
    fileType: file.mimeType,
    fileSize: file.size,
  };
};
