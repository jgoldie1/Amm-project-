export type AgeBand = 'child'|'teen'|'adult'|'older_adult'
export type GenderPresentation = 'woman'|'man'|'nonbinary'|'custom'|'prefer_not_to_say'
export type ContentMaturity = 'everyone'|'teen'|'adult'

export interface AccessibilityProfile {
  captions: boolean
  audioDescription: boolean
  screenReader: boolean
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  oneHandedControls: boolean
  switchControls: boolean
  voiceControl: boolean
  haptics: boolean
  scentCuesEnabled: boolean
  scentHardwareAvailable: boolean
}

export interface AudienceProfile {
  ageBand: AgeBand
  genderPresentation: GenderPresentation
  maturity: ContentMaturity
  accessibility: AccessibilityProfile
  socialDiscovery: 'friends_only'|'age_appropriate'|'open_adult'
  commerceEnabled: boolean
  voiceChatEnabled: boolean
  directMessagesEnabled: boolean
}

export interface SensoryCue {
  id: string
  meaning: string
  visual?: string
  audio?: string
  caption?: string
  hapticPattern?: string
  scent?: string
}

export interface AccessibleSensoryOutput {
  visual?: string
  audio?: string
  caption?: string
  hapticPattern?: string
  scentDeviceCue?: string
}

export function resolveSensoryCue(cue: SensoryCue, profile: AccessibilityProfile): AccessibleSensoryOutput {
  const out: AccessibleSensoryOutput = {}
  if (cue.visual) out.visual = cue.visual
  if (cue.audio) out.audio = cue.audio
  if (cue.caption && profile.captions) out.caption = cue.caption
  if (cue.hapticPattern && profile.haptics) out.hapticPattern = cue.hapticPattern
  if (cue.scent && profile.scentCuesEnabled && profile.scentHardwareAvailable) out.scentDeviceCue = cue.scent

  // Smell is enhancement only. If it carried meaning, guarantee at least one non-scent equivalent.
  if (cue.scent && !out.visual && !out.audio && !out.caption && !out.hapticPattern) {
    out.caption = cue.meaning
  }
  return out
}

export function configureAudience(ageBand: AgeBand, accessibility: AccessibilityProfile): AudienceProfile {
  if (ageBand === 'child') return {
    ageBand, genderPresentation:'prefer_not_to_say', maturity:'everyone', accessibility,
    socialDiscovery:'friends_only', commerceEnabled:false, voiceChatEnabled:false, directMessagesEnabled:false,
  }
  if (ageBand === 'teen') return {
    ageBand, genderPresentation:'prefer_not_to_say', maturity:'teen', accessibility,
    socialDiscovery:'age_appropriate', commerceEnabled:false, voiceChatEnabled:true, directMessagesEnabled:false,
  }
  return {
    ageBand, genderPresentation:'prefer_not_to_say', maturity:'adult', accessibility,
    socialDiscovery:'open_adult', commerceEnabled:true, voiceChatEnabled:true, directMessagesEnabled:true,
  }
}

export const AGE_SAFE_GAMEPLAY_RULES = Object.freeze({
  child: ['no_real_money_rewards','no_direct_messages','no_open_voice_chat','no_adult_worlds','guardian_controls_required'],
  teen: ['no_regulated_investment','no_adult_worlds','restricted_commerce','moderated_voice','age_appropriate_discovery'],
  adult: ['full_age_appropriate_gameplay','regulated_features_still_require_separate_eligibility'],
  older_adult: ['full_age_appropriate_gameplay','accessible_defaults_recommended'],
})

export const CHARACTER_QUALITY_REQUIREMENTS = [
  'broad_body_shapes_and_heights',
  'age_appropriate_faces_and_motion',
  'women_men_nonbinary_and_custom_presentation',
  'skin_hair_and_clothing_variety',
  'mobility_aids_and_accessibility_devices',
  'culturally_varied_styles_without_stereotype_templates',
  'facial_microexpressions',
  'eye_focus_and_blinking',
  'lip_sync_and_voice_emotion',
  'finger_and_foot_placement',
  'cloth_and_hair_motion_lod',
] as const
