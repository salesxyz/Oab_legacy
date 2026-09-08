import { useId, useState, type InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  error?: string;
  helperText?: string;
  id?: string;
}

export function Input({ label, error, helperText, type = 'text', id, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (visible ? 'text' : 'password') : type;

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div className={styles.inputWrap}>
        <input
          id={inputId}
          type={resolvedType}
          className={[styles.input, error ? styles.inputError : '', isPassword ? styles.hasToggle : '']
            .filter(Boolean)
            .join(' ')}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={visible}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className={styles.errorMessage} role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className={styles.helperText}>
          {helperText}
        </p>
      )}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M1.5 10s3-6 8.5-6 8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M2.5 2.5l15 15M8.3 8.4a2.5 2.5 0 003.3 3.3M6 5.1C3 6.4 1.5 10 1.5 10s3 6 8.5 6c1.4 0 2.7-.4 3.8-1M15.4 14c1.7-1.3 2.6-3 2.6-4s-3-6-8.5-6c-.5 0-1 0-1.5.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
