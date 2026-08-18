export type AccessibilityPreferences = {
  screenReader: boolean;
  keyboardOnly: boolean;
  switchAccess: boolean;
  voiceControl: boolean;
  oneHandedMode: boolean;
  largeTargets: boolean;
  largeText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  captions: boolean;
  transcripts: boolean;
  audioDescription: boolean;
  speechToText: boolean;
  textToSpeech: boolean;
  simplifiedUI: boolean;
  extraProcessingTime: boolean;
};

export type AccessibilityPassport = {
  version: 1;
  userId?: string;
  preferences: AccessibilityPreferences;
  communicationPreference?: 'text' | 'voice' | 'video' | 'email' | 'none';
  opportunityNeeds: string[];
  updatedAt: string;
};

export const defaultAccessibilityPreferences: AccessibilityPreferences = {
  screenReader: false,
  keyboardOnly: false,
  switchAccess: false,
  voiceControl: false,
  oneHandedMode: false,
  largeTargets: false,
  largeText: false,
  highContrast: false,
  reducedMotion: false,
  captions: false,
  transcripts: false,
  audioDescription: false,
  speechToText: false,
  textToSpeech: false,
  simplifiedUI: false,
  extraProcessingTime: false,
};

export const createAccessibilityPassport = (
  partial: Partial<AccessibilityPassport> = {},
): AccessibilityPassport => ({
  version: 1,
  preferences: { ...defaultAccessibilityPreferences, ...partial.preferences },
  opportunityNeeds: partial.opportunityNeeds ?? [],
  communicationPreference: partial.communicationPreference ?? 'none',
  userId: partial.userId,
  updatedAt: new Date().toISOString(),
});

export const ACCESSIBILITY_STORAGE_KEY = 'tryamm.accessibility-passport.v1';

export function loadAccessibilityPassport(): AccessibilityPassport {
  if (typeof window === 'undefined') return createAccessibilityPassport();
  try {
    const raw = window.localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
    if (!raw) return createAccessibilityPassport();
    return createAccessibilityPassport(JSON.parse(raw));
  } catch {
    return createAccessibilityPassport();
  }
}

export function saveAccessibilityPassport(passport: AccessibilityPassport) {
  const next = { ...passport, updatedAt: new Date().toISOString() };
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(next));
  }
  applyAccessibilityPreferences(next.preferences);
  return next;
}

export function applyAccessibilityPreferences(p: AccessibilityPreferences) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const flags: Record<string, boolean> = {
    'a11y-screen-reader': p.screenReader,
    'a11y-keyboard-only': p.keyboardOnly,
    'a11y-switch-access': p.switchAccess,
    'a11y-voice-control': p.voiceControl,
    'a11y-one-handed': p.oneHandedMode,
    'a11y-large-targets': p.largeTargets,
    'a11y-large-text': p.largeText,
    'a11y-high-contrast': p.highContrast,
    'a11y-reduced-motion': p.reducedMotion,
    'a11y-captions': p.captions,
    'a11y-simplified': p.simplifiedUI,
  };
  Object.entries(flags).forEach(([name, enabled]) => root.classList.toggle(name, enabled));
  root.dataset.accessibilityPassport = 'v1';
}

export function publicAccessibilitySummary(passport: AccessibilityPassport) {
  // Intentionally excludes diagnosis/medical identity. Only user-selected functional needs.
  return {
    communicationPreference: passport.communicationPreference,
    opportunityNeeds: [...passport.opportunityNeeds],
  };
}
