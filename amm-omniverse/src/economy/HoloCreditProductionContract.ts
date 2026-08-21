export const HOLO_CREDIT_PRODUCTION_CONTRACT = {
  currency: {
    code: 'HC',
    name: 'Holo Credits',
    model: 'closed-loop-virtual-credit',
    serverAuthoritative: true,
    prohibited: ['cash-out','investment-yield','gambling-stake','crypto-exchange','peer-to-peer-money-transmission','creator-wages-disguised-as-credits'],
  },
  wallet: {
    balances: ['available','pending','reserved','refunded'],
    immutableLedger: true,
    idempotencyRequired: true,
    negativeBalanceBlocked: true,
    clientCannotMint: true,
  },
  purchaseRails: {
    ios: 'verified App Store purchase/receipt before credit grant',
    android: 'verified Google Play purchase token before credit grant',
    web: 'verified server payment webhook before credit grant',
    restorePurchases: true,
    refundReconciliation: true,
    chargebackReconciliation: true,
  },
  familyYouth: {
    guardianControls: ['spending-limit','purchase-approval','category-controls','purchase-history','pause-spending'],
    unrestrictedCashout: false,
    ageAppropriateCatalog: true,
  },
  entitlements: {
    catalogServerAuthoritative: true,
    examples: ['movie-box-effects','lottie-2-packs','digital-cosmetics','battle-deck-customization','replay-upgrades','university-digital-labs'],
    physicalGoodsUseSeparateCheckout: true,
  },
  fraud: {
    system: 'Jacobie Vision',
    signals: ['receipt-reuse','rapid-refunds','account-takeover','device-risk','impossible-purchase-velocity','chargeback-pattern','catalog-tampering'],
    actions: ['allow','step-up-auth','hold','deny','manual-review'],
  },
} as const

export const MOVIE_BOX_CONTRACT = {
  name: 'TRYAMM Movie Box',
  goal: 'Create movies/reels from playable worlds, HoloArena sessions and creator scenes without losing project state.',
  pipeline: ['CHOOSE WORLD/SET','PLACE CHARACTERS','CAMERA SHOTS','RECORD DIALOGUE/VOICE','MUSIC/SFX','CAPTURE GAMEPLAY/CINEMATIC','LOTTIE 2.0 OVERLAYS','TIMELINE EDIT','TITLES/CREDITS','RIGHTS/PROVENANCE CHECK','PREVIEW','SAVE','REOPEN','EXPORT','PUBLISH'],
  lottie20: {
    runtime: 'lottie-web',
    versionContract: '2.0-library',
    uses: ['titles','transitions','lower-thirds','holographic-HUD','achievement-effects','credits','CTA-endcards'],
    rule: 'Use original, licensed, or user-authorized animation assets only.',
  },
  holoCreditUses: ['premium-original-effect-packs','optional-render-upgrades','creator-tool-entitlements','digital-set-customization'],
  freeBaseline: ['record','basic-edit','save','reopen','basic-titles','rights-check'],
  safety: ['never charge HC for accessibility','never hide export ownership rules','never auto-publish','preserve project after failed payment/render'],
  worldMemory: ['movie-project-id','source-world','characters-used','rights-state','creator-id','scene-checkpoints','published-output-id'],
} as const
