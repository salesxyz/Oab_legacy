import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import styles from '../components/ui/Toast.module.css';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = ++idRef.current;
      setToasts((current) => [...current, { id, type, message }]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={styles.container} aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`} role="status">
            <ToastIcon type={toast.type} />
            <p className={styles.message}>{toast.message}</p>
            <button
              type="button"
              className={styles.dismiss}
              onClick={() => dismiss(toast.id)}
              aria-label="Fechar notificação"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastIcon({ type }: { type: ToastType }) {
  if (type === 'success') {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={styles.icon} aria-hidden="true">
        <path d="M4 9.5l3 3 7-7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'error') {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={styles.icon} aria-hidden="true">
        <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 5.5v4M9 12v.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={styles.icon} aria-hidden="true">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 8v4.5M9 5.5v.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa ser usado dentro de <ToastProvider>');
  return ctx;
}
