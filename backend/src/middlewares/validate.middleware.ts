import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

interface ValidationSchemas {
  body?: z.ZodType;
  query?: z.ZodType;
  params?: z.ZodType;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);

      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query);
        // A partir do Express 5, `req.query` é uma propriedade somente leitura
        // (getter na cadeia de protótipos), então uma atribuição direta
        // (`req.query = ...`) lança TypeError em runtime. Redefinimos a
        // propriedade na própria instância da requisição para continuar
        // permitindo que o restante do código leia `req.query` normalmente
        // já validado/coagido pelo Zod (ex.: page/pageSize como number).
        Object.defineProperty(req, 'query', {
          value: parsedQuery,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }

      if (schemas.params) req.params = schemas.params.parse(req.params) as any;
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(
          ApiError.badRequest('Dados inválidos enviados na requisição.', 'VALIDATION_ERROR', err.flatten().fieldErrors),
        );
      }
      return next(err);
    }
  };
}
