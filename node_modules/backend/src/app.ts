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

// ---------- Health check ----------
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString(), env: env.NODE_ENV });
});

// ---------- Documentação ----------
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
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
api.use(profileRoutes);

app.use('/api/v1', api);
// Alias sem versionamento, para compatibilidade com a documentação do escopo original.
app.use('/', api);

// ---------- 404 e tratamento centralizado de erros ----------
app.use(notFoundHandler);
app.use(errorHandler);
