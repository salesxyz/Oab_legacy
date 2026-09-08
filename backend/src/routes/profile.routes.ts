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
const subscriptionSchema = z.object({ plan: z.enum(['BASICO', 'VITALICIO']) });

// Nota: authMiddleware é aplicado individualmente a cada rota (em vez de um
// router.use global) porque este router é montado na raiz da API junto com
// outros módulos sem prefixo comum — um middleware "catch-all" aqui
// interceptaria também requisições destinadas a outras rotas.

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

router.patch(
  '/profile/preferences',
  authMiddleware,
  validate({ body: updatePreferencesSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const updated = await profileRepository.update(req.user!.id, req.body);
    res.json(updated);
  }),
);

router.patch(
  '/subscription',
  authMiddleware,
  validate({ body: subscriptionSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await userRepository.activateSubscription(req.user!.id, req.body.plan);
    res.json({ plan: user.subscriptionPlan, accessExpiresAt: user.accessExpiresAt });
  }),
);

router.get(
  '/progress',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await contentService.getUserProgressOverview(req.user!.id));
  }),
);

router.get(
  '/achievements',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const summary = await gamificationService.getProfileSummary(req.user!.id);
    res.json(summary?.achievements ?? []);
  }),
);

router.get(
  '/ranking',
  authMiddleware,
  requireRole('ALUNO'),
  asyncHandler(async (_req: Request, res: Response) => {
    res.json(await gamificationService.getRanking());
  }),
);

router.get(
  '/history/questions',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await questionService.getUserHistory(req.user!.id));
  }),
);

router.get(
  '/history/simulations',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await simulationService.getUserResults(req.user!.id));
  }),
);

export default router;
