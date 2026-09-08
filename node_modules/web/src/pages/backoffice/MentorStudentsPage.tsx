import { useEffect, useState } from 'react';
import { Alert } from '../../components/ui/Alert';
import { BookIcon, ClockIcon, UserIcon } from '../../components/ui/icons';
import { mentorApi } from '../../services/mentorApi';
import type { MentorStudent } from '../../services/mentorApi';
import { getErrorMessage } from '../../utils/errors';
import styles from './BackofficePage.module.css';

function formatActivity(date: string | null) {
  if (!date) return 'Ainda não iniciou';
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
}

export function MentorStudentsPage() {
  const [students, setStudents] = useState<MentorStudent[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    mentorApi.listStudents(search)
      .then((result) => { if (!cancelled) setStudents(result.rows); })
      .catch((reason) => { if (!cancelled) setError(getErrorMessage(reason, 'Não foi possível carregar os alunos.')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [search]);

  return <div className={styles.page}>
    <p className={styles.eyebrow}>Acompanhamento</p>
    <h1 className={styles.heading}>Alunos</h1>
    <p className={styles.intro}>Veja o avanço e o desempenho de cada aluno em todos os módulos.</p>
    {error && <div className={styles.error}><Alert type="error">{error}</Alert></div>}
    <section className={styles.panel}>
      <div className={styles.panelHeader}><div><h2 className={styles.panelTitle}>Andamento por módulo</h2><p className={styles.panelMeta}>{students.length} alunos encontrados</p></div><input className={styles.search} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar aluno" aria-label="Buscar aluno" /></div>
      {loading ? <div className={styles.empty}>Carregando andamento...</div> : students.length === 0 ? <div className={styles.empty}>Nenhum aluno encontrado.</div> : <div className={styles.studentList}>{students.map((student) => <article className={styles.studentProgress} key={student.id}>
        <div className={styles.studentHeader}><div className={styles.person}><strong>{student.name}</strong><span>{student.email}</span></div><span className={`${styles.badge} ${student.status === 'ATIVO' ? styles.activeBadge : styles.inactiveBadge}`}>{student.status === 'ATIVO' ? 'Ativo' : 'Inativo'}</span></div>
        <div className={styles.moduleHeader}><span><BookIcon size={14} /> Módulo</span><span>Progresso</span><span>Acerto</span><span>Última atividade</span></div>
        {student.modules.length === 0 ? <div className={styles.moduleEmpty}>Nenhum módulo publicado.</div> : student.modules.map((module) => <div className={styles.moduleRow} key={module.id}>
          <div className={styles.moduleName}><strong>{module.title}</strong><span>{module.completedContents} de {module.totalContents} conteúdos concluídos</span></div>
          <div className={styles.progressCell}><div className={styles.progressTrack}><div className={styles.progressFill} style={{ width: `${module.progressPercent}%` }} /></div><strong>{module.progressPercent}%</strong></div>
          <strong className={styles.accuracy}>{module.accuracyPercent === null ? '—' : `${module.accuracyPercent}%`}</strong>
          <span className={styles.activity}><ClockIcon size={13} /> {formatActivity(module.lastActivityAt)}</span>
        </div>)}
      </article>)}</div>}
    </section>
    <section className={styles.panel}><div className={styles.panelHeader}><div><h2 className={styles.panelTitle}>Escopo do mentor</h2><p className={styles.panelMeta}><UserIcon size={15} /> Acompanhamento pedagógico</p></div></div><div className={styles.callout}><p>O mentor consulta a jornada dos alunos e acompanha aprovações. Alterações de acesso, papéis e dados administrativos ficam sob responsabilidade do administrador.</p></div></section>
  </div>;
}
