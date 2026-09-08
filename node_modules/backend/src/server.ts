import { app } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { pool } from './db/client';

async function start() {
  try {
    await pool.query('SELECT 1');
    logger.info('✅ Conexão com o banco de dados verificada com sucesso.');
  } catch (err) {
    logger.error('❌ Não foi possível conectar ao banco de dados. Verifique DATABASE_URL.', err);
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 OAB Mentoria API rodando em ${env.APP_URL} (ambiente: ${env.NODE_ENV})`);
    logger.info(`📚 Documentação disponível em ${env.APP_URL}/docs`);
  });

  const shutdown = (signal: string) => {
    logger.info(`Recebido ${signal}. Encerrando servidor com segurança...`);
    server.close(async () => {
      await pool.end();
      logger.info('Servidor encerrado.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
