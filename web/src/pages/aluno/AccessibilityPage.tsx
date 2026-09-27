import { useEffect, useState } from 'react';
import { AccessibilityIcon, CheckCircleIcon } from '../../components/ui/icons';
import { profileApi } from '../../services/profileApi';
import {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  applyAccessibilitySettings,
  persistAccessibilitySettings,
  readStoredAccessibilitySettings,
  type AccessibilitySettings,
} from '../../utils/accessibility';
import styles from './AccessibilityPage.module.css';

const settingsItems: Array<{ key: keyof AccessibilitySettings; title: string; description: string }> = [
  { key: 'highContrast', title: 'Alto contraste', description: 'Aumenta a diferença entre fundos, textos e elementos de ação.' },
  { key: 'largerText', title: 'Texto ampliado', description: 'Aumenta o tamanho dos textos principais para facilitar a leitura.' },
  { key: 'reducedMotion', title: 'Reduzir movimento', description: 'Desativa transições e animações não essenciais da plataforma.' },
];

export function AccessibilityPage() {
  const [settings, setSettings] = useState(DEFAULT_ACCESSIBILITY_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let active = true;

    const stored = readStoredAccessibilitySettings();

    profileApi.getProfile()
      .then((profile) => {
        if (!active) return;

        const nextSettings = {
          ...DEFAULT_ACCESSIBILITY_SETTINGS,
          ...stored,
          ...(profile.profile?.accessibilitySettings as Partial<AccessibilitySettings> ?? {}),
        };

        setSettings(nextSettings);
        applyAccessibilitySettings(nextSettings);
        persistAccessibilitySettings(nextSettings);
      })
      .catch(() => {
        if (!active) return;
        setSettings(stored);
        applyAccessibilitySettings(stored);
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    applyAccessibilitySettings(settings);
    persistAccessibilitySettings(settings);
  }, [settings]);

  const toggleSetting = async (key: keyof AccessibilitySettings) => {
    const nextSettings = { ...settings, [key]: !settings[key] };
    setSettings(nextSettings);
    setIsSaving(true);
    setFeedback('');
    try {
      const payload = {
        accessibilitySettings: {
          highContrast: nextSettings.highContrast,
          largerText: nextSettings.largerText,
          reducedMotion: nextSettings.reducedMotion,
          reduceMotion: nextSettings.reducedMotion,
        },
      };
      await profileApi.updatePreferences(payload);
      setFeedback('Preferências atualizadas.');
    } catch {
      setSettings(settings);
      setFeedback('Não foi possível salvar a preferência.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerIcon}><AccessibilityIcon size={25} /></div>
        <div><p className={styles.eyebrow}>Minha conta</p><h1>Acessibilidade</h1><p className={styles.subtitle}>Personalize a experiência de estudo para ficar mais confortável.</p></div>
      </header>
      <section className={styles.panel} aria-labelledby="accessibility-options-title">
        <div className={styles.panelHeading}><div><p className={styles.kicker}>Preferências visuais</p><h2 id="accessibility-options-title">Como você prefere estudar?</h2></div>{feedback && <span className={styles.feedback} role="status" aria-live="polite"><CheckCircleIcon size={15} />{feedback}</span>}</div>
        <div className={styles.options}>
          {settingsItems.map(({ key, title, description }) => (
            <div className={styles.option} key={key}>
              <div><h3>{title}</h3><p>{description}</p></div>
              <button className={`${styles.toggle} ${settings[key] ? styles.toggleActive : ''}`} type="button" role="switch" aria-checked={settings[key]} aria-label={`${title}: ${settings[key] ? 'ativado' : 'desativado'}`} onClick={() => void toggleSetting(key)} disabled={isSaving}>
                <span />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
