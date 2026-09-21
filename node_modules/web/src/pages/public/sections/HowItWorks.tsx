import { Container } from '../../../components/ui/Container';
import { ScrollStack, ScrollStackItem } from '../../../components/ui/ScrollStack';
import { howItWorks } from '../../../data/landingContent';
import styles from './HowItWorks.module.css';

export function HowItWorks() {
  return (
    <section className={styles.section} id="como-funciona">
      <Container>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Como funciona</p>
          <h2>Um método que acompanha a sua evolução nas duas fases.</h2>
        </div>

        <ScrollStack className={styles.steps} useWindowScroll itemDistance={100} itemStackDistance={30} stackPosition="20%" scaleEndPosition="10%" baseScale={0.85}>
          {howItWorks.map((step, index) => (
            <ScrollStackItem key={step.title} itemClassName={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            </ScrollStackItem>
          ))}
        </ScrollStack>
      </Container>
    </section>
  );
}
