export type ShowcaseCharacter = {
  id: string
  displayName: string
  role: string
  source: 'player-authored' | 'public-figure-reference' | 'fictional'
  playable: boolean
  rightsStatus: 'player-memory' | 'reference-only' | 'original'
}

export const HOLLYWOOD_SHOWCASE_CHARACTERS: ShowcaseCharacter[] = [
  {
    id: 'raymond-jarreau',
    displayName: 'Raymond Jarreau',
    role: 'Hollywood Showcase connector / family-network mentor',
    source: 'player-authored',
    playable: false,
    rightsStatus: 'player-memory',
  },
  {
    id: 'chris-tucker-reference',
    displayName: 'Chris Tucker',
    role: 'Comedy and Hollywood cultural reference',
    source: 'public-figure-reference',
    playable: false,
    rightsStatus: 'reference-only',
  },
  {
    id: 'showcase-host-original',
    displayName: 'The Showcase Host',
    role: 'Original playable talent-show host and mission giver',
    source: 'fictional',
    playable: true,
    rightsStatus: 'original',
  },
]

export type ShowcaseMission = {
  id: string
  title: string
  roles: string[]
  objectives: string[]
  memoryWrites: string[]
  unlocks: string[]
}

export const HOLLYWOOD_SHOWCASE_MISSIONS: ShowcaseMission[] = [
  {
    id: 'showcase-open-call', title: 'Open Call',
    roles: ['performer','comedian','dancer','singer','stagehand'],
    objectives: ['find the venue','check in','rehearse','choose a performance path','complete the showcase'],
    memoryWrites: ['first Hollywood showcase','audition courage','stage reputation'],
    unlocks: ['Backstage Pass','Showcase Circuit'],
  },
  {
    id: 'backstage-pass', title: 'Backstage Pass',
    roles: ['production assistant','camera operator','lighting operator','sound engineer','stage manager'],
    objectives: ['solve a call-sheet conflict','set lights','check microphones','coordinate talent','deliver the show on time'],
    memoryWrites: ['production reliability','crew relationships'],
    unlocks: ['Production Company Path'],
  },
  {
    id: 'comedy-night', title: 'Hollywood Comedy Night',
    roles: ['comedian','host','writer','camera operator'],
    objectives: ['write an original set','test material on fictional NPCs','perform','handle crowd reactions','publish an original replay'],
    memoryWrites: ['comedy reputation','creator audience'],
    unlocks: ['Touring Comedy Circuit'],
  },
  {
    id: 'soul-line-to-showcase', title: 'From the Line to the Showcase',
    roles: ['dancer','choreographer','creator'],
    objectives: ['complete Soul Train Line challenge','build original choreography','rehearse with a fictional crew','headline a showcase'],
    memoryWrites: ['dance legacy','Hollywood showcase reputation'],
    unlocks: ['Dance Headliner Missions'],
  },
  {
    id: 'talent-scout', title: 'Find the Next Star',
    roles: ['talent scout','manager','producer'],
    objectives: ['watch fictional auditions','evaluate skill and professionalism','offer a development mission','build a showcase lineup'],
    memoryWrites: ['talent-development reputation','industry network'],
    unlocks: ['Agency and Management Path'],
  },
  {
    id: 'showcase-to-network', title: 'Showcase to Network',
    roles: ['producer','director','editor','host'],
    objectives: ['record the event','edit a rights-safe highlight','publish to All American Network','respond to audience feedback'],
    memoryWrites: ['broadcast credit','network audience'],
    unlocks: ['All American Network Series'],
  },
  {
    id: 'boulevard-afterparty', title: 'Boulevard Afterparty',
    roles: ['promoter','DJ','security','rideshare driver','vendor'],
    objectives: ['prepare a legal event','coordinate transport','serve fictional crowds','keep the event safe','close the ledger'],
    memoryWrites: ['nightlife reputation','business reliability'],
    unlocks: ['Hollywood Event Business'],
  },
  {
    id: 'return-to-the-showcase', title: 'Return to the Showcase',
    roles: ['legacy artist','mentor','business owner'],
    objectives: ['return after building reputation elsewhere','meet NPCs who remember earlier missions','mentor a fictional newcomer','fund or produce a new showcase'],
    memoryWrites: ['mentor legacy','Hollywood legacy'],
    unlocks: ['Legacy Showcase Season'],
  },
]

export const SHOWCASE_LIFE_LOOP = [
  'SOUL TRAIN MEMORY',
  'SOUL TRAIN LINE',
  'DANCE / COMEDY / MUSIC SCORE',
  'HOLLYWOOD SHOWCASE',
  'CREATOR REPLAY',
  'ALL AMERICAN NETWORK',
  'WORLD MEMORY',
  'HOLLYWOOD REPUTATION',
  'AGENCY / PRODUCTION COMPANY / TOUR',
  'RETURN AS A MENTOR',
  'NEW MISSIONS',
] as const

export const PUBLIC_FIGURE_RIGHTS_RULE = {
  referenceAllowedForPlanning: true,
  commercialPlayableLikenessRequiresRights: true,
  voiceCloneWithoutPermission: false,
  inventedPrivateDialogueAsFact: false,
  originalComedyCharacterAvailableImmediately: true,
} as const
