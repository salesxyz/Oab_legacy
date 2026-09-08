import { Container } from '../../../components/ui/Container';
import { howItWorks } from '../../../data/landingContent';
import styles from './HowItWorks.module.css';

export function HowItWorks() {
  return (
    <section className={styles.section} id="como-funciona">
      <Container>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Como funciona</p>
          <h2>Quatro passos entre abrir a plataforma e sentar para a prova.</h2>
        </div>

        <ol className={styles.steps} role="list">
          {howItWorks.map((step, index) => (
            <li className={styles.step} key={step.title}>
              <span className={styles.stepNumber} aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
