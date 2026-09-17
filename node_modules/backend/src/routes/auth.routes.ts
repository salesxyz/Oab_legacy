import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyCodeSchema,
} from '../schemas/auth.schema';

const router = Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Cadastro de usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             default:
 *               value:
 *                 name: Maria Silva
 *                 email: maria@exemplo.com
 *                 password: Senha@123
 *     responses:
 *       201:
 *         description: Usuário cadastrado
 */
router.post('/register', authRateLimiter, validate({ body: registerSchema }), authController.register);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             default:
 *               value:
 *                 email: maria@exemplo.com
 *                 password: Senha@123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokenResponse'
 *             examples:
 *               success:
 *                 value:
 *                   accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                   refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                   user:
 *                     id: user_123
 *                     name: Maria Silva
 *                     email: maria@exemplo.com
 *                     role: ALUNO
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', authRateLimiter, validate({ body: loginSchema }), authController.login);

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Renovar token
 *     responses:
 *       200:
 *         description: Token renovado
 */
router.post('/refresh', authController.refresh);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Encerrar sessão atual
 *     responses:
 *       200:
 *         description: Logout realizado
 */
router.post('/logout', authController.logout);

/**
 * @openapi
 * /api/v1/auth/logout-all:
 *   post:
 *     tags: [Auth]
 *     summary: Encerrar todas as sessões
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessões encerradas
 */
router.post('/logout-all', authMiddleware, authController.logoutAll);

/**
 * @openapi
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Solicitar recuperação de senha
 *     responses:
 *       200:
 *         description: Código de recuperação enviado
 */
router.post('/forgot-password', authRateLimiter, validate({ body: forgotPasswordSchema }), authController.forgotPassword);

/**
 * @openapi
 * /api/v1/auth/verify-code:
 *   post:
 *     tags: [Auth]
 *     summary: Validar código de recuperação
 *     responses:
 *       200:
 *         description: Código validado
 */
router.post('/verify-code', authRateLimiter, validate({ body: verifyCodeSchema }), authController.verifyCode);

/**
 * @openapi
 * /api/v1/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Redefinir senha
 *     responses:
 *       200:
 *         description: Senha redefinida
 */
router.post('/reset-password', authRateLimiter, validate({ body: resetPasswordSchema }), authController.resetPassword);

/**
 * @openapi
 * /api/v1/auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Alterar senha autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Senha alterada
 */
router.post(
  '/change-password',
  authMiddleware,
  validate({ body: changePasswordSchema }),
  authController.changePassword,
);

export default router;
