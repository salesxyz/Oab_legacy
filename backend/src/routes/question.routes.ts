import { Router } from 'express';
import { questionController } from '../controllers/question.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.middleware';
import { requireContentManager } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';
import { answerQuestionSchema, createQuestionSchema, listQuestionsQuerySchema, updateQuestionSchema } from '../schemas/question.schema';
import { idParamSchema } from '../schemas/content.schema';
import { requireActiveSubscription } from '../middlewares/subscription.middleware';

const router = Router();

/**
 * @openapi
 * /api/v1/questions/subjects:
 *   get:
 *     tags: [Questions]
 *     summary: Listar matérias das questões
 *     responses:
 *       200:
 *         description: Matérias retornadas
 */
router.get('/questions/subjects', questionController.subjects);

/**
 * @openapi
 * /api/v1/questions/history:
 *   get:
 *     tags: [Questions]
 *     summary: Histórico de questões respondidas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Histórico retornado
 */
router.get('/questions/history', authMiddleware, questionController.history);

/**
 * @openapi
 * /api/v1/questions/performance:
 *   get:
 *     tags: [Questions]
 *     summary: Desempenho do usuário em questões
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados de desempenho retornados
 */
router.get('/questions/performance', authMiddleware, questionController.performance);

/**
 * @openapi
 * /api/v1/questions:
 *   get:
 *     tags: [Questions]
 *     summary: Listar questões
 *     responses:
 *       200:
 *         description: Lista de questões retornada
 */
router.get('/questions', optionalAuthMiddleware, validate({ query: listQuestionsQuerySchema }), questionController.list);

/**
 * @openapi
 * /api/v1/questions/{id}:
 *   get:
 *     tags: [Questions]
 *     summary: Buscar questão por id
 *     responses:
 *       200:
 *         description: Questão encontrada
 */
router.get('/questions/:id', validate({ params: idParamSchema }), questionController.get);

/**
 * @openapi
 * /api/v1/questions:
 *   post:
 *     tags: [Questions]
 *     summary: Criar questão
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQuestionRequest'
 *           examples:
 *             default:
 *               value:
 *                 statement: Qual é a fonte do direito?
 *                 subject: Direito Constitucional
 *                 alternatives:
 *                   - Lei
 *                   - Costume
 *                   - Jurisprudência
 *                   - Doutrina
 *                 correctIndex: 0
 *     responses:
 *       201:
 *         description: Questão criada
 */
router.post('/questions', authMiddleware, requireContentManager, validate({ body: createQuestionSchema }), questionController.create);

/**
 * @openapi
 * /api/v1/questions/{id}:
 *   patch:
 *     tags: [Questions]
 *     summary: Atualizar questão
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Questão atualizada
 */
router.patch(
  '/questions/:id',
  authMiddleware,
  requireContentManager,
  validate({ params: idParamSchema, body: updateQuestionSchema }),
  questionController.update,
);

/**
 * @openapi
 * /api/v1/questions/{id}:
 *   delete:
 *     tags: [Questions]
 *     summary: Remover questão
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Questão removida
 */
router.delete('/questions/:id', authMiddleware, requireContentManager, validate({ params: idParamSchema }), questionController.remove);

// Responder é sempre atrelado ao usuário autenticado.
/**
 * @openapi
 * /api/v1/questions/{id}/answer:
 *   post:
 *     tags: [Questions]
 *     summary: Responder uma questão
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resposta registrada
 */
router.post(
  '/questions/:id/answer',
  authMiddleware,
  requireActiveSubscription,
  validate({ params: idParamSchema, body: answerQuestionSchema }),
  questionController.answer,
);

export default router;
