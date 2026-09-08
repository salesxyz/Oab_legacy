import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../../components/ui/Alert';
import { LogoutIcon, UserIcon } from '../../components/ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { profileApi } from '../../services/profileApi';
import { getErrorMessage } from '../../utils/errors';
import styles from './BackofficePage.module.css';

export function BackofficeProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? '');
  const [goal, setGoal] = useState('');
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    profileApi.getProfile()
      .then((profile) => {
        setName(profile.name);
        setGoal(profile.profile?.goal ?? '');
        setCreatedAt(profile.createdAt);
      })
      .catch((reason) => setError(getErrorMessage(reason, 'Não foi possível carregar seu perfil.')))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await profileApi.updateProfile({ name: name.trim(), goal: goal.trim() });
      setMessage('Perfil atualizado com sucesso.');
    } catch (reason) {
      setError(getErrorMessage(reason, 'Não foi possível atualizar seu perfil.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/entrar', { replace: true });
  }

  const initials = user?.name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const roleLabel = user?.role === 'ADMIN' ? 'Administrador' : 'Professor';

  return <div className={styles.page}>
    <p className={styles.eyebrow}>Conta</p>
    <h1 className={styles.heading}>Meu perfil</h1>
    <p className={styles.intro}>Gerencie seus dados de acesso e encerre sua sessão com segurança.</p>
    {error && <div className={styles.error}><Alert type="error">{error}</Alert></div>}
    {message && <div className={styles.success}>{message}</div>}
    {loading ? <section className={styles.panel}><div className={styles.empty}>Carregando perfil...</div></section> : <div className={styles.profileGrid}>
      <section className={styles.panel}>
        <div className={styles.profileHeader}><span className={styles.profileAvatar}>{initials}</span><div><h2 className={styles.panelTitle}>{user?.name}</h2><p className={styles.panelMeta}>{user?.email}</p></div></div>
        <div className={styles.accountFacts}><div><span>Perfil de acesso</span><strong>{roleLabel}</strong></div><div><span>Status</span><strong className={styles.statusText}>Ativo</strong></div><div><span>Membro desde</span><strong>{createdAt ? new Date(createdAt).toLocaleDateString('pt-BR') : 'Não informado'}</strong></div></div>
      </section>
      <section className={styles.panel}><div className={styles.panelHeader}><div><h2 className={styles.panelTitle}>Dados pessoais</h2><p className={styles.panelMeta}>Atualize as informações exibidas na plataforma.</p></div><UserIcon /></div><form className={styles.form} onSubmit={handleSubmit}><label className={styles.field}>Nome completo<input className={styles.input} value={name} onChange={(event) => setName(event.target.value)} /></label><label className={styles.field}>Objetivo de estudo<textarea className={styles.textarea} value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Opcional" /></label><button className={styles.primaryButton} disabled={saving}>{saving ? 'Salvando...' : 'Salvar alterações'}</button></form></section>
      <section className={styles.panel}><div className={styles.panelHeader}><div><h2 className={styles.panelTitle}>Sessão</h2><p className={styles.panelMeta}>O acesso será removido deste dispositivo.</p></div></div><button className={styles.logoutPanelButton} onClick={handleLogout}><LogoutIcon size={17} /> Sair da conta</button></section>
    </div>}
  </div>;
}