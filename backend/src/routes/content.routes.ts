import { Router } from 'express';
import { courseController, moduleController, contentController } from '../controllers/content.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.middleware';
import { requireContentManager } from '../middlewares/rbac.middleware';
import { uploadVideoFile } from '../middlewares/videoUpload.middleware';
import { validate } from '../middlewares/validate.middleware';
import { requireActiveSubscription } from '../middlewares/subscription.middleware';
import {
  createContentSchema,
  createCourseSchema,
  createModuleSchema,
  idParamSchema,
  progressSchema,
  reorderModulesSchema,
  updateContentSchema,
  updateCourseSchema,
  updateModuleSchema,
} from '../schemas/content.schema';

const router = Router();

// ---------- Cursos ----------
// Leitura é pública (com fallback: admins veem rascunhos também).
router.get('/courses', optionalAuthMiddleware, courseController.list);
router.get('/courses/:id', optionalAuthMiddleware, validate({ params: idParamSchema }), courseController.get);
router.post('/courses', authMiddleware, requireContentManager, validate({ body: createCourseSchema }), courseController.create);
router.patch(
  '/courses/:id',
  authMiddleware,
  requireContentManager,
  validate({ params: idParamSchema, body: updateCourseSchema }),
  courseController.update,
);
router.delete('/courses/:id', authMiddleware, requireContentManager, validate({ params: idParamSchema }), courseController.remove);

// ---------- Módulos ----------
router.get('/courses/:courseId/modules', optionalAuthMiddleware, moduleController.listByCourse);
router.get('/modules/:id', optionalAuthMiddleware, validate({ params: idParamSchema }), moduleController.get);
router.post('/modules', authMiddleware, requireContentManager, validate({ body: createModuleSchema }), moduleController.create);
router.patch(
  '/modules/:id',
  authMiddleware,
  requireContentManager,
  validate({ params: idParamSchema, body: updateModuleSchema }),
  moduleController.update,
);
router.delete('/modules/:id', authMiddleware, requireContentManager, validate({ params: idParamSchema }), moduleController.remove);
router.post(
  '/modules/reorder',
  authMiddleware,
  requireContentManager,
  validate({ body: reorderModulesSchema }),
  moduleController.reorder,
);

// ---------- Conteúdos ----------
router.get('/modules/:moduleId/contents', optionalAuthMiddleware, contentController.listByModule);
router.get('/contents/:id', optionalAuthMiddleware, validate({ params: idParamSchema }), contentController.get);
router.post('/contents', authMiddleware, requireContentManager, validate({ body: createContentSchema }), contentController.create);
router.post('/contents/upload-video', authMiddleware, requireContentManager, uploadVideoFile, contentController.uploadVideo);
router.patch(
  '/contents/:id',
  authMiddleware,
  requireContentManager,
  validate({ params: idParamSchema, body: updateContentSchema }),
  contentController.update,
);
router.delete('/contents/:id', authMiddleware, requireContentManager, validate({ params: idParamSchema }), contentController.remove);

// Progresso é sempre gravado pelo backend a partir do usuário autenticado —
// nunca confia em um userId enviado pelo cliente.
router.post(
  '/contents/:id/progress',
  authMiddleware,
  requireActiveSubscription,
  validate({ params: idParamSchema, body: progressSchema }),
  contentController.markProgress,
);

export default router;
