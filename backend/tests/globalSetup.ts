import dotenv from 'dotenv';
import path from 'path';
import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

module.exports = async () => {
  dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

  const migrationClient = new Client({ connectionString: process.env.DATABASE_URL });
  await migrationClient.connect();
  await migrate(drizzle(migrationClient), {
    migrationsFolder: path.resolve(__dirname, '../drizzle'),
  });
  await migrationClient.end();

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  // Limpa todas as tabelas de domínio antes da suíte, garantindo testes
  // determinísticos e independentes de execuções anteriores.
  await client.query(`
    TRUNCATE users, profiles, gamification, refresh_tokens, password_resets,
             courses, modules, contents, questions, alternatives, user_answers,
             progress, tips, simulations, simulation_questions, simulation_results,
             achievements, user_achievements
    RESTART IDENTITY CASCADE;
  `);

  await client.end();
};
