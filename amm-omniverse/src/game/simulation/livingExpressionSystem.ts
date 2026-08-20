export type CoreEmotion = 'joy'|'sadness'|'anger'|'fear'|'surprise'|'disgust'|'calm'|'love'|'pride'|'shame'|'grief'|'hope'|'excitement'|'loneliness'
export type SenseChannel = 'vision'|'hearing'|'touch'|'smell'|'taste'

export interface EmotionalState {
  primary: CoreEmotion
  intensity: number // 0..1
  valence: number // -1..1
  arousal: number // 0..1
  trust: number // 0..1
  socialNeed: number // 0..1
  memoryTags: string[]
}

export interface ExpressionState {
  face: { brow: number; eyes: number; cheeks: number; mouth: number; blinkRate: number }
  gazeTarget?: string
  voice: { pace: number; pitch: number; energy: number; tremor: number }
  body: { posture: number; gestureEnergy: number; personalSpace: number; locomotionUrgency: number }
}

export interface LifeNeedState {
  hunger: number
  thirst: number
  fatigue: number
  comfort: number
  safety: number
  belonging: number
  purpose: number
}

export interface ScentSource {
  id: string
  category: 'food'|'rain'|'soil'|'flowers'|'water'|'smoke'|'vehicle'|'cleaning'|'animal'|'venue'|'custom'
  label: string
  intensity: number
  radiusMeters: number
  position: [number, number, number]
  tags: string[]
}

export interface ScentPerception {
  sourceId: string
  label: string
  perceivedIntensity: number
  direction?: number
  description: string
}

// Consumer hardware generally cannot synthesize arbitrary smells. This layer is therefore
// device-adaptive: normal screens use descriptive/visual/audio associations; an explicitly
// supported external scent device may receive abstract scent cues through a permissioned adapter.
export function perceiveScent(source: ScentSource, distanceMeters: number, windFactor = 1): ScentPerception | null {
  if (distanceMeters > source.radiusMeters || source.intensity <= 0) return null
  const falloff = Math.max(0, 1 - distanceMeters / Math.max(0.01, source.radiusMeters))
  const perceivedIntensity = Math.min(1, source.intensity * falloff * Math.max(0, windFactor))
  return {
    sourceId: source.id,
    label: source.label,
    perceivedIntensity,
    description: perceivedIntensity > .7 ? `strong ${source.label}` : perceivedIntensity > .3 ? source.label : `faint ${source.label}`,
  }
}

export interface LivingAgentState {
  id: string
  emotion: EmotionalState
  expression: ExpressionState
  needs: LifeNeedState
  relationships: Record<string, number>
  shortTermGoals: string[]
  currentActivity: string
  recentMemories: Array<{ tag: string; emotionalWeight: number; createdAt: number }>
}

export interface WorldStimulus {
  type: 'conversation'|'music'|'weather'|'crowd'|'danger'|'success'|'failure'|'food'|'scent'|'friend'|'loss'|'discovery'|'event'
  strength: number
  valence: number
  tags: string[]
}

export function applyStimulus(agent: LivingAgentState, stimulus: WorldStimulus): LivingAgentState {
  const strength = Math.max(0, Math.min(1, stimulus.strength))
  const valence = Math.max(-1, Math.min(1, stimulus.valence))
  const next = structuredClone(agent)
  next.emotion.valence = clamp(next.emotion.valence * .72 + valence * strength * .28, -1, 1)
  next.emotion.arousal = clamp(next.emotion.arousal * .8 + strength * .2, 0, 1)
  next.emotion.intensity = clamp(Math.max(next.emotion.intensity * .82, strength), 0, 1)
  next.emotion.memoryTags = [...new Set([...next.emotion.memoryTags, ...stimulus.tags])].slice(-16)
  next.recentMemories = [...next.recentMemories, { tag: stimulus.tags[0] ?? stimulus.type, emotionalWeight: valence * strength, createdAt: Date.now() }].slice(-24)
  return next
}

export function deriveExpression(emotion: EmotionalState): ExpressionState {
  const positive = Math.max(0, emotion.valence)
  const negative = Math.max(0, -emotion.valence)
  return {
    face: {
      brow: clamp(negative * .7 + emotion.arousal * .2, 0, 1),
      eyes: clamp(.35 + emotion.arousal * .5, 0, 1),
      cheeks: clamp(positive * .75, 0, 1),
      mouth: clamp((emotion.valence + 1) / 2, 0, 1),
      blinkRate: clamp(.25 + emotion.arousal * .35, 0, 1),
    },
    voice: {
      pace: clamp(.35 + emotion.arousal * .5, 0, 1),
      pitch: clamp(.4 + positive * .2 + emotion.arousal * .15, 0, 1),
      energy: clamp(.25 + emotion.arousal * .65, 0, 1),
      tremor: clamp(negative * emotion.arousal * .5, 0, 1),
    },
    body: {
      posture: clamp(.5 + positive * .3 - negative * .25, 0, 1),
      gestureEnergy: clamp(.2 + emotion.arousal * .7, 0, 1),
      personalSpace: clamp(.45 + negative * .3, 0, 1),
      locomotionUrgency: clamp(.15 + emotion.arousal * .75, 0, 1),
    },
  }
}

export interface WorldPulseContext {
  hour: number
  weather: string
  district: string
  populationDensity: number
  creatorActivity: number
  businessActivity: number
  nightlifeActivity: number
  wildlifeActivity: number
  majorEventIntensity: number
}

export function calculateWorldPulse(ctx: WorldPulseContext) {
  const nightlife = ctx.hour >= 19 || ctx.hour <= 3 ? ctx.nightlifeActivity : ctx.nightlifeActivity * .35
  return Math.round(clamp((ctx.populationDensity*.2 + ctx.creatorActivity*.18 + ctx.businessActivity*.16 + nightlife*.18 + ctx.wildlifeActivity*.08 + ctx.majorEventIntensity*.2),0,1)*100)
}

export const LIVING_WORLD_QUALITY_GATES = [
  'facial_microexpression_continuity',
  'gaze_and_blink_naturalness',
  'voice_emotion_alignment',
  'foot_placement_and_body_motion',
  'short_term_npc_goals',
  'business_hours_capacity_and_staffing',
  'crowd_density_reacts_to_events',
  'wildlife_continues_off_player_focus',
  'weather_affects_behavior_and_scent',
  'world_pulse_changes_missions_and_traffic',
  'sensory_cues_have_accessible_equivalents',
  'scent_never_required_for_gameplay',
  'performance_budget_survives_peak_event',
] as const

function clamp(n:number,min:number,max:number){ return Math.max(min,Math.min(max,n)) }
