export type MaskStyle = 'ski_mask'|'balaclava'|'street_mask'|'holo_mask'|'creator_mask'
export type CosmeticCurrency = 'USD'

export interface MaskCosmetic {
  id: string
  name: string
  style: MaskStyle
  priceCents: 1000
  currency: CosmeticCurrency
  cosmeticOnly: true
  hidesAvatarFaceVisually: boolean
  bypassesAccountIdentity: false
  bypassesAgeGate: false
  bypassesModeration: false
  bypassesSecurity: false
  competitiveAdvantage: false
  paidRewardEligible: false
}

export const MASK_COSMETICS: MaskCosmetic[] = [
  {id:'midnight-ski',name:'Midnight Ski Mask',style:'ski_mask',priceCents:1000,currency:'USD',cosmeticOnly:true,hidesAvatarFaceVisually:true,bypassesAccountIdentity:false,bypassesAgeGate:false,bypassesModeration:false,bypassesSecurity:false,competitiveAdvantage:false,paidRewardEligible:false},
  {id:'holo-balaclava',name:'Holo Balaclava',style:'balaclava',priceCents:1000,currency:'USD',cosmeticOnly:true,hidesAvatarFaceVisually:true,bypassesAccountIdentity:false,bypassesAgeGate:false,bypassesModeration:false,bypassesSecurity:false,competitiveAdvantage:false,paidRewardEligible:false},
  {id:'judah-street-mask',name:'Judah Street Mask',style:'street_mask',priceCents:1000,currency:'USD',cosmeticOnly:true,hidesAvatarFaceVisually:true,bypassesAccountIdentity:false,bypassesAgeGate:false,bypassesModeration:false,bypassesSecurity:false,competitiveAdvantage:false,paidRewardEligible:false},
]

export interface CosmeticEntitlement {
  userId: string
  cosmeticId: string
  providerReceiptId: string
  grantedAt: string
  revokedAt?: string
}

export function canEquipMask(mask: MaskCosmetic, entitlement: CosmeticEntitlement | undefined, userId: string) {
  return Boolean(entitlement && entitlement.userId === userId && entitlement.cosmeticId === mask.id && !entitlement.revokedAt)
}

export const IDENTITY_SEPARATION_RULES = [
  'avatar_mask_changes_visual_presentation_only',
  'account_identity_and_server_user_id_remain_unchanged',
  'moderation_can_still_attribute_actions_to_account',
  'age_and_adult_mode_gates_are_not_bypassed',
  'fraud_risk_and_payout_step_up_are_not_bypassed',
  'competitive_and_paid_reward_rules_are_not_changed_by_cosmetic',
  'purchase_requires_authoritative_money_engine_receipt',
  'refund_or_chargeback_can_revoke_entitlement',
] as const

export interface DistrictCloneContract {
  sourceDistrict: 'streetverse_district_01'
  preserveSystems: string[]
  replaceContent: string[]
  mandatoryProof: string[]
}

export const DISTRICT_EXPANSION_CONTRACT: DistrictCloneContract = {
  sourceDistrict:'streetverse_district_01',
  preserveSystems:['identity','avatar','passport','inventory','world_pulse','character_intelligence','discovery_director','live_chat','checkpoint','panic_mode','accessibility','render_quality','money_entitlements'],
  replaceContent:['geometry','glb_assets','businesses','missions','characters','stories','easter_eggs','music','world_pulse_events'],
  mandatoryProof:['asset_rights','glb_validation','skin_tone_render_qa','teeth_eye_hair_qa','mobile_frame_budget','xr_frame_budget','two_client_multiplayer','save_rejoin','panic_mode','commerce_sandbox'],
}
