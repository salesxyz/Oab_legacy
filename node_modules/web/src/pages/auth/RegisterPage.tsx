import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../layouts/auth/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../utils/errors';
import { useToast } from '../../contexts/ToastContext';
import { checkPassword, isPasswordValid, isValidEmail } from '../../utils/validation';
import styles from './AuthForm.module.css';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordCheck = checkPassword(password);

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (name.trim().length < 2) errors.name = 'Informe seu nome completo.';
    if (!isValidEmail(email)) errors.email = 'Informe um email válido.';
    if (!isPasswordValid(password)) errors.password = 'A senha ainda não atende aos requisitos abaixo.';
    if (confirmPassword !== password) errors.confirmPassword = 'As senhas não coincidem.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register(name.trim(), email, password);
      showToast('Conta criada com sucesso! Bem-vindo(a).', 'success');
      navigate('/app', { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error, 'Não foi possível criar sua conta. Tente novamente.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Criar conta" subtitle="Comece sua preparação para a aprovação na OAB.">
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError && <Alert type="error">{formError}</Alert>}

        <Input
          label="Nome completo"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
          placeholder="Seu nome"
        />

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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          placeholder="Crie uma senha"
        />

        <ul className={styles.passwordRules} role="list">
          <PasswordRule met={passwordCheck.minLength} label="Pelo menos 8 caracteres" />
          <PasswordRule met={passwordCheck.hasUpper} label="Uma letra maiúscula" />
          <PasswordRule met={passwordCheck.hasLower} label="Uma letra minúscula" />
          <PasswordRule met={passwordCheck.hasNumber} label="Um número" />
        </ul>

        <Input
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
          placeholder="Repita a senha"
        />

        <label className={styles.legalConsent}>
          <input type="checkbox" checked={acceptedLegal} onChange={(event) => setAcceptedLegal(event.target.checked)} />
          <span>
            Li e concordo com os <Link to="/termos" className={styles.inlineLink}>Termos de Uso</Link> e a{' '}
            <Link to="/privacidade" className={styles.inlineLink}>Política de Privacidade</Link>.
          </span>
        </label>

        <Button type="submit" fullWidth loading={isSubmitting} disabled={!acceptedLegal}>
          Criar conta grátis
        </Button>
      </form>

      <p className={styles.footer}>
        Já tem conta?{' '}
        <Link to="/entrar" className={styles.inlineLink}>
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}

function PasswordRule({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={`${styles.ruleItem} ${met ? styles.ruleItemMet : ''}`}>
      {met ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2.5 7l3 3 6-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="3" fill="currentColor" opacity="0.4" />
        </svg>
      )}
      <span>
        {label}
        <span className="visually-hidden">{met ? ' — requisito atendido' : ' — requisito pendente'}</span>
      </span>
    </li>
  );
}
