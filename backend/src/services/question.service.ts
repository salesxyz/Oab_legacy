import { questionRepository } from '../repositories/question.repository';
import { gamificationService } from './gamification.service';
import { XP_RULES } from '../utils/gamificationRules';
import { ApiError } from '../utils/ApiError';

function toPublicQuestion(question: { alternatives?: Array<{ correct: boolean }> } & Record<string, unknown>) {
  // Nunca revela qual alternativa é a correta antes da submissão da resposta.
  if (!question.alternatives) return question;
  return {
    ...question,
    alternatives: question.alternatives.map(({ correct, ...rest }) => rest),
  };
}

export const questionService = {
  async list(filters: Parameters<typeof questionRepository.list>[0]) {
    return questionRepository.list(filters);
  },

  async getForAnswering(id: string) {
    const question = await questionRepository.findWithAlternatives(id);
    if (!question || !question.active) throw ApiError.notFound('Questão não encontrada.');
    return toPublicQuestion(question);
  },

  async getSubjects() {
    return questionRepository.listDistinctSubjects();
  },

  async create(data: {
    moduleId: string;
    statement: string;
    explanation?: string;
    difficulty?: 'FACIL' | 'MEDIO' | 'DIFICIL';
    subject: string;
    examBoard?: string;
    year?: number;
    alternatives: Array<{ text: string; correct: boolean; order?: number }>;
  }) {
    const { alternatives, ...questionData } = data;
    if (alternatives.length < 3 || alternatives.length > 5) {
      throw ApiError.badRequest('A questão deve ter entre 3 e 5 alternativas.', 'INVALID_ALTERNATIVES');
    }
    const correctCount = alternatives.filter((a) => a.correct).length;
    if (correctCount !== 1) {
      throw ApiError.badRequest('A questão deve ter exatamente uma alternativa correta.', 'INVALID_ALTERNATIVES');
    }
    return questionRepository.create(questionData, alternatives);
  },

  async update(id: string, data: Record<string, unknown>) {
    const { alternatives, ...questionData } = data as any;
    const question = await questionRepository.update(id, questionData);
    if (alternatives) {
      if (alternatives.length < 3 || alternatives.length > 5) {
        throw ApiError.badRequest('A questão deve ter entre 3 e 5 alternativas.', 'INVALID_ALTERNATIVES');
      }
      const correctCount = alternatives.filter((a: any) => a.correct).length;
      if (correctCount !== 1) {
        throw ApiError.badRequest('A questão deve ter exatamente uma alternativa correta.', 'INVALID_ALTERNATIVES');
      }
      await questionRepository.replaceAlternatives(id, alternatives);
    }
    return question;
  },

  delete: questionRepository.delete,

  async answer(userId: string, questionId: string, alternativeId: string, responseTimeMs?: number) {
    const alternative = await questionRepository.findAlternativeById(alternativeId);
    if (!alternative || alternative.questionId !== questionId) {
      throw ApiError.badRequest('Alternativa inválida para esta questão.', 'INVALID_ALTERNATIVE');
    }

    const question = await questionRepository.findWithAlternatives(questionId);
    if (!question) throw ApiError.notFound('Questão não encontrada.');

    const correct = alternative.correct;
    await questionRepository.recordAnswer({ userId, questionId, alternativeId, correct, responseTimeMs });

    const totalAnswered = await questionRepository.countAnswersForUser(userId);
    const xpGained = XP_RULES.QUESTION_ANSWERED + (correct ? XP_RULES.QUESTION_CORRECT_BONUS : 0);
    await gamificationService.awardXp(userId, xpGained);
    await gamificationService.registerStudyActivity(userId);
    await gamificationService.checkQuestionAchievements(userId, totalAnswered, totalAnswered === 1);

    const correctAlternative = question.alternatives.find((a) => a.correct);

    return {
      correct,
      correctAlternativeId: correctAlternative?.id,
      explanation: question.explanation,
      xpGained,
    };
  },

  async getUserHistory(userId: string) {
    return questionRepository.listAnswersForUser(userId);
  },

  async getPerformanceBySubject(userId: string) {
    const result = await questionRepository.performanceBySubjectForUser(userId);
    return (result.rows as Array<{ subject: string; total: number; correct: number }>).map((r) => ({
      subject: r.subject,
      total: r.total,
      correct: r.correct,
      percent: r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0,
    }));
  },
};
