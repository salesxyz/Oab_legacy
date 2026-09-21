import { Container } from '../../components/ui/Container';
import { BrandMark } from '../../components/ui/BrandMark';
import { footerLinks } from '../../data/landingContent';
import styles from './PublicFooter.module.css';

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.top}>
          <div className={styles.brand}>
            <BrandMark className={styles.logo} tone="light" aria-label="Voltar ao início" />
            <p className={styles.tagline}>
              Preparação para as duas fases do Exame de Ordem: teoria, prática profissional, questões comentadas e acompanhamento até a aprovação.
            </p>
          </div>

          <div className={styles.columns}>
            <div>
              <p className={styles.columnTitle}>Plataforma</p>
              <ul className={styles.columnList} role="list">
                {footerLinks.plataforma.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className={styles.columnLink}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className={styles.columnTitle}>Legal</p>
              <ul className={styles.columnList} role="list">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className={styles.columnLink}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© {year} OAB Legacy. Todos os direitos reservados.</span>
          <span>Conteúdo de apoio ao estudo — não substitui a leitura da lei e da doutrina.</span>
        </div>
      </Container>
    </footer>
  );
}
