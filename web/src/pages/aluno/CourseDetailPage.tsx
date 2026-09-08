import { useNavigate, useParams } from 'react-router-dom';
import { useApiQuery } from '../../hooks/useApiQuery';
import { courseApi } from '../../services/courseApi';
import { Alert } from '../../components/ui/Alert';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { CheckCircleIcon, CircleDotIcon, LockIcon } from '../../components/ui/icons';
import pageStyles from './Page.module.css';
import listStyles from './CourseList.module.css';

/**
 * Determina o status visual de cada módulo (concluído / atual / bloqueado).
 * O backend não impõe bloqueio sequencial — isso é uma escolha de exibição
 * do frontend, seguindo o conceito de "mapa de aprendizado" do produto.
 */
function withStatus<T extends { progressPercent: number }>(modules: T[]) {
  let unlockedFound = false;
  return modules.map((m) => {
    if (m.progressPercent >= 100) return { ...m, status: 'done' as const };
    if (!unlockedFound) {
      unlockedFound = true;
      return { ...m, status: 'current' as const };
    }
    return { ...m, status: 'locked' as const };
  });
}

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { data: course } = useApiQuery(() => courseApi.getCourse(courseId!), [courseId]);
  const { data: modules, error, isLoading } = useApiQuery(() => courseApi.listModules(courseId!), [courseId]);

  const withStatuses = modules ? withStatus(modules) : [];

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.breadcrumb}>
        <a onClick={() => navigate('/app/cursos')} style={{ cursor: 'pointer' }}>Meus cursos</a>
      </div>

      <div className={pageStyles.pageHeader}>
        <h1 className={pageStyles.pageTitle}>{course?.title ?? 'Carregando...'}</h1>
        {course?.description && <p className={pageStyles.pageSubtitle}>{course.description}</p>}
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {isLoading && (
        <div className={listStyles.list}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={pageStyles.skeleton} style={{ height: 72 }} />
          ))}
        </div>
      )}

      {!isLoading && withStatuses.length === 0 && !error && (
        <div className={pageStyles.emptyState}>Este curso ainda não tem módulos publicados.</div>
      )}

      <div className={listStyles.list}>
        {withStatuses.map((m) => (
          <button
            key={m.id}
            className={listStyles.item}
            disabled={m.status === 'locked'}
            style={{ opacity: m.status === 'locked' ? 0.6 : 1, cursor: m.status === 'locked' ? 'default' : 'pointer' }}
            onClick={() => m.status !== 'locked' && navigate(`/app/cursos/${courseId}/modulos/${m.id}`)}
          >
            <span
              className={`${listStyles.itemIcon} ${
                m.status === 'done' ? listStyles.iconDone : m.status === 'current' ? listStyles.iconCurrent : listStyles.iconLocked
              }`}
            >
              {m.status === 'done' && <CheckCircleIcon size={18} />}
              {m.status === 'current' && <CircleDotIcon size={18} />}
              {m.status === 'locked' && <LockIcon size={16} />}
            </span>
            <span className={listStyles.itemBody}>
              <p className={`${listStyles.itemTitle} ${m.status === 'locked' ? listStyles.itemTitleLocked : ''}`}>{m.title}</p>
              <p className={listStyles.itemMeta}>
                {m.completedContents}/{m.totalContents} conteúdos concluídos
              </p>
              <ProgressBar percent={m.progressPercent} label={`${m.progressPercent}% concluído`} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
