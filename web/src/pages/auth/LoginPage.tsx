import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../layouts/auth/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../utils/errors';
import { useToast } from '../../contexts/ToastContext';
import { isValidEmail } from '../../utils/validation';
import styles from './AuthForm.module.css';

interface LocationState {
  from?: string;
}

export function LoginPage() {
  const { login, sessionJustExpired, clearSessionExpiredFlag } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleLoginUrl = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3333'}/auth/google`;

  useEffect(() => {
    if (sessionJustExpired) {
      showToast('Sua sessão expirou. Faça login novamente.', 'info');
      clearSessionExpiredFlag();
    }
  }, [sessionJustExpired, clearSessionExpiredFlag, showToast]);

  function validate(): boolean {
    const errors: typeof fieldErrors = {};
    if (!isValidEmail(email)) errors.email = 'Informe um email válido.';
    if (!password) errors.password = 'Informe sua senha.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const loggedUser = await login(email, password, remember);
      const state = location.state as LocationState | null;
      const defaultPath = loggedUser.role === 'ADMIN' ? '/admin' : loggedUser.role === 'MENTOR' ? '/professor' : '/app';
      navigate(state?.from ?? defaultPath, { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error, 'Não foi possível entrar. Tente novamente.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Entrar" subtitle="Continue de onde você parou na sua preparação.">
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError && <Alert type="error">{formError}</Alert>}

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          placeholder="voce@email.com"
        />

        <Input
          label="Senha"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          placeholder="Sua senha"
        />

        <div className={styles.optionsRow}>
          <Checkbox label="Lembrar acesso" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <Link to="/recuperar-senha" className={styles.inlineLink}>
            Esqueci minha senha
          </Link>
        </div>

        <Button type="submit" fullWidth loading={isSubmitting}>
          Entrar
        </Button>

        <div className={styles.oauthDivider}><span>ou</span></div>
        <a href={googleLoginUrl} className={styles.googleButton}>
          <GoogleIcon />
          Continuar com Google
        </a>
      </form>

      <p className={styles.footer}>
        Ainda não tem conta?{' '}
        <Link to="/cadastro" className={styles.inlineLink}>
          Criar conta
        </Link>
      </p>
    </AuthLayout>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M21.35 12.27c0-.71-.06-1.4-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.15c1.84-1.7 2.9-4.21 2.9-7.22Z" />
      <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.15-2.45c-.87.58-1.98.92-3.3.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.75 9.75 0 0 0 12 21.75Z" />
      <path fill="#FBBC05" d="M6.53 13.83a5.86 5.86 0 0 1 0-3.66V7.64H3.28a9.75 9.75 0 0 0 0 8.72l3.25-2.53Z" />
      <path fill="#EA4335" d="M12 6.14c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.22 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.72 5.39l3.25 2.53C7.3 7.86 9.46 6.14 12 6.14Z" />
    </svg>
  );
}
