import { Router } from 'express';
import { simulationController } from '../controllers/simulation.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.middleware';
import { requireContentManager } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createSimulationSchema, finishSimulationSchema, updateSimulationSchema } from '../schemas/simulation.schema';
import { idParamSchema } from '../schemas/content.schema';
import { requireActiveSubscription } from '../middlewares/subscription.middleware';

const router = Router();

/**
 * @openapi
 * /api/v1/simulations/my-results:
 *   get:
 *     tags: [Simulations]
 *     summary: Resultados dos meus simulados
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resultados retornados
 */
router.get('/simulations/my-results', authMiddleware, simulationController.myResults);

/**
 * @openapi
 * /api/v1/simulations:
 *   get:
 *     tags: [Simulations]
 *     summary: Listar simulados
 *     responses:
 *       200:
 *         description: Lista de simulados retornada
 */
router.get('/simulations', optionalAuthMiddleware, simulationController.list);

/**
 * @openapi
 * /api/v1/simulations/{id}:
 *   get:
 *     tags: [Simulations]
 *     summary: Buscar simulado por id
 *     responses:
 *       200:
 *         description: Simulado encontrado
 */
router.get('/simulations/:id', validate({ params: idParamSchema }), simulationController.get);

/**
 * @openapi
 * /api/v1/simulations:
 *   post:
 *     tags: [Simulations]
 *     summary: Criar simulado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSimulationRequest'
 *           examples:
 *             default:
 *               value:
 *                 title: Simulado de Constitucional
 *                 description: Simulado com 20 questões de nível médio.
 *                 questionIds:
 *                   - q_123
 *                   - q_456
 *                   - q_789
 *     responses:
 *       201:
 *         description: Simulado criado
 */
router.post('/simulations', authMiddleware, requireContentManager, validate({ body: createSimulationSchema }), simulationController.create);

/**
 * @openapi
 * /api/v1/simulations/{id}:
 *   patch:
 *     tags: [Simulations]
 *     summary: Atualizar simulado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Simulado atualizado
 */
router.patch(
  '/simulations/:id',
  authMiddleware,
  requireContentManager,
  validate({ params: idParamSchema, body: updateSimulationSchema }),
  simulationController.update,
);

/**
 * @openapi
 * /api/v1/simulations/{id}:
 *   delete:
 *     tags: [Simulations]
 *     summary: Remover simulado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Simulado removido
 */
router.delete('/simulations/:id', authMiddleware, requireContentManager, validate({ params: idParamSchema }), simulationController.remove);

/**
 * @openapi
 * /api/v1/simulations/{id}/start:
 *   post:
 *     tags: [Simulations]
 *     summary: Iniciar simulado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Simulado iniciado
 */
router.post('/simulations/:id/start', authMiddleware, requireActiveSubscription, validate({ params: idParamSchema }), simulationController.start);

/**
 * @openapi
 * /api/v1/simulations/{id}/finish:
 *   post:
 *     tags: [Simulations]
 *     summary: Finalizar simulado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Simulado finalizado
 */
router.post(
  '/simulations/:id/finish',
  authMiddleware,
  requireActiveSubscription,
  validate({ params: idParamSchema, body: finishSimulationSchema }),
  simulationController.finish,
);

export default router;
