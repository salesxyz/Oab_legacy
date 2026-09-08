import { z } from 'zod';

export const createSimulationSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional(),
  questionCount: z.number().int().min(1).max(200),
  timeLimitMinutes: z.number().int().min(1).max(600),
  questionIds: z.array(z.string().uuid()).min(1),
});

export const updateSimulationSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  timeLimitMinutes: z.number().int().min(1).max(600).optional(),
  active: z.boolean().optional(),
});

export const finishSimulationSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      alternativeId: z.string().uuid(),
    }),
  ),
  timeSpentSeconds: z.number().int().min(0),
});
