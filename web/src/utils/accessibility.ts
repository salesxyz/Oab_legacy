export type AccessibilitySettings = {
  highContrast: boolean;
  largerText: boolean;
  reducedMotion: boolean;
};

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  largerText: false,
  reducedMotion: false,
};

export const ACCESSIBILITY_STORAGE_KEY = 'oab-legacy-accessibility';

export function readStoredAccessibilitySettings(): AccessibilitySettings {
  try {
    const raw = window.localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ACCESSIBILITY_SETTINGS };

    const parsed = JSON.parse(raw) as Partial<AccessibilitySettings>;
    return {
      ...DEFAULT_ACCESSIBILITY_SETTINGS,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_ACCESSIBILITY_SETTINGS };
  }
}

export function readSystemAccessibilitySettings(): Partial<AccessibilitySettings> {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return {};
  }

  return {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    highContrast: window.matchMedia('(prefers-contrast: more)').matches || window.matchMedia('(forced-colors: active)').matches,
  };
}

export function getEffectiveAccessibilitySettings(): AccessibilitySettings {
  const stored = readStoredAccessibilitySettings();
  const system = readSystemAccessibilitySettings();

  return {
    highContrast: stored.highContrast || Boolean(system.highContrast),
    largerText: stored.largerText,
    reducedMotion: stored.reducedMotion || Boolean(system.reducedMotion),
  };
}

export function applyAccessibilitySettings(settings: AccessibilitySettings) {
  const root = document.documentElement;
  root.dataset.highContrast = String(settings.highContrast);
  root.dataset.largerText = String(settings.largerText);
  root.dataset.reducedMotion = String(settings.reducedMotion);

  root.style.setProperty('--font-scale-factor', settings.largerText ? '1.08' : '1');
  root.style.setProperty('--motion-scale-factor', settings.reducedMotion ? '0' : '1');
}

export function persistAccessibilitySettings(settings: AccessibilitySettings) {
  try {
    window.localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignora falha de armazenamento em ambientes restritivos.
  }
  applyAccessibilitySettings(settings);
}
