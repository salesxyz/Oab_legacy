  import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';
import { isProduction } from '../config/env';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Rota ${req.method} ${req.originalUrl} não encontrada.`, 'ROUTE_NOT_FOUND'));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, { code: err.code, path: req.originalUrl, stack: err.stack });
    } else {
      logger.warn(err.message, { code: err.code, path: req.originalUrl });
    }
    return res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Erro não tratado explicitamente: nunca expõe stack trace ou detalhes internos.
  logger.error('Erro não tratado', { error: err, path: req.originalUrl });

  return res.status(500).json({
    message: 'Ocorreu um erro inesperado. Tente novamente em instantes.',
    code: 'INTERNAL_ERROR',
    ...(isProduction ? {} : { debug: err instanceof Error ? err.message : String(err) }),
  });
}
