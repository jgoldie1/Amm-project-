export type ReuseClass = 'global' | 'regional' | 'scene-only'

export type ReusableAsset = {
  id: string
  kind: 'lottie' | 'shader' | 'audio' | 'prop' | 'vehicle' | 'npc-rig' | 'ui' | 'environment-kit'
  reuse: ReuseClass
  source: 'original' | 'licensed'
  fallback?: string
  notes: string
}

export const LOTTIE_LIBRARY_2 = {
  version: '2.0',
  runtime: 'lottie-web',
  rules: [
    'Load animation JSON once and cache by asset id.',
    'Respect prefers-reduced-motion and accessibility profile overrides.',
    'Prefer vector/Lottie overlays over duplicated rendered video for HUD, transitions and holographic UI.',
    'Never embed copyrighted film/trailer frames inside Lottie JSON without rights metadata.',
  ],
} as const

export const STREETVERSE_REUSABLE_ASSETS: ReusableAsset[] = [
  { id: 'holo-memory-ripple', kind: 'lottie', reuse: 'global', source: 'original', fallback: 'static memory ring', notes: 'World Memory reveal and legacy scene transition.' },
  { id: 'holo-wayfinder', kind: 'lottie', reuse: 'global', source: 'original', fallback: 'high-contrast arrow', notes: 'Navigation, Indiana/Chicago travel and mission guidance.' },
  { id: 'scene-title-reveal', kind: 'lottie', reuse: 'global', source: 'original', fallback: 'fade title', notes: 'Cinematic chapter titles without video duplication.' },
  { id: 'street-crowd-rig-a', kind: 'npc-rig', reuse: 'regional', source: 'original', notes: 'Shared Chicago/Indiana crowd skeleton with wardrobe swaps.' },
  { id: 'midwest-brick-kit', kind: 'environment-kit', reuse: 'regional', source: 'original', notes: 'Brick, concrete, fencing, alleys and storefront modular kit.' },
  { id: 'baseball-field-kit', kind: 'environment-kit', reuse: 'global', source: 'original', notes: 'Reusable baseball diamond, bleachers, fencing, dugout and lighting kit.' },
  { id: 'film-set-prop-kit', kind: 'prop', reuse: 'global', source: 'original', notes: 'Original cameras, cables, carts, lights and production props.' },
  { id: 'holo-depth-shader', kind: 'shader', reuse: 'global', source: 'original', notes: 'Shared volumetric hologram depth and edge treatment.' },
]

export function reusableAssetsFor(kind: ReusableAsset['kind']) {
  return STREETVERSE_REUSABLE_ASSETS.filter(asset => asset.kind === kind)
}
