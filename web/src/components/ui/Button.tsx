import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import styles from './Button.module.css';

type Variant = 'primary' | 'onDark' | 'secondary' | 'secondaryOnDark' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface SharedProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  icon?: ReactNode;
  loading?: boolean;
  children: ReactNode;
}

type AsButton = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' };
type AsAnchor = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { as: 'a' };
type AsLink = SharedProps & LinkProps & { as: 'link' };

type ButtonProps = AsButton | AsAnchor | AsLink;

function classes(variant: Variant, size: Size, fullWidth?: boolean, extra?: string) {
  return [
    styles.button,
    styles[variant],
    size !== 'md' ? styles[size] : '',
    fullWidth ? styles.fullWidth : '',
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * Botão do design system. Renderiza como <button>, <a> ou <Link> do
 * react-router conforme a prop `as`, mantendo a mesma aparência visual
 * independentemente do elemento HTML subjacente.
 */
export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', fullWidth, icon, loading, children, className, ...rest } = props;
  const cls = classes(variant, size, fullWidth, className as string | undefined);
  const content = (
    <>
      {loading ? <Spinner /> : icon}
      {children}
    </>
  );

  if (props.as === 'a') {
    const { as: _as, ...anchorRest } = rest as AsAnchor;
    return (
      <a className={cls} aria-busy={loading} {...anchorRest}>
        {content}
      </a>
    );
  }

  if (props.as === 'link') {
    const { as: _as, ...linkRest } = rest as AsLink;
    return (
      <Link className={cls} aria-busy={loading} {...linkRest}>
        {content}
      </Link>
    );
  }

  const { as: _as, disabled, ...buttonRest } = rest as AsButton;
  return (
    <button className={cls} disabled={disabled || loading} aria-busy={loading} {...buttonRest}>
      {content}
    </button>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.spinner} aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path d="M14.5 8a6.5 6.5 0 00-6.5-6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
