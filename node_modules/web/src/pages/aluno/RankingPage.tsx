import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useApiQuery } from '../../hooks/useApiQuery';
import { profileApi } from '../../services/profileApi';
import { Alert } from '../../components/ui/Alert';
import pageStyles from './Page.module.css';

export function RankingPage() {
  const { user } = useAuth();
  const { data: ranking, error, isLoading } = useApiQuery(() => profileApi.getRanking());
  if (user?.role !== 'ALUNO') return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/professor'} replace />;

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.pageHeader}>
        <h1 className={pageStyles.pageTitle}>Ranking</h1>
        <p className={pageStyles.pageSubtitle}>Compare seu desempenho com outros estudantes (participação é opcional).</p>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {isLoading && <div className={pageStyles.skeleton} style={{ height: 320 }} />}

      {!isLoading && ranking && ranking.length === 0 && (
        <div className={pageStyles.emptyState}>
          Ninguém no ranking público ainda. Ganhe XP respondendo questões para aparecer aqui!
        </div>
      )}

      {ranking && ranking.length > 0 && (
        <div className={pageStyles.card} style={{ padding: 0 }}>
          {ranking.map((entry, index) => {
            const isYou = entry.userId === user?.id;
            return (
              <div
                key={entry.userId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 20px',
                  borderBottom: index < ranking.length - 1 ? '1px solid var(--color-border)' : 'none',
                  background: isYou ? '#eff6ff' : 'transparent',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 'var(--text-sm)',
                    color: index < 3 ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    width: 28,
                  }}
                >
                  {index + 1}º
                </span>
                <span style={{ flex: 1, fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-primary)' }}>
                  {isYou ? 'Você' : entry.name}
                </span>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  {entry.xp.toLocaleString('pt-BR')} XP
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
