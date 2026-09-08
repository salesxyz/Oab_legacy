import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { paramId } from '../utils/params';
import { contentService } from '../services/content.service';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

function canManageContent(req: Request) {
  return req.user?.role === 'ADMIN' || req.user?.role === 'MENTOR';
}

export const courseController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const courses = await contentService.listCourses(canManageContent(req));
    res.json(courses);
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const course = await contentService.getCourse(paramId(req, 'id'), canManageContent(req));
    res.json(course);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const course = await contentService.createCourse(req.body);
    res.status(201).json(course);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const course = await contentService.updateCourse(paramId(req, 'id'), req.body);
    res.json(course);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await contentService.deleteCourse(paramId(req, 'id'));
    res.status(204).send();
  }),
};

export const moduleController = {
  listByCourse: asyncHandler(async (req: Request, res: Response) => {
    const modules = await contentService.listModulesWithProgress(paramId(req, 'courseId'), req.user?.id, canManageContent(req));
    res.json(modules);
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const module = await contentService.getModule(paramId(req, 'id'));
    res.json(module);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const module = await contentService.createModule(req.body);
    res.status(201).json(module);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const module = await contentService.updateModule(paramId(req, 'id'), req.body);
    res.json(module);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await contentService.deleteModule(paramId(req, 'id'));
    res.status(204).send();
  }),

  reorder: asyncHandler(async (req: Request, res: Response) => {
    await contentService.reorderModules(req.body.items);
    res.status(200).json({ message: 'Módulos reordenados com sucesso.' });
  }),
};

export const contentController = {
  listByModule: asyncHandler(async (req: Request, res: Response) => {
    const contents = await contentService.listContents(paramId(req, 'moduleId'), canManageContent(req));
    res.json(contents);
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const content = await contentService.getContent(paramId(req, 'id'), canManageContent(req));
    res.json(content);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const content = await contentService.createContent(req.body);
    res.status(201).json(content);
  }),

  uploadVideo: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw ApiError.badRequest('Envie um arquivo de vídeo.');
    if (!req.body.moduleId || !req.body.title) throw ApiError.badRequest('Módulo e título são obrigatórios.');

    const content = await contentService.createContent({
      moduleId: req.body.moduleId,
      title: req.body.title,
      description: req.body.description || undefined,
      type: 'VIDEO',
      videoUrl: `${env.APP_URL}/media/videos/${req.file.filename}`,
      status: req.body.status || 'RASCUNHO',
    });
    res.status(201).json(content);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const content = await contentService.updateContent(paramId(req, 'id'), req.body);
    res.json(content);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await contentService.deleteContent(paramId(req, 'id'));
    res.status(204).send();
  }),

  markProgress: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await contentService.markContentProgress(req.user.id, paramId(req, 'id'), req.body.percent);
    res.json(result);
  }),
};
