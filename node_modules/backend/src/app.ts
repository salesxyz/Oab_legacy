import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { generalRateLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { swaggerSpec } from './docs/swagger';

import authRoutes from './routes/auth.routes';
import contentRoutes from './routes/content.routes';
import questionRoutes from './routes/question.routes';
import simulationRoutes from './routes/simulation.routes';
import tipRoutes from './routes/tip.routes';
import profileRoutes from './routes/profile.routes';
import adminRoutes from './routes/admin.routes';
import mentorRoutes from './routes/mentor.routes';
import paymentRoutes from './routes/payment.routes';
import { videoStoragePath } from './middlewares/videoUpload.middleware';

export const app = express();

// ---------- Segurança e infraestrutura básica ----------
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(generalRateLimiter);
app.use(['/api/v1/payments/webhook/stripe', '/payments/webhook/stripe'], express.raw({ type: 'application/json' }));

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Verificar status da API
 *     responses:
 *       200:
 *         description: API funcionando normalmente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatusResponse'
 *             examples:
 *               success:
 *                 value:
 *                   status: ok
 *                   timestamp: '2026-09-13T15:30:00.000Z'
 */
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------- Documentação ----------
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'OAB Mentoria API',
    customCss: `
      body {
        background: #10161d;
        color: #e5e7eb;
      }
      .swagger-ui .topbar {
        background: #0b1118;
        border-bottom: 1px solid rgba(148, 163, 184, 0.25);
      }
      .swagger-ui .topbar .download-url-wrapper {
        display: none;
      }
      .swagger-ui .topbar .topbar-wrapper a {
        color: #7dd3fc;
        font-weight: 600;
      }
      .swagger-ui .info {
        margin: 24px 0 20px;
      }
      .swagger-ui .info .title {
        color: #f8fafc;
        font-size: 2rem;
      }
      .swagger-ui .scheme-container {
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 12px;
        box-shadow: none;
      }
      .swagger-ui .opblock.opblock-get {
        border-color: #22c55e;
      }
      .swagger-ui .opblock.opblock-post {
        border-color: #3b82f6;
      }
      .swagger-ui .opblock.opblock-patch {
        border-color: #f59e0b;
      }
      .swagger-ui .opblock.opblock-delete {
        border-color: #ef4444;
      }
      .swagger-ui .opblock-summary-path {
        color: #e2e8f0;
      }
      .swagger-ui .btn.execute {
        background: #10b981;
        border-color: #10b981;
      }
      .swagger-ui select,
      .swagger-ui input,
      .swagger-ui textarea {
        background: #0f172a;
        color: #e2e8f0;
        border: 1px solid rgba(148, 163, 184, 0.35);
      }
      .swagger-ui .model-box,
      .swagger-ui section.models {
        background: rgba(15, 23, 42, 0.55);
      }
      .swagger-ui .responses-table td,
      .swagger-ui .responses-table th,
      .swagger-ui table thead tr th {
        color: #e2e8f0;
        background: #0b1220;
      }
      .swagger-ui .parameter__name,
      .swagger-ui .response-col_status,
      .swagger-ui .opblock-tag {
        color: #f8fafc;
      }
      .swagger-ui .markdown p,
      .swagger-ui .markdown li,
      .swagger-ui .renderedMarkdown p,
      .swagger-ui .renderedMarkdown li {
        color: #dbeafe;
      }
      .swagger-ui a {
        color: #7dd3fc;
      }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      operationsSorter: 'alpha',
      tagsSorter: 'alpha',
    },
  }),
);
app.use('/media/videos', express.static(videoStoragePath, { fallthrough: false, maxAge: '1d' }));

// ---------- Rotas da API ----------
const api = express.Router();
api.use('/auth', authRoutes);
api.use(contentRoutes);
api.use(questionRoutes);
api.use(simulationRoutes);
api.use(tipRoutes);
api.use('/admin', adminRoutes);
api.use(mentorRoutes);
api.use(paymentRoutes);
api.use(profileRoutes);

app.use('/api/v1', api);
// Alias sem versionamento, para compatibilidade com a documentação do escopo original.
app.use('/', api);

// ---------- 404 e tratamento centralizado de erros ----------
app.use(notFoundHandler);
app.use(errorHandler);
