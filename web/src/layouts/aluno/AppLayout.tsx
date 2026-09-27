import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AccessibilityIcon, AwardIcon, BookIcon, ClipboardIcon, ClockIcon, HomeIcon, LogoutIcon, MenuIcon, TrophyIcon, UserIcon } from '../../components/ui/icons';
import { BrandMark } from '../../components/ui/BrandMark';
import styles from './AppLayout.module.css';

const navItems = [
  { to: '/app', label: 'Início', icon: HomeIcon, end: true },
  { to: '/app/cursos', label: 'Cursos', icon: BookIcon },
  { to: '/app/questoes', label: 'Questões', icon: ClipboardIcon },
  { to: '/app/simulados', label: 'Simulados', icon: ClockIcon },
  { to: '/app/ranking', label: 'Ranking', icon: TrophyIcon },
  { to: '/app/assinatura', label: 'Assinatura', icon: AwardIcon },
  { to: '/app/perfil', label: 'Perfil', icon: UserIcon, separated: true },
  { to: '/app/acessibilidade', label: 'Acessibilidade', icon: AccessibilityIcon },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const initials = user?.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <a href="#conteudo" className="skipLink">Pular para o conteúdo</a>
      <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${isMobileNavOpen ? styles.sidebarMobileOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <BrandMark className={styles.logo} tone="light" aria-label="Voltar ao início" />
        </div>
        <div className={styles.accountSummary}>
          <span className={styles.accountAvatar}>{initials}</span>
          <div className={styles.accountCopy}><strong>{user?.name}</strong><span>{user?.subscriptionPlan === 'VITALICIO' ? 'Plano Vitalício' : user?.subscriptionPlan === 'BASICO' ? 'Plano Básico' : 'Plano gratuito'}</span></div>
        </div>
        <nav className={styles.nav} aria-label="Navegação da área do aluno">
          {navItems.map(({ to, label, icon: Icon, end, separated }) => (
            <div className={separated ? styles.navItemSeparated : undefined} key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={() => setIsMobileNavOpen(false)}
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                <Icon />
                <span className={styles.navLabel}>{label}</span>
              </NavLink>
            </div>
          ))}
        </nav>
        <button className={styles.logoutButton} onClick={() => logout()}>
          <LogoutIcon />
          <span className={styles.navLabel}>Sair</span>
        </button>
      </aside>
      {isMobileNavOpen && <button className={styles.mobileScrim} type="button" aria-label="Fechar menu" onClick={() => setIsMobileNavOpen(false)} />}

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.mobileMenuButton} type="button" onClick={() => setIsMobileNavOpen((value) => !value)} aria-label={isMobileNavOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={isMobileNavOpen}><MenuIcon /></button>
          <BrandMark className={styles.topbarLogo} aria-label="Voltar ao início" />
          <span className={styles.avatar} aria-label={`Conta de ${user?.name}`}>{initials}</span>
        </header>

        <main id="conteudo" className={styles.content}>
          <Outlet />
        </main>

        <nav className={styles.bottomNav} aria-label="Navegação da área do aluno">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setIsMobileNavOpen(false)}
              className={({ isActive }) => `${styles.bottomNavLink} ${isActive ? styles.bottomNavLinkActive : ''}`}
            >
              <Icon size={20} />
              <span className={styles.bottomNavLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
    </>
  );
}
