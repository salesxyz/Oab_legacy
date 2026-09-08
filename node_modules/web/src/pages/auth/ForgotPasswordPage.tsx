import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../layouts/auth/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { CodeInput } from '../../components/ui/CodeInput';
import { authApi } from '../../services/authApi';
import { getErrorMessage } from '../../utils/errors';
import { ApiError } from '../../services/httpClient';
import { checkPassword, isPasswordValid, isValidEmail } from '../../utils/validation';
import styles from './AuthForm.module.css';

type Step = 'email' | 'code' | 'password' | 'success';

const CODE_VALID_SECONDS = 15 * 60; // espelha PASSWORD_RESET_CODE_EXPIRES_IN_MINUTES do backend
const RESEND_COOLDOWN_SECONDS = 60;

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | undefined>();
  const [codeExpiresIn, setCodeExpiresIn] = useState(CODE_VALID_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFieldError, setPasswordFieldError] = useState<string | undefined>();
  const [confirmError, setConfirmError] = useState<string | undefined>();

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef<number | null>(null);

  // Contadores da etapa de código: tempo de validade do código + cooldown do reenvio.
  useEffect(() => {
    if (step !== 'code') return;

    timerRef.current = window.setInterval(() => {
      setCodeExpiresIn((current) => Math.max(0, current - 1));
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [step]);

  async function handleSubmitEmail(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!isValidEmail(email)) {
      setEmailError('Informe um email válido.');
      return;
    }
    setEmailError(undefined);

    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      setCode('');
      setCodeExpiresIn(CODE_VALID_SECONDS);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setStep('code');
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setFormError(null);
    try {
      await authApi.forgotPassword(email);
      setCode('');
      setCodeExpiresIn(CODE_VALID_SECONDS);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  async function handleSubmitCode(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setCodeError(undefined);

    if (code.length !== 6) {
      setCodeError('Informe os 6 dígitos do código.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.verifyCode(email, code);
      setStep('password');
    } catch (error) {
      if (error instanceof ApiError && error.code === 'RESET_ATTEMPTS_EXCEEDED') {
        setFormError('Muitas tentativas com este código. Solicite um novo código para continuar.');
      } else {
        setCodeError('Código inválido ou expirado.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmitPassword(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setPasswordFieldError(undefined);
    setConfirmError(undefined);

    let hasError = false;
    if (!isPasswordValid(newPassword)) {
      setPasswordFieldError('A senha ainda não atende aos requisitos abaixo.');
      hasError = true;
    }
    if (confirmPassword !== newPassword) {
      setConfirmError('As senhas não coincidem.');
      hasError = true;
    }
    if (hasError) return;

    setIsSubmitting(true);
    try {
      await authApi.resetPassword(email, code, newPassword);
      setStep('success');
    } catch (error) {
      if (error instanceof ApiError && (error.code === 'INVALID_RESET_CODE' || error.code === 'RESET_ATTEMPTS_EXCEEDED')) {
        setFormError('O código expirou ou é inválido. Volte e solicite um novo código.');
      } else {
        setFormError(getErrorMessage(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const passwordCheck = checkPassword(newPassword);

  if (step === 'success') {
    return (
      <AuthLayout title="Senha alterada">
        <div className={styles.stepBody}>
          <div>
            <span className={styles.successIcon} aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M6 13.5l4.5 4.5L20 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p>Sua senha foi redefinida com sucesso. Você já pode entrar com a nova senha.</p>
          </div>
          <Button onClick={() => navigate('/entrar', { replace: true })} fullWidth>
            Ir para o login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  if (step === 'password') {
    return (
      <AuthLayout title="Crie uma nova senha" subtitle="Escolha uma senha forte que você ainda não tenha usado.">
        <form className={styles.form} onSubmit={handleSubmitPassword} noValidate>
          {formError && <Alert type="error">{formError}</Alert>}

          <Input
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={passwordFieldError}
          />

          <ul className={styles.passwordRules} role="list">
            <li className={`${styles.ruleItem} ${passwordCheck.minLength ? styles.ruleItemMet : ''}`}>Pelo menos 8 caracteres</li>
            <li className={`${styles.ruleItem} ${passwordCheck.hasUpper ? styles.ruleItemMet : ''}`}>Uma letra maiúscula</li>
            <li className={`${styles.ruleItem} ${passwordCheck.hasLower ? styles.ruleItemMet : ''}`}>Uma letra minúscula</li>
            <li className={`${styles.ruleItem} ${passwordCheck.hasNumber ? styles.ruleItemMet : ''}`}>Um número</li>
          </ul>

          <Input
            label="Confirmar nova senha"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={confirmError}
          />

          <Button type="submit" fullWidth loading={isSubmitting}>
            Salvar nova senha
          </Button>
        </form>
      </AuthLayout>
    );
  }

  if (step === 'code') {
    return (
      <AuthLayout title="Digite o código" subtitle={`Enviamos um código de 6 dígitos para ${email}.`}>
        <form className={styles.form} onSubmit={handleSubmitCode} noValidate>
          {formError && <Alert type="error">{formError}</Alert>}

          <CodeInput value={code} onChange={setCode} error={Boolean(codeError)} disabled={isSubmitting} />
          {codeError && (
            <p role="alert" style={{ color: 'var(--color-danger)', fontSize: 'var(--text-xs)' }}>
              {codeError}
            </p>
          )}

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            {codeExpiresIn > 0 ? `O código expira em ${formatTime(codeExpiresIn)}.` : 'O código expirou — solicite um novo.'}
          </p>

          <Button type="submit" fullWidth loading={isSubmitting} disabled={codeExpiresIn === 0}>
            Verificar código
          </Button>

          <div className={styles.resendRow}>
            <span>Não recebeu o código?</span>
            <button
              type="button"
              className={styles.resendButton}
              onClick={handleResend}
              disabled={resendCooldown > 0}
            >
              {resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : 'Reenviar código'}
            </button>
          </div>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Esqueci minha senha" subtitle="Informe seu email e enviaremos um código de verificação.">
      <Link to="/entrar" className={styles.backLink}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 3.5L5 8l5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Voltar para o login
      </Link>

      <form className={styles.form} onSubmit={handleSubmitEmail} noValidate>
        {formError && <Alert type="error">{formError}</Alert>}

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          placeholder="voce@email.com"
        />

        <Button type="submit" fullWidth loading={isSubmitting}>
          Enviar código
        </Button>
      </form>
    </AuthLayout>
  );
}
