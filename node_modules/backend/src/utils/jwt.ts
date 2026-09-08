import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';

export type JwtRole = 'ALUNO' | 'ADMIN' | 'MENTOR';

export interface AccessTokenPayload {
  sub: string; // userId
  role: JwtRole;
  name: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
}

/**
 * O refresh token em si é um valor opaco e aleatório (não um JWT com claims),
 * o que evita vazamento de informação e permite revogação/rotação real no banco.
 * Guardamos apenas o hash (SHA-256) no banco — nunca o valor puro.
 */
export function generateRefreshTokenValue(): string {
  return crypto.randomBytes(48).toString('hex');
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function refreshTokenExpiryDate(): Date {
  const days = env.REFRESH_TOKEN_EXPIRES_IN_DAYS;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
