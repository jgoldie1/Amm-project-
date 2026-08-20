export type WorldId = 'streetverse' | 'my_world' | 'we_are_the_world' | 'kingdom' | 'starverse' | 'holoverse' | 'mars'

export interface WorldQualityGate {
  world: WorldId
  thirtySecondHook: string
  fiveMinuteLoop: string[]
  thirtyMinuteArc: string[]
  clipWorthyMoment: string
  meaningfulChoice: string
  returnTomorrowReason: string
  signatureAudio: string
  signatureVisual: string
  socialLoop: string
  accessibilityProof: string[]
  performanceBudget: { targetFps: number; maxFrameMs: number; maxInitialAssetMb: number }
}

export const WORLD_QUALITY_GATES: WorldQualityGate[] = [
  {
    world:'streetverse',
    thirtySecondHook:'Enter a living city where your avatar can drive, perform, race, create, buy, sell and trigger dynamic missions with friends.',
    fiveMinuteLoop:['spawn into district','accept dynamic mission','move/drive/perform','earn XP and game credits','share/replay the moment'],
    thirtyMinuteArc:['meet NPC/friend','complete 2-3 missions','upgrade reputation or vehicle','unlock district opportunity','checkpoint and return hook'],
    clipWorthyMoment:'crew race or creator performance erupts into a dynamic city event',
    meaningfulChoice:'reputation path: creator, entrepreneur, athlete, explorer, faith/community or driver',
    returnTomorrowReason:'rotating city events, creator drops, races and personal mission chains',
    signatureAudio:'adaptive Set Apart / creator radio and positional city soundscape',
    signatureVisual:'cyan/gold holographic city language with recognizable district silhouettes',
    socialLoop:'crew up → mission/race/performance → LIVE/clip → leaderboard/community response',
    accessibilityProof:['one-hand controls','full remap','subtitle/caption controls','reduced motion','high contrast','voice navigation'],
    performanceBudget:{targetFps:60,maxFrameMs:16.7,maxInitialAssetMb:120}
  },
  {
    world:'my_world',
    thirtySecondHook:'Build a personal world that remembers your identity, rooms, assets, friends, media and accomplishments.',
    fiveMinuteLoop:['enter world','place/customize GLB asset','invite or visit','create activity','save state'],
    thirtyMinuteArc:['customize space','host friend or LIVE session','complete creator task','publish snapshot/reel','unlock new build capability'],
    clipWorthyMoment:'instant before/after transformation of a personal world with friends present',
    meaningfulChoice:'choose social, creator, business, learning or exploration focus',
    returnTomorrowReason:'persistent builds, visitor activity, creator tasks and new assets',
    signatureAudio:'personalizable spatial soundtrack and ambient themes',
    signatureVisual:'player-owned holographic architecture and asset styling',
    socialLoop:'build → invite → collaborate → publish → remix with permission',
    accessibilityProof:['voice placement','snap-to-grid','undo/redo','keyboard-only','screen-reader labels','low-motion editor'],
    performanceBudget:{targetFps:60,maxFrameMs:16.7,maxInitialAssetMb:100}
  },
  {
    world:'we_are_the_world',
    thirtySecondHook:'Discover people, cultures, creators and events globally through one shared world map.',
    fiveMinuteLoop:['open globe','discover region/event','join translated activity','interact/follow','save discovery'],
    thirtyMinuteArc:['visit multiple regions','join global event','complete culture/creator quest','collaborate','publish shared memory'],
    clipWorthyMoment:'multi-language crowd event with synchronized captions and world transition',
    meaningfulChoice:'follow people, places, causes, cultures or creator scenes',
    returnTomorrowReason:'time-zone aware global events and regional LIVE discovery',
    signatureAudio:'region-aware licensed/authorized music and ambient sound',
    signatureVisual:'living globe with holographic activity pulses and portals',
    socialLoop:'discover → join → translate → collaborate → follow → return',
    accessibilityProof:['caption-first communication','translation','audio-only fallback','screen reader globe list','reduced visual density'],
    performanceBudget:{targetFps:60,maxFrameMs:16.7,maxInitialAssetMb:90}
  },
  {
    world:'kingdom',
    thirtySecondHook:'Build a persistent kingdom through missions, community choices, trade, creativity and exploration.',
    fiveMinuteLoop:['receive kingdom objective','choose role','complete task','improve settlement','checkpoint'],
    thirtyMinuteArc:['solve local problem','upgrade district','coordinate with players/NPCs','unlock story branch','defend/save progress'],
    clipWorthyMoment:'kingdom visibly transforms because of a coordinated player decision',
    meaningfulChoice:'development priorities change future missions and visual state',
    returnTomorrowReason:'branching story, settlement growth and community events',
    signatureAudio:'cinematic themes tied to district growth and mission stakes',
    signatureVisual:'recognizable kingdom silhouettes with holographic civic overlays',
    socialLoop:'role selection → cooperative mission → visible world change → shared reward',
    accessibilityProof:['difficulty assists','objective recap','route guidance','one-hand mode','captioned story','combat alternatives where possible'],
    performanceBudget:{targetFps:60,maxFrameMs:16.7,maxInitialAssetMb:130}
  },
  {
    world:'starverse',
    thirtySecondHook:'Audition, perform and become the star of a persistent social entertainment world.',
    fiveMinuteLoop:['enter stage','choose song/performance challenge','perform','receive audience feedback','clip/share'],
    thirtyMinuteArc:['rehearse','audition','battle/showcase','unlock studio or stage upgrade','premiere result'],
    clipWorthyMoment:'crowd-reactive holographic performance climax',
    meaningfulChoice:'artist identity, genre, stage style and collaboration path',
    returnTomorrowReason:'showcases, talent events, collaborations and premieres',
    signatureAudio:'high-quality vocal/music pipeline with spatial crowd response',
    signatureVisual:'reactive holographic stages generated from approved assets',
    socialLoop:'practice → perform → audience → collaborate → release → return',
    accessibilityProof:['pitch-independent modes','lyrics/captions','visual rhythm cues','audio-description UI','one-hand performance controls'],
    performanceBudget:{targetFps:60,maxFrameMs:16.7,maxInitialAssetMb:110}
  },
  {
    world:'holoverse',
    thirtySecondHook:'Step through spatial portals into concerts, games, rooms and experiences that scale from phone to XR.',
    fiveMinuteLoop:['choose portal','stream destination assets','interact','trigger holographic event','save echo'],
    thirtyMinuteArc:['visit multiple spaces','complete XR-friendly challenge','meet players','collect authorized asset','return through portal'],
    clipWorthyMoment:'seamless phone-to-XR portal reveal with shared players',
    meaningfulChoice:'quality/performance mode and experience path',
    returnTomorrowReason:'rotating spatial events and newly published creator spaces',
    signatureAudio:'spatial audio tied to portals and holographic objects',
    signatureVisual:'strong cyan/gold depth language, volumetrics used selectively',
    socialLoop:'portal → shared experience → LIVE/clip → persistent echo → new portal',
    accessibilityProof:['2D fallback','audio-only cues','reduced motion','seated XR mode','controller/voice alternatives'],
    performanceBudget:{targetFps:72,maxFrameMs:13.9,maxInitialAssetMb:80}
  },
  {
    world:'mars',
    thirtySecondHook:'Join a crew, fly to Mars, land, explore and complete a persistent cooperative mission that survives disconnects.',
    fiveMinuteLoop:['crew join','mission prep','travel/arrival','objective interaction','checkpoint'],
    thirtyMinuteArc:['launch','arrive','Canyon mission','resource/science objective','outpost checkpoint','LIVE recap'],
    clipWorthyMoment:'two-player drop from warp into Mars followed by first shared surface objective',
    meaningfulChoice:'science, engineering, flight or exploration role changes team strategy',
    returnTomorrowReason:'persistent outpost, branching mission chain and unlockable destinations',
    signatureAudio:'ship systems, comms, suit audio and cinematic travel motifs',
    signatureVisual:'optimized Mars terrain plus holographic navigation/science overlays',
    socialLoop:'crew → role → mission → checkpoint → LIVE/record → restore/rejoin',
    accessibilityProof:['seated/one-hand flight option','navigation assist','captioned comms','color-independent HUD','motion-reduction travel'],
    performanceBudget:{targetFps:60,maxFrameMs:16.7,maxInitialAssetMb:140}
  }
]

export interface QualityEvidence {
  hookUnder30Seconds: boolean
  tutorialWithoutExternalHelp: boolean
  coreLoopFunScore: number // 1-5 from playtest
  sessionCompletionRate: number // 0..1
  clipMomentTriggered: boolean
  returnIntentRate: number // 0..1
  accessibilityChecklistPass: boolean
  performanceBudgetPass: boolean
  crashFreeSessionRate: number // 0..1
}

export function qualityStatus(e: QualityEvidence): 'GREEN'|'YELLOW'|'RED' {
  if (!e.hookUnder30Seconds || !e.tutorialWithoutExternalHelp || e.coreLoopFunScore < 3 || !e.accessibilityChecklistPass || !e.performanceBudgetPass || e.crashFreeSessionRate < .97) return 'RED'
  if (e.coreLoopFunScore < 4 || e.sessionCompletionRate < .65 || !e.clipMomentTriggered || e.returnIntentRate < .5 || e.crashFreeSessionRate < .995) return 'YELLOW'
  return 'GREEN'
}

// Quality principle: distinctive art direction + responsive controls + clear onboarding + strong sound + reliable performance
// beat expensive asset count. AI/HoloForge may accelerate content production, but every generated asset/mission must pass
// rights, performance, gameplay, moderation and human quality review before entering the published library.
