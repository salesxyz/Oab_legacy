import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authService } from '../services/auth.service';
import { ApiError } from '../utils/ApiError';

export const REFRESH_COOKIE_NAME = 'oab_mentoria_refresh';
const REFRESH_MODE_COOKIE_NAME = 'oab_mentoria_refresh_mode';
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

function setRefreshCookies(res: Response, refreshToken: string, persistent: boolean) {
  const secure = process.env.NODE_ENV === 'production';
  const baseOptions = { httpOnly: true, secure, sameSite: 'strict' as const, path: '/' };
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...baseOptions,
    ...(persistent ? { maxAge: REFRESH_COOKIE_MAX_AGE } : {}),
  });
  res.cookie(REFRESH_MODE_COOKIE_NAME, persistent ? 'persistent' : 'session', {
    ...baseOptions,
    ...(persistent ? { maxAge: REFRESH_COOKIE_MAX_AGE } : {}),
  });
}

function clearRefreshCookies(res: Response) {
  const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/' };
  res.clearCookie(REFRESH_COOKIE_NAME, options);
  res.clearCookie(REFRESH_MODE_COOKIE_NAME, options);
}

function withoutRefreshToken<T extends { refreshToken: string }>(result: T) {
  const { refreshToken: _refreshToken, ...publicResult } = result;
  return publicResult;
}

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    setRefreshCookies(res, result.refreshToken, false);
    return res.status(201).json(withoutRefreshToken(result));
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    setRefreshCookies(res, result.refreshToken, req.body.remember);
    return res.status(200).json(withoutRefreshToken(result));
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) throw ApiError.unauthorized('Sessão expirada. Faça login novamente.', 'INVALID_REFRESH_TOKEN');
    const result = await authService.refresh(refreshToken);
    const persistent = req.cookies?.[REFRESH_MODE_COOKIE_NAME] === 'persistent';
    setRefreshCookies(res, result.refreshToken, persistent);
    return res.status(200).json(withoutRefreshToken(result));
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (refreshToken) await authService.logout(refreshToken);
    clearRefreshCookies(res);
    return res.status(204).send();
  }),

  logoutAll: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    await authService.logoutAllSessions(req.user.id);
    clearRefreshCookies(res);
    return res.status(204).send();
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body.email);
    return res.status(200).json({ message: 'Se o email estiver cadastrado, um código de recuperação foi enviado.' });
  }),

  verifyCode: asyncHandler(async (req: Request, res: Response) => {
    await authService.verifyResetCode(req.body.email, req.body.code);
    return res.status(200).json({ valid: true });
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body.email, req.body.code, req.body.newPassword);
    return res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
    return res.status(200).json({ message: 'Senha alterada com sucesso.' });
  }),
};
