import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { paramId } from '../utils/params';
import { simulationService } from '../services/simulation.service';
import { ApiError } from '../utils/ApiError';

function isAdmin(req: Request) {
  return req.user?.role === 'ADMIN';
}

export const simulationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    res.json(await simulationService.list(!isAdmin(req)));
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    res.json(await simulationService.get(paramId(req, 'id')));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const sim = await simulationService.create(req.body);
    res.status(201).json(sim);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    res.json(await simulationService.update(paramId(req, 'id'), req.body));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await simulationService.delete(paramId(req, 'id'));
    res.status(204).send();
  }),

  start: asyncHandler(async (req: Request, res: Response) => {
    res.json(await simulationService.start(paramId(req, 'id')));
  }),

  finish: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await simulationService.finish(req.user.id, paramId(req, 'id'), req.body.answers, req.body.timeSpentSeconds);
    res.json(result);
  }),

  myResults: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    res.json(await simulationService.getUserResults(req.user.id));
  }),
};
