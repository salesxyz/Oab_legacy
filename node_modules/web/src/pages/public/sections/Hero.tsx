import { Container } from '../../../components/ui/Container';
import { Button } from '../../../components/ui/Button';
import { LearningPathIllustration } from '../../../components/illustrations/LearningPathIllustration';
import { heroStats } from '../../../data/landingContent';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero} id="top">
      <Container>
        <div className={styles.grid}>
          <div className={styles.copy}>
            <h1 className={styles.headline}>A primeira fase da OAB, estudada com método.</h1>
            <p className={styles.subhead}>
              Módulos organizados por disciplina, questões comentadas de provas anteriores e simulados cronometrados
              — para você chegar no dia do exame sabendo exatamente onde está.
            </p>
            <div className={styles.ctaRow}>
              <Button as="link" to="/cadastro" size="lg">
                Começar agora
              </Button>
              <Button as="a" href="#como-funciona" variant="secondary" size="lg">
                Ver como funciona
              </Button>
            </div>

            <dl className={styles.statsRow}>
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <dt className="visually-hidden">{stat.label}</dt>
                  <dd className={styles.statValue}>{stat.value}</dd>
                  <p className={styles.statLabel}>{stat.label}</p>
                </div>
              ))}
            </dl>
          </div>

          <div className={styles.panel}>
            <span className={styles.panelBadge}>
              <span className={styles.panelDot} aria-hidden="true" />
              Seu mapa de estudo
            </span>
            <LearningPathIllustration />
          </div>
        </div>
      </Container>
    </section>
  );
}
