import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { paymentService } from '../services/payment.service';

const router = Router();
const checkoutSchema = z.object({ plan: z.enum(['BASICO', 'VITALICIO']) });

/**
 * @openapi
 * /api/v1/payments/checkout:
 *   post:
 *     tags: [Admin]
 *     summary: Criar checkout de assinatura
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutRequest'
 *           examples:
 *             default:
 *               value:
 *                 plan: BASICO
 *     responses:
 *       201:
 *         description: Sessão de checkout criada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 checkoutUrl:
 *                   type: string
 *                   example: https://checkout.stripe.com/c/pay_123
 *                 sessionId:
 *                   type: string
 *                   example: cs_test_123
 *       400:
 *         description: Plano inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/payments/checkout', authMiddleware, validate({ body: checkoutSchema }), asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentService.createCheckoutSession(req.user!.id, req.body.plan);
  res.status(201).json(result);
}));

/**
 * @openapi
 * /api/v1/payments/webhook/stripe:
 *   post:
 *     tags: [Admin]
 *     summary: Webhook Stripe
 *     responses:
 *       200:
 *         description: Evento processado
 */
router.post('/payments/webhook/stripe', asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'];
  if (typeof signature !== 'string') {
    res.status(400).json({ message: 'Assinatura Stripe ausente.', code: 'MISSING_STRIPE_SIGNATURE' });
    return;
  }
  const result = await paymentService.handleWebhook(req.body as Buffer, signature);
  res.json(result);
}));

export default router;
