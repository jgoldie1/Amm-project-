export type AfterDarkStage =
  | 'age-gate'
  | 'briefing'
  | 'public-event'
  | 'tip'
  | 'investigation'
  | 'evidence-review'
  | 'extraction'
  | 'complete';

export type AfterDarkApproach = 'spy' | 'detective' | 'social' | 'rescue';
export type EvidenceClass =
  | 'access_log'
  | 'camera_fragment'
  | 'financial_record'
  | 'message'
  | 'witness_statement'
  | 'physical_clue';

export interface AfterDarkEvidence {
  id: string;
  label: string;
  class: EvidenceClass;
  fictional: true;
  integrityHash: string;
  chainOfCustody: string[];
}

export interface PublicEventCameo {
  id: string;
  displayName: string;
  eventLabel: string;
  eventYear: number;
  sourceRef: string;
  role: 'background_cameo';
  interactable: false;
  suspectEligible: false;
}

export interface AfterDarkMissionState {
  missionId: 'after-dark-white-night-file';
  alpha: true;
  stage: AfterDarkStage;
  ageVerified: boolean;
  consentAccepted: boolean;
  approach?: AfterDarkApproach;
  evidenceIds: string[];
  protectedWitness: boolean;
  innocentAccusations: number;
  startedAt: string;
  updatedAt: string;
}

export const AFTER_DARK_ALPHA_FLAG = 'tryamm.alpha.after-dark.v1';
export const AFTER_DARK_STATE_KEY = 'tryamm.streetverse.after-dark.white-night.v1';

export const AFTER_DARK_FICTIONAL_CAST = [
  { id: 'benny', name: 'Benny / Stubbs AI', role: 'mission-director' },
  { id: 'maya-cross', name: 'Maya Cross', role: 'event-coordinator-protected-witness' },
  { id: 'darius-vale', name: 'Darius Vale', role: 'fictional-investigative-target' },
  { id: 'cipher', name: 'Cipher', role: 'anonymous-source' },
  { id: 'orion-security', name: 'Orion Security', role: 'fictional-security-faction' },
  { id: 'lena-brooks', name: 'Detective Lena Brooks', role: 'law-enforcement-liaison' },
] as const;

// Alpha deliberately ships with no enabled real-person cameos. A named cameo can
// be activated only after sourceRef + event/year verification and content review.
export const VERIFIED_PUBLIC_EVENT_CAMEOS: PublicEventCameo[] = [];

export const AFTER_DARK_EVIDENCE: AfterDarkEvidence[] = [
  {
    id: 'ev-access-01',
    label: 'Fictional restricted-area access log',
    class: 'access_log',
    fictional: true,
    integrityHash: 'alpha-access-01',
    chainOfCustody: ['generated-by-mission-server'],
  },
  {
    id: 'ev-camera-01',
    label: 'Fictional service-corridor camera fragment',
    class: 'camera_fragment',
    fictional: true,
    integrityHash: 'alpha-camera-01',
    chainOfCustody: ['generated-by-mission-server'],
  },
  {
    id: 'ev-message-01',
    label: 'Fictional encrypted staff message',
    class: 'message',
    fictional: true,
    integrityHash: 'alpha-message-01',
    chainOfCustody: ['generated-by-mission-server'],
  },
  {
    id: 'ev-witness-01',
    label: 'Maya Cross protected witness statement',
    class: 'witness_statement',
    fictional: true,
    integrityHash: 'alpha-witness-01',
    chainOfCustody: ['generated-by-mission-server'],
  },
];

export const AFTER_DARK_ALPHA_MISSION = {
  id: 'after-dark-white-night-file',
  title: 'The White Night File',
  status: 'ALPHA_READY',
  ageGate: 21,
  worlds: ['streetverse', 'omniverse'],
  approaches: ['spy', 'detective', 'social', 'rescue'] as AfterDarkApproach[],
  rewards: {
    xp: 750,
    softCurrency: 250,
    reputation: { investigator: 8, communityTrust: 5, afterDarkSafety: 10 },
    cleanInvestigationBadge: 'Evidence Before Accusation',
  },
  guardrails: [
    'Real public-event attendees are never fictional suspects.',
    'Attendance never implies wrongdoing or knowledge of wrongdoing.',
    'Invented crimes, evidence, witnesses and targets use fictional characters.',
    'Named real-person cameos require a verified sourceRef, event label and year before activation.',
  ],
} as const;

function now() {
  return new Date().toISOString();
}

export function createAfterDarkMissionState(): AfterDarkMissionState {
  const timestamp = now();
  return {
    missionId: 'after-dark-white-night-file',
    alpha: true,
    stage: 'age-gate',
    ageVerified: false,
    consentAccepted: false,
    evidenceIds: [],
    protectedWitness: false,
    innocentAccusations: 0,
    startedAt: timestamp,
    updatedAt: timestamp,
  };
}

export function loadAfterDarkMissionState(): AfterDarkMissionState {
  if (typeof localStorage === 'undefined') return createAfterDarkMissionState();
  try {
    const saved = JSON.parse(localStorage.getItem(AFTER_DARK_STATE_KEY) || 'null');
    return saved?.missionId === 'after-dark-white-night-file'
      ? saved
      : createAfterDarkMissionState();
  } catch {
    return createAfterDarkMissionState();
  }
}

export function saveAfterDarkMissionState(state: AfterDarkMissionState) {
  const next = { ...state, updatedAt: now() };
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(AFTER_DARK_STATE_KEY, JSON.stringify(next));
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tryamm:after-dark-state', { detail: next }));
  }
  return next;
}

export function verifyAfterDarkAgeAndConsent(age21Plus: boolean, consent: boolean) {
  const current = loadAfterDarkMissionState();
  if (!age21Plus || !consent) {
    return saveAfterDarkMissionState({
      ...current,
      ageVerified: false,
      consentAccepted: false,
      stage: 'age-gate',
    });
  }
  return saveAfterDarkMissionState({
    ...current,
    ageVerified: true,
    consentAccepted: true,
    stage: 'briefing',
  });
}

export function chooseAfterDarkApproach(approach: AfterDarkApproach) {
  const current = loadAfterDarkMissionState();
  if (!current.ageVerified || !current.consentAccepted) return current;
  return saveAfterDarkMissionState({ ...current, approach, stage: 'public-event' });
}

export function advanceAfterDarkStage(stage: AfterDarkStage) {
  const current = loadAfterDarkMissionState();
  if (!current.ageVerified || !current.consentAccepted) return current;
  return saveAfterDarkMissionState({ ...current, stage });
}

export function collectAfterDarkEvidence(evidenceId: string) {
  const current = loadAfterDarkMissionState();
  const evidence = AFTER_DARK_EVIDENCE.find((item) => item.id === evidenceId);
  if (!evidence || current.evidenceIds.includes(evidenceId)) return current;
  return saveAfterDarkMissionState({
    ...current,
    evidenceIds: [...current.evidenceIds, evidenceId],
    stage: 'investigation',
  });
}

export function protectAfterDarkWitness() {
  const current = loadAfterDarkMissionState();
  return saveAfterDarkMissionState({ ...current, protectedWitness: true, stage: 'extraction' });
}

export function validateAfterDarkAlphaCompletion(state = loadAfterDarkMissionState()) {
  const evidenceThreshold = Math.min(3, AFTER_DARK_EVIDENCE.length);
  const accepted =
    state.ageVerified &&
    state.consentAccepted &&
    !!state.approach &&
    state.evidenceIds.length >= evidenceThreshold &&
    state.protectedWitness &&
    state.innocentAccusations === 0;

  return {
    accepted,
    missionId: state.missionId,
    xp: accepted ? AFTER_DARK_ALPHA_MISSION.rewards.xp : 0,
    softCurrency: accepted ? AFTER_DARK_ALPHA_MISSION.rewards.softCurrency : 0,
    reputationChanges: accepted ? AFTER_DARK_ALPHA_MISSION.rewards.reputation : {},
    unlocks: accepted ? [AFTER_DARK_ALPHA_MISSION.rewards.cleanInvestigationBadge] : [],
    reason: accepted ? 'alpha-contract-satisfied' : 'mission-objectives-incomplete',
  };
}

export function completeAfterDarkAlphaMission() {
  const validation = validateAfterDarkAlphaCompletion();
  if (!validation.accepted) return validation;
  const current = loadAfterDarkMissionState();
  saveAfterDarkMissionState({ ...current, stage: 'complete' });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete', { detail: validation }));
    window.dispatchEvent(new CustomEvent('tryamm:reel-highlight', {
      detail: { activityId: current.missionId, category: 'victory', priority: 100 },
    }));
  }
  return validation;
}

export function resetAfterDarkAlphaMission() {
  return saveAfterDarkMissionState(createAfterDarkMissionState());
}

export function installStreetVerseAfterDarkAlphaRuntime() {
  if (typeof window === 'undefined') return () => undefined;
  const w = window as typeof window & {
    __tryammAfterDarkAlphaInstalled?: boolean;
    __tryammAfterDarkAlpha?: unknown;
  };
  if (w.__tryammAfterDarkAlphaInstalled) return () => undefined;
  w.__tryammAfterDarkAlphaInstalled = true;
  w.__tryammAfterDarkAlpha = {
    mission: AFTER_DARK_ALPHA_MISSION,
    fictionalCast: AFTER_DARK_FICTIONAL_CAST,
    verifiedCameos: VERIFIED_PUBLIC_EVENT_CAMEOS,
    load: loadAfterDarkMissionState,
    verifyAgeAndConsent: verifyAfterDarkAgeAndConsent,
    chooseApproach: chooseAfterDarkApproach,
    advance: advanceAfterDarkStage,
    collectEvidence: collectAfterDarkEvidence,
    protectWitness: protectAfterDarkWitness,
    validate: validateAfterDarkAlphaCompletion,
    complete: completeAfterDarkAlphaMission,
    reset: resetAfterDarkAlphaMission,
  };
  window.dispatchEvent(new CustomEvent('tryamm:after-dark-alpha-ready', {
    detail: { missionId: AFTER_DARK_ALPHA_MISSION.id, status: AFTER_DARK_ALPHA_MISSION.status },
  }));
  return () => undefined;
}
