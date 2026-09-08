export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export interface PasswordCheck {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
}

/** Mesmas regras do backend (src/schemas/auth.schema.ts): 8+ caracteres,
 * ao menos uma maiúscula, uma minúscula e um número. */
export function checkPassword(password: string): PasswordCheck {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  const check = checkPassword(password);
  return check.minLength && check.hasUpper && check.hasLower && check.hasNumber;
}
