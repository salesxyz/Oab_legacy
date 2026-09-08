import { useId, type InputHTMLAttributes } from 'react';
import styles from './Checkbox.module.css';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> {
  label: string;
  id?: string;
}

export function Checkbox({ label, id, ...rest }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label htmlFor={inputId} className={styles.wrap}>
      <input id={inputId} type="checkbox" className={styles.input} {...rest} />
      <span className={styles.box} aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={styles.check}>
          <path
            d="M2 6l2.5 2.5L10 3"
            stroke="var(--color-text-on-primary)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className={styles.label}>{label}</span>
    </label>
  );
}
