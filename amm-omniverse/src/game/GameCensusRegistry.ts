export const CORE_WORLD_CENSUS = [
  'Gridiron X','Court Kings','Diamond Legends','Ice Storm','World Pitch','Fight Night Holo','StreetVerse','Battlefront Zero','Yogihoo Arena','Volcano Racers','Kingdom Builders'
] as const

export const GAMEVERSE_RUNTIME_CENSUS = [
  'Living City','Living Flight','HoloBeasts: Living Wilds','Living Ops: Shadow Front','Paranormal Unit: Rift Hunters','Holo Battle: Omniverse','Living Racing','Living Sports','Living Laser','Living Quest','Creator World'
] as const

export const HOLOARENA_LAUNCH_GAMES = [
  'Volcano: Last Route','Battle Deck: Holo Champions','Photon Tag: Neon District','Timewalk: Archive Detectives'
] as const

export const RESTORED_PLANNED_GAMES = [
  {
    name:'Toe Monroe: Holographic Pinball',
    lane:'Black-anime-inspired original holographic arcade/pinball experience',
    status:'PLANNED',
    levels:['Street Table','Neon City','Holo Rift','Legacy Championship'],
    systems:['physics table','holographic targets','mission multipliers','World Memory high scores','AR tabletop mode','VR cabinet mode','venue cabinet mode','Movie Box replay'],
    rightsRule:'Use original TRYAMM/creator-owned characters, art, music and likenesses or separately documented permissions.'
  },
] as const

export const DELIVERY_MODES = ['Web','Mobile','AR','VR','Mixed Reality','HoloArena location XR','Spectator display','Movie/replay output'] as const

export const GLOBAL_GAMES_COUNTS = {
  summerSports:34,
  winterSports:15,
  totalSports:49,
  note:'TRYAMM Summer + Winter Global Games uses an independent Olympic-style competition structure; official Olympic branding/marks/data require separate rights.'
} as const

export const CENSUS_TRUTH = 'The two 11-item catalogs overlap conceptually and are not 22 fully separate finished games. Core World names are branded worlds; GameVerse Runtime names are the current runtime/entry architecture. Count unique finished products only after gameplay/runtime scope is reconciled.'
