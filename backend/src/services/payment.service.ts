import Stripe from 'stripe';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { paymentRepository } from '../repositories/payment.repository';
import { userRepository } from '../repositories/user.repository';

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;
const planConfig = {
  BASICO: { name: 'OAB Mentoria - Plano Basico', amountCents: env.STRIPE_BASIC_PRICE_CENTS },
  VITALICIO: { name: 'OAB Mentoria - Plano Vitalicio', amountCents: env.STRIPE_LIFETIME_PRICE_CENTS },
} as const;

type Plan = keyof typeof planConfig;

function requireStripe() {
  if (!stripe) throw ApiError.internal('Stripe não está configurado.', 'STRIPE_NOT_CONFIGURED');
  return stripe;
}

export const paymentService = {
  async createCheckoutSession(userId: string, plan: Plan) {
    const client = requireStripe();
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('Usuário não encontrado.');
    const selectedPlan = planConfig[plan];
    const session = await client.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      line_items: [{ price_data: { currency: env.STRIPE_CURRENCY, product_data: { name: selectedPlan.name }, unit_amount: selectedPlan.amountCents }, quantity: 1 }],
      metadata: { userId, plan },
      success_url: `${env.WEB_URL}/app/assinatura?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.WEB_URL}/app/assinatura?checkout=canceled`,
    });
    await paymentRepository.create({ userId, plan, amountCents: selectedPlan.amountCents, currency: env.STRIPE_CURRENCY, stripeCheckoutSessionId: session.id, metadata: { plan } });
    return { sessionId: session.id, checkoutUrl: session.url };
  },

  async handleWebhook(payload: string | Buffer, signature: string) {
    const client = requireStripe();
    if (!env.STRIPE_WEBHOOK_SECRET) throw ApiError.internal('STRIPE_WEBHOOK_SECRET não está configurado.', 'STRIPE_NOT_CONFIGURED');
    let event: Stripe.Event;
    try {
      event = client.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch {
      throw ApiError.badRequest('Assinatura do webhook Stripe inválida.', 'INVALID_STRIPE_SIGNATURE');
    }
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const payment = await paymentRepository.findByCheckoutSessionId(session.id);
      if (payment && payment.status !== 'PAID') {
        await paymentRepository.markPaid(payment.id, typeof session.payment_intent === 'string' ? session.payment_intent : null);
        await userRepository.activateSubscription(payment.userId, payment.plan as Plan);
      }
    }
    return { received: true };
  },
};
