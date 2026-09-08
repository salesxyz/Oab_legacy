import { Container } from '../../../components/ui/Container';
import { Button } from '../../../components/ui/Button';
import styles from './FinalCta.module.css';

export function FinalCta() {
  return (
    <section className={styles.section}>
      <Container>
        <h2 className={styles.heading}>Sua vaga na advocacia começa com o primeiro módulo.</h2>
        <p className={styles.subhead}>
          Crie sua conta gratuita agora e comece pela disciplina que você mais precisa reforçar.
        </p>
        <div className={styles.ctaRow}>
          <Button as="link" to="/cadastro" variant="onDark" size="lg">
            Criar conta grátis
          </Button>
          <Button as="link" to="/entrar" variant="secondaryOnDark" size="lg">
            Já tenho conta
          </Button>
        </div>
      </Container>
    </section>
  );
}
