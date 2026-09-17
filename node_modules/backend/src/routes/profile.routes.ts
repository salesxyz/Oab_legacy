import { Request, Response, Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { userRepository } from '../repositories/user.repository';
import { profileRepository } from '../repositories/profile.repository';
import { gamificationService } from '../services/gamification.service';
import { contentService } from '../services/content.service';
import { questionService } from '../services/question.service';
import { simulationService } from '../services/simulation.service';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updatePreferencesSchema, updateProfileSchema } from '../schemas/profile.schema';
import { z } from 'zod';

const router = Router();

// Nota: authMiddleware é aplicado individualmente a cada rota (em vez de um
// router.use global) porque este router é montado na raiz da API junto com
// outros módulos sem prefixo comum — um middleware "catch-all" aqui
// interceptaria também requisições destinadas a outras rotas.

/**
 * @openapi
 * /api/v1/profile:
 *   get:
 *     tags: [Profile]
 *     summary: Obter perfil do usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil retornado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 id: user_123
 *                 name: Maria Silva
 *                 email: maria@exemplo.com
 *                 role: ALUNO
 *                 subscriptionPlan: BASICO
 *                 approved: true
 *                 profile:
 *                   goal: Aprovar na OAB em 2026.
 *                 gamification:
 *                   points: 250
 *                 performanceBySubject:
 *                   Direito Constitucional: 82
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/profile',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await userRepository.findById(req.user!.id);
    if (!user) throw ApiError.notFound('Usuário não encontrado.');
    const profile = await profileRepository.findByUserId(user.id);
    const gam = await gamificationService.getProfileSummary(user.id);
    const performance = await questionService.getPerformanceBySubject(user.id);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      photoUrl: user.photoUrl,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      accessExpiresAt: user.accessExpiresAt,
      approved: user.approved,
      approvedAt: user.approvedAt,
      createdAt: user.createdAt,
      profile,
      gamification: gam,
      performanceBySubject: performance,
    });
  }),
);

/**
 * @openapi
 * /api/v1/profile:
 *   patch:
 *     tags: [Profile]
 *     summary: Atualizar perfil
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *           examples:
 *             default:
 *               value:
 *                 name: Maria Silva
 *                 photoUrl: https://cdn.exemplo.com/foto.jpg
 *                 goal: Aprovar na OAB em 2026.
 *     responses:
 *       200:
 *         description: Perfil atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             examples:
 *               success:
 *                 value:
 *                   message: Perfil atualizado com sucesso.
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  '/profile',
  authMiddleware,
  validate({ body: updateProfileSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { name, photoUrl, goal } = req.body;
    if (name || photoUrl) {
      await userRepository.updateProfileBasics(req.user!.id, { name, photoUrl });
    }
    if (goal !== undefined) {
      await profileRepository.update(req.user!.id, { goal });
    }
    res.json({ message: 'Perfil atualizado com sucesso.' });
  }),
);

/**
 * @openapi
 * /api/v1/profile/preferences:
 *   patch:
 *     tags: [Profile]
 *     summary: Atualizar preferências do perfil
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferências atualizadas
 */
router.patch(
  '/profile/preferences',
  authMiddleware,
  validate({ body: updatePreferencesSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const updated = await profileRepository.update(req.user!.id, req.body);
    res.json(updated);
  }),
);

/**
 * @openapi
 * /api/v1/progress:
 *   get:
 *     tags: [Profile]
 *     summary: Progresso do aluno
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progresso retornado
 */
router.get(
  '/progress',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await contentService.getUserProgressOverview(req.user!.id));
  }),
);

/**
 * @openapi
 * /api/v1/achievements:
 *   get:
 *     tags: [Profile]
 *     summary: Conquistas do usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conquistas retornadas
 */
router.get(
  '/achievements',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const summary = await gamificationService.getProfileSummary(req.user!.id);
    res.json(summary?.achievements ?? []);
  }),
);

/**
 * @openapi
 * /api/v1/ranking:
 *   get:
 *     tags: [Profile]
 *     summary: Ranking geral
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ranking retornado
 */
router.get(
  '/ranking',
  authMiddleware,
  requireRole('ALUNO'),
  asyncHandler(async (_req: Request, res: Response) => {
    res.json(await gamificationService.getRanking());
  }),
);

/**
 * @openapi
 * /api/v1/history/questions:
 *   get:
 *     tags: [Profile]
 *     summary: Histórico de questões do usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Histórico de questões retornado
 */
router.get(
  '/history/questions',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await questionService.getUserHistory(req.user!.id));
  }),
);

/**
 * @openapi
 * /api/v1/history/simulations:
 *   get:
 *     tags: [Profile]
 *     summary: Histórico de simulados do usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Histórico de simulados retornado
 */
router.get(
  '/history/simulations',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await simulationService.getUserResults(req.user!.id));
  }),
);

export default router;
