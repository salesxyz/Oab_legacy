import { useNavigate, useParams } from 'react-router-dom';
import { useApiQuery } from '../../hooks/useApiQuery';
import { courseApi } from '../../services/courseApi';
import { profileApi } from '../../services/profileApi';
import { Alert } from '../../components/ui/Alert';
import { BookIcon, CheckCircleIcon } from '../../components/ui/icons';
import pageStyles from './Page.module.css';
import listStyles from './CourseList.module.css';

const typeLabel: Record<string, string> = {
  VIDEO: 'Videoaula',
  TEXTO: 'Leitura',
  PDF: 'Material em PDF',
  QUIZ: 'Quiz',
};

export function ModulePage() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const navigate = useNavigate();

  const { data: contents, error, isLoading } = useApiQuery(() => courseApi.listContents(moduleId!), [moduleId]);
  const { data: progress } = useApiQuery(() => profileApi.getProgress(), []);

  const completedIds = new Set((progress ?? []).filter((p) => p.completed).map((p) => p.contentId));

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.breadcrumb}>
        <a onClick={() => navigate('/app/cursos')} style={{ cursor: 'pointer' }}>Meus cursos</a>
        <span>/</span>
        <a onClick={() => navigate(`/app/cursos/${courseId}`)} style={{ cursor: 'pointer' }}>Módulos</a>
      </div>

      <div className={pageStyles.pageHeader}>
        <h1 className={pageStyles.pageTitle}>Conteúdos do módulo</h1>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {isLoading && (
        <div className={listStyles.list}>
          {[0, 1].map((i) => (
            <div key={i} className={pageStyles.skeleton} style={{ height: 64 }} />
          ))}
        </div>
      )}

      {!isLoading && contents && contents.length === 0 && (
        <div className={pageStyles.emptyState}>Este módulo ainda não tem conteúdos publicados.</div>
      )}

      <div className={listStyles.list}>
        {contents?.map((content) => {
          const done = completedIds.has(content.id);
          return (
            <button
              key={content.id}
              className={listStyles.item}
              onClick={() => navigate(`/app/cursos/${courseId}/modulos/${moduleId}/conteudos/${content.id}`)}
            >
              <span className={`${listStyles.itemIcon} ${done ? listStyles.iconDone : listStyles.iconCurrent}`}>
                {done ? <CheckCircleIcon size={18} /> : <BookIcon size={18} />}
              </span>
              <span className={listStyles.itemBody}>
                <p className={listStyles.itemTitle}>{content.title}</p>
                <p className={listStyles.itemMeta}>{typeLabel[content.type] ?? content.type}</p>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
