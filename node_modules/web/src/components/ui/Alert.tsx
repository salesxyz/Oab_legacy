import type { ReactNode } from 'react';
import styles from './Alert.module.css';

interface AlertProps {
  type?: 'error' | 'success' | 'info';
  children: ReactNode;
}

export function Alert({ type = 'info', children }: AlertProps) {
  return (
    <div className={`${styles.alert} ${styles[type]}`} role={type === 'error' ? 'alert' : 'status'}>
      <span className={styles.icon} aria-hidden="true">
        <AlertIcon type={type} />
      </span>
      <span>{children}</span>
    </div>
  );
}

function AlertIcon({ type }: { type: 'error' | 'success' | 'info' }) {
  if (type === 'success') {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M4 9.5l3 3 7-7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'error') {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 5.5v4M9 12v.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 8v4.5M9 5.5v.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
