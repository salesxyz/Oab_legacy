import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { simulationApi } from '../../services/simulationApi';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { ClockIcon } from '../../components/ui/icons';
import { getErrorMessage } from '../../utils/errors';
import type { SimulationFinishResult, SimulationStartResponse } from '../../types/student';
import pageStyles from './Page.module.css';
import styles from './Simulations.module.css';

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type Stage = 'intro' | 'loading' | 'running' | 'finishing' | 'result';

export function SimulationRunnerPage() {
  const { simulationId } = useParams<{ simulationId: string }>();
  const navigate = useNavigate();

  const [stage, setStage] = useState<Stage>('intro');
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SimulationStartResponse | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [result, setResult] = useState<SimulationFinishResult | null>(null);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    if (stage !== 'running' || secondsLeft <= 0) return;
    const timer = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [stage, secondsLeft]);

  useEffect(() => {
    if (stage === 'running' && secondsLeft === 0) {
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, stage]);

  async function start() {
    if (!simulationId) return;
    setStage('loading');
    setError(null);
    try {
      const data = await simulationApi.start(simulationId);
      setSession(data);
      setSecondsLeft(data.simulation.timeLimitMinutes * 60);
      startedAtRef.current = Date.now();
      setStage('running');
    } catch (err) {
      setError(getErrorMessage(err));
      setStage('intro');
    }
  }

  async function finish() {
    if (!simulationId || !session) return;
    setStage('finishing');
    try {
      const answerList = Object.entries(answers).map(([questionId, alternativeId]) => ({ questionId, alternativeId }));
      const timeSpentSeconds = Math.round((Date.now() - startedAtRef.current) / 1000);
      const res = await simulationApi.finish(simulationId, answerList, timeSpentSeconds);
      setResult(res);
      setStage('result');
    } catch (err) {
      setError(getErrorMessage(err));
      setStage('running');
    }
  }

  if (stage === 'result' && result) {
    return (
      <div className={pageStyles.page}>
        <div className={`${pageStyles.card} ${styles.resultHero}`}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Resultado do simulado</p>
          <p className={styles.resultScore}>
            {result.result.correctCount}/{result.result.correctCount + result.result.wrongCount}
          </p>
          <p className={styles.resultMeta}>
            {result.result.percent}% de aproveitamento · {formatTime(result.result.timeSpentSeconds)}
          </p>

          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>
              Desempenho por disciplina
            </p>
            {result.performanceBySubject.map((p) => (
              <div key={p.subject} className={styles.performanceRow}>
                <span>{p.subject}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>{p.correct}/{p.total} ({p.percent}%)</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <Button onClick={() => navigate('/app/simulados')} fullWidth>Voltar aos simulados</Button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'running' && session) {
    const question = session.questions[index];
    const selected = answers[question.id];

    return (
      <div className={pageStyles.page}>
        <div className={styles.timerBar}>
          <span>Questão {index + 1}/{session.questions.length}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ClockIcon size={14} /> {formatTime(secondsLeft)}
          </span>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        <div className={pageStyles.card}>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-primary)', marginBottom: 20 }}>{question.statement}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {question.alternatives.map((alt) => (
              <button
                key={alt.id}
                onClick={() => setAnswers((a) => ({ ...a, [question.id]: alt.id }))}
                style={{
                  textAlign: 'left',
                  padding: 16,
                  borderRadius: 10,
                  border: `1.5px solid ${selected === alt.id ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                  background: selected === alt.id ? '#eff6ff' : 'var(--color-surface)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                {alt.text}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.navRow}>
          <Button variant="secondary" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
            Anterior
          </Button>
          {index < session.questions.length - 1 ? (
            <Button onClick={() => setIndex((i) => i + 1)}>Próxima</Button>
          ) : (
            <Button onClick={finish} loading={stage === ('finishing' as Stage)}>
              Finalizar simulado
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={pageStyles.page}>
      <div className={`${pageStyles.card} ${styles.resultHero}`}>
        <ClockIcon size={28} />
        <p style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-primary)', marginTop: 12 }}>
          Pronto para começar?
        </p>
        <p className={styles.resultMeta}>O cronômetro inicia assim que você clicar em começar.</p>
        {error && <Alert type="error">{error}</Alert>}
        <Button onClick={start} loading={stage === ('loading' as Stage)}>Iniciar simulado</Button>
      </div>
    </div>
  );
}
