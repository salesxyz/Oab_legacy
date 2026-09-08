import { Container } from '../../components/ui/Container';
import { footerLinks } from '../../data/landingContent';
import styles from './PublicFooter.module.css';

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.top}>
          <div className={styles.brand}>
            <a href="#top" className={styles.logo}>
              <img src="/oab-legacy-logo.svg" alt="OAB Mentoria" />
            </a>
            <p className={styles.tagline}>
              Plataforma de estudos para a 1ª fase do Exame de Ordem: módulos por disciplina, questões comentadas de
              provas anteriores e simulados cronometrados.
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
          <span>© {year} OAB Mentoria. Todos os direitos reservados.</span>
          <span>Conteúdo de apoio ao estudo — não substitui a leitura da lei e da doutrina.</span>
        </div>
      </Container>
    </footer>
  );
}
