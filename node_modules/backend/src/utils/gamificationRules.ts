/**
 * Regras de XP e níveis. Centralizadas aqui para que o administrador
 * possa, futuramente, expor essa configuração via painel sem espalhar
 * "números mágicos" pelo código.
 */
export const XP_RULES = {
  CONTENT_COMPLETED: 20,
  QUESTION_ANSWERED: 5,
  QUESTION_CORRECT_BONUS: 10,
  SIMULATION_COMPLETED: 50,
  DAILY_STREAK_BONUS: 15,
} as const;

// Nível N exige LEVEL_THRESHOLDS[N-1] XP acumulado.
export const LEVEL_THRESHOLDS = [0, 100, 300, 700, 1500, 3000];

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Iniciante',
  2: 'Estudante',
  3: 'Concurseiro',
  4: 'Especialista',
  5: 'Preparado para a OAB',
};

export function calculateLevel(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    }
  }
  return Math.min(level, LEVEL_NAMES[Object.keys(LEVEL_NAMES).length] ? Object.keys(LEVEL_NAMES).length : level);
}

export function xpForNextLevel(xp: number): { current: number; next: number | null; level: number } {
  const level = calculateLevel(xp);
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? null;
  return { current: xp, next: nextThreshold, level };
}

export function isNewDay(lastDate: Date | null, now: Date = new Date()): boolean {
  if (!lastDate) return true;
  return lastDate.toDateString() !== now.toDateString();
}

export function isConsecutiveDay(lastDate: Date | null, now: Date = new Date()): boolean {
  if (!lastDate) return false;
  const diffMs = now.setHours(0, 0, 0, 0) - new Date(lastDate).setHours(0, 0, 0, 0);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays === 1;
}
