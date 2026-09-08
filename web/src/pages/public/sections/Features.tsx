import type { ReactNode } from 'react';
import { Container } from '../../../components/ui/Container';
import { features } from '../../../data/landingContent';
import styles from './Features.module.css';

const icons: ReactNode[] = [
  // Questões — check em círculo
  <svg key="q" width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M7.5 11.3l2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // Videoaulas — play em quadrado arredondado
  <svg key="v" width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect x="2.5" y="2.5" width="17" height="17" rx="4" stroke="currentColor" strokeWidth="1.6" />
    <path d="M9.5 8l5 3-5 3V8z" fill="currentColor" />
  </svg>,
  // Simulados — cronômetro
  <svg key="s" width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M11 8v4l2.6 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M8.5 2.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>,
  // Progresso — barras ascendentes
  <svg key="p" width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect x="3" y="12" width="3.5" height="7" rx="1" fill="currentColor" />
    <rect x="9.25" y="7.5" width="3.5" height="11.5" rx="1" fill="currentColor" />
    <rect x="15.5" y="3" width="3.5" height="16" rx="1" fill="currentColor" />
  </svg>,
  // Sequência — chama
  <svg key="f" width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path
      d="M11 2.5c1 3-3 4-3 7.5a3.5 3.5 0 0 0 7 0c0-1.2-.5-2-1-2.6.3 1.6-.6 2.4-1.4 2 .8-2-1-3.6-1.6-6.9z"
      fill="currentColor"
    />
  </svg>,
  // Ranking — pódio
  <svg key="r" width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect x="2.5" y="11" width="4.5" height="8" rx="1" fill="currentColor" opacity="0.55" />
    <rect x="8.75" y="6" width="4.5" height="13" rx="1" fill="currentColor" />
    <rect x="15" y="9" width="4.5" height="10" rx="1" fill="currentColor" opacity="0.55" />
  </svg>,
];

export function Features() {
  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Uma plataforma, seis frentes de preparação</p>
          <p className={styles.lead}>
            Cada parte da plataforma existe para responder a uma pergunta específica da sua rotina de estudo.
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((feature, index) => (
            <div className={styles.item} key={feature.title}>
              <span className={styles.iconWrap} aria-hidden="true">
                {icons[index]}
              </span>
              <div>
                <h3 className={styles.itemTitle}>{feature.title}</h3>
                <p className={styles.itemDescription}>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
