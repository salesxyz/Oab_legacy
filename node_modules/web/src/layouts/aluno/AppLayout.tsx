import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AwardIcon, BookIcon, ClipboardIcon, ClockIcon, HomeIcon, LogoutIcon, TrophyIcon, UserIcon } from '../../components/ui/icons';
import { BrandMark } from '../../components/ui/BrandMark';
import styles from './AppLayout.module.css';

const navItems = [
  { to: '/app', label: 'Início', icon: HomeIcon, end: true },
  { to: '/app/cursos', label: 'Cursos', icon: BookIcon },
  { to: '/app/questoes', label: 'Questões', icon: ClipboardIcon },
  { to: '/app/simulados', label: 'Simulados', icon: ClockIcon },
  { to: '/app/ranking', label: 'Ranking', icon: TrophyIcon },
  { to: '/app/perfil', label: 'Perfil', icon: UserIcon },
  { to: '/app/assinatura', label: 'Assinatura', icon: AwardIcon },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const initials = user?.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <BrandMark className={styles.logo} tone="light" aria-label="Voltar ao início" />
        <nav className={styles.nav} aria-label="Navegação da área do aluno">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>
        <button className={styles.logoutButton} onClick={() => logout()}>
          <LogoutIcon />
          Sair
        </button>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <BrandMark className={styles.topbarLogo} aria-label="Voltar ao início" />
          <span className={styles.avatar} aria-hidden="true">{initials}</span>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>

        <nav className={styles.bottomNav} aria-label="Navegação da área do aluno">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `${styles.bottomNavLink} ${isActive ? styles.bottomNavLinkActive : ''}`}
            >
              <Icon size={20} />
              <span className={styles.bottomNavLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
