import { useEffect, useState } from 'react';
import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';
import { nav } from '../../data/landingContent';
import styles from './PublicHeader.module.css';

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Fecha o menu mobile ao pressionar Esc, e trava o scroll do body enquanto
  // o painel está aberto.
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <Container className={styles.bar}>
        <a href="#top" className={styles.logo}>
          <img src="/oab-legacy-logo.svg" alt="OAB Mentoria" />
        </a>

        <nav className={styles.nav} aria-label="Navegação principal">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <Button as="link" to="/entrar" variant="ghost" size="sm">
            Entrar
          </Button>
          <Button as="link" to="/cadastro" variant="primary" size="sm">
            Criar conta
          </Button>
        </div>

        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-panel"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MenuIcon open={menuOpen} />
        </button>
      </Container>

      {menuOpen && (
        <div id="mobile-nav-panel" className={styles.mobilePanel}>
          <nav className={styles.mobileNav} aria-label="Navegação mobile">
            {nav.map((item) => (
              <a key={item.href} href={item.href} className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className={styles.mobileActions}>
            <Button as="link" to="/entrar" variant="secondary" fullWidth>
              Entrar
            </Button>
            <Button as="link" to="/cadastro" variant="primary" fullWidth>
              Criar conta
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
