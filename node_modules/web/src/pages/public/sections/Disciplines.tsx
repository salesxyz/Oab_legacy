import { Container } from '../../../components/ui/Container';
import { disciplines } from '../../../data/landingContent';
import styles from './Disciplines.module.css';

export function Disciplines() {
  return (
    <section className={styles.section} id="disciplinas">
      <Container>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Disciplinas do edital</p>
          <h2>As 9 disciplinas que mais aparecem na 1ª fase, todas com módulo próprio.</h2>
        </div>

        <ul className={styles.list} role="list">
          {disciplines.map((discipline) => (
            <li key={discipline} className={styles.chip}>
              {discipline}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
