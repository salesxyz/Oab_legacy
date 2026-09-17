import { z } from 'zod';

const alternativeSchema = z.object({
  text: z.string().trim().min(1).max(1000),
  correct: z.boolean(),
  order: z.number().int().min(0).optional(),
});

export const createQuestionSchema = z.object({
  moduleId: z.string().uuid(),
  statement: z.string().trim().min(5),
  explanation: z.string().trim().optional(),
  difficulty: z.enum(['FACIL', 'MEDIO', 'DIFICIL']).optional(),
  subject: z.string().trim().min(2).max(150),
  examBoard: z.string().trim().max(100).optional(),
  year: z.number().int().min(1990).max(2100).optional(),
  alternatives: z.array(alternativeSchema).min(3, 'A questão deve ter pelo menos 3 alternativas.').max(5, 'A questão pode ter no máximo 5 alternativas.').refine(
    (alternatives) => alternatives.filter((alternative) => alternative.correct).length === 1,
    'A questão deve ter exatamente uma alternativa correta.',
  ),
});

export const updateQuestionSchema = createQuestionSchema.partial().extend({
  active: z.boolean().optional(),
});

export const listQuestionsQuerySchema = z.object({
  subject: z.string().optional(),
  difficulty: z.enum(['FACIL', 'MEDIO', 'DIFICIL']).optional(),
  examBoard: z.string().optional(),
  year: z.coerce.number().int().optional(),
  moduleId: z.string().uuid().optional(),
  onlyUnanswered: z.coerce.boolean().optional(),
  onlyWrong: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const answerQuestionSchema = z.object({
  alternativeId: z.string().uuid(),
  responseTimeMs: z.number().int().min(0).optional(),
});
