import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApiQuery } from '../../hooks/useApiQuery';
import { courseApi } from '../../services/courseApi';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { getErrorMessage } from '../../utils/errors';
import pageStyles from './Page.module.css';
import listStyles from './CourseList.module.css';

export function ContentPage() {
  const { courseId, moduleId, contentId } = useParams<{ courseId: string; moduleId: string; contentId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: content, error, isLoading } = useApiQuery(() => courseApi.getContent(contentId!), [contentId]);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  async function markComplete() {
    if (!contentId) return;
    setCompleting(true);
    try {
      await courseApi.markProgress(contentId, 100);
      setCompleted(true);
      showToast('Conteúdo concluído! XP adicionado.', 'success');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setCompleting(false);
    }
  }

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.breadcrumb}>
        <a onClick={() => navigate(`/app/cursos/${courseId}/modulos/${moduleId}`)} style={{ cursor: 'pointer' }}>
          Voltar ao módulo
        </a>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {isLoading && <div className={pageStyles.skeleton} style={{ height: 220 }} />}

      {content && (
        <>
          <div className={pageStyles.pageHeader}>
            <h1 className={pageStyles.pageTitle}>{content.title}</h1>
            {content.description && <p className={pageStyles.pageSubtitle}>{content.description}</p>}
          </div>

          <div className={pageStyles.card}>
            {content.type === 'VIDEO' && content.videoUrl && (
              <p className={listStyles.contentBody}>
                🎬 Videoaula disponível em: <a href={content.videoUrl} target="_blank" rel="noreferrer">{content.videoUrl}</a>
              </p>
            )}
            {content.body && <p className={listStyles.contentBody}>{content.body}</p>}
            {content.materialUrl && (
              <p className={listStyles.contentBody} style={{ marginTop: 12 }}>
                📄 Material complementar: <a href={content.materialUrl} target="_blank" rel="noreferrer">{content.materialUrl}</a>
              </p>
            )}
          </div>

          <div className={listStyles.contentActions}>
            <Button onClick={markComplete} loading={completing} disabled={completed}>
              {completed ? 'Concluído ✓' : 'Marcar como concluída'}
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/app/cursos/${courseId}/modulos/${moduleId}`)}>
              Voltar ao módulo
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
