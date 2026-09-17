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
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Erro de validação' },
            code: { type: 'string', example: 'VALIDATION_ERROR' },
          },
        },
        MessageResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Operação realizada com sucesso.' },
          },
        },
        AuthTokenResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'user_123' },
                name: { type: 'string', example: 'Maria Silva' },
                email: { type: 'string', format: 'email', example: 'maria@exemplo.com' },
                role: { type: 'string', example: 'ALUNO' },
              },
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Maria Silva' },
            email: { type: 'string', format: 'email', example: 'maria@exemplo.com' },
            password: { type: 'string', format: 'password', example: 'Senha@123' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'maria@exemplo.com' },
            password: { type: 'string', format: 'password', example: 'Senha@123' },
          },
        },
        CreateCourseRequest: {
          type: 'object',
          required: ['title', 'description', 'phase'],
          properties: {
            title: { type: 'string', example: 'Direito Constitucional I' },
            description: { type: 'string', example: 'Curso estruturado para a fase objetiva do Exame da OAB.' },
            phase: { type: 'string', enum: ['OBJETIVA', 'MIXTA', 'PRATICA'], example: 'OBJETIVA' },
            isPublished: { type: 'boolean', example: true },
          },
        },
        CreateQuestionRequest: {
          type: 'object',
          required: ['statement', 'alternatives', 'correctIndex', 'subject'],
          properties: {
            statement: { type: 'string', example: 'Qual é a fonte do direito?' },
            subject: { type: 'string', example: 'Direito Constitucional' },
            alternatives: {
              type: 'array',
              minItems: 3,
              maxItems: 5,
              items: { type: 'string' },
              example: ['Lei', 'Costume', 'Jurisprudência', 'Doutrina'],
            },
            correctIndex: { type: 'integer', example: 0 },
          },
        },
        CreateSimulationRequest: {
          type: 'object',
          required: ['title', 'description', 'questionIds'],
          properties: {
            title: { type: 'string', example: 'Simulado de Constitucional' },
            description: { type: 'string', example: 'Simulado com 20 questões de nível médio.' },
            questionIds: {
              type: 'array',
              items: { type: 'string' },
              example: ['q_123', 'q_456', 'q_789'],
            },
          },
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Maria Silva' },
            photoUrl: { type: 'string', example: 'https://cdn.exemplo.com/foto.jpg' },
            goal: { type: 'string', example: 'Aprovar na OAB em 2026.' },
          },
        },
        CheckoutRequest: {
          type: 'object',
          required: ['plan'],
          properties: {
            plan: { type: 'string', enum: ['BASICO', 'VITALICIO'], example: 'BASICO' },
          },
        },
        HealthStatusResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            timestamp: { type: 'string', format: 'date-time', example: '2026-09-13T15:30:00.000Z' },
          },
        },
        CourseResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'course_123' },
            title: { type: 'string', example: 'Direito Constitucional I' },
            description: { type: 'string', example: 'Curso estruturado para a fase objetiva.' },
            phase: { type: 'string', example: 'OBJETIVA' },
            isPublished: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time', example: '2026-09-13T15:30:00.000Z' },
          },
        },
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
