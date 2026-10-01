import {useEffect,useState} from 'react'
import type {SoundKey} from '../game/audio/SoundEngine'

const PREVIEWS:Array<{key:SoundKey;label:string}>=[
  {key:'car_crash',label:'🚗 CRASH'},
  {key:'fire_crackle',label:'🔥 FIRE'},
  {key:'police_siren',label:'🚓 POLICE'},
  {key:'ambulance_siren',label:'🚑 EMS'},
  {key:'firetruck_siren',label:'🚒 FIRE TRUCK'},
  {key:'radio_chirp',label:'📻 RADIO'},
  {key:'crowd_ambient',label:'👥 CROWD'},
  {key:'wind',label:'💨 WIND'},
  {key:'rain',label:'🌧 RAIN'},
  {key:'gate_buzzer',label:'🚧 GATE'},
  {key:'distant_shot',label:'⚠️ INCIDENT'},
  {key:'rescue_success',label:'✅ RESCUE'},
]

export default function StreetVerseSoundBankHUD(){
  const [open,setOpen]=useState(false)
  const [enabled,setEnabled]=useState(true)
  const [volume,setVolume]=useState(.68)

  useEffect(()=>{
    try{
      const saved=JSON.parse(localStorage.getItem('tryamm.streetverse.sound-bank.v1')||'{}')
      if(typeof saved.enabled==='boolean')setEnabled(saved.enabled)
      if(Number.isFinite(saved.volume))setVolume(Math.max(0,Math.min(1,Number(saved.volume))))
    }catch{}
    const onOpen=()=>setOpen(true)
    const onState=(event:Event)=>{
      const d=(event as CustomEvent<{enabled?:boolean;volume?:number}>).detail||{}
      if(typeof d.enabled==='boolean')setEnabled(d.enabled)
      if(Number.isFinite(d.volume))setVolume(Math.max(0,Math.min(1,Number(d.volume))))
    }
    addEventListener('tryamm:streetverse-sound-bank-open',onOpen)
    addEventListener('tryamm:streetverse-sound-bank-state',onState)
    return()=>{
      removeEventListener('tryamm:streetverse-sound-bank-open',onOpen)
      removeEventListener('tryamm:streetverse-sound-bank-state',onState)
    }
  },[])

  const apply=(nextEnabled:boolean,nextVolume:number)=>{
    setEnabled(nextEnabled);setVolume(nextVolume)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-sound-bank-settings',{detail:{enabled:nextEnabled,volume:nextVolume}}))
  }

  if(!open)return null
  return <div role="dialog" aria-modal="true" aria-label="StreetVerse sound bank" style={backdrop}>
    <section style={panel}>
      <div style={{fontSize:10,letterSpacing:2,color:'#8ff5ff',fontWeight:950}}>STREETVERSE • SOUND BANK</div>
      <h2 style={{margin:'6px 0 4px'}}>Living City SFX</h2>
      <p style={copy}>Procedural sounds work without downloading audio files. Police/fire/EMS radio and sirens are fictional game audio, not real scanner traffic.</p>
      <button onClick={()=>apply(!enabled,volume)} style={{...button,width:'100%',borderColor:enabled?'#6dffc0':'#79666a'}}>{enabled?'🔊 SOUND ON':'🔇 SOUND OFF'}</button>
      <label style={{display:'block',fontSize:10,fontWeight:900,marginTop:12,color:'#c6f6ff'}}>MASTER VOLUME • {Math.round(volume*100)}%
        <input aria-label="Sound bank volume" type="range" min="0" max="1" step=".05" value={volume} onChange={e=>apply(enabled,Number(e.target.value))} style={{width:'100%',minHeight:38}}/>
      </label>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:7,marginTop:8}}>
        {PREVIEWS.map(item=><button key={item.key} disabled={!enabled} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-sound-preview',{detail:{key:item.key}}))} style={button}>{item.label}</button>)}
      </div>
      <div style={{marginTop:10,padding:10,borderRadius:12,background:'#0b1b22',fontSize:10,lineHeight:1.45,color:'#9eb7c1'}}>
        21+ private scenes can use non-graphic room ambience, breathing and heartbeat only after adult/private/consent gates. No public adult audio.
      </div>
      <button onClick={()=>setOpen(false)} style={{...button,width:'100%',marginTop:10}}>CLOSE</button>
    </section>
  </div>
}

const backdrop:React.CSSProperties={position:'fixed',inset:0,zIndex:47300,display:'grid',placeItems:'center',padding:14,background:'rgba(2,7,11,.84)',backdropFilter:'blur(5px)'}
const panel:React.CSSProperties={width:'min(94vw,520px)',maxHeight:'86dvh',overflowY:'auto',border:'1px solid #58e8ff77',borderRadius:20,background:'#07131bf8',color:'#fff',padding:16,fontFamily:'system-ui',boxShadow:'0 24px 80px #000d'}
const copy:React.CSSProperties={fontSize:12,lineHeight:1.5,color:'#bad0d9'}
const button:React.CSSProperties={minHeight:48,borderRadius:11,border:'1px solid #31596c',background:'#0b202b',color:'#fff',fontWeight:900,padding:'9px 10px',touchAction:'manipulation'}
