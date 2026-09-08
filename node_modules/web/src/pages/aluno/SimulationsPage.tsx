import { useNavigate } from 'react-router-dom';
import { useApiQuery } from '../../hooks/useApiQuery';
import { simulationApi } from '../../services/simulationApi';
import { Alert } from '../../components/ui/Alert';
import { ClockIcon } from '../../components/ui/icons';
import pageStyles from './Page.module.css';
import styles from './Simulations.module.css';

export function SimulationsPage() {
  const navigate = useNavigate();
  const { data: simulations, error, isLoading } = useApiQuery(() => simulationApi.list());

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.pageHeader}>
        <h1 className={pageStyles.pageTitle}>Simulados</h1>
        <p className={pageStyles.pageSubtitle}>Teste seu desempenho em condições reais de prova.</p>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {isLoading && (
        <>
          {[0, 1].map((i) => (
            <div key={i} className={pageStyles.skeleton} style={{ height: 88, marginBottom: 12 }} />
          ))}
        </>
      )}

      {!isLoading && simulations && simulations.length === 0 && (
        <div className={pageStyles.emptyState}>Nenhum simulado disponível no momento.</div>
      )}

      {simulations?.map((sim) => (
        <button
          key={sim.id}
          className={`${pageStyles.card} ${styles.simCard}`}
          onClick={() => navigate(`/app/simulados/${sim.id}`)}
        >
          <p className={styles.simTitle}>{sim.title}</p>
          {sim.description && <p className={styles.simMeta} style={{ marginBottom: 6 }}>{sim.description}</p>}
          <p className={styles.simMeta} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ClockIcon size={13} /> {sim.questionCount} questões · {sim.timeLimitMinutes} minutos
          </p>
        </button>
      ))}
    </div>
  );
}
