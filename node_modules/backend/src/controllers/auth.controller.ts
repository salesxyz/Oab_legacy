import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authService } from '../services/auth.service';
import { ApiError } from '../utils/ApiError';

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    return res.status(201).json(result);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    return res.status(200).json(result);
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.refresh(req.body.refreshToken);
    return res.status(200).json(result);
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(req.body.refreshToken);
    return res.status(204).send();
  }),

  logoutAll: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    await authService.logoutAllSessions(req.user.id);
    return res.status(204).send();
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body.email);
    // Sempre 200 com mensagem genérica, exista ou não o email.
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
