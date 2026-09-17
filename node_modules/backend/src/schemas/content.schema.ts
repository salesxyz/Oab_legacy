import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional(),
  imageUrl: z.string().url().optional(),
  phase: z.enum(['OBJETIVA', 'PRATICO_PROFISSIONAL']).default('OBJETIVA'),
  order: z.number().int().min(0).optional(),
  status: z.enum(['RASCUNHO', 'PUBLICADO']).optional(),
});

export const updateCourseSchema = createCourseSchema.partial().extend({
  status: z.enum(['RASCUNHO', 'PUBLICADO']).optional(),
});

export const createModuleSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional(),
  order: z.number().int().min(0).optional(),
});

export const updateModuleSchema = createModuleSchema.partial().omit({ courseId: true });

export const reorderModulesSchema = z.object({
  items: z.array(z.object({ id: z.string().uuid(), order: z.number().int().min(0) })).min(1),
});

export const createContentSchema = z.object({
  moduleId: z.string().uuid(),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional(),
  type: z.enum(['VIDEO', 'TEXTO', 'PDF', 'QUIZ']),
  body: z.string().optional(),
  videoUrl: z.string().url().optional(),
  materialUrl: z.string().url().optional(),
  order: z.number().int().min(0).optional(),
  status: z.enum(['RASCUNHO', 'PUBLICADO']).optional(),
});

export const updateContentSchema = createContentSchema.partial().extend({
  status: z.enum(['RASCUNHO', 'PUBLICADO']).optional(),
});

export const progressSchema = z.object({
  percent: z.number().min(0).max(100),
});

export const idParamSchema = z.object({ id: z.string().uuid() });
