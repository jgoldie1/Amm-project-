import {useMemo,useRef,useState} from 'react'
import {getAccessToken} from '../services/supabaseClient'
import {Howl} from 'howler'

const API=(import.meta as any).env?.VITE_API_URL??''

type Gift={id:string;label:string;icon:string;effect:string;suggested:number;spatial:'2d'|'ar'|'vr'|'all';musicCue:string}
const GIFTS:Gift[]=[
  {id:'spark',label:'Spark',icon:'✦',effect:'Cyan particle burst',suggested:0,spatial:'all',musicCue:'spark'},
  {id:'heart',label:'Holo Heart',icon:'♡',effect:'Floating heart ribbons around host',suggested:100,spatial:'ar',musicCue:'heart'},
  {id:'crown',label:'Crown Drop',icon:'♛',effect:'Gold crown halo above host',suggested:500,spatial:'all',musicCue:'crown'},
  {id:'lion',label:'Judah Lion',icon:'🦁',effect:'3D lion crest enters stage',suggested:1000,spatial:'vr',musicCue:'lion'},
  {id:'galaxy',label:'Galaxy',icon:'◎',effect:'Orbit rings and stars surround room',suggested:2500,spatial:'all',musicCue:'galaxy'},
  {id:'supernova',label:'Supernova',icon:'☀',effect:'Full-space radial blast',suggested:5000,spatial:'vr',musicCue:'supernova'},
  {id:'portal',label:'World Portal',icon:'◉',effect:'StreetVerse portal opens behind host',suggested:10000,spatial:'all',musicCue:'portal'},
  {id:'judah',label:'Judah Royal',icon:'♜',effect:'Cyan/gold royal throne sequence',suggested:25000,spatial:'all',musicCue:'royal'},
]

const CUES:Record<string,string>={
  spark:'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
  heart:'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
  crown:'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
  lion:'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
  galaxy:'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
  supernova:'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
  portal:'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
  royal:'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
}

type Props={recipientId?:string}

export default function HoloGiftEngine({recipientId='demo-host'}:Props){
  const [gift,setGift]=useState(GIFTS[0])
  const [amount,setAmount]=useState(gift.suggested)
  const [burst,setBurst]=useState(0)
  const [mode,setMode]=useState<'screen'|'ar'|'vr'>('screen')
  const [musicEnabled,setMusicEnabled]=useState(true)
  const [message,setMessage]=useState('Visual gifts are immediate. Cash tips require provider verification before they become payable.')
  const [busy,setBusy]=useState(false)
  const rings=useMemo(()=>Array.from({length:8}),[])
  const soundRef=useRef<Howl|null>(null)

  function playCue(){if(!musicEnabled)return;try{soundRef.current?.stop();soundRef.current=new Howl({src:[CUES[gift.musicCue]],volume:.35});soundRef.current.play()}catch{}}
  async function enterXR(target:'ar'|'vr'){
    setMode(target)
    window.dispatchEvent(new CustomEvent('tryamm:holo-xr-gift-mode',{detail:{mode:target,giftId:gift.id}}))
    setMessage(`${target.toUpperCase()} gift mode armed. Compatible devices can anchor gifts in camera/world space; unsupported devices fall back to holographic screen effects.`)
  }

  async function send(){
    setBusy(true)
    try{
      const token=await getAccessToken()
      if(!token)throw new Error('Sign in before sending a gift or tip.')
      const response=await fetch(`${API}/api/gifts/intent`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({giftType:gift.id,recipientId,amountMinor:amount,spatialMode:mode,musicCue:gift.musicCue})})
      const data=await response.json().catch(()=>({}))
      if(!response.ok)throw new Error(data?.error||`Gift request failed (${response.status})`)
      setBurst(v=>v+1);playCue()
      window.dispatchEvent(new CustomEvent('tryamm:holo-gift',{detail:{...data.intent,spatialMode:mode,musicCue:gift.musicCue,effect:gift.effect}}))
      setMessage(amount>0?`${gift.label} fired in ${mode.toUpperCase()} mode with music cue. Tip remains pending provider verification; no withdrawable cash was created.`:`${gift.label} visual/music effect fired in ${mode.toUpperCase()} mode.`)
    }catch(error){setMessage(error instanceof Error?error.message:'Gift failed.')}
    finally{setBusy(false)}
  }

  return <section style={{border:'1px solid #274459',borderRadius:20,background:'#07111de8',padding:14,position:'relative',overflow:'hidden'}}>
    {burst>0&&<div key={burst} aria-hidden="true" style={{position:'absolute',inset:0,pointerEvents:'none',display:'grid',placeItems:'center',animation:'tryammGiftFade 2.2s ease-out forwards'}}>
      <div style={{position:'relative',width:260,height:260,display:'grid',placeItems:'center',transform:mode==='vr'?'perspective(700px) rotateX(12deg) rotateY(-10deg)':'none'}}>{rings.map((_,i)=><span key={i} style={{position:'absolute',width:45+i*26,height:45+i*26,borderRadius:'50%',border:`${Math.max(1,4-i/2)}px solid ${i%2?'#e8b944':'#4fe3ff'}`,opacity:.82-i*.07,boxShadow:`0 0 ${20+i*8}px ${i%2?'#e8b94466':'#4fe3ff66'}`,animation:`tryammGiftRing ${.55+i*.08}s ease-out forwards`}}/>)}<span style={{fontSize:80,filter:'drop-shadow(0 0 18px #4fe3ff) drop-shadow(0 0 32px #e8b944)',transform:mode==='ar'?'translateY(-18px) scale(1.08)':mode==='vr'?'scale(1.25)':'none'}}>{gift.icon}</span></div>
    </div>}
    <style>{`@keyframes tryammGiftRing{from{transform:scale(.15) rotate(0);opacity:1}to{transform:scale(1.7) rotate(28deg);opacity:0}}@keyframes tryammGiftFade{0%,78%{opacity:1}100%{opacity:0}}`}</style>
    <div style={{fontSize:10,letterSpacing:2.5,color:'#4fe3ff',fontWeight:950}}>AR / VR HOLO GIFT + MUSIC ENGINE</div>
    <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:10}}>{(['screen','ar','vr'] as const).map(id=><button key={id} onClick={()=>id==='screen'?setMode('screen'):enterXR(id)} style={{padding:'8px 11px',borderRadius:11,border:`1px solid ${mode===id?'#4fe3ff':'#2d4050'}`,background:mode===id?'#0c2b39':'#081019',color:'#fff',fontWeight:900,cursor:'pointer'}}>{id.toUpperCase()}</button>)}<button onClick={()=>setMusicEnabled(v=>!v)} style={{padding:'8px 11px',borderRadius:11,border:'1px solid #e8b94466',background:'#151007',color:'#fff',fontWeight:900,cursor:'pointer'}}>♫ MUSIC {musicEnabled?'ON':'OFF'}</button></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))',gap:7,marginTop:10}}>{GIFTS.map(item=><button key={item.id} onClick={()=>{setGift(item);setAmount(item.suggested)}} style={{padding:9,borderRadius:12,border:`1px solid ${gift.id===item.id?'#4fe3ff':'#26394b'}`,background:gift.id===item.id?'#0c2837':'#080d14',color:'#fff',cursor:'pointer'}}><div style={{fontSize:24}}>{item.icon}</div><div style={{fontSize:10,fontWeight:900}}>{item.label}</div><div style={{fontSize:8,color:'#899aa8',marginTop:3}}>{item.effect}</div><div style={{fontSize:8,color:'#e8b944',marginTop:3}}>{item.spatial.toUpperCase()} • MUSIC</div></button>)}</div>
    <label style={{display:'block',marginTop:10,fontSize:9,color:'#9aabb8'}}>OPTIONAL TIP (USD cents)</label>
    <input type="number" min={0} max={100000} value={amount} onChange={e=>setAmount(Math.max(0,Math.floor(Number(e.target.value||0))))} style={{width:'100%',boxSizing:'border-box',marginTop:4,padding:10,borderRadius:10,border:'1px solid #294052',background:'#03070d',color:'#fff'}}/>
    <button onClick={send} disabled={busy} style={{width:'100%',marginTop:10,padding:12,borderRadius:12,border:'1px solid #4fe3ff88',background:'linear-gradient(135deg,#0c3343,#2a1f35)',color:'#fff',fontWeight:950,cursor:'pointer'}}>{busy?'SENDING…':`SEND ${gift.icon} ${gift.label} • ${mode.toUpperCase()}${amount?` + $${(amount/100).toFixed(2)} TIP`:''}`}</button>
    <div style={{fontSize:10,lineHeight:1.5,color:'#a7b6c2',marginTop:9}}>{message}</div>
  </section>
}
