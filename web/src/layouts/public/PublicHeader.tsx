import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';
import { BrandMark } from '../../components/ui/BrandMark';
import { useAuth } from '../../contexts/AuthContext';
import { nav } from '../../data/landingContent';
import styles from './PublicHeader.module.css';

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [mobileSection, setMobileSection] = useState<string | null>('preparacao');
  const headerRef = useRef<HTMLElement>(null);
  const headerOffset = useRef(0);
  const lastScrollY = useRef(0);
  const { user, logout } = useAuth();

  const closeNavigation = () => {
    setMenuOpen(false);
    setDropdownOpen(null);
    setProfileOpen(false);
  };

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    if (menuOpen) {
      headerOffset.current = 0;
      headerRef.current?.style.setProperty('--header-offset', '0px');
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY.current;
      const headerHeight = 76;
      const threshold = 5;

      // Ignore tiny scroll jitters
      if (Math.abs(scrollDelta) < threshold) {
        lastScrollY.current = currentScrollY;
        return;
      }

      // At the very top, always show the header
      if (currentScrollY <= 0) {
        headerOffset.current = 0;
        headerRef.current?.style.setProperty('--header-offset', '0px');
        lastScrollY.current = currentScrollY;
        return;
      }

      // Dampen the delta for a gradual slide
      const damping = 0.6;
      const dampedDelta = scrollDelta * damping;

      headerOffset.current = Math.min(Math.max(headerOffset.current + dampedDelta, 0), headerHeight);

      // Snap to fully shown / fully hidden when close to the edges
      if (headerOffset.current < 4) headerOffset.current = 0;
      if (headerOffset.current > headerHeight - 4) headerOffset.current = headerHeight;

      headerRef.current?.style.setProperty('--header-offset', `${headerOffset.current}px`);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuOpen]);

  // Fecha o menu mobile ao pressionar Esc, e trava o scroll do body enquanto
  // o painel está aberto.
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setProfileOpen(false);
        setDropdownOpen(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header ref={headerRef} className={styles.header}>
      <Container className={styles.bar}>
        <BrandMark className={styles.logo} aria-label="Voltar ao início" />

        <nav className={styles.nav} aria-label="Navegação principal">
          <DropdownNavItem
            label="Preparação"
            open={dropdownOpen === 'preparacao'}
            onToggle={() => setDropdownOpen((current) => (current === 'preparacao' ? null : 'preparacao'))}
          >
            {nav.slice(0, 2).map((item) => <DropdownLink key={item.href} {...item} onClick={closeNavigation} />)}
          </DropdownNavItem>
          <DropdownNavItem
            label="Plataforma"
            open={dropdownOpen === 'plataforma'}
            onToggle={() => setDropdownOpen((current) => (current === 'plataforma' ? null : 'plataforma'))}
          >
            {nav.slice(2).map((item) => <DropdownLink key={item.href} {...item} onClick={closeNavigation} />)}
            <DropdownLink label="Termos de uso" href="/termos" onClick={closeNavigation} />
            <DropdownLink label="Privacidade" href="/privacidade" onClick={closeNavigation} />
          </DropdownNavItem>
          <a href="/#jornada" className={styles.navLink} onClick={closeNavigation}>Jornada</a>
        </nav>

        <div className={styles.actions}>
          {user ? (
            <div className={styles.profile}>
              <button
                type="button"
                className={styles.profileButton}
                aria-expanded={profileOpen}
                aria-controls="profile-menu"
                onClick={() => setProfileOpen((open) => !open)}
              >
                <ProfilePhoto userName={user.name} photoUrl={user.photoUrl} />
                <span className={styles.profileName}>{user.name}</span>
                <ChevronIcon />
              </button>

              {profileOpen && (
                <div id="profile-menu" className={styles.profileMenu} role="menu">
                  <div className={styles.profileSummary}>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <Button as="link" to="/app/perfil" variant="ghost" fullWidth onClick={closeNavigation}>
                    Meu perfil
                  </Button>
                  <button type="button" className={styles.logoutButton} role="menuitem" onClick={() => { closeNavigation(); void logout(); }}>
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button as="link" to="/entrar" variant="ghost" size="sm" onClick={closeNavigation}>
                Entrar
              </Button>
              <Button as="link" to="/cadastro" variant="primary" size="sm" onClick={closeNavigation}>
                Criar conta
              </Button>
            </>
          )}
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
            <MobileSection label="Preparação" open={mobileSection === 'preparacao'} onToggle={() => setMobileSection((current) => current === 'preparacao' ? null : 'preparacao')}>
              {nav.slice(0, 2).map((item) => <a key={item.href} href={item.href} className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
            </MobileSection>
            <MobileSection label="Plataforma" open={mobileSection === 'plataforma'} onToggle={() => setMobileSection((current) => current === 'plataforma' ? null : 'plataforma')}>
              {nav.slice(2).map((item) => <a key={item.href} href={item.href} className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
              <a href="/#jornada" className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>Jornada</a>
              <a href="/termos" className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>Termos de uso</a>
              <a href="/privacidade" className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>Privacidade</a>
            </MobileSection>
          </nav>
          <div className={styles.mobileActions}>
            {user ? (
              <>
                <Button as="link" to="/app/perfil" variant="secondary" fullWidth onClick={closeNavigation}>
                  Meu perfil
                </Button>
                <Button as="button" variant="primary" fullWidth onClick={() => { closeNavigation(); void logout(); }}>
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button as="link" to="/entrar" variant="secondary" fullWidth onClick={closeNavigation}>
                  Entrar
                </Button>
                <Button as="link" to="/cadastro" variant="primary" fullWidth onClick={closeNavigation}>
                  Criar conta
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function DropdownNavItem({ label, open, onToggle, children }: { label: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <div className={styles.dropdown}>
      <button type="button" className={styles.navLink} aria-expanded={open} onClick={onToggle}>
        {label}<ChevronIcon open={open} />
      </button>
      {open && <div className={styles.dropdownPanel}>{children}</div>}
    </div>
  );
}

function DropdownLink({ label, href, onClick }: { label: string; href: string; onClick: () => void }) {
  return <a href={href} className={styles.dropdownLink} onClick={onClick}>{label}<span aria-hidden="true">↗</span></a>;
}

function MobileSection({ label, open, onToggle, children }: { label: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <section className={styles.mobileSection}>
      <button type="button" className={styles.mobileSectionTrigger} aria-expanded={open} onClick={onToggle}>
        {label}<ChevronIcon open={open} />
      </button>
      {open && <div className={styles.mobileSectionContent}>{children}</div>}
    </section>
  );
}

function ProfilePhoto({ userName, photoUrl }: { userName: string; photoUrl: string | null }) {
  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((name) => name[0])
    .join('')
    .toUpperCase();

  return photoUrl ? <img className={styles.profilePhoto} src={photoUrl} alt="" /> : <span className={styles.profileFallback}>{initials}</span>;
}

function ChevronIcon({ open = false }: { open?: boolean }) {
  return (
    <svg aria-hidden="true" className={open ? styles.chevronOpen : ''} width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
