"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const pg_1 = require("pg");
module.exports = async () => {
    dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env.test') });
    const client = new pg_1.Client({ connectionString: process.env.DATABASE_URL });
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
//# sourceMappingURL=globalSetup.js.map