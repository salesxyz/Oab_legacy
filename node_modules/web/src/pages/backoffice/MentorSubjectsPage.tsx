import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../components/ui/Alert';
import { BookIcon } from '../../components/ui/icons';
import { managementApi, type ModuleSummary } from '../../services/managementApi';
import type { Course } from '../../types/student';
import { getErrorMessage } from '../../utils/errors';
import styles from './BackofficePage.module.css';

export function MentorSubjectsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadCourses() {
    const items = await managementApi.listCourses();
    setCourses(items);
    setSelectedCourse((current) => current || items[0]?.id || '');
  }

  useEffect(() => {
    loadCourses().catch((reason) => setError(getErrorMessage(reason, 'Não foi possível carregar as matérias.'))).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    managementApi.listModules(selectedCourse).then(setModules).catch((reason) => setError(getErrorMessage(reason, 'Não foi possível carregar os módulos.')));
  }, [selectedCourse]);

  async function createCourse(event: FormEvent) {
    event.preventDefault();
    if (!courseTitle.trim()) return;
    setSaving(true); setError(null); setMessage(null);
    try { const course = await managementApi.createCourse({ title: courseTitle.trim(), description: '', status: 'RASCUNHO' }); setCourseTitle(''); await loadCourses(); setSelectedCourse(course.id); setMessage('Matéria criada como rascunho.'); }
    catch (reason) { setError(getErrorMessage(reason, 'Não foi possível criar a matéria.')); }
    finally { setSaving(false); }
  }

  async function createModule(event: FormEvent) {
    event.preventDefault();
    if (!selectedCourse || !moduleTitle.trim()) return;
    setSaving(true); setError(null); setMessage(null);
    try { await managementApi.createModule({ courseId: selectedCourse, title: moduleTitle.trim() }); setModuleTitle(''); setModules(await managementApi.listModules(selectedCourse)); setMessage('Módulo criado com sucesso.'); }
    catch (reason) { setError(getErrorMessage(reason, 'Não foi possível criar o módulo.')); }
    finally { setSaving(false); }
  }

  return <div className={styles.page}>
    <p className={styles.eyebrow}>Conteúdo pedagógico</p>
    <h1 className={styles.heading}>Matérias e módulos</h1>
    <p className={styles.intro}>Organize as matérias da preparação e estruture os módulos das aulas.</p>
    {error && <div className={styles.error}><Alert type="error">{error}</Alert></div>}
    {message && <div className={styles.success}>{message}</div>}
    {loading ? <section className={styles.panel}><div className={styles.empty}>Carregando matérias...</div></section> : <>
      <section className={styles.panel}><div className={styles.panelHeader}><div><h2 className={styles.panelTitle}>Adicionar matéria</h2><p className={styles.panelMeta}>Crie a disciplina como rascunho para organizar as aulas.</p></div><BookIcon /></div><form className={styles.form} onSubmit={createCourse}><label className={styles.field}>Nome da matéria<input className={styles.input} value={courseTitle} onChange={(event) => setCourseTitle(event.target.value)} placeholder="Ex.: Direito Constitucional" /></label><button className={styles.primaryButton} disabled={saving}>{saving ? 'Salvando...' : 'Criar matéria'}</button></form></section>
      <section className={styles.panel}><div className={styles.panelHeader}><div><h2 className={styles.panelTitle}>Adicionar módulo</h2><p className={styles.panelMeta}>Escolha uma matéria e crie uma nova etapa de estudo.</p></div></div><form className={styles.form} onSubmit={createModule}><label className={styles.field}>Matéria<select className={styles.select} value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)}><option value="">Selecione uma matéria</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label><label className={styles.field}>Nome do módulo<input className={styles.input} value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} placeholder="Ex.: Princípios fundamentais" /></label><button className={styles.primaryButton} disabled={saving || !selectedCourse}>{saving ? 'Salvando...' : 'Criar módulo'}</button></form>{selectedCourse && <div className={styles.list}>{modules.map((module) => <div className={styles.listRow} key={module.id}><div><p className={styles.rowTitle}>{module.title}</p><p className={styles.rowMeta}>{module.totalContents} aulas cadastradas</p></div></div>)}</div>}</section>
      <section className={styles.panel}><div className={styles.callout}><p>Depois de criar a matéria e o módulo, use a área de aulas para enviar a videoaula.</p><Link className={styles.linkButton} to="/professor/aulas">Adicionar videoaula</Link></div></section>
    </>}
  </div>;
}
