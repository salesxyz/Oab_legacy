import { useNavigate } from 'react-router-dom';
import { useApiQuery } from '../../hooks/useApiQuery';
import { courseApi } from '../../services/courseApi';
import { Alert } from '../../components/ui/Alert';
import pageStyles from './Page.module.css';
import listStyles from './CourseList.module.css';

export function CoursesPage() {
  const navigate = useNavigate();
  const { data: courses, error, isLoading } = useApiQuery(() => courseApi.listCourses());

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.pageHeader}>
        <h1 className={pageStyles.pageTitle}>Meus cursos</h1>
        <p className={pageStyles.pageSubtitle}>Escolha um curso para ver os módulos e continuar seus estudos.</p>
      </div>

      {error && (
        <Alert type="error">
          {error}{' '}
        </Alert>
      )}

      {isLoading && (
        <div className={listStyles.list}>
          {[0, 1].map((i) => (
            <div key={i} className={pageStyles.skeleton} style={{ height: 96 }} />
          ))}
        </div>
      )}

      {!isLoading && !error && courses && courses.length === 0 && (
        <div className={pageStyles.emptyState}>Nenhum curso disponível no momento.</div>
      )}

      {!isLoading && courses && courses.length > 0 && (
        <div className={listStyles.list}>
          {courses.map((course) => (
            <button
              key={course.id}
              className={`${pageStyles.card} ${listStyles.courseCard}`}
              onClick={() => navigate(`/app/cursos/${course.id}`)}
            >
              <p className={listStyles.courseTitle}>{course.title}</p>
              <span className={listStyles.coursePhase}>
                {course.phase === 'PRATICO_PROFISSIONAL' ? '2ª fase · Prático-profissional' : '1ª fase · Objetiva'}
              </span>
              {course.description && <p className={listStyles.courseDescription}>{course.description}</p>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
