import type { ReactNode } from 'react';
import { LearningPathIllustration } from '../../components/illustrations/LearningPathIllustration';
import { BrandMark } from '../../components/ui/BrandMark';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <aside className={styles.brandPanel}>
        <BrandMark className={styles.logo} tone="light" aria-label="Voltar ao início" />

        <div className={styles.illustration}>
          <LearningPathIllustration />
        </div>

        <div className={styles.brandMessage}>
          <h2 className={styles.brandHeadline}>Estude por módulos, não por acaso.</h2>
          <p className={styles.brandSubhead}>
            Preparação organizada para as duas fases do Exame de Ordem, da base objetiva à prática profissional.
          </p>
        </div>
      </aside>

      <main className={styles.formPanel}>
        <BrandMark className={styles.mobileLogo} aria-label="Voltar ao início" />

        <div className={styles.formCard}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {children}
        </div>
      </main>
    </div>
  );
}
