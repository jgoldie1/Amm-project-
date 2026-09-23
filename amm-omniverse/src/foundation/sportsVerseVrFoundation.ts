export const SPORTSVERSE_VR_FOUNDATION = {
  version: '0.1.0',
  releaseLane: 'post-alpha',
  featureFlag: 'sportsverseVrPhygital',
  principles: {
    serverAuthoritativeCompetition: true,
    crossInputParity: true,
    accessibilityFallbackRequired: true,
    cashRewardsRequireVerifiedCompetition: true,
    noClientMintedRewards: true,
  },
  inputs: ['vr-headset','holo-hand','touch','gamepad','keyboard','voice','adaptive-one-hand'],
  matchFormats: {
    basketball: ['1v1','3v3','5v5'],
    soccer: ['1v1','3v3','5v5'],
    football: ['5v5'],
    hockey: ['3v3','5v5'],
    beachVolleyball: ['2v2','5v5-arcade'],
    beachSoccer: ['3v3','5v5'],
    beachBasketball: ['3v3','5v5'],
  },
  roster: {
    aiFillEmptySlots: true,
    humanMayReplaceAiAtSafeJoinPoint: true,
    spectatorsSupported: true,
    coachesSupported: true,
  },
  interaction: {
    smartAction: true,
    holoHand: ['point','pinch','grab','swipe','open-palm-cancel'],
    contextualControls: true,
  },
  creatorLoop: ['match','event-replay','holo-director','highlight','reel','publish'],
  phygital: {
    resultClasses: ['casual','camera-estimated','verified-competition'],
    irlToAvatarProgression: true,
    sharedPlayerIdentity: true,
  },
} as const

export type SportsVerseVrFoundation = typeof SPORTSVERSE_VR_FOUNDATION
