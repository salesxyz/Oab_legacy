import { Router } from 'express';
import { simulationController } from '../controllers/simulation.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.middleware';
import { requireContentManager } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createSimulationSchema, finishSimulationSchema, updateSimulationSchema } from '../schemas/simulation.schema';
import { idParamSchema } from '../schemas/content.schema';
import { requireActiveSubscription } from '../middlewares/subscription.middleware';

const router = Router();

router.get('/simulations/my-results', authMiddleware, simulationController.myResults);

router.get('/simulations', optionalAuthMiddleware, simulationController.list);
router.get('/simulations/:id', validate({ params: idParamSchema }), simulationController.get);

router.post('/simulations', authMiddleware, requireContentManager, validate({ body: createSimulationSchema }), simulationController.create);
router.patch(
  '/simulations/:id',
  authMiddleware,
  requireContentManager,
  validate({ params: idParamSchema, body: updateSimulationSchema }),
  simulationController.update,
);
router.delete('/simulations/:id', authMiddleware, requireContentManager, validate({ params: idParamSchema }), simulationController.remove);

router.post('/simulations/:id/start', authMiddleware, requireActiveSubscription, validate({ params: idParamSchema }), simulationController.start);
router.post(
  '/simulations/:id/finish',
  authMiddleware,
  requireActiveSubscription,
  validate({ params: idParamSchema, body: finishSimulationSchema }),
  simulationController.finish,
);

export default router;
