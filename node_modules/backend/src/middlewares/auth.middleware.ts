import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { verifyAccessToken } from '../utils/jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'ALUNO' | 'ADMIN' | 'MENTOR';
        name: string;
      };
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Token de acesso ausente.'));
  }

  const token = header.substring('Bearer '.length);

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role, name: payload.name };
    return next();
  } catch {
    return next(ApiError.unauthorized('Token de acesso inválido ou expirado.', 'INVALID_TOKEN'));
  }
}

/**
 * Middleware opcional: popula req.user se houver token válido, mas não bloqueia
 * a requisição caso não haja. Útil em rotas públicas com comportamento extra
 * para usuários autenticados.
 */
export function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();

  try {
    const payload = verifyAccessToken(header.substring('Bearer '.length));
    req.user = { id: payload.sub, role: payload.role, name: payload.name };
  } catch {
    // Ignora token inválido em rota opcional.
  }
  return next();
}
