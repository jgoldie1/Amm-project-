import {weatherVisualFromState,type StreetVerseWeatherState,type StreetVerseWeatherKind} from './StreetVerseWeatherRuntime'

export type StreetVerseWorldConsequenceMission=Readonly<{
 id:string
 kind:'weather-response'
 weatherKind:StreetVerseWeatherKind
 title:string
 objective:string
 targetLabel:string
 x:number
 z:number
 reward:number
 xp:number
 reputation:number
 severity:number
 expiresAt:number
}>

export type StreetVerseWorldConsequenceState=Readonly<{
 incidentId:string|null
 weatherKind:StreetVerseWeatherKind
 severity:number
 windIntensity:number
 gustIntensity:number
 windDirection:number
 precipitationIntensity:number
 businessDisruption:number
 trafficDisruption:number
 bodyStress:number
 activeMission:StreetVerseWorldConsequenceMission|null
}>

const clamp01=(n:number)=>Math.max(0,Math.min(1,n))

const missionFor=(kind:StreetVerseWeatherKind,severity:number,now:number):StreetVerseWorldConsequenceMission=>{
 const base={kind:'weather-response' as const,weatherKind:kind,severity,expiresAt:now+12*60_000}
 if(kind==='snow')return{...base,id:'weather-snow-walkway-'+Math.floor(now/300000),title:'SNOW RESPONSE',objective:'Reach the Circle Park entry and clear the main walkway for residents.',targetLabel:'CIRCLE PARK ENTRY',x:-38,z:40,reward:225,xp:150,reputation:4}
 if(kind==='rain'||kind==='mixed')return{...base,id:'weather-rain-check-'+Math.floor(now/300000),title:'FLOOD CHECK',objective:'Inspect the Circle Park entry drive and report standing water or blocked access.',targetLabel:'CIRCLE PARK ENTRY DRIVE',x:-38,z:34,reward:190,xp:125,reputation:4}
 if(kind==='fog')return{...base,id:'weather-fog-safety-'+Math.floor(now/300000),title:'LOW VISIBILITY',objective:'Reach the main wayfinder and help mark a safer pedestrian route.',targetLabel:'CIRCLE PARK WAYFINDER',x:0,z:34,reward:170,xp:115,reputation:4}
 return{...base,id:'weather-storm-secure-'+Math.floor(now/300000),title:'STORM RESPONSE',objective:'Reach the courtyard and secure loose community equipment before conditions worsen.',targetLabel:'CIRCLE PARK COURTYARD',x:-20,z:58,reward:260,xp:175,reputation:4}
}

export function installStreetVerseWorldConsequenceRuntime(characterId='bj-stubbs'){
 let lastMissionKey=''
 let activeMission:StreetVerseWorldConsequenceMission|null=null
 let state:StreetVerseWorldConsequenceState={
  incidentId:null,weatherKind:'unavailable',severity:0,windIntensity:0,gustIntensity:0,windDirection:0,
  precipitationIntensity:0,businessDisruption:0,trafficDisruption:0,bodyStress:0,activeMission:null,
 }

 const publish=()=>window.dispatchEvent(new CustomEvent('tryamm:world-consequence-state',{detail:state}))

 const onWeather=(event:Event)=>{
  const d=(event as CustomEvent<{state?:StreetVerseWeatherState}>).detail||{}
  const weather=d.state
  if(!weather)return
  const visual=weatherVisualFromState(weather)
  const windIntensity=clamp01(Number(weather.windSpeed||0)/45)
  const gustIntensity=clamp01(Number(weather.windGusts||0)/65)
  const windDirection=((Number(weather.windDirection||0)%360)+360)%360
  const precipitationIntensity=clamp01(visual.precipitationIntensity)
  const tempStress=weather.apparentTemperature==null?0:clamp01(Math.abs(Number(weather.apparentTemperature)-68)/55)
  const weatherBase=visual.kind==='storm'?1:visual.kind==='snow'?0.72:visual.kind==='rain'?0.55:visual.kind==='fog'?0.42:visual.kind==='mixed'?0.50:0
  const severity=clamp01(weatherBase*.62+windIntensity*.17+gustIntensity*.12+precipitationIntensity*.07+tempStress*.02)
  const businessDisruption=clamp01(severity*.72+precipitationIntensity*.12)
  const trafficDisruption=clamp01(1-visual.trafficSpeedMultiplier)
  const bodyStress=clamp01(severity*.36+tempStress*.20)
  const incidentId=severity>=.40?`weather-${visual.kind}-${Math.floor(Date.now()/300000)}`:null

  if(bodyStress>.08){
   window.dispatchEvent(new CustomEvent('tryamm:character-body-state-change-request',{detail:{
    characterId,
    changes:{stress:+bodyStress*.05,temperature:+tempStress*.05,stamina:-severity*.015},
    source:'world-consequence-weather',
    serverValidate:true,
   }}))
  }

  window.dispatchEvent(new CustomEvent('tryamm:streetverse-business-disruption',{detail:{
   incidentId,kind:visual.kind,severity,businessDisruption,deliveryDelayMultiplier:1+businessDisruption*.75,
   customerTrafficMultiplier:Math.max(.45,1-businessDisruption*.48),source:'world-consequence-engine',
  }}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-environment-sense',{detail:{
   kind:visual.kind,severity,windIntensity,gustIntensity,windDirection,precipitationIntensity,
   hapticIntensity:clamp01(gustIntensity*.6+severity*.35),source:'world-consequence-engine',
  }}))

  if(severity>=.46&&['storm','snow','rain','fog','mixed'].includes(visual.kind)){
   const mission=missionFor(visual.kind,severity,Date.now())
   if(mission.id!==lastMissionKey){
    lastMissionKey=mission.id
    activeMission=mission
    window.dispatchEvent(new CustomEvent('tryamm:world-consequence-mission-offer',{detail:mission}))
   }
  }else if(activeMission&&severity<.24){
   window.dispatchEvent(new CustomEvent('tryamm:world-consequence-mission-expired',{detail:{id:activeMission.id,reason:'conditions-cleared'}}))
   activeMission=null
  }

  state={incidentId,weatherKind:visual.kind,severity,windIntensity,gustIntensity,windDirection,precipitationIntensity,businessDisruption,trafficDisruption,bodyStress,activeMission}
  publish()
 }

 const onComplete=(event:Event)=>{
  const d=(event as CustomEvent<{id?:string}>).detail||{}
  if(!activeMission||d.id!==activeMission.id)return
  const completed=activeMission
  activeMission=null
  state={...state,activeMission:null}
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-gameplay-action',{detail:{action:'public-safety-mission',source:'world-consequence-weather'}}))
  window.dispatchEvent(new CustomEvent('tryamm:character-affect-set',{detail:{characterId,affect:'proud',source:'world-consequence-mission-complete'}}))
  window.dispatchEvent(new CustomEvent('tryamm:world-consequence-reward',{detail:{
   missionId:completed.id,reward:completed.reward,xp:completed.xp,reputation:completed.reputation,source:'world-consequence-engine',
  }}))
  publish()
 }

 window.addEventListener('tryamm:streetverse-weather-visual',onWeather)
 window.addEventListener('tryamm:world-consequence-mission-complete',onComplete)

 return{
  getState:()=>state,
  dispose:()=>{
   window.removeEventListener('tryamm:streetverse-weather-visual',onWeather)
   window.removeEventListener('tryamm:world-consequence-mission-complete',onComplete)
  }
 }
}
