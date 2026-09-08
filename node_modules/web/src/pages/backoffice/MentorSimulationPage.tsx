import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Alert } from '../../components/ui/Alert';
import { ClipboardIcon } from '../../components/ui/icons';
import { managementApi } from '../../services/managementApi';
import { getErrorMessage } from '../../utils/errors';
import styles from './BackofficePage.module.css';

export function MentorSimulationPage() {
  const [form, setForm] = useState({ title: '', description: '', timeLimitMinutes: '120' });
  const [questions, setQuestions] = useState<Awaited<ReturnType<typeof managementApi.listQuestions>>['rows']>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionYear, setQuestionYear] = useState('todos');
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    managementApi.listQuestions()
      .then((result) => setQuestions(result.rows))
      .catch((reason) => setError(getErrorMessage(reason, 'Não foi possível carregar as questões.')))
      .finally(() => setLoadingQuestions(false));
  }, []);

  const years = useMemo(() => Array.from(new Set(questions.map((question) => question.year).filter((year): year is number => year !== null))).sort((a, b) => b - a), [questions]);
  const filteredQuestions = useMemo(() => questions.filter((question) => {
    const search = questionSearch.trim().toLowerCase();
    const matchesSearch = !search || question.statement.toLowerCase().includes(search) || question.subject.toLowerCase().includes(search) || (question.examBoard ?? '').toLowerCase().includes(search);
    const matchesYear = questionYear === 'todos' || String(question.year) === questionYear;
    return matchesSearch && matchesYear;
  }), [questions, questionSearch, questionYear]);

  function toggleQuestion(questionId: string) {
    setSelectedQuestionIds((current) => current.includes(questionId) ? current.filter((id) => id !== questionId) : [...current, questionId]);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    if (!form.title.trim() || selectedQuestionIds.length === 0 || Number(form.timeLimitMinutes) < 1) {
      setError('Informe título, tempo e selecione pelo menos uma questão.');
      return;
    }
    setSaving(true);
    try {
      await managementApi.createSimulation({ title: form.title.trim(), description: form.description.trim(), timeLimitMinutes: Number(form.timeLimitMinutes), questionCount: selectedQuestionIds.length, questionIds: selectedQuestionIds });
      setForm({ title: '', description: '', timeLimitMinutes: '120' });
      setSelectedQuestionIds([]);
      setMessage('Simulado criado com sucesso.');
    } catch (reason) {
      setError(getErrorMessage(reason, 'Não foi possível criar o simulado.'));
    } finally {
      setSaving(false);
    }
  }

  return <div className={styles.page}>
    <p className={styles.eyebrow}>Avaliações</p>
    <h1 className={styles.heading}>Criar simulado</h1>
    <p className={styles.intro}>Monte provas completas com questões do banco para acompanhar a preparação dos alunos.</p>
    {error && <div className={styles.error}><Alert type="error">{error}</Alert></div>}
    {message && <div className={styles.success}>{message}</div>}
    <section className={styles.panel}><div className={styles.panelHeader}><div><h2 className={styles.panelTitle}>Novo simulado</h2><p className={styles.panelMeta}>Selecione questões cadastradas ou de provas anteriores da OAB.</p></div><ClipboardIcon /></div><form className={styles.form} onSubmit={handleSubmit}><label className={styles.field}>Título da prova<input className={styles.input} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Ex.: Simulado OAB - Ética e Constitucional" /></label><label className={styles.field}>Descrição<textarea className={styles.textarea} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Objetivo e orientações da prova" /></label><label className={styles.field}>Tempo em minutos<input className={styles.input} type="number" min="1" value={form.timeLimitMinutes} onChange={(event) => setForm({ ...form, timeLimitMinutes: event.target.value })} /></label><div className={styles.questionPicker}><div className={styles.questionPickerHeader}><div><strong>Questões selecionadas: {selectedQuestionIds.length}</strong><span>Marque as questões que farão parte do simulado.</span></div><div className={styles.questionFilters}><input className={styles.input} value={questionSearch} onChange={(event) => setQuestionSearch(event.target.value)} placeholder="Buscar questão" aria-label="Buscar questão" /><select className={styles.select} value={questionYear} onChange={(event) => setQuestionYear(event.target.value)} aria-label="Filtrar por ano"><option value="todos">Todos os anos</option>{years.map((year) => <option value={year} key={year}>{year}</option>)}</select></div></div>{loadingQuestions ? <div className={styles.empty}>Carregando questões...</div> : filteredQuestions.length === 0 ? <div className={styles.empty}>Nenhuma questão encontrada.</div> : <div className={styles.questionOptions}>{filteredQuestions.map((question) => <label className={styles.questionOption} key={question.id}><input type="checkbox" checked={selectedQuestionIds.includes(question.id)} onChange={() => toggleQuestion(question.id)} /><span><strong>{question.subject} {question.year ? `· ${question.year}` : ''}</strong><span>{question.statement}</span><small>{question.examBoard || 'Questão própria'} · ID: {question.id}</small></span></label>)}</div>}</div><button className={styles.primaryButton} disabled={saving || loadingQuestions}>{saving ? 'Criando...' : 'Criar simulado'}</button></form></section>
  </div>;
}
