import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

export const videoStoragePath = path.resolve(env.VIDEO_STORAGE_DIR);
fs.mkdirSync(videoStoragePath, { recursive: true });

const extensionByMimeType: Record<string, string> = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
};

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, videoStoragePath),
  filename: (_req, file, callback) => callback(null, `${randomUUID()}${extensionByMimeType[file.mimetype] ?? '.video'}`),
});

export const videoUpload = multer({
  storage,
  limits: { fileSize: env.VIDEO_MAX_SIZE_MB * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!extensionByMimeType[file.mimetype]) {
      callback(new Error('Formato de vídeo não suportado. Use MP4, WebM ou MOV.'));
      return;
    }
    callback(null, true);
  },
});

export function uploadVideoFile(req: Parameters<ReturnType<typeof videoUpload.single>>[0], res: Parameters<ReturnType<typeof videoUpload.single>>[1], next: Parameters<ReturnType<typeof videoUpload.single>>[2]) {
  videoUpload.single('video')(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return next(ApiError.badRequest(`O vídeo excede o limite de ${env.VIDEO_MAX_SIZE_MB} MB.`));
    }
    return next(ApiError.badRequest(error.message));
  });
}