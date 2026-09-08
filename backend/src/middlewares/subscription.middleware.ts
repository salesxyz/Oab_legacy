import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { userRepository } from '../repositories/user.repository';

export async function requireActiveSubscription(req: Request, _res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) return next(ApiError.unauthorized());
  const storedUser = user.role === 'ALUNO' ? await userRepository.findById(user.id) : null;
  if (storedUser?.accessExpiresAt && storedUser.accessExpiresAt <= new Date()) {
    return next(ApiError.forbidden('Seu acesso expirou. Renove seu plano para continuar estudando.', 'SUBSCRIPTION_EXPIRED'));
  }
  return next();
}