import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { BookIcon, ClipboardIcon, HomeIcon, LogoutIcon, UserIcon } from '../../components/ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import styles from './BackofficeLayout.module.css';

const adminNav = [{ to: '/admin', label: 'Visão geral', icon: HomeIcon, end: true }, { to: '/admin/usuarios', label: 'Usuários', icon: UserIcon }, { to: '/admin/perfil', label: 'Perfil', icon: UserIcon }];
const mentorNav = [{ to: '/professor', label: 'Visão geral', icon: HomeIcon, end: true }, { to: '/professor/alunos', label: 'Alunos', icon: UserIcon }, { to: '/professor/materias', label: 'Matérias', icon: BookIcon }, { to: '/professor/aulas', label: 'Aulas', icon: BookIcon }, { to: '/professor/questoes', label: 'Questões', icon: ClipboardIcon }, { to: '/professor/simulados', label: 'Simulados', icon: ClipboardIcon }, { to: '/professor/perfil', label: 'Perfil', icon: UserIcon }];

export function BackofficeLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MENTOR')) return <Navigate to="/app" replace />;
  if (location.pathname.startsWith('/admin') && user.role !== 'ADMIN') return <Navigate to="/professor" replace />;
  if (location.pathname.startsWith('/professor') && user.role !== 'MENTOR') return <Navigate to="/admin" replace />;
  const isAdmin = user.role === 'ADMIN';
  const navItems = isAdmin ? adminNav : mentorNav;
  const portalName = isAdmin ? 'Console administrativo' : 'Espaço do professor';
  const initials = user.name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}><img src="/favicon.svg" alt="" aria-hidden="true" /><span>OAB Mentoria</span></div>
        <div className={styles.portalTag}>{portalName}</div>
        <nav className={styles.nav} aria-label="Navegação do painel">
          {navItems.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}><Icon />{label}</NavLink>)}
        </nav>
        <button className={styles.logout} onClick={() => logout()}><LogoutIcon /> Sair</button>
      </aside>
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div><p className={styles.mobileBrand}>OAB Mentoria</p><p className={styles.topbarTitle}>{portalName}</p></div>
          <div className={styles.userChip}><span className={styles.avatar}>{initials}</span><span className={styles.userName}>{user.name}</span></div>
        </header>
        <main className={styles.content}><Outlet /></main>
        <nav className={styles.mobileNav} aria-label="Navegação do painel">
          {navItems.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.mobileActive : ''}`}><Icon size={19} /><span>{label}</span></NavLink>)}
        </nav>
      </div>
    </div>
  );
}