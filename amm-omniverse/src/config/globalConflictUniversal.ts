export type UniversalGameId=
  |'streetverse'|'gridiron-x'|'court-kings'|'diamond-legends'|'ice-storm'|'world-pitch'
  |'fight-night-holo'|'battlefront-zero'|'yogihoo-arena'|'volcano-racers'|'kingdom-builders'|'quantum-tag'

export type UniversalCampaignAdapter={
  gameId:UniversalGameId
  campaignRole:string
  chapterLoops:string[]
  sharedOutputs:string[]
  violenceProfile:'NONE'|'SPORT'|'FANTASY'|'TACTICAL_FICTION'
}

export const GLOBAL_CONFLICT_UNIVERSAL={
  id:'global-conflict-universal',
  title:'Global Conflict / WWIII Universe',
  canon:'Original fictional TRYAMM universe. It is not a recreation of a current real-world war.',
  architecture:'universal-campaign-fabric',
  purpose:[
    'let every TRYAMM game participate in one optional cross-game seasonal story',
    'keep each game mechanically independent while sharing Passport progression and event state',
    'create a dependable monthly release train without forcing unfinished games into production',
    'turn every launch into the next chapter of a connected universe',
  ],
  sharedState:[
    'passport-campaign-rank',
    'chapter-completion',
    'cross-game-unlocks',
    'team-affiliation-fictional-only',
    'world-event-state',
    'replay-and-highlight-metadata',
    'accessibility-preferences',
    'creator-attribution',
  ],
  releaseTrain:{
    cadence:'MONTHLY',
    targetWindowRule:'SECOND_FRIDAY',
    slotPolicy:'A game receives a public date only after exact-head production gates pass; an unready title rolls to the next open monthly slot instead of shipping broken.',
    chapterPolicy:'Every monthly game launch ships with one Global Conflict crossover chapter plus its own standalone content.',
    preloadPolicy:'Previous month can tease the next title through portals, missions, collectibles and non-purchasable preview content.',
  },
  safeguards:[
    'fictional nations, factions, commanders and scenarios by default',
    'no claim that fictional events describe real people or current conflicts',
    'no real-money reward is granted from client-side game state',
    'cross-game paid inventory and eligibility remain server authoritative',
    'players can opt out of the Global Conflict campaign and still play each standalone game',
  ],
} as const

export const GLOBAL_CONFLICT_ADAPTERS:UniversalCampaignAdapter[]=[
  {gameId:'streetverse',campaignRole:'Civilian open-world hub',chapterLoops:['city alerts','rescue and logistics missions','business continuity','rebuild districts','investigation and diplomacy choices'],sharedOutputs:['campaign-rank','district-state','replay'],violenceProfile:'TACTICAL_FICTION'},
  {gameId:'gridiron-x',campaignRole:'Global morale sports chapter',chapterLoops:['international exhibition','team objective challenges','stadium event'],sharedOutputs:['team-reputation','cosmetics','replay'],violenceProfile:'SPORT'},
  {gameId:'court-kings',campaignRole:'Street and arena basketball chapter',chapterLoops:['city-v-city tournament','court-control objectives','creator exhibition'],sharedOutputs:['team-reputation','cosmetics','replay'],violenceProfile:'SPORT'},
  {gameId:'diamond-legends',campaignRole:'Baseball relief-series chapter',chapterLoops:['series missions','precision challenges','community stadium event'],sharedOutputs:['team-reputation','cosmetics','replay'],violenceProfile:'SPORT'},
  {gameId:'ice-storm',campaignRole:'Hockey alliance chapter',chapterLoops:['league series','team chemistry objectives','arena event'],sharedOutputs:['team-reputation','cosmetics','replay'],violenceProfile:'SPORT'},
  {gameId:'world-pitch',campaignRole:'Global football unity chapter',chapterLoops:['world tournament','club objectives','stadium event'],sharedOutputs:['team-reputation','cosmetics','replay'],violenceProfile:'SPORT'},
  {gameId:'fight-night-holo',campaignRole:'Combat academy defense chapter',chapterLoops:['dojo trials','team tournament','mastery challenges'],sharedOutputs:['combat-mastery','campaign-rank','replay'],violenceProfile:'SPORT'},
  {gameId:'battlefront-zero',campaignRole:'Primary tactical campaign',chapterLoops:['training','team battle','capture','survival','ranked campaign missions'],sharedOutputs:['squad-rank','mission-record','campaign-state','replay'],violenceProfile:'TACTICAL_FICTION'},
  {gameId:'yogihoo-arena',campaignRole:'Creature-energy anomaly chapter',chapterLoops:['protect portals','deck battles','creature rescue','arena tournament'],sharedOutputs:['deck-mastery','creature-bond','campaign-rank','replay'],violenceProfile:'FANTASY'},
  {gameId:'volcano-racers',campaignRole:'Mobility and courier chapter',chapterLoops:['evacuation time trial','supply run','pursuit race','route unlock'],sharedOutputs:['driver-rank','route-state','replay'],violenceProfile:'SPORT'},
  {gameId:'kingdom-builders',campaignRole:'Recovery and reconstruction chapter',chapterLoops:['restore utilities','build shelters','resource routing','district recovery'],sharedOutputs:['rebuild-score','world-state','replay'],violenceProfile:'NONE'},
  {gameId:'quantum-tag',campaignRole:'Non-lethal signal and portal-control chapter',chapterLoops:['phase capture','portal run','team territory','time-shift tournament'],sharedOutputs:['phase-rank','portal-state','campaign-rank','replay'],violenceProfile:'NONE'},
]

export const GAMEVERSE_MONTHLY_RELEASE_ORDER:UniversalGameId[]=[
  'streetverse',
  'quantum-tag',
  'battlefront-zero',
  'yogihoo-arena',
  'volcano-racers',
  'fight-night-holo',
  'gridiron-x',
  'court-kings',
  'diamond-legends',
  'ice-storm',
  'world-pitch',
  'kingdom-builders',
]

export function getGlobalConflictAdapter(gameId:UniversalGameId){
  return GLOBAL_CONFLICT_ADAPTERS.find(adapter=>adapter.gameId===gameId)
}
