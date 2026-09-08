import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApiQuery } from '../../hooks/useApiQuery';
import { profileApi } from '../../services/profileApi';
import { courseApi } from '../../services/courseApi';
import { tipApi } from '../../services/tipApi';
import type { ModuleWithProgress } from '../../types/student';
import { Alert } from '../../components/ui/Alert';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { AwardIcon, ChevronRightIcon, ClipboardIcon, ClockIcon, FlameIcon } from '../../components/ui/icons';
import pageStyles from './Page.module.css';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading, error: profileError } = useApiQuery(() => profileApi.getProfile());
  const { data: tip } = useApiQuery(() => tipApi.ofTheDay().catch(() => null), []);

  const [currentModule, setCurrentModule] = useState<(ModuleWithProgress & { courseId: string }) | null>(null);
  const [continueLoading, setContinueLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    courseApi
      .listCourses()
      .then(async (courses) => {
        const firstCourse = courses[0];
        if (!firstCourse) return null;
        const modules = await courseApi.listModules(firstCourse.id);
        const inProgress = modules.find((m) => m.progressPercent < 100) ?? modules[0];
        return inProgress ? { ...inProgress, courseId: firstCourse.id } : null;
      })
      .then((result) => {
        if (!cancelled) setCurrentModule(result);
      })
      .catch(() => {
        if (!cancelled) setCurrentModule(null);
      })
      .finally(() => {
        if (!cancelled) setContinueLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const firstName = user?.name.split(' ')[0];

  return (
    <div className={pageStyles.page}>
      <h1 className={styles.greeting}>Olá, {firstName}!</h1>
      <p className={styles.subhead}>Continue sua preparação para a OAB.</p>

      {profileError && <Alert type="error">{profileError}</Alert>}

      {profileLoading ? (
        <div className={styles.statsGrid}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={`${pageStyles.skeleton}`} style={{ height: 84 }} />
          ))}
        </div>
      ) : (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><AwardIcon /></div>
            <p className={styles.statValue}>{profile?.gamification?.xp ?? 0}</p>
            <p className={styles.statLabel}>XP acumulado</p>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><ClipboardIcon /></div>
            <p className={styles.statValue}>{profile?.gamification?.level ?? 1}</p>
            <p className={styles.statLabel}>Nível atual</p>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: '#EA580C' }}><FlameIcon /></div>
            <p className={styles.statValue}>{profile?.gamification?.streakDays ?? 0}</p>
            <p className={styles.statLabel}>Dias seguidos</p>
          </div>
        </div>
      )}

      {!continueLoading && currentModule && (
        <button
          className={`${pageStyles.card} ${styles.continueCard}`}
          onClick={() => navigate(`/app/cursos/${currentModule.courseId}/modulos/${currentModule.id}`)}
        >
          <p className={styles.continueLabel}>Continue de onde parou</p>
          <p className={styles.continueTitle}>{currentModule.title}</p>
          <ProgressBar percent={currentModule.progressPercent} label={`${currentModule.progressPercent}% concluído`} />
          <p className={styles.continueCta}>
            Continuar <ChevronRightIcon size={14} />
          </p>
        </button>
      )}

      <div className={styles.quickNav}>
        <button className={`${pageStyles.card} ${styles.quickNavCard}`} onClick={() => navigate('/app/questoes')}>
          <span className={styles.quickNavIcon}><ClipboardIcon size={22} /></span>
          <span className={styles.quickNavLabel}>Responder questões</span>
        </button>
        <button className={`${pageStyles.card} ${styles.quickNavCard}`} onClick={() => navigate('/app/simulados')}>
          <span className={styles.quickNavIcon}><ClockIcon size={22} /></span>
          <span className={styles.quickNavLabel}>Fazer simulado</span>
        </button>
      </div>

      {tip && (
        <div className={styles.tipCard}>
          <p className={styles.tipLabel}>Dica do dia</p>
          <p className={styles.tipTitle}>{tip.title}</p>
          <p className={styles.tipContent}>{tip.content}</p>
        </div>
      )}
    </div>
  );
}
