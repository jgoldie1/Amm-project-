export type HoloSurface =
  | 'phone'
  | 'tv'
  | 'projector'
  | 'spatial-display'
  | 'holocube'
  | 'holo-wall'
  | 'ar'
  | 'vr'
  | 'mr'
  | 'venue';

export type HoloCapability =
  | 'screen'
  | 'fullscreen'
  | 'pointer'
  | 'touch'
  | 'gamepad'
  | 'xr'
  | 'external-display';

export type HoloBridgeProfile = {
  surface: HoloSurface;
  capabilities: HoloCapability[];
  reducedMotion: boolean;
  standalone: boolean;
};

function mediaMatches(query: string): boolean {
  return typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(query).matches;
}

/**
 * Safe, standards-first capability detection for the first HoloBridge release.
 * Supplier-specific adapters are intentionally kept out of this base layer.
 */
export function detectHoloBridgeProfile(): HoloBridgeProfile {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      surface: 'phone',
      capabilities: ['screen'],
      reducedMotion: false,
      standalone: false,
    };
  }

  const capabilities: HoloCapability[] = ['screen'];
  const nav = navigator as Navigator & {
    standalone?: boolean;
    getGamepads?: () => (Gamepad | null)[];
    xr?: unknown;
  };

  if ('requestFullscreen' in document.documentElement) capabilities.push('fullscreen');
  if ('PointerEvent' in window) capabilities.push('pointer');
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) capabilities.push('touch');
  if (typeof nav.getGamepads === 'function') capabilities.push('gamepad');
  if ('xr' in nav) capabilities.push('xr');

  const standalone = Boolean(nav.standalone) || mediaMatches('(display-mode: standalone)');
  const coarse = mediaMatches('(pointer: coarse)');
  const wide = mediaMatches('(min-width: 900px)');

  return {
    surface: wide && !coarse ? 'tv' : 'phone',
    capabilities,
    reducedMotion: mediaMatches('(prefers-reduced-motion: reduce)'),
    standalone,
  };
}

export function chooseHoloPresentation(profile: HoloBridgeProfile) {
  const spatial = profile.capabilities.includes('xr');
  return {
    mode: spatial ? 'spatial-ready' : 'standard-screen',
    animateDepth: !profile.reducedMotion,
    showVisibleControls: true,
    requireExplicitConfirmationForConsequentialActions: true,
  } as const;
}
