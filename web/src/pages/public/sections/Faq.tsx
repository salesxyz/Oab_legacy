import { Container } from '../../../components/ui/Container';
import { Accordion } from '../../../components/ui/Accordion';
import { faq } from '../../../data/landingContent';
import styles from './Faq.module.css';

export function Faq() {
  return (
    <section className={styles.section} id="faq">
      <Container>
        <div className={styles.grid}>
          <div className={styles.heading}>
            <p className={styles.eyebrow}>Perguntas frequentes</p>
            <h2>O que os candidatos mais perguntam</h2>
          </div>
          <Accordion items={faq} />
        </div>
      </Container>
    </section>
  );
}
