import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  photoUrl: z.string().url().optional(),
  goal: z.string().trim().max(500).optional(),
});

export const updatePreferencesSchema = z.object({
  publicRanking: z.boolean().optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
  accessibilitySettings: z
    .object({
      fontSize: z.enum(['small', 'medium', 'large', 'extra-large']).optional(),
      highContrast: z.boolean().optional(),
      reduceMotion: z.boolean().optional(),
      screenReaderOptimized: z.boolean().optional(),
      captionsEnabled: z.boolean().optional(),
      soundFeedback: z.boolean().optional(),
    })
    .optional(),
});
