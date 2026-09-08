import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiQuery } from '../../hooks/useApiQuery';
import { questionApi, type QuestionFilters } from '../../services/questionApi';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import pageStyles from './Page.module.css';
import styles from './Questions.module.css';

const diffClass: Record<string, string> = {
  FACIL: styles.diffFacil,
  MEDIO: styles.diffMedio,
  DIFICIL: styles.diffDificil,
};

export function QuestionsPage() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);

  const { data: subjects } = useApiQuery(() => questionApi.getSubjects(), []);

  const filters: QuestionFilters = { page, pageSize: 10 };
  if (subject) filters.subject = subject;
  if (difficulty) filters.difficulty = difficulty as QuestionFilters['difficulty'];

  const { data, error, isLoading } = useApiQuery(() => questionApi.list(filters), [subject, difficulty, page]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / 10)) : 1;

  function updateFilter(setter: (v: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.pageHeader}>
        <h1 className={pageStyles.pageTitle}>Questões</h1>
        <p className={pageStyles.pageSubtitle}>Pratique com questões de provas anteriores, filtradas por disciplina e dificuldade.</p>
      </div>

      <div className={styles.filters}>
        <select className={styles.select} value={subject} onChange={(e) => updateFilter(setSubject, e.target.value)}>
          <option value="">Todas as disciplinas</option>
          {subjects?.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className={styles.select} value={difficulty} onChange={(e) => updateFilter(setDifficulty, e.target.value)}>
          <option value="">Todas as dificuldades</option>
          <option value="FACIL">Fácil</option>
          <option value="MEDIO">Médio</option>
          <option value="DIFICIL">Difícil</option>
        </select>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={pageStyles.skeleton} style={{ height: 76 }} />
          ))}
        </div>
      )}

      {!isLoading && data && data.rows.length === 0 && (
        <div className={pageStyles.emptyState}>Nenhuma questão encontrada com esses filtros.</div>
      )}

      {!isLoading && data && data.rows.length > 0 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.rows.map((q) => (
              <button key={q.id} className={`${pageStyles.card} ${styles.questionRow}`} onClick={() => navigate(`/app/questoes/${q.id}`)}>
                <div className={styles.questionRowTop}>
                  <span className={styles.subjectTag}>{q.subject}</span>
                  <span className={`${styles.difficultyTag} ${diffClass[q.difficulty]}`}>{q.difficulty}</span>
                </div>
                <p className={styles.statement}>{q.statement}</p>
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              <span style={{ alignSelf: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {page} / {totalPages}
              </span>
              <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
