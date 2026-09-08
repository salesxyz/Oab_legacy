import { useRef } from 'react';
import styles from './CodeInput.module.css';

interface CodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
}

export function CodeInput({ length = 6, value, onChange, error, disabled }: CodeInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  function setDigit(index: number, digit: string) {
    const next = [...digits];
    next[index] = digit;
    onChange(next.join(''));
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1);
    setDigit(index, digit);
    if (digit && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowRight' && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted.padEnd(length, ''));
    const nextIndex = Math.min(pasted.length, length - 1);
    refs.current[nextIndex]?.focus();
  }

  return (
    <div className={styles.wrap} role="group" aria-label={`Código de verificação de ${length} dígitos`}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          className={[styles.digit, error ? styles.digitError : ''].filter(Boolean).join(' ')}
          value={digit}
          disabled={disabled}
          aria-label={`Dígito ${index + 1} de ${length}`}
          aria-invalid={error}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
