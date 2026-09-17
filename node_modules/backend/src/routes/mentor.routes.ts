import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';
import { userRepository } from '../repositories/user.repository';
import { mentorRepository } from '../repositories/mentor.repository';
import { paramId } from '../utils/params';
import { idParamSchema } from '../schemas/content.schema';

const router = Router();
const listQuerySchema = z.object({ search: z.string().optional(), page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(50) });
const studentAnswersQuerySchema = z.object({ subject: z.string().trim().optional(), page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) });
const studentSimulationsQuerySchema = z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) });

/**
 * @openapi
 * /api/v1/mentor/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Dashboard do mentor
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do mentor retornados
 */
router.get('/mentor/dashboard', authMiddleware, requireRole('MENTOR'), asyncHandler(async (_req: Request, res: Response) => {
  res.json(await mentorRepository.getDashboard());
}));

/**
 * @openapi
 * /api/v1/mentor/students:
 *   get:
 *     tags: [Admin]
 *     summary: Listar alunos do mentor
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de alunos retornada
 */
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

/**
 * @openapi
 * /api/v1/mentor/students/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Detalhar aluno
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do aluno retornados
 */
router.get('/mentor/students/:id', authMiddleware, requireRole('MENTOR'), validate({ params: idParamSchema }), asyncHandler(async (req: Request, res: Response) => {
  const student = await mentorRepository.findStudentById(paramId(req, 'id'));
  if (!student) {
    res.status(404).json({ message: 'Aluno não encontrado.', code: 'STUDENT_NOT_FOUND' });
    return;
  }
  res.json(student);
}));

/**
 * @openapi
 * /api/v1/mentor/students/{id}/performance:
 *   get:
 *     tags: [Admin]
 *     summary: Desempenho do aluno
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance do aluno retornada
 */
router.get('/mentor/students/:id/performance', authMiddleware, requireRole('MENTOR'), validate({ params: idParamSchema }), asyncHandler(async (req: Request, res: Response) => {
  const performance = await mentorRepository.getStudentPerformance(paramId(req, 'id'));
  if (!performance) {
    res.status(404).json({ message: 'Aluno não encontrado.', code: 'STUDENT_NOT_FOUND' });
    return;
  }
  res.json(performance);
}));

/**
 * @openapi
 * /api/v1/mentor/students/{id}/answers:
 *   get:
 *     tags: [Admin]
 *     summary: Respostas do aluno
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Respostas do aluno retornadas
 */
router.get('/mentor/students/:id/answers', authMiddleware, requireRole('MENTOR'), validate({ params: idParamSchema, query: studentAnswersQuerySchema }), asyncHandler(async (req: Request, res: Response) => {
  const result = await mentorRepository.listStudentAnswers(paramId(req, 'id'), req.query as unknown as { page: number; pageSize: number; subject?: string });
  if (!result) {
    res.status(404).json({ message: 'Aluno não encontrado.', code: 'STUDENT_NOT_FOUND' });
    return;
  }
  res.json(result);
}));

/**
 * @openapi
 * /api/v1/mentor/students/{id}/simulations:
 *   get:
 *     tags: [Admin]
 *     summary: Simulados do aluno
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Simulados do aluno retornados
 */
router.get('/mentor/students/:id/simulations', authMiddleware, requireRole('MENTOR'), validate({ params: idParamSchema, query: studentSimulationsQuerySchema }), asyncHandler(async (req: Request, res: Response) => {
  const result = await mentorRepository.listStudentSimulations(paramId(req, 'id'), req.query as unknown as { page: number; pageSize: number });
  if (!result) {
    res.status(404).json({ message: 'Aluno não encontrado.', code: 'STUDENT_NOT_FOUND' });
    return;
  }
  res.json(result);
}));

export default router;