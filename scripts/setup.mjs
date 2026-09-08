#!/usr/bin/env node
/**
 * Setup único do projeto OAB Mentoria.
 *
 * Uso: npm run setup   (a partir da raiz do monorepo)
 *
 * O que este script faz:
 *   1. Verifica se Node.js, npm e as ferramentas de linha de comando do
 *      PostgreSQL estão disponíveis.
 *   2. Cria backend/.env e web/.env a partir dos respectivos .env.example,
 *      caso ainda não existam (nunca sobrescreve um .env já configurado).
 *   3. Tenta criar os bancos de dados de desenvolvimento e teste (ignora
 *      silenciosamente se já existirem).
 *   4. Roda as migrations do banco.
 *   5. Popula o banco com dados de desenvolvimento (usuário de teste, admin,
 *      curso de exemplo, questões, simulado, dicas, conquistas).
 *
 * Não instala dependências — isso já é feito por `npm install` na raiz
 * (graças aos npm workspaces, que também instalam backend/ e web/).
 */

import { existsSync, copyFileSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const backendDir = path.join(rootDir, 'backend');
const webDir = path.join(rootDir, 'web');

const color = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function step(message) {
  console.log(`\n${color.cyan}${color.bold}➜ ${message}${color.reset}`);
}

function ok(message) {
  console.log(`  ${color.green}✓${color.reset} ${message}`);
}

function warn(message) {
  console.log(`  ${color.yellow}!${color.reset} ${message}`);
}

function fail(message) {
  console.log(`  ${color.red}✗${color.reset} ${message}`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'pipe', encoding: 'utf-8', ...options });
  return result;
}

function commandExists(command) {
  const result = run(process.platform === 'win32' ? 'where' : 'which', [command]);
  return result.status === 0;
}

// ---------- 1. Pré-requisitos ----------
step('Verificando pré-requisitos');

const nodeVersion = process.versions.node;
const nodeMajor = Number(nodeVersion.split('.')[0]);
if (nodeMajor < 20) {
  fail(`Node.js ${nodeVersion} encontrado — este projeto exige Node.js 20 ou superior.`);
  process.exit(1);
}
ok(`Node.js ${nodeVersion}`);

if (!commandExists('npm')) {
  fail('npm não encontrado no PATH.');
  process.exit(1);
}
ok('npm disponível');

const hasCreatedb = commandExists('createdb');
const hasPsql = commandExists('psql');
if (!hasCreatedb || !hasPsql) {
  warn('Ferramentas de linha de comando do PostgreSQL (createdb/psql) não encontradas no PATH.');
  warn('Isso é normal se o seu PostgreSQL roda em outra máquina, container ou serviço gerenciado.');
  warn('Nesse caso, crie os bancos manualmente e ajuste DATABASE_URL nos arquivos .env.');
} else {
  ok('Ferramentas de linha de comando do PostgreSQL disponíveis');
}

// ---------- 2. Arquivos .env ----------
step('Configurando variáveis de ambiente');

function ensureEnvFile(dir, label) {
  const envPath = path.join(dir, '.env');
  const examplePath = path.join(dir, '.env.example');

  if (existsSync(envPath)) {
    ok(`${label}/.env já existe — mantido sem alterações`);
    return;
  }

  if (!existsSync(examplePath)) {
    warn(`${label}/.env.example não encontrado — pulei a criação do .env`);
    return;
  }

  copyFileSync(examplePath, envPath);
  ok(`${label}/.env criado a partir de ${label}/.env.example`);
}

ensureEnvFile(backendDir, 'backend');
ensureEnvFile(webDir, 'web');

warn('Revise backend/.env antes de ir para produção — especialmente JWT_SECRET, REFRESH_TOKEN_SECRET e DATABASE_URL.');

// ---------- 3. Bancos de dados ----------
function parseDatabaseName(databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    return url.pathname.replace(/^\//, '').split('?')[0];
  } catch {
    return null;
  }
}

function readEnvVar(envPath, key) {
  if (!existsSync(envPath)) return null;
  const content = readFileSync(envPath, 'utf-8');
  const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : null;
}

if (hasCreatedb) {
  step('Criando bancos de dados (ignorado se já existirem)');

  const backendEnvPath = path.join(backendDir, '.env');
  const dbUrl = readEnvVar(backendEnvPath, 'DATABASE_URL');
  const dbName = dbUrl ? parseDatabaseName(dbUrl) : 'oab_mentoria';
  const testDbName = `${dbName}_test`;

  for (const name of [dbName, testDbName]) {
    if (!name) continue;
    const result = run('createdb', [name]);
    if (result.status === 0) {
      ok(`Banco "${name}" criado`);
    } else if (result.stderr?.includes('already exists')) {
      ok(`Banco "${name}" já existia`);
    } else {
      warn(`Não foi possível criar o banco "${name}" automaticamente (${result.stderr?.trim() || 'erro desconhecido'})`);
      warn('Se o seu PostgreSQL exige usuário/senha, crie o banco manualmente e rode novamente.');
    }
  }
} else {
  warn('Pulei a criação automática dos bancos — crie manualmente antes de continuar, se necessário.');
}

// ---------- 4. Migrations ----------
step('Aplicando migrations do banco');
const migrate = run('npm', ['run', 'db:migrate', '--workspace=backend'], { stdio: 'inherit' });
if (migrate.status !== 0) {
  fail('Falha ao aplicar as migrations. Verifique DATABASE_URL em backend/.env e se o PostgreSQL está acessível.');
  process.exit(1);
}
ok('Migrations aplicadas');

// ---------- 5. Seed ----------
step('Populando o banco com dados de desenvolvimento');
const seed = run('npm', ['run', 'db:seed', '--workspace=backend'], { stdio: 'inherit' });
if (seed.status !== 0) {
  warn('O seed falhou — isso pode ser esperado se o banco já tinha sido populado antes. Verifique a saída acima.');
} else {
  ok('Seed concluído');
}

// ---------- Concluído ----------
console.log(`\n${color.green}${color.bold}Tudo pronto!${color.reset}`);
console.log(`\nPróximo passo:\n  ${color.bold}npm run dev${color.reset}\n`);
console.log('Isso sobe backend (http://localhost:3333) e frontend (http://localhost:5173) juntos.');
console.log('\nLogin de teste após o seed:');
console.log('  Aluno: teste@exemplo.com / SenhaTeste123!');
console.log('  Admin: admin@exemplo.com / AdminTeste123!\n');
