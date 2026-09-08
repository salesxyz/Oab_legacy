import { Router } from 'express';
import { questionController } from '../controllers/question.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.middleware';
import { requireContentManager } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';
import { answerQuestionSchema, createQuestionSchema, listQuestionsQuerySchema, updateQuestionSchema } from '../schemas/question.schema';
import { idParamSchema } from '../schemas/content.schema';
import { requireActiveSubscription } from '../middlewares/subscription.middleware';

const router = Router();

router.get('/questions/subjects', questionController.subjects);
router.get('/questions/history', authMiddleware, questionController.history);
router.get('/questions/performance', authMiddleware, questionController.performance);

router.get('/questions', optionalAuthMiddleware, validate({ query: listQuestionsQuerySchema }), questionController.list);
router.get('/questions/:id', validate({ params: idParamSchema }), questionController.get);

router.post('/questions', authMiddleware, requireContentManager, validate({ body: createQuestionSchema }), questionController.create);
router.patch(
  '/questions/:id',
  authMiddleware,
  requireContentManager,
  validate({ params: idParamSchema, body: updateQuestionSchema }),
  questionController.update,
);
router.delete('/questions/:id', authMiddleware, requireContentManager, validate({ params: idParamSchema }), questionController.remove);

// Responder é sempre atrelado ao usuário autenticado.
router.post(
  '/questions/:id/answer',
  authMiddleware,
  requireActiveSubscription,
  validate({ params: idParamSchema, body: answerQuestionSchema }),
  questionController.answer,
);

export default router;
