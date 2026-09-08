import { useEffect, useState } from 'react';
import { Alert } from '../../components/ui/Alert';
import { ClockIcon, UserIcon } from '../../components/ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi, type AdminDashboardStats, type AdminUser } from '../../services/adminApi';
import { getErrorMessage } from '../../utils/errors';
import styles from './BackofficePage.module.css';

const initialStats: AdminDashboardStats = { totalStudents: 0, activeStudents: 0, publishedContents: 0, answeredQuestions: 0, averageAccuracyPercent: 0, contentCompletionRatePercent: 0, simulationsTaken: 0, totalUsers: 0, totalMentors: 0, totalAdmins: 0, approvedStudents: 0, basicSubscriptions: 0, lifetimeSubscriptions: 0, expiredSubscriptions: 0, database: { databaseName: '', databaseSize: '', userRecords: 0, courseRecords: 0, questionRecords: 0, simulationRecords: 0 } };

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(initialStats);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([adminApi.getDashboard(), adminApi.listUsers(search)])
      .then(([dashboard, result]) => { if (!cancelled) { setStats(dashboard); setUsers(result.rows); setTotalUsers(result.total); } })
      .catch((reason) => { if (!cancelled) setError(getErrorMessage(reason, 'Não foi possível carregar o console administrativo.')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [search]);

  async function toggleStatus(target: AdminUser) {
    try {
      const updated = await adminApi.updateUserStatus(target.id, target.status === 'ATIVO' ? 'INATIVO' : 'ATIVO');
      setUsers((current) => current.map((item) => item.id === updated.id ? { ...item, status: updated.status } : item));
    } catch (reason) { setError(getErrorMessage(reason, 'Não foi possível atualizar o status.')); }
  }

  async function changeRole(target: AdminUser, role: AdminUser['role']) {
    try {
      const updated = await adminApi.updateUserRole(target.id, role);
      setUsers((current) => current.map((item) => item.id === updated.id ? { ...item, role: updated.role } : item));
    } catch (reason) { setError(getErrorMessage(reason, 'Não foi possível atualizar o perfil.')); }
  }

  async function toggleApproval(target: AdminUser) {
    try {
      const updated = await adminApi.updateUserApproval(target.id, !target.approved);
      setUsers((current) => current.map((item) => item.id === updated.id ? { ...item, approved: updated.approved, approvedAt: updated.approvedAt, accessExpiresAt: updated.accessExpiresAt } : item));
    } catch (reason) { setError(getErrorMessage(reason, 'Não foi possível atualizar a aprovação.')); }
  }

  const cards = [
    { label: 'Usuários na base', value: stats.totalUsers, note: `${stats.activeStudents} alunos ativos`, icon: UserIcon },
    { label: 'Aprovados', value: stats.approvedStudents, note: 'Alunos marcados como aprovados', icon: UserIcon },
    { label: 'Planos ativos', value: stats.basicSubscriptions + stats.lifetimeSubscriptions, note: `${stats.expiredSubscriptions} expirados`, icon: ClockIcon },
    { label: 'Professores e admins', value: stats.totalMentors + stats.totalAdmins, note: `${stats.totalMentors} professores · ${stats.totalAdmins} admins`, icon: UserIcon },
  ];

  return <div className={styles.page}>
    <p className={styles.eyebrow}>Administração</p>
    <h1 className={styles.heading}>Bom dia, {user?.name.split(' ')[0]}.</h1>
    <p className={styles.intro}>Controle usuários, permissões, assinaturas e a saúde da base de dados.</p>
    {error && <div className={styles.error}><Alert type="error">{error}</Alert></div>}
    <div className={styles.stats}>{loading ? cards.map((card) => <div className={styles.skeleton} key={card.label} />) : cards.map(({ label, value, note, icon: Icon }) => <div className={styles.stat} key={label}><p className={styles.statLabel}><Icon size={15} /> {label}</p><p className={styles.statValue}>{value.toLocaleString('pt-BR')}</p><p className={styles.statNote}>{note}</p></div>)}</div>
    <div className={styles.columns}>
      <section className={styles.panel}>
        <div className={styles.panelHeader}><div><h2 className={styles.panelTitle}>Pessoas na plataforma</h2><p className={styles.panelMeta}>{totalUsers} usuários encontrados</p></div><input className={styles.search} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar nome ou email" aria-label="Buscar usuário" /></div>
        {users.length === 0 ? <div className={styles.empty}>Nenhum usuário encontrado.</div> : <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Usuário</th><th>Perfil</th><th>Plano</th><th>Aprovação</th><th>Status</th><th>Ação</th></tr></thead><tbody>{users.map((target) => <tr key={target.id}><td><div className={styles.person}><strong>{target.name}</strong><span>{target.email}</span></div></td><td><select className={styles.role} value={target.role} onChange={(event) => changeRole(target, event.target.value as AdminUser['role'])} aria-label={`Perfil de ${target.name}`}><option value="ALUNO">Aluno</option><option value="MENTOR">Professor</option><option value="ADMIN">Admin</option></select></td><td>{target.subscriptionPlan === 'VITALICIO' ? 'Vitalício' : target.subscriptionPlan === 'BASICO' ? 'Básico' : 'Sem plano'}</td><td><button className={`${styles.badge} ${target.approved ? styles.activeBadge : styles.inactiveBadge}`} onClick={() => toggleApproval(target)}>{target.approved ? 'Aprovado' : 'Pendente'}</button>{target.approved && target.accessExpiresAt && <small>{new Date(target.accessExpiresAt).toLocaleDateString('pt-BR')}</small>}</td><td><span className={`${styles.badge} ${target.status === 'ATIVO' ? styles.activeBadge : styles.inactiveBadge}`}>{target.status === 'ATIVO' ? 'Ativo' : 'Inativo'}</span></td><td><button className={styles.linkButton} onClick={() => toggleStatus(target)}>{target.status === 'ATIVO' ? 'Desativar' : 'Ativar'}</button></td></tr>)}</tbody></table></div>}
      </section>
      <section className={styles.panel}><div className={styles.panelHeader}><div><h2 className={styles.panelTitle}>Saúde da jornada</h2><p className={styles.panelMeta}>Indicadores de aprendizagem</p></div></div><div className={styles.metric}><div className={styles.metricRow}><span>Precisão média</span><strong className={styles.metricValue}>{stats.averageAccuracyPercent}%</strong></div><div className={styles.meter}><div className={styles.meterFill} style={{ width: `${Math.min(stats.averageAccuracyPercent, 100)}%` }} /></div></div><div className={styles.metric}><div className={styles.metricRow}><span>Conclusão de conteúdos</span><strong className={styles.metricValue}>{stats.contentCompletionRatePercent}%</strong></div><div className={styles.meter}><div className={styles.meterFill} style={{ width: `${Math.min(stats.contentCompletionRatePercent, 100)}%`, background: 'var(--color-accent)' }} /></div></div><div className={styles.callout}><p>Use os indicadores para identificar onde a experiência do aluno precisa de atenção.</p></div></section>
    </div>
    <section className={styles.panel}><div className={styles.panelHeader}><div><h2 className={styles.panelTitle}>Resumo do banco de dados</h2><p className={styles.panelMeta}>{stats.database.databaseName} · {stats.database.databaseSize}</p></div></div><div className={styles.metric}><div className={styles.metricRow}><span>Registros de usuários</span><strong className={styles.metricValue}>{stats.database.userRecords}</strong></div></div><div className={styles.metric}><div className={styles.metricRow}><span>Cursos cadastrados</span><strong className={styles.metricValue}>{stats.database.courseRecords}</strong></div></div><div className={styles.metric}><div className={styles.metricRow}><span>Questões cadastradas</span><strong className={styles.metricValue}>{stats.database.questionRecords}</strong></div></div><div className={styles.metric}><div className={styles.metricRow}><span>Simulados realizados</span><strong className={styles.metricValue}>{stats.database.simulationRecords}</strong></div></div><div className={styles.callout}><p>Planos Básicos: {stats.basicSubscriptions} · Vitalícios: {stats.lifetimeSubscriptions}.</p></div></section>
  </div>;
}