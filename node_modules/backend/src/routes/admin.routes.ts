import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { paramId } from '../utils/params';
import { asyncHandler } from '../utils/asyncHandler';
import { adminRepository } from '../repositories/admin.repository';
import { userRepository } from '../repositories/user.repository';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';
import { ApiError } from '../utils/ApiError';
import { emailService } from '../services/email.service';
import { logger } from '../config/logger';

const router = Router();
router.use(authMiddleware, requireAdmin);

/**
 * @openapi
 * /api/v1/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Dashboard administrativo
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas do painel administrativo
 */

const listUsersQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const setStatusSchema = z.object({ status: z.enum(['ATIVO', 'INATIVO']) });
const setRoleSchema = z.object({ role: z.enum(['ALUNO', 'ADMIN', 'MENTOR']) });
const setApprovalSchema = z.object({ approved: z.boolean() });

router.get(
  '/dashboard',
  asyncHandler(async (_req: Request, res: Response) => {
    res.json(await adminRepository.dashboardStats());
  }),
);

/**
 * @openapi
 * /api/v1/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Listar usuários
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
router.get(
  '/users',
  validate({ query: listUsersQuerySchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { search, page, pageSize } = req.query as any;
    const result = await userRepository.list({ search, page, pageSize });
    res.json(result);
  }),
);

/**
 * @openapi
 * /api/v1/admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Buscar usuário por id
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuário encontrado
 */
router.get(
  '/users/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const user = await userRepository.findById(paramId(req, 'id'));
    if (!user) throw ApiError.notFound('Usuário não encontrado.');
    const { passwordHash, ...safe } = user;
    res.json(safe);
  }),
);

/**
 * @openapi
 * /api/v1/admin/users/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Alterar status do usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status atualizado
 */
router.patch(
  '/users/:id/status',
  validate({ body: setStatusSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await userRepository.setStatus(paramId(req, 'id'), req.body.status);
    res.json(user);
  }),
);

/**
 * @openapi
 * /api/v1/admin/users/{id}/role:
 *   patch:
 *     tags: [Admin]
 *     summary: Alterar papel do usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Papel atualizado
 */
router.patch(
  '/users/:id/role',
  validate({ body: setRoleSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await userRepository.setRole(paramId(req, 'id'), req.body.role);
    res.json(user);
  }),
);

/**
 * @openapi
 * /api/v1/admin/users/{id}/approval:
 *   patch:
 *     tags: [Admin]
 *     summary: Aprovar ou bloquear usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aprovação atualizada
 */
router.patch(
  '/users/:id/approval',
  validate({ body: setApprovalSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await userRepository.findById(paramId(req, 'id'));
    if (!user) throw ApiError.notFound('Usuário não encontrado.');
    const updated = await userRepository.markApproved(user.id, req.body.approved);
    if (req.body.approved && !user.approved) {
      emailService.sendApprovalEmail(updated.email, updated.name, updated.accessExpiresAt).catch((error) => logger.error('Falha ao enviar email de aprovação', error));
    }
    res.json(updated);
  }),
);

export default router;
