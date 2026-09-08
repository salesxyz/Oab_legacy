import { Request } from 'express';
import { ApiError } from './ApiError';

/**
 * A partir do Express 5, `req.params[name]` tem o tipo `string | string[]`
 * (o path-to-regexp v8 agora suporta parâmetros repetidos/splat). Nenhuma
 * rota desta API usa esse recurso — todo parâmetro aqui é um valor único
 * (normalmente um UUID já validado pelo middleware Zod). Este helper
 * centraliza essa garantia em vez de espalhar `as string` pelo código.
 */
export function paramId(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string' || value.length === 0) {
    throw ApiError.badRequest(`Parâmetro de rota "${name}" inválido.`, 'INVALID_ROUTE_PARAM');
  }
  return value;
}
