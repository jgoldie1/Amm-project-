import { useEffect, useRef, useState } from 'react'

type SoundDetail={kind?:string;level?:number;speed?:number;throttle?:number;brake?:number;steer?:number}

export default function StreetVerseSoundEngine(){
  const ctxRef=useRef<AudioContext|null>(null)
  const masterRef=useRef<GainNode|null>(null)
  const engineOscRef=useRef<OscillatorNode|null>(null)
  const engineGainRef=useRef<GainNode|null>(null)
  const ambienceOscRef=useRef<OscillatorNode|null>(null)
  const [enabled,setEnabled]=useState(false)
  const [vehicleMode,setVehicleMode]=useState(false)

  useEffect(()=>{
    const unlock=()=>{
      if(ctxRef.current)return
      const AudioCtx=window.AudioContext||(window as typeof window & {webkitAudioContext?:typeof AudioContext}).webkitAudioContext
      if(!AudioCtx)return
      const ctx=new AudioCtx()
      const master=ctx.createGain();master.gain.value=.22;master.connect(ctx.destination)
      ctxRef.current=ctx;masterRef.current=master
      const ambience=ctx.createOscillator();const ambienceGain=ctx.createGain()
      ambience.type='sine';ambience.frequency.value=48;ambienceGain.gain.value=.015
      ambience.connect(ambienceGain).connect(master);ambience.start();ambienceOscRef.current=ambience
      const engine=ctx.createOscillator();const engineGain=ctx.createGain()
      engine.type='sawtooth';engine.frequency.value=72;engineGain.gain.value=0
      engine.connect(engineGain).connect(master);engine.start();engineOscRef.current=engine;engineGainRef.current=engineGain
      setEnabled(true)
    }
    const resume=()=>{ctxRef.current?.resume().catch(()=>{});unlock()}
    window.addEventListener('pointerdown',resume,{passive:true});window.addEventListener('keydown',resume)
    return()=>{window.removeEventListener('pointerdown',resume);window.removeEventListener('keydown',resume)}
  },[])

  useEffect(()=>{
    const tone=(frequency:number,duration=.08,level=.05,type:OscillatorType='sine')=>{
      const ctx=ctxRef.current,master=masterRef.current;if(!ctx||!master)return
      const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.value=frequency;gain.gain.value=level
      gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);osc.connect(gain).connect(master);osc.start();osc.stop(ctx.currentTime+duration)
    }
    const onWorldSound=(event:Event)=>{const d=(event as CustomEvent<SoundDetail>).detail||{};if(d.kind==='footstep')tone(115,.045,Math.min(.035,d.level||.02),'triangle');if(d.kind==='vehicle'&&!vehicleMode)tone(62+Math.min(45,Number(d.speed||0)*2),.05,Math.min(.025,d.level||.015),'sawtooth')}
    const onVehicle=(event:Event)=>{const entered=Boolean((event as CustomEvent<{entered?:boolean}>).detail?.entered);setVehicleMode(entered);const ctx=ctxRef.current,gain=engineGainRef.current,osc=engineOscRef.current;if(ctx&&gain&&osc){gain.gain.cancelScheduledValues(ctx.currentTime);gain.gain.linearRampToValueAtTime(entered?.085:0,ctx.currentTime+.18);osc.frequency.linearRampToValueAtTime(entered?88:68,ctx.currentTime+.2)}tone(entered?220:150,.12,.07,'triangle')}
    const onDrive=(event:Event)=>{const d=(event as CustomEvent<SoundDetail>).detail||{},ctx=ctxRef.current,osc=engineOscRef.current,gain=engineGainRef.current;if(ctx&&osc&&gain&&vehicleMode){const throttle=Math.max(0,Math.min(1,Number(d.throttle||0))),speed=Math.abs(Number(d.speed||0));osc.frequency.setTargetAtTime(82+speed*4+throttle*75,ctx.currentTime,.06);gain.gain.setTargetAtTime(.065+throttle*.055,ctx.currentTime,.05)}if(Number(d.brake||0)>.55)tone(92,.09,.045,'square');if(Math.abs(Number(d.steer||0))>.75&&Math.abs(Number(d.speed||0))>8)tone(760,.06,.025,'sawtooth')}
    const onHorn=()=>{tone(310,.18,.11,'square');setTimeout(()=>tone(265,.2,.085,'square'),35)}
    const onCollision=()=>{tone(72,.14,.12,'square');setTimeout(()=>tone(48,.18,.08,'sawtooth'),45)}
    const onProximity=()=>tone(440,.07,.035,'sine')
    const onTalk=()=>{tone(260,.06,.025,'triangle');setTimeout(()=>tone(330,.06,.02,'triangle'),70)}
    const onLocation=()=>{tone(523,.08,.04,'sine');setTimeout(()=>tone(659,.1,.035,'sine'),90)}
    window.addEventListener('tryamm:world-sound',onWorldSound);window.addEventListener('tryamm:streetverse-vehicle-interact',onVehicle);window.addEventListener('tryamm:streetverse-drive-telemetry',onDrive);window.addEventListener('tryamm:streetverse-horn',onHorn);window.addEventListener('tryamm:streetverse-vehicle-collision',onCollision);window.addEventListener('tryamm:streetverse-proximity',onProximity);window.addEventListener('tryamm:streetverse-resident-talk',onTalk);window.addEventListener('tryamm:streetverse-location-visited',onLocation)
    return()=>{window.removeEventListener('tryamm:world-sound',onWorldSound);window.removeEventListener('tryamm:streetverse-vehicle-interact',onVehicle);window.removeEventListener('tryamm:streetverse-drive-telemetry',onDrive);window.removeEventListener('tryamm:streetverse-horn',onHorn);window.removeEventListener('tryamm:streetverse-vehicle-collision',onCollision);window.removeEventListener('tryamm:streetverse-proximity',onProximity);window.removeEventListener('tryamm:streetverse-resident-talk',onTalk);window.removeEventListener('tryamm:streetverse-location-visited',onLocation)}
  },[vehicleMode])

  return <div aria-live="polite" style={{position:'fixed',right:14,top:104,zIndex:16996,pointerEvents:'none',padding:'6px 9px',borderRadius:999,background:'#03111ddd',border:'1px solid #4fe3ff44',color:enabled?'#8effb7':'#ffe08a',fontSize:9,fontWeight:900,fontFamily:'system-ui,sans-serif'}}>{enabled?(vehicleMode?'SOUND • ENGINE/HORN/BRAKE ACTIVE':'SOUND • CITY ACTIVE'):'TAP ONCE • ENABLE SOUND'}</div>
}
