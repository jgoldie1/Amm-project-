import {useEffect,useRef,useState} from 'react'

type Telemetry={speed?:number;throttle?:number;brake?:number;slipAngle?:number;burnout?:boolean;drifting?:boolean;surface?:string}
type Collision={speed?:number;kind?:string}

type Tone='traffic'|'crowd'|'steps'|'transit'|'construction'|'horn'|'siren'|'race'|'impact'|'bird'

export default function StreetVerseAmbientLife(){
 const ctxRef=useRef<AudioContext|null>(null)
 const masterRef=useRef<GainNode|null>(null)
 const [enabled,setEnabled]=useState(false)
 const [life,setLife]=useState('CITY IDLE')
 const ensure=()=>{
  if(ctxRef.current)return ctxRef.current
  const Ctx=window.AudioContext||(window as any).webkitAudioContext
  if(!Ctx)return null
  const ctx=new Ctx();const master=ctx.createGain();master.gain.value=.18;master.connect(ctx.destination);ctxRef.current=ctx;masterRef.current=master;return ctx
 }
 const blip=(tone:Tone,intensity=.4)=>{
  const ctx=ensure();const master=masterRef.current;if(!ctx||!master)return
  if(ctx.state==='suspended')ctx.resume().catch(()=>{})
  const now=ctx.currentTime
  const osc=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter()
  const config:Record<Tone,[OscillatorType,number,number,number]>={
   traffic:['sawtooth',72,120,.18],crowd:['triangle',190,260,.08],steps:['square',86,100,.045],transit:['sawtooth',115,70,.2],construction:['square',58,65,.09],horn:['square',420,360,.18],siren:['sine',720,980,.25],race:['sawtooth',100,220,.14],impact:['square',48,30,.12],bird:['sine',1200,1650,.07]
  }
  const [type,start,end,dur]=config[tone];osc.type=type;osc.frequency.setValueAtTime(start,now);osc.frequency.exponentialRampToValueAtTime(Math.max(20,end),now+dur)
  filter.type='lowpass';filter.frequency.value=tone==='bird'||tone==='siren'?2200:900
  gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(Math.min(.22,.055+intensity*.08),now+.012);gain.gain.exponentialRampToValueAtTime(.001,now+dur)
  osc.connect(filter);filter.connect(gain);gain.connect(master);osc.start(now);osc.stop(now+dur+.02)
 }
 useEffect(()=>{
  if(!enabled)return
  let timers:number[]=[]
  const loop=(tone:Tone,min:number,max:number)=>{const run=()=>{blip(tone,.22+Math.random()*.38);timers.push(window.setTimeout(run,min+Math.random()*(max-min)))};timers.push(window.setTimeout(run,min))}
  loop('traffic',900,1900);loop('crowd',1800,4200);loop('steps',1100,2600);loop('bird',3000,7000);loop('transit',6000,12000);loop('construction',6500,14000)
  return()=>timers.forEach(clearTimeout)
 },[enabled])
 useEffect(()=>{
  const onDrive=(e:Event)=>{const d=(e as CustomEvent<Telemetry>).detail||{};const speed=Number(d.speed||0);if(speed>5){setLife(d.drifting?'DRIFT ACTION':d.burnout?'BURNOUT ACTION':'TRAFFIC ACTION');if(Math.random()<.18)blip('race',Math.min(1,speed/35));if(d.drifting&&Math.random()<.28)blip('traffic',.7)}}
  const onCollision=(e:Event)=>{const d=(e as CustomEvent<Collision>).detail||{};setLife('COLLISION RESPONSE');blip('impact',Math.min(1,Number(d.speed||8)/25));setTimeout(()=>blip('siren',.65),500)}
  const onHorn=()=>blip('horn',.65)
  const onMission=()=>{setLife('MISSION ACTION');blip('race',.8)}
  const onEmergency=()=>{setLife('EMERGENCY RESPONSE');blip('siren',.9);setTimeout(()=>blip('siren',.85),450)}
  const onPower=()=>{setLife('POWERSPORT ACTION');blip('race',.65)}
  addEventListener('tryamm:streetverse-drive-telemetry',onDrive);addEventListener('tryamm:streetverse-vehicle-collision',onCollision);addEventListener('tryamm:streetverse-drive-sound',onHorn);addEventListener('tryamm:streetverse-mission-start',onMission);addEventListener('tryamm:streetverse-emergency-response',onEmergency);addEventListener('tryamm:streetverse-powersport-mounted',onPower)
  return()=>{removeEventListener('tryamm:streetverse-drive-telemetry',onDrive);removeEventListener('tryamm:streetverse-vehicle-collision',onCollision);removeEventListener('tryamm:streetverse-drive-sound',onHorn);removeEventListener('tryamm:streetverse-mission-start',onMission);removeEventListener('tryamm:streetverse-emergency-response',onEmergency);removeEventListener('tryamm:streetverse-powersport-mounted',onPower);ctxRef.current?.close().catch(()=>{});ctxRef.current=null}
 },[])
 return <button onClick={()=>{setEnabled(v=>!v);ensure();setLife(enabled?'CITY MUTED':'CITY ALIVE')}} style={{position:'fixed',left:12,bottom:78,zIndex:16998,border:'1px solid #6cff9b66',borderRadius:12,padding:'9px 11px',background:'rgba(4,15,13,.9)',color:'#e8fff0',fontSize:10,fontWeight:950}}>{enabled?'🔊':'🔇'} CITY LIFE • {life}</button>
}
