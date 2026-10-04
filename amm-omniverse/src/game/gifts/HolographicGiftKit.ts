import type {LottieAnimKey} from '../lottie/LottieAnimations'

export type HoloGiftTier='MICRO'|'REACTION'|'MUSIC'|'PRESTIGE'|'SET-APART'|'PK'|'WORLD'
export type HoloGiftKitEntry={
 giftId:string
 lottieKey:LottieAnimKey
 fallbackKey:LottieAnimKey
 fullScreen:boolean
 owned:boolean
}

const SPECIFIC:Record<string,LottieAnimKey>={
 spark:'hologram_flicker',
 rose:'xp_burst',
 heart:'heal_burst',
 fire:'flame_scroll',
 confetti:'mission_complete',
 'kiss-me':'heal_burst',
 'air-kiss':'heal_burst',
 'holo-hug':'heal_burst',
 'high-five':'fusion_burst',
 wink:'avatar_select',
 'laugh-burst':'xp_burst',
 boo:'hologram_flicker',
 heartbreak:'life_drain',
 'cartoon-punch':'trap_activate',
 'cartoon-slap':'trap_activate',
 america250:'xp_burst',
 eagle:'portal_swirl',
 'liberty-bell':'wanted_alert',
 'stars-stripes':'xp_burst',
 'mic-drop':'radio_wave',
 vinyl:'radio_wave',
 boombox:'radio_wave',
 'gold-record':'mission_complete',
 crown:'crown_scroll',
 diamond:'crystal_gain',
 supercar:'fusion_burst',
 'private-jet':'portal_swirl',
 yacht:'portal_swirl',
 lion:'faith_glow',
 'twelve-tribes':'crown_scroll',
 shofar:'shofar_wave',
 'set-apart-scroll':'scroll_victory',
 'menorah-light':'menorah_light',
 'jerusalem-gate':'portal_swirl',
 ark:'faith_glow',
 judah:'crown_scroll',
 'pk-ko':'trap_activate',
 'pk-comeback':'fusion_burst',
 'pk-crown':'crown_scroll',
 galaxy:'realm_shift',
 supernova:'fusion_burst',
 'streetverse-car':'portal_swirl',
 'mars-drop':'realm_shift',
 'starverse-stage':'radio_wave',
 portal:'portal_swirl',
 'omnibox-premiere':'mission_complete',
 'world-takeover':'realm_shift',
}

export function lottieForGift(giftId:string,tier?:string):HoloGiftKitEntry{
 const fallback:LottieAnimKey=
  tier==='PK'?'fusion_burst':
  tier==='WORLD'?'portal_swirl':
  tier==='SET-APART'?'faith_glow':
  tier==='MUSIC'?'radio_wave':
  tier==='PRESTIGE'?'xp_burst':
  tier==='REACTION'?'hologram_flicker':
  'hologram_flicker'
 const lottieKey=SPECIFIC[giftId]||fallback
 return{
  giftId,
  lottieKey,
  fallbackKey:fallback,
  fullScreen:tier==='WORLD'||tier==='PK'||tier==='PRESTIGE',
  owned:true,
 }
}

export const HOLOGRAPHIC_GIFT_KIT={
 schema:'tryamm.holographic-gift-kit.v1',
 renderer:'lottie-web-inline-json',
 externalAnimationDependency:false,
 fallbackGuaranteed:true,
 specificMappings:Object.keys(SPECIFIC).length,
 tiers:['MICRO','REACTION','MUSIC','PRESTIGE','SET-APART','PK','WORLD'] as const,
 revenueSafety:{
  animationMayPlayBeforeSettlement:true,
  moneyMovedOnlyAfterVerifiedProviderEvent:true,
  visualEffectNeverCreatesWithdrawableBalance:true,
 },
} as const
