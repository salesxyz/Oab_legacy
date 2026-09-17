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

/**
 * @openapi
 * /api/v1/courses:
 *   get:
 *     tags: [Courses]
 *     summary: Listar cursos
 *     responses:
 *       200:
 *         description: Lista de cursos retornada
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CourseResponse'
 *             examples:
 *               success:
 *                 value:
 *                   - id: course_123
 *                     title: Direito Constitucional I
 *                     description: Curso estruturado para a fase objetiva.
 *                     phase: OBJETIVA
 *                     isPublished: true
 *                     createdAt: '2026-09-13T15:30:00.000Z'
 */
// ---------- Cursos ----------
// Leitura é pública (com fallback: admins veem rascunhos também).
router.get('/courses', optionalAuthMiddleware, courseController.list);

/**
 * @openapi
 * /api/v1/courses/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: Buscar curso por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Curso encontrado
 */
router.get('/courses/:id', optionalAuthMiddleware, validate({ params: idParamSchema }), courseController.get);

/**
 * @openapi
 * /api/v1/courses:
 *   post:
 *     tags: [Courses]
 *     summary: Criar curso
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourseRequest'
 *           examples:
 *             default:
 *               value:
 *                 title: Direito Constitucional I
 *                 description: Curso estruturado para a fase objetiva do Exame da OAB.
 *                 phase: OBJETIVA
 *                 isPublished: true
 *     responses:
 *       201:
 *         description: Curso criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseResponse'
 *             examples:
 *               success:
 *                 value:
 *                   id: course_123
 *                   title: Direito Constitucional I
 *                   description: Curso estruturado para a fase objetiva.
 *                   phase: OBJETIVA
 *                   isPublished: true
 *                   createdAt: '2026-09-13T15:30:00.000Z'
 */
router.post('/courses', authMiddleware, requireContentManager, validate({ body: createCourseSchema }), courseController.create);
/**
 * @openapi
 * /api/v1/courses/{id}:
 *   patch:
 *     tags: [Courses]
 *     summary: Atualizar curso
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Curso atualizado
 */
router.patch(
  '/courses/:id',
  authMiddleware,
  requireContentManager,
  validate({ params: idParamSchema, body: updateCourseSchema }),
  courseController.update,
);

/**
 * @openapi
 * /api/v1/courses/{id}:
 *   delete:
 *     tags: [Courses]
 *     summary: Remover curso
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Curso removido
 */
router.delete('/courses/:id', authMiddleware, requireContentManager, validate({ params: idParamSchema }), courseController.remove);

// ---------- Módulos ----------
/**
 * @openapi
 * /api/v1/courses/{courseId}/modules:
 *   get:
 *     tags: [Courses]
 *     summary: Listar módulos de um curso
 *     responses:
 *       200:
 *         description: Módulos retornados
 */
router.get('/courses/:courseId/modules', optionalAuthMiddleware, moduleController.listByCourse);

/**
 * @openapi
 * /api/v1/modules/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: Buscar módulo por id
 *     responses:
 *       200:
 *         description: Módulo encontrado
 */
router.get('/modules/:id', optionalAuthMiddleware, validate({ params: idParamSchema }), moduleController.get);

/**
 * @openapi
 * /api/v1/modules:
 *   post:
 *     tags: [Courses]
 *     summary: Criar módulo
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Módulo criado
 */
router.post('/modules', authMiddleware, requireContentManager, validate({ body: createModuleSchema }), moduleController.create);
/**
 * @openapi
 * /api/v1/modules/{id}:
 *   patch:
 *     tags: [Courses]
 *     summary: Atualizar módulo
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Módulo atualizado
 */
router.patch(
  '/modules/:id',
  authMiddleware,
  requireContentManager,
  validate({ params: idParamSchema, body: updateModuleSchema }),
  moduleController.update,
);

/**
 * @openapi
 * /api/v1/modules/{id}:
 *   delete:
 *     tags: [Courses]
 *     summary: Remover módulo
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Módulo removido
 */
router.delete('/modules/:id', authMiddleware, requireContentManager, validate({ params: idParamSchema }), moduleController.remove);

/**
 * @openapi
 * /api/v1/modules/reorder:
 *   post:
 *     tags: [Courses]
 *     summary: Reordenar módulos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ordem dos módulos atualizada
 */
router.post(
  '/modules/reorder',
  authMiddleware,
  requireContentManager,
  validate({ body: reorderModulesSchema }),
  moduleController.reorder,
);

// ---------- Conteúdos ----------
/**
 * @openapi
 * /api/v1/modules/{moduleId}/contents:
 *   get:
 *     tags: [Courses]
 *     summary: Listar conteúdos de um módulo
 *     responses:
 *       200:
 *         description: Conteúdos retornados
 */
router.get('/modules/:moduleId/contents', optionalAuthMiddleware, contentController.listByModule);

/**
 * @openapi
 * /api/v1/contents/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: Buscar conteúdo por id
 *     responses:
 *       200:
 *         description: Conteúdo encontrado
 */
router.get('/contents/:id', optionalAuthMiddleware, validate({ params: idParamSchema }), contentController.get);

/**
 * @openapi
 * /api/v1/contents:
 *   post:
 *     tags: [Courses]
 *     summary: Criar conteúdo
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Conteúdo criado
 */
router.post('/contents', authMiddleware, requireContentManager, validate({ body: createContentSchema }), contentController.create);

/**
 * @openapi
 * /api/v1/contents/upload-video:
 *   post:
 *     tags: [Courses]
 *     summary: Upload de vídeo para conteúdo
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upload realizado
 */
router.post('/contents/upload-video', authMiddleware, requireContentManager, uploadVideoFile, contentController.uploadVideo);
/**
 * @openapi
 * /api/v1/contents/{id}:
 *   patch:
 *     tags: [Courses]
 *     summary: Atualizar conteúdo
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conteúdo atualizado
 */
router.patch(
  '/contents/:id',
  authMiddleware,
  requireContentManager,
  validate({ params: idParamSchema, body: updateContentSchema }),
  contentController.update,
);

/**
 * @openapi
 * /api/v1/contents/{id}:
 *   delete:
 *     tags: [Courses]
 *     summary: Remover conteúdo
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Conteúdo removido
 */
router.delete('/contents/:id', authMiddleware, requireContentManager, validate({ params: idParamSchema }), contentController.remove);

// Progresso é sempre gravado pelo backend a partir do usuário autenticado —
// nunca confia em um userId enviado pelo cliente.
/**
 * @openapi
 * /api/v1/contents/{id}/progress:
 *   post:
 *     tags: [Courses]
 *     summary: Registrar progresso de conteúdo
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progresso atualizado
 */
router.post(
  '/contents/:id/progress',
  authMiddleware,
  requireActiveSubscription,
  validate({ params: idParamSchema, body: progressSchema }),
  contentController.markProgress,
);

export default router;
