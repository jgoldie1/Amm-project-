import {soundEngine,type SoundKey} from '../game/audio/SoundEngine'

type RescueKind=
  |'structure-fire'|'house-fire'|'cat-in-tree'|'car-wreck'|'stroke-emergency'
  |'gunshot-victim'|'sexual-assault-survivor'|'assault'|'robbery'

type EmergencyKind='police'|'sheriff'|'ambulance'|'fire'

let installed=false
let fireLoop:number|undefined
let sirenTimers:number[]=[]
let enabled=true
let volume=.68
let lastPosition={x:0,z:54,at:0}
let lastFootstepAt=0
let lastVehicleToneAt=0
let ambientTimer:number|undefined
let weather:'clear'|'rain'|'wind'='clear'
let dayPhase:'day'|'night'='day'

const play=(key:SoundKey,caption?:string)=>{
  if(!enabled)return
  soundEngine.play(key)
  if(caption)window.dispatchEvent(new CustomEvent('tryamm:audio-caption',{detail:{speaker:'SFX',text:caption,key}}))
}

const clearSirens=()=>{sirenTimers.forEach(clearTimeout);sirenTimers=[]}
const repeat=(fn:()=>void,count:number,spacing:number)=>{
  for(let i=0;i<count;i++)sirenTimers.push(window.setTimeout(fn,i*spacing))
}

const emergencySound=(kind:EmergencyKind)=>{
  play('radio_chirp',`${kind} radio chirp`)
  if(kind==='police')repeat(()=>play('police_siren'),3,720)
  else if(kind==='sheriff')repeat(()=>play('sheriff_siren'),3,780)
  else if(kind==='ambulance')repeat(()=>play('ambulance_siren'),3,720)
  else repeat(()=>play('firetruck_siren'),3,860)
}

const rescueStart=(kind:RescueKind)=>{
  play('dispatch_tone','rescue dispatch tone')
  if(kind==='structure-fire'||kind==='house-fire'){play('fire_alarm','fire alarm');setTimeout(()=>play('crowd_gasp'),130)}
  else if(kind==='car-wreck'){play('tire_screech');setTimeout(()=>play('metal_crunch'),90);setTimeout(()=>play('glass_break'),170)}
  else if(kind==='gunshot-victim'){play('distant_shot','distant gunshot effect');setTimeout(()=>play('crowd_gasp'),100)}
  else if(kind==='cat-in-tree')play('notification','animal rescue call')
  else if(kind==='stroke-emergency')play('notification','medical emergency call')
  else play('crowd_gasp','incident response')
}

const setFire=(burning:boolean)=>{
  if(!burning){if(fireLoop)clearInterval(fireLoop);fireLoop=undefined;return}
  if(fireLoop)return
  play('fire_crackle','fire crackle')
  fireLoop=window.setInterval(()=>play('fire_crackle'),520)
}

const startNaturalAmbience=()=>{
  if(ambientTimer)return
  ambientTimer=window.setInterval(()=>{
    if(!enabled)return
    const roll=Math.random()
    if(weather==='rain'){play('rain');return}
    if(weather==='wind'&&roll<.72){play('wind');return}
    if(roll<.46)play('city_ambient')
    else if(roll<.72)play('crowd_ambient')
    else if(dayPhase==='day'&&roll<.82)play('footstep')
  },1350)
}

export function installStreetVerseSoundBankRuntime(){
  if(installed||typeof window==='undefined')return()=>{}
  installed=true
  soundEngine.setVolume(volume)

  const onSettings=(event:Event)=>{
    const d=(event as CustomEvent<{enabled?:boolean;volume?:number}>).detail||{}
    if(typeof d.enabled==='boolean')enabled=d.enabled
    if(Number.isFinite(d.volume)){volume=Math.max(0,Math.min(1,Number(d.volume)));soundEngine.setVolume(volume)}
    try{localStorage.setItem('tryamm.streetverse.sound-bank.v1',JSON.stringify({enabled,volume}))}catch{}
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-sound-bank-state',{detail:{enabled,volume}}))
  }

  try{
    const saved=JSON.parse(localStorage.getItem('tryamm.streetverse.sound-bank.v1')||'{}')
    if(typeof saved.enabled==='boolean')enabled=saved.enabled
    if(Number.isFinite(saved.volume)){volume=Math.max(0,Math.min(1,Number(saved.volume)));soundEngine.setVolume(volume)}
  }catch{}

  const onPreview=(event:Event)=>{
    const key=(event as CustomEvent<{key?:SoundKey}>).detail?.key
    if(key)play(key,`preview ${key.replaceAll('_',' ')}`)
  }
  const onRescue=(event:Event)=>{
    const kind=(event as CustomEvent<{kind?:RescueKind}>).detail?.kind
    if(kind)rescueStart(kind)
  }
  const onEmergency=(event:Event)=>{
    const kind=(event as CustomEvent<{kind?:EmergencyKind}>).detail?.kind
    if(kind)emergencySound(kind)
  }
  const onFire=(event:Event)=>setFire(Boolean((event as CustomEvent<{burning?:boolean}>).detail?.burning))
  const onRescueAction=(event:Event)=>{
    const action=String((event as CustomEvent<{action?:string}>).detail?.action||'').toUpperCase()
    if(action.includes('SUPPRESS FIRE'))play('water_hose','fire hose')
    else if(action.includes('EXTRICATE')){play('metal_crunch','vehicle extrication');setTimeout(()=>play('debris_fall'),110)}
    else if(action.includes('ANIMAL'))play('success','animal rescue progress')
    else if(action.includes('TREAT')||action.includes('HAND OFF'))play('notification','medical handoff')
  }
  const onResolved=()=>play('rescue_success','rescue complete')
  const onCollision=()=>{play('metal_crunch','vehicle collision');setTimeout(()=>play('glass_break'),90)}
  const onGate=(event:Event)=>{
    const method=(event as CustomEvent<{method?:string}>).detail?.method
    if(method==='resident-key'){play('gate_buzzer','resident gate buzzer');setTimeout(()=>play('gate_open'),180)}
    else if(method==='guard-sign-in')play('gate_buzzer','guard gate buzzer')
  }
  const onThreat=(event:Event)=>{
    const kind=String((event as CustomEvent<{kind?:string}>).detail?.kind||'').toLowerCase()
    if(kind.includes('gunshot')||kind.includes('shooting')||kind.includes('shot-fired'))play('distant_shot','distant gunshot effect')
  }
  const onPrivateAdult=(event:Event)=>{
    const d=(event as CustomEvent<{ageVerified?:boolean;privateSession?:boolean;consented?:boolean}>).detail||{}
    if(d.ageVerified!==true||d.privateSession!==true||d.consented!==true)return
    play('adult_room_ambience','private adult room ambience')
    setTimeout(()=>play('heartbeat_close'),260)
    setTimeout(()=>play('soft_breathing'),520)
  }
  const onAICafe=(event:Event)=>{
    const d=(event as CustomEvent<{task?:{title?:string}}>).detail||{}
    if(d.task?.title)play('notification','AI Café task assigned')
  }

  const onPlayerPosition=(event:Event)=>{
    const d=(event as CustomEvent<{x?:number;z?:number;speed?:number;vehicle?:boolean}>).detail||{}
    const x=Number(d.x),z=Number(d.z),now=performance.now()
    if(!Number.isFinite(x)||!Number.isFinite(z))return
    const distance=Math.hypot(x-lastPosition.x,z-lastPosition.z)
    const elapsed=Math.max(1,now-lastPosition.at)
    const moving=distance>.05
    if(moving&&!d.vehicle&&now-lastFootstepAt>310){
      play('footstep')
      lastFootstepAt=now
    }
    if(d.vehicle&&moving&&now-lastVehicleToneAt>420){
      const speed=Math.abs(Number(d.speed||0))
      play(speed>14?'engine_rev':'engine_idle')
      if(speed>16&&Math.random()<.08)play('tire_screech')
      lastVehicleToneAt=now
    }
    lastPosition={x,z,at:now}
    void elapsed
  }
  const onWeather=(event:Event)=>{
    const raw=String((event as CustomEvent<{weather?:string}>).detail?.weather||'clear').toLowerCase()
    weather=raw.includes('rain')||raw.includes('storm')?'rain':raw.includes('wind')?'wind':'clear'
  }
  const onDayPhase=(event:Event)=>{
    const raw=String((event as CustomEvent<{phase?:string;timeOfDay?:string}>).detail?.phase||(event as CustomEvent<{timeOfDay?:string}>).detail?.timeOfDay||'day').toLowerCase()
    dayPhase=raw.includes('night')||raw.includes('evening')?'night':'day'
  }

  addEventListener('tryamm:streetverse-player-position',onPlayerPosition)
  addEventListener('tryamm:streetverse-weather-state',onWeather)
  addEventListener('tryamm:world-weather',onWeather)
  addEventListener('tryamm:world-day-phase',onDayPhase)
  startNaturalAmbience()
    addEventListener('tryamm:streetverse-sound-bank-settings',onSettings)
  addEventListener('tryamm:streetverse-sound-preview',onPreview)
  addEventListener('tryamm:streetverse-rescue-incident-start',onRescue)
  addEventListener('tryamm:streetverse-emergency-response',onEmergency)
  addEventListener('tryamm:streetverse-structure-fire-state',onFire)
  addEventListener('tryamm:streetverse-rescue-action',onRescueAction)
  addEventListener('tryamm:streetverse-rescue-incident-resolved',onResolved)
  addEventListener('tryamm:streetverse-vehicle-collision',onCollision)
  addEventListener('tryamm:circle-park-access-result',onGate)
  addEventListener('tryamm:streetverse-threat-action',onThreat)
  addEventListener('tryamm:after-dark-private-intimacy-audio',onPrivateAdult)
  addEventListener('tryamm:ai-cafe-assigned',onAICafe)

  queueMicrotask(()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-sound-bank-ready',{detail:{
    enabled,volume,
    procedural:true,
    categories:['city','vehicle','accident','fire','police','sheriff','ambulance','firefighter','weather','crowd','rescue','21+-private-non-graphic'],
    fictionalPublicSafetyAudio:true,
    realScannerAudio:false,
    realAgencyRadioTraffic:false,
  }})))

  return()=>{
    if(fireLoop)clearInterval(fireLoop)
    if(ambientTimer)clearInterval(ambientTimer)
    ambientTimer=undefined
    clearSirens()
    removeEventListener('tryamm:streetverse-player-position',onPlayerPosition)
    removeEventListener('tryamm:streetverse-weather-state',onWeather)
    removeEventListener('tryamm:world-weather',onWeather)
    removeEventListener('tryamm:world-day-phase',onDayPhase)
    removeEventListener('tryamm:streetverse-sound-bank-settings',onSettings)
    removeEventListener('tryamm:streetverse-sound-preview',onPreview)
    removeEventListener('tryamm:streetverse-rescue-incident-start',onRescue)
    removeEventListener('tryamm:streetverse-emergency-response',onEmergency)
    removeEventListener('tryamm:streetverse-structure-fire-state',onFire)
    removeEventListener('tryamm:streetverse-rescue-action',onRescueAction)
    removeEventListener('tryamm:streetverse-rescue-incident-resolved',onResolved)
    removeEventListener('tryamm:streetverse-vehicle-collision',onCollision)
    removeEventListener('tryamm:circle-park-access-result',onGate)
    removeEventListener('tryamm:streetverse-threat-action',onThreat)
    removeEventListener('tryamm:after-dark-private-intimacy-audio',onPrivateAdult)
    removeEventListener('tryamm:ai-cafe-assigned',onAICafe)
    installed=false
  }
}
