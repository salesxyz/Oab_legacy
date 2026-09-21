import type { AnchorHTMLAttributes } from 'react';
import styles from './BrandMark.module.css';

type BrandMarkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  tone?: 'light' | 'dark';
};

export function BrandMark({ className = '', tone = 'dark', ...props }: BrandMarkProps) {
  return (
    <a className={`${styles.brand} ${styles[tone]} ${className}`} href="/" {...props}>
      <span className={styles.name} aria-label="OAB Legacy">
        <span>OAB</span>
        <span>LEGACY</span>
      </span>
    </a>
  );
}