import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApiQuery } from '../../hooks/useApiQuery';
import { profileApi } from '../../services/profileApi';
import { Alert } from '../../components/ui/Alert';
import { Checkbox } from '../../components/ui/Checkbox';
import { AwardIcon, FlameIcon, LogoutIcon } from '../../components/ui/icons';
import { useToast } from '../../contexts/ToastContext';
import { getErrorMessage } from '../../utils/errors';
import pageStyles from './Page.module.css';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { data: profile, error, isLoading } = useApiQuery(() => profileApi.getProfile());
  const [publicRanking, setPublicRanking] = useState<boolean | null>(null);
  const [savingPreference, setSavingPreference] = useState(false);

  const ranking = publicRanking ?? profile?.profile?.publicRanking ?? true;

  async function togglePublicRanking(value: boolean) {
    setPublicRanking(value);
    setSavingPreference(true);
    try {
      await profileApi.updatePreferences({ publicRanking: value });
    } catch (err) {
      setPublicRanking(!value);
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSavingPreference(false);
    }
  }

  const initials = user?.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.pageHeader}>
        <h1 className={pageStyles.pageTitle}>Perfil</h1>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {isLoading && <div className={pageStyles.skeleton} style={{ height: 300 }} />}

      {profile && (
        <>
          <div className={pageStyles.card} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <span
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--color-primary)',
                color: 'var(--color-accent)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: 'var(--text-lg)',
                flexShrink: 0,
              }}
            >
              {initials}
            </span>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{profile.name}</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{profile.email}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div className={pageStyles.card} style={{ textAlign: 'center' }}>
              <AwardIcon size={18} />
              <p style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--color-primary)', marginTop: 4 }}>
                {profile.gamification?.xp ?? 0}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>XP</p>
            </div>
            <div className={pageStyles.card} style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--color-primary)' }}>
                {profile.gamification?.level ?? 1}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Nível</p>
            </div>
            <div className={pageStyles.card} style={{ textAlign: 'center' }}>
              <FlameIcon size={18} />
              <p style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--color-primary)', marginTop: 4 }}>
                {profile.gamification?.streakDays ?? 0}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Sequência</p>
            </div>
          </div>

          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Conquistas ({profile.gamification?.achievements.length ?? 0})
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {profile.gamification?.achievements.map((a) => (
              <div key={a.id} className={pageStyles.card} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12 }}>
                <span>{a.icon ?? '🏆'}</span>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-primary)' }}>{a.title}</span>
              </div>
            ))}
            {profile.gamification?.achievements.length === 0 && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', gridColumn: '1 / -1' }}>
                Nenhuma conquista desbloqueada ainda.
              </p>
            )}
          </div>

          {profile.performanceBySubject.length > 0 && (
            <>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                Desempenho por disciplina
              </p>
              <div className={pageStyles.card} style={{ marginBottom: 20 }}>
                {profile.performanceBySubject.map((p) => (
                  <div
                    key={p.subject}
                    style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', padding: '8px 0' }}
                  >
                    <span>{p.subject}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{p.correct}/{p.total} ({p.percent}%)</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Privacidade
          </p>
          <div className={pageStyles.card} style={{ marginBottom: 20 }}>
            <Checkbox
              label="Participar do ranking público"
              checked={ranking}
              disabled={savingPreference}
              onChange={(e) => togglePublicRanking(e.target.checked)}
            />
          </div>

          <button
            onClick={() => logout()}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: 14,
              borderRadius: 10,
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
            }}
          >
            <LogoutIcon size={16} /> Sair
          </button>
        </>
      )}
    </div>
  );
}
