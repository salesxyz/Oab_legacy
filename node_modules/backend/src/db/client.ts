import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '../config/env';
import * as schema from './schema';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  // Pool sizing adequado para produção; ajuste conforme a carga real.
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('Erro inesperado no pool do PostgreSQL', err);
});

export const db = drizzle(pool, { schema });
export type Database = typeof db;
