import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../config/env';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OAB Mentoria — API',
      version: '1.0.0',
      description:
        'API da plataforma OAB Mentoria: autenticação, conteúdos, questões, simulados, gamificação e painel administrativo.',
    },
    servers: [{ url: env.APP_URL }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Cadastro, login, recuperação de senha' },
      { name: 'Courses', description: 'Cursos, módulos e conteúdos' },
      { name: 'Questions', description: 'Banco de questões' },
      { name: 'Simulations', description: 'Simulados' },
      { name: 'Profile', description: 'Perfil, progresso, conquistas, ranking' },
      { name: 'Tips', description: 'Dicas de estudo' },
      { name: 'Admin', description: 'Endpoints administrativos' },
      { name: 'Health', description: 'Status da API' },
    ],
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js'],
});
