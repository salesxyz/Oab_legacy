import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const spinnerStyle: React.CSSProperties = {
  minHeight: '100svh',
  display: 'grid',
  placeItems: 'center',
  color: 'var(--color-text-muted)',
  fontSize: 'var(--text-sm)',
};

/**
 * Protege rotas que exigem sessão autenticada. O controle real de
 * permissões (o que o usuário pode ou não fazer) sempre vive no backend —
 * este componente só evita mostrar telas que dependem de dados do usuário
 * antes de sabermos se há sessão, e redireciona quem não está autenticado.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return <div style={spinnerStyle}>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/entrar" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
