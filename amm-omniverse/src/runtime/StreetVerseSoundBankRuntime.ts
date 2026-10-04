import {onQuantumBeat,quantumBeatClock,type QuantumBeatEvent} from '../services/quantumBeat'
import {soundEngine,type SoundKey} from '../game/audio/SoundEngine'

type RescueKind=
  |'structure-fire'|'house-fire'|'cat-in-tree'|'car-wreck'|'stroke-emergency'
  |'gunshot-victim'|'sexual-assault-survivor'|'assault'|'robbery'

type EmergencyKind='police'|'sheriff'|'ambulance'|'fire'

let installed=false
let enabled=true
let volume=.68
let lastPosition={x:0,z:54,at:0}
let lastVehicleToneAt=0
let weather:'clear'|'rain'|'wind'='clear'
let dayPhase:'day'|'night'='day'
let moving=false
let inVehicle=false
let vehicleSpeed=0
let emergencyActive=false
let emergencyKind:EmergencyKind|null=null
let emergencyUntil=0
let fireActive=false
let lastQuantumBpm=0
let radioPlaying=false
let radioVolume=.65
let conversationActive=false
let currentRadioGenre:'gospel'|'hiphop'|'electronic'|'jazz'|'rnb'='hiphop'
let radioLoop:ReturnType<typeof setInterval>|null=null
let ambienceStarted=false

const play=(key:SoundKey,caption?:string)=>{
  if(!enabled)return
  soundEngine.play(key)
  if(caption)window.dispatchEvent(new CustomEvent('tryamm:audio-caption',{detail:{speaker:'SFX',text:caption,key}}))
}

const emergencySiren=(kind:EmergencyKind)=>{
  if(kind==='police')play('police_siren')
  else if(kind==='sheriff')play('sheriff_siren')
  else if(kind==='ambulance')play('ambulance_siren')
  else play('firetruck_siren')
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
  fireActive=burning
  if(burning)play('fire_crackle','fire crackle')
}

const setQuantumTempo=(bpm:number)=>{
  const next=Math.max(60,Math.min(150,Math.round(bpm)))
  if(next===lastQuantumBpm)return
  lastQuantumBpm=next
  quantumBeatClock.configure({mode:'game',bpm:next,beatsPerBar:4})
}

const onQuantumStreetBeat=(event:QuantumBeatEvent)=>{
  if(!enabled||event.mode!=='game')return
  const phase=event.phase
  const emergencyNow=emergencyActive&&performance.now()<emergencyUntil
  if(emergencyActive&&!emergencyNow){
    emergencyActive=false
    emergencyKind=null
    setQuantumTempo(inVehicle&&vehicleSpeed>1?124:moving?108:84)
  }

  if(phase===0){
    if(fireActive)play('fire_crackle')
    else if(weather==='rain')play('rain')
    else if(weather==='wind')play('wind')
    else play('city_ambient')
    if(emergencyNow&&emergencyKind)emergencySiren(emergencyKind)
  }
  if(phase===1){
    if(inVehicle&&vehicleSpeed>1)play(vehicleSpeed>14?'engine_rev':'engine_idle')
    else if(moving)play('footstep')
  }
  if(phase===2){
    if(emergencyNow)play('radio_chirp')
    else if(fireActive)play('fire_crackle')
    else if(Math.random()<.58)play('crowd_ambient')
  }
  if(phase===3){
    if(fireActive&&Math.random()<.45)play('debris_fall')
    else if(dayPhase==='day'&&Math.random()<.20)play('footstep')
    else if(weather==='clear'&&Math.random()<.16)play('wind')
  }
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
    if(kind){
      emergencyActive=true
      emergencyKind=kind
      emergencyUntil=performance.now()+14000
      setQuantumTempo(138)
      play('radio_chirp',`${kind} radio chirp`)
      emergencySiren(kind)
    }
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
  const onFirstGesture=()=>{
    if(!ambienceStarted){
      ambienceStarted=true
      soundEngine.startAmbient('city_ambient',900)
      soundEngine.startAmbient('crowd_ambient',1700)
    }
    soundEngine.play('city_ambient')
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-audio-unlocked',{detail:{enabled,volume,backgroundAmbience:true,source:'first-user-gesture'}}))
    removeEventListener('pointerdown',onFirstGesture)
    removeEventListener('keydown',onFirstGesture)
  }
  const stopRadio=()=>{if(radioLoop){clearInterval(radioLoop);radioLoop=null};radioPlaying=false}
  const onRadio=(event:Event)=>{
    const d=(event as CustomEvent<{playing?:boolean;volume?:number;genre?:'gospel'|'hiphop'|'electronic'|'jazz'|'rnb';title?:string;artist?:string}>).detail||{}
    if(Number.isFinite(d.volume))radioVolume=Math.max(0,Math.min(1,Number(d.volume)))
    if(d.genre)currentRadioGenre=d.genre
    if(d.playing===false){stopRadio();play('button_click','radio off');return}
    if(d.playing===true){
      stopRadio();radioPlaying=true
      const effective=conversationActive?Math.max(.12,radioVolume*.35):radioVolume
      soundEngine.setVolume(volume*effective)
      radioLoop=soundEngine.playBackingTrack(currentRadioGenre)
      play('stream_live',d.title?`radio • ${d.title}${d.artist?' • '+d.artist:''}`:'StreetVerse Radio on')
    }
  }
  const onConversation=(event:Event)=>{
    const d=(event as CustomEvent<{active?:boolean;speakerId?:string}>).detail||{}
    conversationActive=d.active!==false
    const effective=radioPlaying?(conversationActive?Math.max(.12,radioVolume*.35):radioVolume):1
    soundEngine.setVolume(volume*effective)
    if(conversationActive)play('mic_check',d.speakerId?'passenger speaking':'in-car conversation')
  }
  const onVehicleControlled=(event:Event)=>{
    const entered=Boolean((event as CustomEvent<{entered?:boolean}>).detail?.entered)
    if(entered)play('engine_start','engine start')
    else{play('door_open','vehicle door');if(radioPlaying)stopRadio();soundEngine.setVolume(volume)}
  }
  const onHorn=()=>play('notification','vehicle horn')
  const onMissionStartAudio=()=>play('mission_start','mission started')
  const onMissionCompleteAudio=()=>play('mission_complete','mission complete')
  const onRewardAudio=()=>play('cash_earn','reward earned')
  const onRadioRoyalty=()=>play('royalty_earned','music royalty recorded')

  const onAICafe=(event:Event)=>{
    const d=(event as CustomEvent<{task?:{title?:string}}>).detail||{}
    if(d.task?.title)play('notification','AI Café task assigned')
  }

  const onPlayerPosition=(event:Event)=>{
    const d=(event as CustomEvent<{x?:number;z?:number;speed?:number;vehicle?:boolean}>).detail||{}
    const x=Number(d.x),z=Number(d.z),now=performance.now()
    if(!Number.isFinite(x)||!Number.isFinite(z))return
    const distance=Math.hypot(x-lastPosition.x,z-lastPosition.z)
    moving=distance>.05
    inVehicle=Boolean(d.vehicle)
    vehicleSpeed=Math.abs(Number(d.speed||0))
    const targetBpm=emergencyActive?138:inVehicle&&vehicleSpeed>1?124:moving?108:84
    setQuantumTempo(targetBpm)
    if(inVehicle&&vehicleSpeed>16&&now-lastVehicleToneAt>1800&&Math.random()<.08){play('tire_screech');lastVehicleToneAt=now}
    lastPosition={x,z,at:now}
  }
  const onWeather=(event:Event)=>{
    const raw=String((event as CustomEvent<{weather?:string}>).detail?.weather||'clear').toLowerCase()
    weather=raw.includes('rain')||raw.includes('storm')?'rain':raw.includes('wind')?'wind':'clear'
  }
  const onDayPhase=(event:Event)=>{
    const raw=String((event as CustomEvent<{phase?:string;timeOfDay?:string}>).detail?.phase||(event as CustomEvent<{timeOfDay?:string}>).detail?.timeOfDay||'day').toLowerCase()
    dayPhase=raw.includes('night')||raw.includes('evening')?'night':'day'
  }

  addEventListener('pointerdown',onFirstGesture,{once:true})
  addEventListener('keydown',onFirstGesture,{once:true})
  addEventListener('tryamm:streetverse-player-position',onPlayerPosition)
  addEventListener('tryamm:streetverse-weather-state',onWeather)
  addEventListener('tryamm:world-weather',onWeather)
  addEventListener('tryamm:world-day-phase',onDayPhase)
  const removeQuantumBeat=onQuantumBeat(onQuantumStreetBeat)
  quantumBeatClock.configure({mode:'game',bpm:84,beatsPerBar:4,latencyCompensationMs:0})
  quantumBeatClock.start()
  setQuantumTempo(84)
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
  addEventListener('tryamm:streetverse-radio-state',onRadio)
  addEventListener('tryamm:streetverse-in-car-conversation',onConversation)
  addEventListener('tryamm:streetverse-vehicle-controlled',onVehicleControlled)
  addEventListener('tryamm:streetverse-vehicle-horn',onHorn)
  addEventListener('tryamm:streetverse-mission-start',onMissionStartAudio)
  addEventListener('tryamm:streetverse-mission-complete',onMissionCompleteAudio)
  addEventListener('tryamm:world-consequence-reward',onRewardAudio)
  addEventListener('tryamm:music-sync-payable',onRadioRoyalty)

  queueMicrotask(()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-sound-bank-ready',{detail:{
    enabled,volume,
    procedural:true,
    categories:['city','vehicle','accident','fire','police','sheriff','ambulance','firefighter','weather','crowd','rescue','21+-private-non-graphic'],
    quantumBeat:{enabled:true,mode:'game',idleBpm:84,walkBpm:108,driveBpm:124,emergencyBpm:138,beatsPerBar:4},
    fictionalPublicSafetyAudio:true,
    realScannerAudio:false,
    realAgencyRadioTraffic:false,
  }})))

  return()=>{
    removeQuantumBeat()
    quantumBeatClock.stop()
    soundEngine.stopAllAmbient()
    ambienceStarted=false
    removeEventListener('pointerdown',onFirstGesture)
    removeEventListener('keydown',onFirstGesture)
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
    removeEventListener('tryamm:streetverse-radio-state',onRadio)
    removeEventListener('tryamm:streetverse-in-car-conversation',onConversation)
    removeEventListener('tryamm:streetverse-vehicle-controlled',onVehicleControlled)
    removeEventListener('tryamm:streetverse-vehicle-horn',onHorn)
    removeEventListener('tryamm:streetverse-mission-start',onMissionStartAudio)
    removeEventListener('tryamm:streetverse-mission-complete',onMissionCompleteAudio)
    removeEventListener('tryamm:world-consequence-reward',onRewardAudio)
    removeEventListener('tryamm:music-sync-payable',onRadioRoyalty)
    stopRadio()
    soundEngine.setVolume(volume)
    installed=false
  }
}
