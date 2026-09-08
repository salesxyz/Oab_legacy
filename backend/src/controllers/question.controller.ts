import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { paramId } from '../utils/params';
import { questionService } from '../services/question.service';
import { ApiError } from '../utils/ApiError';

export const questionController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as any;
    const filters = {
      subject: query.subject,
      difficulty: query.difficulty,
      examBoard: query.examBoard,
      year: query.year,
      moduleId: query.moduleId,
      onlyUnanswered: query.onlyUnanswered && req.user ? req.user.id : undefined,
      onlyWrong: query.onlyWrong && req.user ? req.user.id : undefined,
      page: query.page,
      pageSize: query.pageSize,
    };
    const result = await questionService.list(filters);
    res.json(result);
  }),

  subjects: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await questionService.getSubjects());
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const question = await questionService.getForAnswering(paramId(req, 'id'));
    res.json(question);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const question = await questionService.create(req.body);
    res.status(201).json(question);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const question = await questionService.update(paramId(req, 'id'), req.body);
    res.json(question);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await questionService.delete(paramId(req, 'id'));
    res.status(204).send();
  }),

  answer: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await questionService.answer(req.user.id, paramId(req, 'id'), req.body.alternativeId, req.body.responseTimeMs);
    res.json(result);
  }),

  history: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    res.json(await questionService.getUserHistory(req.user.id));
  }),

  performance: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    res.json(await questionService.getPerformanceBySubject(req.user.id));
  }),
};
