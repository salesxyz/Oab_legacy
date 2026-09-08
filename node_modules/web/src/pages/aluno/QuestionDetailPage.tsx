import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApiQuery } from '../../hooks/useApiQuery';
import { questionApi } from '../../services/questionApi';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { getErrorMessage } from '../../utils/errors';
import type { AnswerResult } from '../../types/student';
import pageStyles from './Page.module.css';
import styles from './Questions.module.css';

const diffClass: Record<string, string> = {
  FACIL: styles.diffFacil,
  MEDIO: styles.diffMedio,
  DIFICIL: styles.diffDificil,
};

export function QuestionDetailPage() {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const { data: question, error, isLoading } = useApiQuery(() => questionApi.get(questionId!), [questionId]);

  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [startTime] = useState(() => Date.now());

  async function submit(alternativeId: string) {
    if (!questionId || result) return;
    setSelected(alternativeId);
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await questionApi.answer(questionId, alternativeId, Date.now() - startTime);
      setResult(res);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      setSelected(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.breadcrumb}>
        <a onClick={() => navigate('/app/questoes')} style={{ cursor: 'pointer' }}>Voltar às questões</a>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {isLoading && <div className={pageStyles.skeleton} style={{ height: 240 }} />}

      {question && (
        <div className={pageStyles.card}>
          <div className={styles.questionRowTop}>
            <span className={styles.subjectTag}>{question.subject}</span>
            <span className={`${styles.difficultyTag} ${diffClass[question.difficulty]}`}>{question.difficulty}</span>
          </div>
          <p className={styles.statement} style={{ fontSize: 'var(--text-base)', fontWeight: 500, color: 'var(--color-primary)' }}>
            {question.statement}
          </p>

          {submitError && <Alert type="error">{submitError}</Alert>}

          <div className={styles.options}>
            {question.alternatives.map((alt) => {
              let cls = styles.option;
              if (result) {
                if (alt.id === result.correctAlternativeId) cls = `${styles.option} ${styles.optionCorrect}`;
                else if (alt.id === selected) cls = `${styles.option} ${styles.optionWrong}`;
              }
              return (
                <button key={alt.id} className={cls} onClick={() => submit(alt.id)} disabled={submitting || Boolean(result)}>
                  {alt.text}
                </button>
              );
            })}
          </div>

          {result && (
            <div className={`${styles.feedback} ${result.correct ? styles.feedbackCorrect : styles.feedbackWrong}`}>
              <p className={`${styles.feedbackTitle} ${result.correct ? styles.feedbackTitleCorrect : styles.feedbackTitleWrong}`}>
                {result.correct ? `🟢 Resposta correta! +${result.xpGained} XP` : '🔴 Resposta incorreta'}
              </p>
              {result.explanation && <p className={styles.feedbackExplanation}>{result.explanation}</p>}
              <Button onClick={() => navigate('/app/questoes')}>Próxima questão</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
