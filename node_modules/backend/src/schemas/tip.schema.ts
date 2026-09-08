import { z } from 'zod';

export const createTipSchema = z.object({
  title: z.string().trim().min(2).max(200),
  content: z.string().trim().min(2),
  category: z.string().trim().max(100).optional(),
});

export const updateTipSchema = createTipSchema.partial().extend({
  active: z.boolean().optional(),
});
