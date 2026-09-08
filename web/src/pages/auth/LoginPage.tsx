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
