import { useEffect, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import { Alert } from '../../components/ui/Alert';
import { BookIcon, ClipboardIcon } from '../../components/ui/icons';
import { managementApi, type ModuleSummary } from '../../services/managementApi';
import type { Course } from '../../types/student';
import { getErrorMessage } from '../../utils/errors';
import styles from './BackofficePage.module.css';

type AuthoringMode = 'conteudos' | 'questoes';
type QuestionDraft = { moduleId: string; subject: string; statement: string; alternatives: string[]; correct: string; examBoard: string; year: string; alternativeA: string; alternativeB: string };

function QuestionAuthoringForm({ question, setQuestion, modules, saving, submitQuestion }: { question: QuestionDraft; setQuestion: Dispatch<SetStateAction<QuestionDraft>>; modules: ModuleSummary[]; saving: boolean; submitQuestion: (event: FormEvent) => Promise<void> }) {
  return <form className={styles.form} onSubmit={submitQuestion}>
    <label className={styles.field}>Módulo<select className={styles.select} value={question.moduleId} onChange={(event) => setQuestion({ ...question, moduleId: event.target.value })}><option value="">Selecione um módulo</option>{modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}</select></label>
    <label className={styles.field}>Disciplina<input className={styles.input} value={question.subject} onChange={(event) => setQuestion({ ...question, subject: event.target.value })} placeholder="Ex.: Direito Constitucional" /></label>
    <label className={styles.field}>Enunciado<textarea className={styles.textarea} value={question.statement} onChange={(event) => setQuestion({ ...question, statement: event.target.value })} /></label>
    <div className={styles.formGrid}>{question.alternatives.map((alternative, index) => <label className={styles.field} key={index}>Alternativa {String.fromCharCode(65 + index)}<input className={styles.input} value={alternative} onChange={(event) => setQuestion({ ...question, alternatives: question.alternatives.map((current, alternativeIndex) => alternativeIndex === index ? event.target.value : current) })} /></label>)}</div>
    <div className={styles.formGrid}><label className={styles.field}>Origem da prova<input className={styles.input} value={question.examBoard} onChange={(event) => setQuestion({ ...question, examBoard: event.target.value })} placeholder="Ex.: OAB/FGV" /></label><label className={styles.field}>Ano da prova<input className={styles.input} type="number" min="1990" max="2100" value={question.year} onChange={(event) => setQuestion({ ...question, year: event.target.value })} placeholder="Ex.: 2024" /></label></div>
    <label className={styles.field}>Resposta correta<select className={styles.select} value={question.correct} onChange={(event) => setQuestion({ ...question, correct: event.target.value })}>{question.alternatives.map((_, index) => <option value={index} key={index}>Alternativa {String.fromCharCode(65 + index)}</option>)}</select></label>
    <button className={styles.primaryButton} disabled={saving}>{saving ? 'Salvando...' : 'Criar questão'}</button>
  </form>;
}

export function ProfessorAuthoringPage({ mode }: { mode: AuthoringMode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [video, setVideo] = useState({ moduleId: '', title: '', description: '', file: null as File | null });
  const [question, setQuestion] = useState<QuestionDraft>({ moduleId: '', subject: '', statement: '', alternatives: ['', '', '', '', ''], correct: '0', examBoard: 'OAB/FGV', year: '', alternativeA: '', alternativeB: '' });

  useEffect(() => {
    managementApi.listCourses()
      .then((items) => {
        setCourses(items);
        setSelectedCourse(items[0]?.id ?? '');
      })
      .catch((reason) => setError(getErrorMessage(reason, 'Não foi possível carregar os cursos.')))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!selectedCourse) return;
    managementApi.listModules(selectedCourse)
      .then((items) => {
        setModules(items);
        setVideo((current) => ({ ...current, moduleId: current.moduleId || items[0]?.id || '' }));
        setQuestion((current) => ({ ...current, moduleId: current.moduleId || items[0]?.id || '' }));
      })
      .catch((reason) => setError(getErrorMessage(reason, 'Não foi possível carregar os módulos.')));
  }, [selectedCourse]);

  function clearFeedback() {
    setError(null);
    setMessage(null);
  }

  async function submitVideo(event: FormEvent) {
    event.preventDefault();
    clearFeedback();
    if (!video.moduleId || !video.title.trim() || !video.file) {
      setError('Informe o módulo, título e arquivo da videoaula.');
      return;
    }
    if (video.file.size > 500 * 1024 * 1024) {
      setError('O vídeo deve ter no máximo 500 MB.');
      return;
    }
    setSaving(true);
    try {
      await managementApi.uploadVideo({ moduleId: video.moduleId, title: video.title.trim(), description: video.description.trim(), video: video.file, status: 'RASCUNHO' });
      setVideo((current) => ({ ...current, title: '', description: '', file: null }));
      setMessage('Videoaula criada como rascunho. Publique após revisar o material.');
    } catch (reason) {
      setError(getErrorMessage(reason, 'Não foi possível criar a videoaula.'));
    } finally {
      setSaving(false);
    }
  }

  async function submitQuestion(event: FormEvent) {
    event.preventDefault();
    clearFeedback();
    if (!question.moduleId || !question.subject.trim() || !question.statement.trim() || question.alternatives.some((alternative) => !alternative.trim())) {
      setError('Preencha módulo, disciplina, enunciado e as cinco alternativas.');
      return;
    }
    setSaving(true);
    try {
      await managementApi.createQuestion({ moduleId: question.moduleId, subject: question.subject.trim(), statement: question.statement.trim(), examBoard: question.examBoard.trim() || undefined, year: question.year ? Number(question.year) : undefined, alternatives: question.alternatives.map((text, order) => ({ text: text.trim(), order, correct: String(order) === question.correct })) });
      setQuestion((current) => ({ ...current, subject: '', statement: '', alternatives: ['', '', '', '', ''], year: '' }));
      setMessage('Questão criada com sucesso.');
    } catch (reason) {
      setError(getErrorMessage(reason, 'Não foi possível criar a questão.'));
    } finally {
      setSaving(false);
    }
  }

  if (mode === 'questoes') {
    return <div className={styles.page}>
      <p className={styles.eyebrow}>Produção de conteúdo</p>
      <h1 className={styles.heading}>Adicionar questão</h1>
      <p className={styles.intro}>Cadastre questões objetivas com cinco alternativas, inclusive de provas anteriores da OAB.</p>
      {error && <div className={styles.error}><Alert type="error">{error}</Alert></div>}
      {message && <div className={styles.success}>{message}</div>}
      {loading ? <section className={styles.panel}><div className={styles.empty}>Carregando cursos...</div></section> : <section className={styles.panel}>
        <div className={styles.panelHeader}><div><h2 className={styles.panelTitle}>Nova questão objetiva</h2><p className={styles.panelMeta}>Informe cinco alternativas e marque apenas uma como correta.</p></div><ClipboardIcon /></div>
        <label className={styles.field}>Curso<select className={styles.select} value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)}><option value="">Selecione um curso</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>
        <QuestionAuthoringForm question={question} setQuestion={setQuestion} modules={modules} saving={saving} submitQuestion={submitQuestion} />
      </section>}
    </div>;
  }

  const title = mode === 'conteudos' ? 'Adicionar videoaula' : 'Adicionar questão';
  const subtitle = mode === 'conteudos' ? 'Cadastre uma aula em vídeo, revise o rascunho e publique no curso.' : 'Construa questões objetivas para reforçar a preparação dos alunos.';

  return <div className={styles.page}><p className={styles.eyebrow}>Produção de conteúdo</p><h1 className={styles.heading}>{title}</h1><p className={styles.intro}>{subtitle}</p>{error && <div className={styles.error}><Alert type="error">{error}</Alert></div>}{message && <div className={styles.success}>{message}</div>}{loading ? <section className={styles.panel}><div className={styles.empty}>Carregando cursos...</div></section> : <section className={styles.panel}><div className={styles.panelHeader}><div><h2 className={styles.panelTitle}>{mode === 'conteudos' ? 'Nova aula em vídeo' : 'Nova questão objetiva'}</h2><p className={styles.panelMeta}>O conteúdo será criado como rascunho para revisão.</p></div>{mode === 'conteudos' ? <BookIcon /> : <ClipboardIcon />}</div><label className={styles.field}>Curso<select className={styles.select} value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)}><option value="">Selecione um curso</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>{mode === 'conteudos' ? <form className={styles.form} onSubmit={submitVideo}><label className={styles.field}>Módulo<select className={styles.select} value={video.moduleId} onChange={(event) => setVideo({ ...video, moduleId: event.target.value })}><option value="">Selecione um módulo</option>{modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}</select></label><label className={styles.field}>Título da aula<input className={styles.input} value={video.title} onChange={(event) => setVideo({ ...video, title: event.target.value })} placeholder="Ex.: Princípios fundamentais" /></label><label className={styles.field}>Arquivo de vídeo<input className={styles.input} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(event) => setVideo({ ...video, file: event.target.files?.[0] ?? null })} /><span className={styles.rowMeta}>{video.file ? `${video.file.name} · ${(video.file.size / 1024 / 1024).toFixed(1)} MB` : 'MP4, WebM ou MOV · máximo de 500 MB'}</span></label><label className={styles.field}>Descrição<textarea className={styles.textarea} value={video.description} onChange={(event) => setVideo({ ...video, description: event.target.value })} placeholder="O que o aluno vai aprender nesta aula?" /></label><button className={styles.primaryButton} disabled={saving}>{saving ? 'Enviando vídeo...' : 'Enviar videoaula'}</button></form> : <form className={styles.form} onSubmit={submitQuestion}><label className={styles.field}>Módulo<select className={styles.select} value={question.moduleId} onChange={(event) => setQuestion({ ...question, moduleId: event.target.value })}><option value="">Selecione um módulo</option>{modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}</select></label><label className={styles.field}>Disciplina<input className={styles.input} value={question.subject} onChange={(event) => setQuestion({ ...question, subject: event.target.value })} placeholder="Ex.: Direito Constitucional" /></label><label className={styles.field}>Enunciado<textarea className={styles.textarea} value={question.statement} onChange={(event) => setQuestion({ ...question, statement: event.target.value })} /></label><div className={styles.formGrid}><label className={styles.field}>Alternativa A<input className={styles.input} value={question.alternativeA} onChange={(event) => setQuestion({ ...question, alternativeA: event.target.value })} /></label><label className={styles.field}>Alternativa B<input className={styles.input} value={question.alternativeB} onChange={(event) => setQuestion({ ...question, alternativeB: event.target.value })} /></label></div><label className={styles.field}>Resposta correta<select className={styles.select} value={question.correct} onChange={(event) => setQuestion({ ...question, correct: event.target.value })}><option value="0">Alternativa A</option><option value="1">Alternativa B</option></select></label><button className={styles.primaryButton} disabled={saving}>{saving ? 'Salvando...' : 'Criar questão'}</button></form>}</section>}</div>;
}