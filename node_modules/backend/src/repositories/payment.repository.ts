import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { payments } from '../db/schema';

export const paymentRepository = {
  async create(data: typeof payments.$inferInsert) {
    const [payment] = await db.insert(payments).values(data).returning();
    return payment;
  },

  async findByCheckoutSessionId(stripeCheckoutSessionId: string) {
    const [payment] = await db.select().from(payments).where(eq(payments.stripeCheckoutSessionId, stripeCheckoutSessionId));
    return payment;
  },

  async markPaid(id: string, stripePaymentIntentId: string | null) {
    const [payment] = await db.update(payments).set({ status: 'PAID', stripePaymentIntentId, paidAt: new Date(), updatedAt: new Date() }).where(eq(payments.id, id)).returning();
    return payment;
  },
};
