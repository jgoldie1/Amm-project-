export type SpatialPlayMode='TABLETOP_AR'|'ROOM_AR'|'VR_ARENA'|'MR_ARENA'
export type SpatialAnchorKind='TRYAMM_CARD'|'QR_PASSPORT'|'AUTHORIZED_OBJECT'|'DIGITAL_DECK'

export type RealityDeckSummon={
  id:string
  name:string
  family:'YOGIHOO'|'MISCHIEF_CREATURE'
  role:'STRIKER'|'GUARDIAN'|'TRICKSTER'|'SUPPORT'
  abilities:string[]
  evolutionPath:string[]
}

export const OMNIDECK_REALITY_SYSTEM={
  id:'omnideck-ar',
  title:'OmniDeck AR',
  connects:['Yogihoo Arena','Battle Deck: Holo Champions','Mischief Creatures'],
  modes:['TABLETOP_AR','ROOM_AR','VR_ARENA','MR_ARENA'] as SpatialPlayMode[],
  anchors:['TRYAMM_CARD','QR_PASSPORT','AUTHORIZED_OBJECT','DIGITAL_DECK'] as SpatialAnchorKind[],
  loop:[
    'recognize an authorized physical or digital anchor',
    'resolve the TRYAMM-owned summon identity',
    'place the summon into a tabletop, room, VR or MR arena',
    'run abilities, positioning, team combos and environmental interactions',
    'write battle result, mastery, reputation and replay metadata back to the TRYAMM Passport',
  ],
  accessibility:[
    'one-hand action mode',
    'large-target spatial controls',
    'voice-selectable actions',
    'reduced-motion placement',
    'seated/tabletop mode',
  ],
  authority:[
    'physical cards and QR anchors identify content but never mint money or ownership by themselves',
    'server-authoritative Passport state controls unlocks, progression, rankings and paid inventory',
    'camera access must be explicit and foreground-only',
    'precise location is not required for ordinary battles',
  ],
  rights:[
    'original TRYAMM creatures, names, art and lore only',
    'no third-party character art, card frames, logos, sounds or copied battle text',
  ],
} as const

export const REALITY_DECK_SUMMONS:RealityDeckSummon[]=[
  {id:'yogihoo-aegis-lion',name:'Aegis Lion',family:'YOGIHOO',role:'GUARDIAN',abilities:['Prism Guard','Roar Pulse','Team Ward'],evolutionPath:['Cub Spark','Aegis Lion','Crown Aegis']},
  {id:'yogihoo-rift-mantis',name:'Rift Mantis',family:'YOGIHOO',role:'STRIKER',abilities:['Rift Cut','Mirror Step','Combo Mark'],evolutionPath:['Shard Nymph','Rift Mantis','Void Mantis']},
  {id:'mischief-sprocket',name:'Sprocket',family:'MISCHIEF_CREATURE',role:'TRICKSTER',abilities:['Device Jinx','Decoy Swarm','Scrap Shift'],evolutionPath:['Nib','Sprocket','Overclock Sprocket']},
  {id:'mischief-gloomkin',name:'Gloomkin',family:'MISCHIEF_CREATURE',role:'SUPPORT',abilities:['Shadow Hide','Mischief Link','Portal Nudge'],evolutionPath:['Glim','Gloomkin','Rift Gloomkin']},
]

export function resolveRealityDeckSummon(input:{anchorKind:SpatialAnchorKind;contentId:string;mode:SpatialPlayMode}){
  const summon=REALITY_DECK_SUMMONS.find(item=>item.id===input.contentId)
  if(!summon) return {ok:false as const,reason:'UNKNOWN_TRYAMM_CONTENT'}
  if(!OMNIDECK_REALITY_SYSTEM.anchors.includes(input.anchorKind)) return {ok:false as const,reason:'UNAUTHORIZED_ANCHOR'}
  if(!OMNIDECK_REALITY_SYSTEM.modes.includes(input.mode)) return {ok:false as const,reason:'UNSUPPORTED_SPATIAL_MODE'}
  return {
    ok:true as const,
    summon,
    mode:input.mode,
    authority:'PASSPORT_SERVER',
    replayTags:['omnideck-ar',summon.family.toLowerCase(),input.mode.toLowerCase()],
  }
}
