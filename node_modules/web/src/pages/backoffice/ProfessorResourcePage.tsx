import { useEffect, useState } from 'react';
import { BookIcon, ClipboardIcon, ClockIcon } from '../../components/ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { courseApi } from '../../services/courseApi';
import { profileApi } from '../../services/profileApi';
import { questionApi } from '../../services/questionApi';
import { simulationApi } from '../../services/simulationApi';
import type { Course, Question, Simulation, SubjectPerformance } from '../../types/student';
import styles from './BackofficePage.module.css';

export type ProfessorResource = 'conteudos' | 'questoes' | 'simulados' | 'desempenho' | 'perfil';
const headings: Record<ProfessorResource, { eyebrow: string; title: string; subtitle: string }> = {
  conteudos: { eyebrow: 'Acervo público', title: 'Meu acervo', subtitle: 'Consulte a trilha de conteúdos disponível para sua preparação.' },
  questoes: { eyebrow: 'Prática', title: 'Banco de questões', subtitle: 'Filtre temas e acompanhe a qualidade da sua prática.' },
  simulados: { eyebrow: 'Provas completas', title: 'Simulados', subtitle: 'Veja as avaliações ativas e seus resultados recentes.' },
  desempenho: { eyebrow: 'Evolução', title: 'Desempenho', subtitle: 'Uma leitura rápida dos seus pontos fortes e próximos focos.' },
  perfil: { eyebrow: 'Conta', title: 'Meu perfil', subtitle: 'Confira os dados do seu acesso à plataforma.' },
};

export function ProfessorResourcePage({ resource }: { resource: ProfessorResource }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [performance, setPerformance] = useState<SubjectPerformance[]>([]);
  const [results, setResults] = useState<Array<{ id: string; percent: number; correctCount: number; createdAt: string }>>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const request = resource === 'conteudos' ? courseApi.listCourses().then(setCourses) : resource === 'questoes' ? questionApi.list({ pageSize: 50 }).then((data) => setQuestions(data.rows)) : resource === 'simulados' ? Promise.all([simulationApi.list(), profileApi.getSimulationHistory()]).then(([items, history]) => { setSimulations(items); setResults(history); }) : resource === 'desempenho' ? profileApi.getProfile().then((data) => setPerformance(data.performanceBySubject || [])) : Promise.resolve();
    request.catch(() => undefined).finally(() => setLoading(false));
  }, [resource]);
  const heading = headings[resource];
  return <div className={styles.page}><p className={styles.eyebrow}>{heading.eyebrow}</p><h1 className={styles.heading}>{heading.title}</h1><p className={styles.intro}>{heading.subtitle}</p>{loading ? <section className={styles.panel}><div className={styles.empty}>Carregando...</div></section> : <>
    {resource === 'conteudos' && <section className={styles.panel}><div className={styles.panelHeader}><div><h2 className={styles.panelTitle}>Cursos publicados</h2><p className={styles.panelMeta}>{courses.length} cursos disponíveis</p></div><BookIcon /></div><div className={styles.list}>{courses.map((course) => <div className={styles.listRow} key={course.id}><div><p className={styles.rowTitle}>{course.title}</p><p className={styles.rowMeta}>{course.description || 'Conteúdo de preparação para a OAB.'}</p></div><span className={`${styles.badge} ${styles.activeBadge}`}>Publicado</span></div>)}</div></section>}
    {resource === 'questoes' && <section className={styles.panel}><div className={styles.panelHeader}><div><h2 className={styles.panelTitle}>Questões disponíveis</h2><p className={styles.panelMeta}>{questions.length} questões encontradas</p></div><ClipboardIcon /></div><div className={styles.list}>{questions.map((question) => <div className={styles.listRow} key={question.id}><div><p className={styles.rowTitle}>{question.subject} · {question.difficulty}</p><p className={styles.rowMeta}>{question.statement}</p></div><a className={styles.linkButton} href="/app/questoes">Praticar</a></div>)}</div></section>}
    {resource === 'simulados' && <section className={styles.panel}><div className={styles.panelHeader}><div><h2 className={styles.panelTitle}>Simulados ativos</h2><p className={styles.panelMeta}>{simulations.length} avaliações disponíveis</p></div><ClockIcon /></div><div className={styles.list}>{simulations.map((simulation) => <div className={styles.listRow} key={simulation.id}><div><p className={styles.rowTitle}>{simulation.title}</p><p className={styles.rowMeta}>{simulation.questionCount} questões · {simulation.timeLimitMinutes} minutos</p></div><a className={styles.linkButton} href="/app/simulados">Iniciar</a></div>)}{results.length > 0 && <><h2 className={styles.panelTitle} style={{ marginTop: 24 }}>Resultados recentes</h2>{results.slice(0, 5).map((result) => <div className={styles.listRow} key={result.id}><div><p className={styles.rowTitle}>{result.correctCount} acertos</p><p className={styles.rowMeta}>{new Date(result.createdAt).toLocaleDateString('pt-BR')}</p></div><strong className={styles.metricValue}>{result.percent}%</strong></div>)}</>}</div></section>}
    {resource === 'desempenho' && <section className={styles.panel}><div className={styles.panelHeader}><div><h2 className={styles.panelTitle}>Precisão por disciplina</h2><p className={styles.panelMeta}>Use este mapa para escolher sua próxima revisão.</p></div></div><div className={styles.list}>{performance.map((item) => <div className={styles.metric} key={item.subject}><div className={styles.metricRow}><span>{item.subject}</span><strong className={styles.metricValue}>{item.percent}%</strong></div><div className={styles.meter}><div className={styles.meterFill} style={{ width: `${item.percent}%` }} /></div><p className={styles.rowMeta}>{item.correct} acertos em {item.total} respostas</p></div>)}</div></section>}
    {resource === 'perfil' && <section className={styles.panel}><div className={styles.profileHeader}><span className={styles.avatar} style={{ width: 58, height: 58 }}>{user?.name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span><div><h2 className={styles.panelTitle}>{user?.name}</h2><p className={styles.panelMeta}>{user?.email}</p></div></div><div className={styles.list}><div className={styles.listRow}><span className={styles.rowMeta}>Perfil de acesso</span><strong className={styles.metricValue}>Professor</strong></div><div className={styles.listRow}><span className={styles.rowMeta}>Status</span><span className={`${styles.badge} ${styles.activeBadge}`}>Ativo</span></div></div><div className={styles.callout}><p>Seu acesso de professor é voltado para acompanhar a experiência de estudo e o próprio desempenho. A autoria de conteúdos ainda é centralizada no administrador.</p></div></section>}
  </>}</div>;
}