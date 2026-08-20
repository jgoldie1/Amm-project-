export type LegacyMission = {
  id: string
  title: string
  location: string
  memoryStatus: 'player-authored'
  objectives: string[]
  consequenceWrites: string[]
  safety?: string[]
}

export const LONG_ROAD_HOME_ARC: LegacyMission[] = [
  {
    id: 'vegas-after-midnight',
    title: 'Vegas After Midnight',
    location: 'Las Vegas memory layer',
    memoryStatus: 'player-authored',
    objectives: ['enter the concert-era memory', 'reconnect with the traveling crew', 'collect memory fragments without reproducing protected concert media', 'choose how the night is remembered'],
    consequenceWrites: ['Vegas travel memory', 'music-era memory', 'friendship memory'],
  },
  {
    id: 'night-everything-changed',
    title: 'The Night Everything Changed',
    location: 'spiritual memory space',
    memoryStatus: 'player-authored',
    objectives: ['HUD fades into a quiet memory state', 'walk through holographic fragments of Chicago, family and Hollywood', 'record the player-authored near-death/spiritual experience', 'express gratitude to YAHAVAH', 'choose a renewed life-path value'],
    consequenceWrites: ['spiritual legacy memory', 'gratitude memory', 'life-path value change'],
  },
  {
    id: 'long-road-home',
    title: '1500 Miles Home',
    location: 'Las Vegas to Chicago interstate memory corridor',
    memoryStatus: 'player-authored',
    objectives: ['prepare the vehicle and route', 'manage fatigue and safe stopping decisions', 'respond to the crash memory without rewarding unsafe driving', 'find repair, lodging or roadside support', 'continue the journey through changing regions and weather'],
    consequenceWrites: ['road-trip memory', 'vehicle incident memory', 'crew trust change', 'interstate knowledge'],
    safety: ['unsafe driving is a failure/risk state, not a skill reward', 'fatigue prompts rest or driver change', 'damaged windshield triggers repair and visibility consequences'],
  },
  {
    id: 'cracked-glass',
    title: 'Cracked Glass',
    location: 'roadside America',
    memoryStatus: 'player-authored',
    objectives: ['inspect vehicle damage', 'contact a mechanic/tow/hotel', 'budget remaining travel resources', 'decide whether the vehicle is safe to continue'],
    consequenceWrites: ['roadside business relationship', 'vehicle safety memory', 'financial choice'],
  },
  {
    id: 'keep-the-crew-together',
    title: 'Keep the Crew Together',
    location: 'interstate corridor',
    memoryStatus: 'player-authored',
    objectives: ['resolve stress between travelers', 'share responsibilities', 'protect relationships while solving travel problems'],
    consequenceWrites: ['friendship trust', 'conflict resolution memory'],
  },
  {
    id: 'chicago-in-the-distance',
    title: 'Chicago in the Distance',
    location: 'Chicago return corridor',
    memoryStatus: 'player-authored',
    objectives: ['reach the Chicago skyline', 'trigger homecoming World Memory', 'reconnect with family/community nodes', 'compare the person who left with the person who returned'],
    consequenceWrites: ['Chicago homecoming', 'legacy progression', 'family/community return'],
  },
  {
    id: 'drive-that-road-again',
    title: 'Drive That Road Again',
    location: 'StreetVerse Time Machine',
    memoryStatus: 'player-authored',
    objectives: ['revisit the route from a later life stage', 'see holographic consequences from earlier choices', 'meet NPCs/businesses whose lives changed', 'record what the journey means now'],
    consequenceWrites: ['reflection memory', 'legacy score milestone', 'time-machine completion'],
  },
]

export const LONG_ROAD_HOME_LOOP = [
  'MUSIC + TRAVEL MEMORY',
  'SPIRITUAL / NEAR-DEATH MEMORY',
  'SAFE-TRAVEL CONSEQUENCE',
  'ROAD ECONOMY',
  'RELATIONSHIPS',
  'CHICAGO HOMECOMING',
  'WORLD MEMORY',
  'LATER-LIFE TIME-MACHINE RETURN',
  'LEGACY',
] as const
