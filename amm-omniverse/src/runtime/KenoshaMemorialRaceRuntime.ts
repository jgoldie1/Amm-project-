export type MemorialRaceId='kenosha-memorial-grand-prix'|'kenosha-stubbs-legacy-race'|'servants-of-christ-charity-cup'

type PrizePlace=1|2|3

export interface MemorialRaceProgram {
  id:MemorialRaceId
  title:string
  dedication:string
  world:'streetverse'
  raceType:'circuit-race'|'point-to-point-race'
  laps:number
  effects:string[]
  broadcast:string[]
  prizePolicy:{places:PrizePlace[];cashValue:'server-funded-only';requiresFundingVerification:true;requiresResultVerification:true;settlement:'authoritative-ledger-only'}
}

const emit=(name:string,detail:unknown)=>window.dispatchEvent(new CustomEvent(name,{detail}))

export const MEMORIAL_RACES:MemorialRaceProgram[]=[
  {
    id:'kenosha-memorial-grand-prix',
    title:'Kenosha Memorial Grand Prix',
    dedication:'Kenosha memorial championship',
    world:'streetverse',raceType:'circuit-race',laps:5,
    effects:['original-anime-speed-lines','holographic-checkpoint-gates','boost-trails','drift-sparks','nitro-bloom','tunnel-light-streaks','finish-camera-flash','cinematic-slow-motion-replay','crowd-light-wave','bennie-race-commentary'],
    broadcast:['tryamm-live','world-seasons','pk-events','reels','ctv-ott-fast'],
    prizePolicy:{places:[1,2,3],cashValue:'server-funded-only',requiresFundingVerification:true,requiresResultVerification:true,settlement:'authoritative-ledger-only'}
  },
  {
    id:'kenosha-stubbs-legacy-race',
    title:'Kenosha Stubbs Legacy Race',
    dedication:'Kenosha Stubbs legacy celebration',
    world:'streetverse',raceType:'point-to-point-race',laps:1,
    effects:['original-anime-speed-lines','city-neon-boost-trails','holographic-lion-gates','drift-sparks','nitro-bloom','finish-photo','cinematic-replay','bennie-race-commentary'],
    broadcast:['tryamm-live','world-seasons','pk-events','reels'],
    prizePolicy:{places:[1,2,3],cashValue:'server-funded-only',requiresFundingVerification:true,requiresResultVerification:true,settlement:'authoritative-ledger-only'}
  },
  {
    id:'servants-of-christ-charity-cup',
    title:'Servants of Christ Charity Cup',
    dedication:'Servants of Christ community benefit race',
    world:'streetverse',raceType:'circuit-race',laps:3,
    effects:['golden-light-gates','original-anime-speed-lines','boost-trails','drift-sparks','finish-camera-flash','community-banner-wave','cinematic-replay','bennie-race-commentary'],
    broadcast:['tryamm-live','world-seasons','reels','servants-of-christ'],
    prizePolicy:{places:[1,2,3],cashValue:'server-funded-only',requiresFundingVerification:true,requiresResultVerification:true,settlement:'authoritative-ledger-only'}
  }
]

export function launchMemorialRace(id:MemorialRaceId,extra:Record<string,unknown>={}){
  const race=MEMORIAL_RACES.find(x=>x.id===id)
  if(!race)throw new Error('memorial_race_not_found')
  const launch={...race,...extra,launchedAt:new Date().toISOString(),moneyAuthority:'server-only'}
  emit('tryamm:memorial-race:launch',launch)
  emit('tryamm:racing:effect-sequence',{raceId:id,effects:race.effects})
  emit('tryamm:live-season-context',{world:'streetverse',event:race.title,mode:'gamecast',source:'memorial-race-runtime'})
  emit('tryamm:creator:clip-opportunity',{source:id,surfaces:['reels','live','ctv-ott-fast'],moments:['launch','boost','drift','photo-finish','podium']})
  return launch
}

export function requestMemorialPrizeSettlement(input:{raceId:MemorialRaceId;resultId:string;placements:Array<{place:PrizePlace;userId:string}>;fundingReference?:string}){
  const race=MEMORIAL_RACES.find(x=>x.id===input.raceId)
  if(!race)throw new Error('memorial_race_not_found')
  const request={...input,eventId:`prize-${input.raceId}-${Date.now()}`,requestedAt:new Date().toISOString(),authority:'pending-server-verification',rules:race.prizePolicy}
  emit('tryamm:memorial-prize:settlement-request',request)
  emit('tryamm:earnings-ledger:verification-required',{...request,reason:'Race visuals/results never create payable money without funded prize pool and authoritative result verification.'})
  return request
}

export function installKenoshaMemorialRaceRuntime(){
  const w=window as typeof window & {__tryammMemorialRaces?:typeof MEMORIAL_RACES;__launchTryammMemorialRace?:typeof launchMemorialRace;__requestMemorialPrizeSettlement?:typeof requestMemorialPrizeSettlement}
  w.__tryammMemorialRaces=MEMORIAL_RACES
  w.__launchTryammMemorialRace=launchMemorialRace
  w.__requestMemorialPrizeSettlement=requestMemorialPrizeSettlement
  emit('tryamm:kenosha-memorial-racing:ready',{races:MEMORIAL_RACES.map(r=>({id:r.id,title:r.title,places:r.prizePolicy.places})),effectsReady:true,prizes:'funding-and-server-verification-required'})
}
