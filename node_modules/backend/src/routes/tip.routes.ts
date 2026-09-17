import { Request, Response, Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { paramId } from '../utils/params';
import { tipRepository } from '../repositories/tip.repository';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createTipSchema, updateTipSchema } from '../schemas/tip.schema';
import { idParamSchema } from '../schemas/content.schema';
import { ApiError } from '../utils/ApiError';

function isAdmin(req: Request) {
  return req.user?.role === 'ADMIN';
}

const tipController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    res.json(await tipRepository.list(!isAdmin(req)));
  }),

  ofTheDay: asyncHandler(async (_req: Request, res: Response) => {
    const tip = await tipRepository.tipOfTheDay();
    if (!tip) throw ApiError.notFound('Nenhuma dica cadastrada ainda.');
    res.json(tip);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await tipRepository.create(req.body));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await tipRepository.update(paramId(req, 'id'), req.body));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await tipRepository.delete(paramId(req, 'id'));
    res.status(204).send();
  }),
};

const router = Router();

/**
 * @openapi
 * /api/v1/tips/of-the-day:
 *   get:
 *     tags: [Tips]
 *     summary: Dica do dia
 *     responses:
 *       200:
 *         description: Dica retornada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 id: tip_123
 *                 title: Dica do dia
 *                 text: Revise os princípios fundamentais antes da prova objetiva.
 *                 createdAt: '2026-09-13T15:30:00.000Z'
 */
router.get('/tips/of-the-day', tipController.ofTheDay);

/**
 * @openapi
 * /api/v1/tips:
 *   get:
 *     tags: [Tips]
 *     summary: Listar dicas
 *     responses:
 *       200:
 *         description: Lista de dicas retornada
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   text:
 *                     type: string
 *             examples:
 *               success:
 *                 value:
 *                   - id: tip_123
 *                     title: Dica de revisão
 *                     text: Estude os temas mais recorrentes da semana.
 */
router.get('/tips', optionalAuthMiddleware, tipController.list);

/**
 * @openapi
 * /api/v1/tips:
 *   post:
 *     tags: [Tips]
 *     summary: Criar dica
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Dica criada
 */
router.post('/tips', authMiddleware, requireAdmin, validate({ body: createTipSchema }), tipController.create);
router.patch(
  '/tips/:id',
  authMiddleware,
  requireAdmin,
  validate({ params: idParamSchema, body: updateTipSchema }),
  tipController.update,
);
router.delete('/tips/:id', authMiddleware, requireAdmin, validate({ params: idParamSchema }), tipController.remove);

export default router;
