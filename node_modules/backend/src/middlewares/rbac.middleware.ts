import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';

/**
 * Garante que o usuário autenticado possua um dos papéis informados.
 * Deve ser usado sempre depois do authMiddleware.
 *
 * O backend NUNCA confia em validações do frontend: toda rota administrativa
 * passa por este middleware.
 */
export function requireRole(...roles: Array<'ALUNO' | 'ADMIN' | 'MENTOR'>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Você não tem permissão para acessar este recurso.'));
    }
    return next();
  };
}

export const requireAdmin = requireRole('ADMIN');
export const requireContentManager = requireRole('ADMIN', 'MENTOR');
