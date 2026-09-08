import { Container } from '../../../components/ui/Container';
import { Button } from '../../../components/ui/Button';
import { plans } from '../../../data/landingContent';
import styles from './Plans.module.css';

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M4 9.5l3 3 7-7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Plans() {
  return (
    <section className={styles.section} id="planos">
      <Container>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Planos</p>
          <h2>Escolha o tempo necessário para conquistar sua aprovação.</h2>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <p className={styles.planName}>{plans.basic.name}</p>
            <p className={styles.planDescription}>{plans.basic.description}</p>
            <div className={styles.price}>
              <span className={styles.priceValue}>{plans.basic.price}</span>
            </div>
            <ul className={styles.featureList} role="list">
              {plans.basic.features.map((feature) => (
                <li key={feature} className={styles.featureItem}>
                  <span className={styles.featureIcon}>
                    <CheckIcon />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <Button as="link" to="/cadastro?plano=basico" variant="secondary" fullWidth>
              Assinar Básico
            </Button>
          </div>

          <div className={`${styles.card} ${styles.cardPremium}`}>
            <span className={styles.premiumBadge}>Até passar na OAB</span>
            <p className={styles.planName}>{plans.lifetime.name}</p>
            <p className={styles.planDescription}>{plans.lifetime.description}</p>
            <div className={styles.price}>
              <span className={styles.priceValue}>{plans.lifetime.price}</span>
              <span className={styles.pricePeriod}>{plans.lifetime.period}</span>
            </div>
            <ul className={styles.featureList} role="list">
              {plans.lifetime.features.map((feature) => (
                <li key={feature} className={styles.featureItem}>
                  <span className={styles.featureIcon}>
                    <CheckIcon />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <Button as="link" to="/cadastro?plano=vitalicio" variant="onDark" fullWidth>
              Assinar Vitalício
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
