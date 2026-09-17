import { integer, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

export const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'PAID', 'FAILED', 'CANCELED']);

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  plan: varchar('plan', { length: 20 }).notNull(),
  amountCents: integer('amount_cents').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('brl'),
  status: paymentStatusEnum('status').notNull().default('PENDING'),
  stripeCheckoutSessionId: varchar('stripe_checkout_session_id', { length: 255 }).notNull().unique(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  metadata: jsonb('metadata'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
