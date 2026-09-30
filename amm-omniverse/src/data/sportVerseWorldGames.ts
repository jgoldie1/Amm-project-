export type SportVerseCompetitionStage='training'|'qualifier'|'heat'|'quarterfinal'|'semifinal'|'final'
export type SportVerseMedal='gold'|'silver'|'bronze'

export type SportVerseSportModule=Readonly<{
 id:string;label:string;family:'aquatics'|'court'|'field'|'combat'|'track'|'team'|'precision'|'racing'|'urban'|'winter'
 adapter?:string
 foundation:'reuse-existing'|'shared-physics'|'new-module'
 modes:readonly string[]
 accessibility:readonly string[]
}>

export const SPORTVERSE_WORLD_GAMES={
 publicName:'SportVerse World Games',
 legacyFoundation:'Olympic Kingdom',
 branding:{
  useOfficialOlympicMarks:false,
  reason:'Public/commercial Olympic properties require rights/licensing; use original TRYAMM World Games branding by default.',
 },
 athletePassport:[
  'one-athlete-identity','avatar','country-or-community-team','training','reputation','mastery',
  'accessibility-passport','tournament-history','medals','replays','reels','creator-attribution','ledger'
 ],
 competitionFlow:['training','qualifier','heat','quarterfinal','semifinal','final'] as const,
 systems:[
  'national-and-community-teams','men-women-mixed-divisions','youth-academy','school-college-club-paths',
  'qualifiers','brackets','heats','medals','records','leaderboards','anti-cheat','explainable-officiating',
  'live-pk','holo-live','replay','reel-capture','sponsors','server-validated-rewards'
 ],
} as const

export const SPORTVERSE_WORLD_GAMES_SPORTS:readonly SportVerseSportModule[]=[
 {id:'basketball',label:'Basketball',family:'court',adapter:'court-kings',foundation:'reuse-existing',modes:['5v5','3x3','skills','dunk-contest'],accessibility:['one-hand-assist','aim-assist','reduced-motion']},
 {id:'flag-football',label:'Flag Football',family:'field',adapter:'gridiron-x',foundation:'reuse-existing',modes:['5v5','7v7','skills'],accessibility:['route-assist','one-hand-controls','coach-mode']},
 {id:'soccer',label:'Football / Soccer',family:'team',adapter:'world-pitch',foundation:'reuse-existing',modes:['11v11','5v5','penalties'],accessibility:['pass-assist','one-hand-controls','coach-mode']},
 {id:'baseball-softball',label:'Baseball / Softball',family:'field',adapter:'diamond-legends',foundation:'reuse-existing',modes:['full-game','home-run','pitching'],accessibility:['timing-assist','one-hand-batting','coach-mode']},
 {id:'boxing',label:'Boxing',family:'combat',adapter:'fight-night-holo',foundation:'reuse-existing',modes:['bout','bag-training','skills'],accessibility:['gesture-assist','one-hand-mode','coach-mode']},
 {id:'swimming',label:'Swimming',family:'aquatics',adapter:'streetverse-pool',foundation:'reuse-existing',modes:['freestyle','breaststroke','backstroke','butterfly','relay'],accessibility:['lane-assist','one-button-stroke','reduced-motion']},
 {id:'artistic-swimming',label:'Artistic Swimming',family:'aquatics',adapter:'streetverse-pool',foundation:'reuse-existing',modes:['solo','duet','team'],accessibility:['sequence-assist','timing-cues','reduced-motion']},
 {id:'water-polo',label:'Water Polo',family:'aquatics',adapter:'streetverse-pool',foundation:'shared-physics',modes:['team','shootout'],accessibility:['pass-assist','one-hand-controls','coach-mode']},
 {id:'athletics-track',label:'Track',family:'track',foundation:'shared-physics',modes:['sprint','distance','relay','hurdles'],accessibility:['auto-stride','one-button-lane','reduced-motion']},
 {id:'athletics-field',label:'Field Events',family:'field',foundation:'shared-physics',modes:['long-jump','high-jump','shot-put','discus','javelin'],accessibility:['timing-assist','trajectory-preview','one-hand-mode']},
 {id:'tennis',label:'Tennis',family:'court',adapter:'circle-park-tennis',foundation:'reuse-existing',modes:['singles','doubles','skills'],accessibility:['swing-assist','one-hand-mode','ball-speed-scaling']},
 {id:'volleyball',label:'Volleyball',family:'court',foundation:'shared-physics',modes:['indoor','beach'],accessibility:['position-assist','one-hand-mode','coach-mode']},
 {id:'wrestling',label:'Wrestling',family:'combat',foundation:'new-module',modes:['freestyle','greco-style'],accessibility:['grapple-assist','timing-cues','coach-mode']},
 {id:'judo',label:'Judo',family:'combat',foundation:'new-module',modes:['match','skills'],accessibility:['timing-assist','gesture-remap','coach-mode']},
 {id:'taekwondo',label:'Taekwondo',family:'combat',foundation:'new-module',modes:['match','forms'],accessibility:['timing-assist','gesture-remap','coach-mode']},
 {id:'archery',label:'Archery',family:'precision',foundation:'shared-physics',modes:['individual','team'],accessibility:['aim-assist','hold-toggle','reduced-motion']},
 {id:'shooting-sport',label:'Target Sport',family:'precision',foundation:'shared-physics',modes:['precision-target'],accessibility:['steady-aim-assist','hold-toggle','reduced-motion']},
 {id:'cycling',label:'Cycling',family:'racing',adapter:'living-racing',foundation:'reuse-existing',modes:['road','track','bmx-race','bmx-freestyle','mountain'],accessibility:['steering-assist','one-hand-controls','reduced-motion']},
 {id:'skateboarding',label:'Skateboarding',family:'urban',foundation:'shared-physics',modes:['street','park'],accessibility:['balance-assist','trick-assist','reduced-motion']},
 {id:'sport-climbing',label:'Sport Climbing',family:'urban',foundation:'new-module',modes:['speed','boulder','lead'],accessibility:['route-assist','grip-toggle','spectator-mode']},
 {id:'surfing',label:'Surfing',family:'urban',foundation:'new-module',modes:['heat','free-surf'],accessibility:['balance-assist','wave-preview','reduced-motion']},
 {id:'rowing',label:'Rowing',family:'racing',foundation:'shared-physics',modes:['single','team'],accessibility:['stroke-assist','one-button-stroke','coach-mode']},
 {id:'canoe',label:'Canoe / Kayak',family:'racing',foundation:'shared-physics',modes:['sprint','slalom'],accessibility:['paddle-assist','one-hand-controls','course-preview']},
 {id:'rugby',label:'Rugby',family:'field',foundation:'new-module',modes:['sevens'],accessibility:['pass-assist','one-hand-controls','coach-mode']},
 {id:'hockey',label:'Field Hockey',family:'field',foundation:'new-module',modes:['team'],accessibility:['stick-assist','one-hand-mode','coach-mode']},
 {id:'handball',label:'Handball',family:'court',foundation:'shared-physics',modes:['team'],accessibility:['pass-assist','one-hand-controls','coach-mode']},
 {id:'table-tennis',label:'Table Tennis',family:'court',foundation:'shared-physics',modes:['singles','doubles'],accessibility:['swing-assist','one-hand-mode','ball-speed-scaling']},
 {id:'badminton',label:'Badminton',family:'court',foundation:'shared-physics',modes:['singles','doubles'],accessibility:['swing-assist','one-hand-mode','shuttle-speed-scaling']},
 {id:'golf',label:'Golf',family:'precision',foundation:'shared-physics',modes:['stroke-play','skills'],accessibility:['swing-assist','trajectory-preview','one-hand-mode']},
 {id:'triathlon',label:'Triathlon',family:'racing',foundation:'shared-physics',modes:['swim-bike-run'],accessibility:['segment-assist','one-hand-controls','reduced-motion']},
 {id:'cricket',label:'Cricket T20',family:'field',foundation:'new-module',modes:['T20','skills'],accessibility:['timing-assist','one-hand-batting','coach-mode']},
 {id:'lacrosse',label:'Lacrosse Sixes',family:'field',foundation:'new-module',modes:['sixes'],accessibility:['pass-assist','one-hand-mode','coach-mode']},
 {id:'squash',label:'Squash',family:'court',foundation:'shared-physics',modes:['singles'],accessibility:['swing-assist','one-hand-mode','ball-speed-scaling']},
] as const

export const sportVerseModule=(id:string)=>SPORTVERSE_WORLD_GAMES_SPORTS.find(s=>s.id===id)

export const requestSportVerseWorldGamesEvent=(event:string,detail:Record<string,unknown>={})=>
 window.dispatchEvent(new CustomEvent('tryamm:sportverse-world-games',{detail:{event,...detail,source:'sportverse-world-games'}}))
