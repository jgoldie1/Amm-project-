export const IMMERSIVE_RELEASE_CHAIN = [
  'RECOVERED IMMERSIVE BRANCH',
  'AUDIT',
  'REALITY LAB / DISTRICT 01',
  'PLAYER STATE',
  'REALTIME MULTIPLAYER',
  'SAVE / REJOIN',
  'CONTROLLERS',
  'ACCESSIBILITY / PANIC',
  'MOBILE PERFORMANCE',
  'COMMERCE GATE',
  'REGRESSION',
  'GREEN',
  'RELEASE',
] as const

export const IMMERSIVE_RELEASE_REQUIREMENTS = {
  ownership: {
    owner: 'RealityLabDistrict01',
    rule: 'District 01 is the single proof owner for the seven-room immersive progression route; museum exhibits are expansion content and must not fork player state.',
  },
  playerState: {
    canonical: ['current room','completed rooms','Lab XP','accessibility profile','checkpoint revision'],
    rule: 'Local storage is fallback only. Authenticated Supabase state is authoritative for cross-device rejoin.',
  },
  multiplayer: {
    canonical: 'Supabase RPC + Realtime',
    rule: 'Clients submit actions; server validates membership and expected revision; accepted state is broadcast by Realtime.',
    conflict: 'revision_conflict must be recoverable without duplicating actions or losing accepted state.',
  },
  controller: {
    inputs: ['keyboard','touch','gamepad'],
    gamepad: ['D-pad/left stick navigate','A complete','B panic','Start resume'],
    rule: 'Controller input cannot bypass panic/safe-state or award payable money.',
  },
  accessibility: {
    controls: ['one-handed mode','reduced motion','high contrast','panic safe state'],
    rule: 'Accessibility is never a paid entitlement and panic overrides progression/recording effects.',
  },
  mobilePerformance: {
    targets: ['responsive layout','reduced-motion path','bounded visual effects','no mandatory XR hardware','local fallback when provider unavailable'],
    rule: 'Heavy immersive effects degrade before controls, safety, save/rejoin, or text legibility degrade.',
  },
  commerce: {
    allowed: ['tickets/memberships when provider-ready','rights-cleared creator products','optional digital enhancements','venue/store products'],
    blocked: ['client-side cash minting','pay-to-win proof progression','paid accessibility','unfunded prize claims','unverified provider checkout'],
  },
  regression: {
    required: ['smoke contracts','typecheck','production build','E2E','security scan','convergence CI'],
    releaseTruth: 'GREEN means automated code gates passed on the exact head; real XR hardware, real two-device auth, production Supabase migrations, provider payments and deployed performance still require external evidence.',
  },
} as const

export const IMMERSIVE_RELEASE_PROOF = 'DISTRICT 01 → CANONICAL PLAYER STATE → SERVER-AUTHORITATIVE MULTIPLAYER → SAVE/REJOIN → CONTROLLER + ACCESSIBILITY/PANIC → MOBILE-SAFE RENDERING → COMMERCE GATES → REGRESSION → GREEN HEAD → PRODUCTION EVIDENCE → RELEASE'
