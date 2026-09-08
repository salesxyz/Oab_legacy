import { useEffect, useState } from 'react';
import { ClipboardIcon, UserIcon } from '../../components/ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { mentorApi } from '../../services/mentorApi';
import type { AdminUser } from '../../services/adminApi';
import styles from './BackofficePage.module.css';

export function ProfessorDashboardPage() {
  const { user } = useAuth();
  const [studentCount, setStudentCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<AdminUser[]>([]);
  useEffect(() => {
    mentorApi.listStudents().then((studentList) => { setStudents(studentList.rows); setStudentCount(studentList.total); setApprovedCount(studentList.rows.filter((student) => student.approved).length); setActiveCount(studentList.rows.filter((student) => student.status === 'ATIVO').length); setPendingCount(studentList.rows.filter((student) => !student.approved).length); }).catch(() => undefined).finally(() => setLoading(false));
  }, []);
  return <div className={styles.page}>
    <p className={styles.eyebrow}>Docência</p>
    <h1 className={styles.heading}>Olá, {user?.name.split(' ')[0]}.</h1>
    <p className={styles.intro}>Acompanhe a evolução dos alunos, os acessos e as aprovações da sua turma.</p>
    <div className={styles.stats}>
      <div className={styles.stat}><p className={styles.statLabel}><UserIcon size={15} /> Alunos acompanhados</p><p className={styles.statValue}>{loading ? '—' : studentCount}</p><p className={styles.statNote}>{activeCount} com acesso ativo</p></div>
      <div className={styles.stat}><p className={styles.statLabel}><ClipboardIcon size={15} /> Aprovados</p><p className={styles.statValue}>{loading ? '—' : approvedCount}</p><p className={styles.statNote}>Resultados confirmados</p></div>
      <div className={styles.stat}><p className={styles.statLabel}>Em preparação</p><p className={styles.statValue}>{loading ? '—' : pendingCount}</p><p className={styles.statNote}>Alunos que precisam de acompanhamento</p></div>
      <div className={styles.stat}><p className={styles.statLabel}>Foco do papel</p><p className={styles.statValue}>Alunos</p><p className={styles.statNote}>Acompanhamento pedagógico</p></div>
    </div>
    <div className={styles.columns}>
      <section className={styles.panel}><div className={styles.panelHeader}><div><h2 className={styles.panelTitle}>Próximos focos</h2><p className={styles.panelMeta}>Ações de acompanhamento</p></div></div><div className={styles.metric}><div className={styles.metricRow}><span>Alunos em preparação</span><strong className={styles.metricValue}>{pendingCount}</strong></div></div><div className={styles.metric}><div className={styles.metricRow}><span>Aprovações confirmadas</span><strong className={styles.metricValue}>{approvedCount}</strong></div></div><div className={styles.callout}><p>Use a área de alunos para consultar plano, validade e status de cada pessoa.</p></div></section>
    </div>
    <section className={styles.panel}><div className={styles.panelHeader}><div><h2 className={styles.panelTitle}>Acompanhamento dos alunos</h2><p className={styles.panelMeta}>{students.length} alunos na base</p></div></div>{students.length === 0 ? <div className={styles.empty}>Nenhum aluno cadastrado.</div> : students.map((student) => <div className={styles.metric} key={student.id}><div className={styles.metricRow}><strong>{student.name}</strong><span className={`${styles.badge} ${student.approved ? styles.activeBadge : styles.inactiveBadge}`}>{student.approved ? 'Aprovado' : 'Em preparação'}</span></div><p className={styles.panelMeta}>{student.subscriptionPlan === 'VITALICIO' ? 'Vitalício' : student.subscriptionPlan === 'BASICO' ? 'Básico' : 'Sem plano'}{student.accessExpiresAt ? ` · acesso até ${new Date(student.accessExpiresAt).toLocaleDateString('pt-BR')}` : ''}</p></div>)}</section>
  </div>;
}