import { Container } from '../../../components/ui/Container';
import { examPhases } from '../../../data/landingContent';
import styles from './ExamJourney.module.css';

export function ExamJourney() {
  return (
    <section className={styles.section} id="jornada">
      <Container>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Da inscrição à aprovação</p>
          <h2>Uma preparação que não termina na primeira prova.</h2>
          <p className={styles.lead}>
            Organize sua rotina para avançar pela primeira fase, escolher a área da segunda e chegar mais preparado à prova prático-profissional.
          </p>
        </div>

        <div className={styles.timeline}>
          {examPhases.map((phase, index) => (
            <article className={styles.phase} key={phase.title}>
              <div className={styles.marker} aria-hidden="true">
                <span>{index + 1}</span>
              </div>
              <div className={styles.phaseBody}>
                <p className={styles.phaseLabel}>{phase.label}</p>
                <h3>{phase.title}</h3>
                <p>{phase.description}</p>
                <ul>
                  {phase.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
