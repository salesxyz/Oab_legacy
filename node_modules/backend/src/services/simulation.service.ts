import { simulationRepository } from '../repositories/simulation.repository';
import { questionRepository } from '../repositories/question.repository';
import { gamificationService } from './gamification.service';
import { XP_RULES } from '../utils/gamificationRules';
import { ApiError } from '../utils/ApiError';

function stripCorrectFlag(question: { alternatives: Array<{ correct: boolean } & Record<string, unknown>> } & Record<string, unknown>) {
  return {
    ...question,
    alternatives: question.alternatives.map(({ correct, ...rest }) => rest),
  };
}

export const simulationService = {
  list: (activeOnly: boolean) => simulationRepository.list(activeOnly),
  get: async (id: string) => {
    const sim = await simulationRepository.findById(id);
    if (!sim) throw ApiError.notFound('Simulado não encontrado.');
    return sim;
  },
  create: (data: { title: string; description?: string; questionCount: number; timeLimitMinutes: number; questionIds: string[] }) => {
    const { questionIds, ...rest } = data;
    if (questionIds.length !== data.questionCount) {
      throw ApiError.badRequest('A quantidade de questões selecionadas deve bater com "quantidade_questoes".', 'QUESTION_COUNT_MISMATCH');
    }
    return simulationRepository.create(rest, questionIds);
  },
  update: simulationRepository.update,
  delete: simulationRepository.delete,

  async start(simulationId: string) {
    const simulation = await simulationRepository.findById(simulationId);
    if (!simulation || !simulation.active) throw ApiError.notFound('Simulado não encontrado ou inativo.');

    const questions = await simulationRepository.getQuestionsForSimulation(simulationId);
    if (questions.length === 0) throw ApiError.badRequest('Este simulado não possui questões configuradas.', 'EMPTY_SIMULATION');

    return {
      simulation,
      questions: questions.map(stripCorrectFlag),
    };
  },

  async finish(
    userId: string,
    simulationId: string,
    answers: Array<{ questionId: string; alternativeId: string }>,
    timeSpentSeconds: number,
  ) {
    const simulation = await simulationRepository.findById(simulationId);
    if (!simulation) throw ApiError.notFound('Simulado não encontrado.');

    const questions = await simulationRepository.getQuestionsForSimulation(simulationId);
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    let correctCount = 0;
    let wrongCount = 0;
    const wrongQuestionIds: string[] = [];
    const subjectStats = new Map<string, { total: number; correct: number }>();

    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) continue; // ignora respostas para questões que não pertencem ao simulado

      const alternative = question.alternatives.find((a) => a.id === answer.alternativeId);
      const correct = Boolean(alternative?.correct);

      if (correct) correctCount++;
      else {
        wrongCount++;
        wrongQuestionIds.push(question.id);
      }

      const stat = subjectStats.get(question.subject) ?? { total: 0, correct: 0 };
      stat.total++;
      if (correct) stat.correct++;
      subjectStats.set(question.subject, stat);

      // Também registra como resposta individual, alimentando o histórico
      // geral de questões do aluno (estatísticas ficam consistentes em toda a plataforma).
      await questionRepository.recordAnswer({
        userId,
        questionId: question.id,
        alternativeId: answer.alternativeId,
        correct,
      });
    }

    const totalAnswered = correctCount + wrongCount;
    const percent = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 10000) / 100 : 0;

    const result = await simulationRepository.saveResult({
      userId,
      simulationId,
      correctCount,
      wrongCount,
      percent,
      timeSpentSeconds,
      answersJson: answers,
    });

    const previousCount = await simulationRepository.countResultsForUser(userId);
    await gamificationService.awardXp(userId, XP_RULES.SIMULATION_COMPLETED);
    await gamificationService.registerStudyActivity(userId);
    await gamificationService.checkSimulationAchievements(userId, previousCount === 1, percent);

    return {
      result,
      performanceBySubject: Array.from(subjectStats.entries()).map(([subject, s]) => ({
        subject,
        total: s.total,
        correct: s.correct,
        percent: Math.round((s.correct / s.total) * 100),
      })),
      wrongQuestionIds,
    };
  },

  async getUserResults(userId: string) {
    return simulationRepository.listResultsForUser(userId);
  },
};
