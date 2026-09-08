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

router.get('/tips/of-the-day', tipController.ofTheDay);
router.get('/tips', optionalAuthMiddleware, tipController.list);
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
