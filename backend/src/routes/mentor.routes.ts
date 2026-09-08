import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';
import { userRepository } from '../repositories/user.repository';

const router = Router();
const listQuerySchema = z.object({ search: z.string().optional(), page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(50) });

router.get(
  '/mentor/students',
  authMiddleware,
  requireRole('MENTOR'),
  validate({ query: listQuerySchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { search, page, pageSize } = req.query as any;
    res.json(await userRepository.listStudentsWithProgress({ search, page, pageSize }));
  }),
);

export default router;