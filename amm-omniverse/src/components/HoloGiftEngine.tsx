import {useMemo,useRef,useState} from 'react'
import {getAccessToken} from '../services/supabaseClient'
import {Howl} from 'howler'

const API=(import.meta as any).env?.VITE_API_URL??''

type Gift={id:string;label:string;icon:string;effect:string;suggested:number;spatial:'2d'|'ar'|'vr'|'all';musicCue:string;collection?:string}
const GIFTS:Gift[]=[
  {id:'spark',label:'Spark',icon:'✦',effect:'Cyan particle burst',suggested:0,spatial:'all',musicCue:'spark'},
  {id:'heart',label:'Holo Heart',icon:'♡',effect:'Floating heart ribbons around host',suggested:100,spatial:'ar',musicCue:'heart'},
  {id:'america250',label:'America 250',icon:'🇺🇸',effect:'250-star red/white/blue holographic sweep with cyan/gold finale',suggested:250,spatial:'all',musicCue:'america250',collection:'AMERICA 250'},
  {id:'crown',label:'Crown Drop',icon:'♛',effect:'Gold crown halo above host',suggested:500,spatial:'all',musicCue:'crown'},
  {id:'lion',label:'Judah Lion',icon:'🦁',effect:'3D lion crest enters stage',suggested:1000,spatial:'vr',musicCue:'lion',collection:'SET-APART'},
  {id:'twelve-tribes',label:'Twelve Tribes',icon:'✡',effect:'Twelve-point tribal light orbit with Judah highlighted',suggested:1200,spatial:'all',musicCue:'tribes',collection:'HEBREW ISRAELITE'},
  {id:'shofar',label:'Shofar Call',icon:'𓃀',effect:'Golden sound-wave spiral opens across the room',suggested:1500,spatial:'all',musicCue:'shofar',collection:'HEBREW ISRAELITE'},
  {id:'set-apart-scroll',label:'Set-Apart Scroll',icon:'📜',effect:'Ancient scroll unfurls with cyan-gold scripture light',suggested:1800,spatial:'ar',musicCue:'scroll',collection:'HEBREW ISRAELITE'},
  {id:'jerusalem-gate',label:'Jerusalem Gate',icon:'🕍',effect:'Holographic city gate opens into a warm gold portal',suggested:2500,spatial:'vr',musicCue:'jerusalem',collection:'HEBREW ISRAELITE'},
  {id:'galaxy',label:'Galaxy',icon:'◎',effect:'Orbit rings and stars surround room',suggested:2500,spatial:'all',musicCue:'galaxy'},
  {id:'supernova',label:'Supernova',icon:'☀',effect:'Full-space radial blast',suggested:5000,spatial:'vr',musicCue:'supernova'},
  {id:'portal',label:'World Portal',icon:'◉',effect:'StreetVerse portal opens behind host',suggested:10000,spatial:'all',musicCue:'portal'},
  {id:'judah',label:'Judah Royal',icon:'♜',effect:'Cyan/gold royal throne sequence',suggested:25000,spatial:'all',musicCue:'royal',collection:'SET-APART'},
]

const SILENT_WAV='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='
const CUES:Record<string,string>={spark:SILENT_WAV,heart:SILENT_WAV,crown:SILENT_WAV,lion:SILENT_WAV,galaxy:SILENT_WAV,supernova:SILENT_WAV,portal:SILENT_WAV,royal:SILENT_WAV,america250:SILENT_WAV,tribes:SILENT_WAV,shofar:SILENT_WAV,scroll:SILENT_WAV,jerusalem:SILENT_WAV}

type Props={recipientId?:string}

export default function HoloGiftEngine({recipientId='demo-host'}:Props){
  const [gift,setGift]=useState(GIFTS[0])
  const [amount,setAmount]=useState(gift.suggested)
  const [burst,setBurst]=useState(0)
  const [mode,setMode]=useState<'screen'|'ar'|'vr'>('screen')
  const [musicEnabled,setMusicEnabled]=useState(true)
  const [message,setMessage]=useState('Visual gifts are immediate. Cash tips require provider verification before they become payable.')
  const [busy,setBusy]=useState(false)
  const rings=useMemo(()=>Array.from({length:gift.id==='america250'?12:8}),[gift.id])
  const soundRef=useRef<Howl|null>(null)

  function playCue(){if(!musicEnabled)return;try{soundRef.current?.stop();soundRef.current=new Howl({src:[CUES[gift.musicCue]||SILENT_WAV],volume:.35});soundRef.current.play()}catch{}}
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
      window.dispatchEvent(new CustomEvent('tryamm:holo-gift',{detail:{...data.intent,spatialMode:mode,musicCue:gift.musicCue,effect:gift.effect,collection:gift.collection}}))
      setMessage(amount>0?`${gift.label} fired in ${mode.toUpperCase()} mode with music cue. Tip remains pending provider verification; no withdrawable cash was created.`:`${gift.label} visual/music effect fired in ${mode.toUpperCase()} mode.`)
    }catch(error){setMessage(error instanceof Error?error.message:'Gift failed.')}
    finally{setBusy(false)}
  }

  const patriotic=gift.id==='america250'
  const setApart=gift.collection==='HEBREW ISRAELITE'||gift.collection==='SET-APART'
  return <section style={{border:'1px solid #274459',borderRadius:20,background:'#07111de8',padding:14,position:'relative',overflow:'hidden'}}>
    {burst>0&&<div key={burst} aria-hidden="true" style={{position:'absolute',inset:0,pointerEvents:'none',display:'grid',placeItems:'center',animation:'tryammGiftFade 2.4s ease-out forwards',background:patriotic?'radial-gradient(circle,#ffffff22,#1447aa22 42%,#b3194222 72%,transparent)':setApart?'radial-gradient(circle,#e8b94422,#4fe3ff12 55%,transparent)':'transparent'}}>
      <div style={{position:'relative',width:280,height:280,display:'grid',placeItems:'center',transform:mode==='vr'?'perspective(700px) rotateX(12deg) rotateY(-10deg)':'none'}}>{rings.map((_,i)=><span key={i} style={{position:'absolute',width:45+i*22,height:45+i*22,borderRadius:'50%',border:`${Math.max(1,4-i/2)}px solid ${patriotic?[ '#b31942','#fff','#0a3161'][i%3]:i%2?'#e8b944':'#4fe3ff'}`,opacity:.84-i*.055,boxShadow:`0 0 ${20+i*7}px ${patriotic?'#ffffff44':i%2?'#e8b94466':'#4fe3ff66'}`,animation:`tryammGiftRing ${.55+i*.07}s ease-out forwards`}}/>)}<span style={{fontSize:82,filter:'drop-shadow(0 0 18px #4fe3ff) drop-shadow(0 0 32px #e8b944)',transform:mode==='ar'?'translateY(-18px) scale(1.08)':mode==='vr'?'scale(1.25)':'none'}}>{gift.icon}</span></div>
    </div>}
    <style>{`@keyframes tryammGiftRing{from{transform:scale(.15) rotate(0);opacity:1}to{transform:scale(1.75) rotate(32deg);opacity:0}}@keyframes tryammGiftFade{0%,80%{opacity:1}100%{opacity:0}}`}</style>
    <div style={{fontSize:10,letterSpacing:2.5,color:'#4fe3ff',fontWeight:950}}>AR / VR HOLO GIFT + MUSIC ENGINE</div>
    <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:10}}>{(['screen','ar','vr'] as const).map(id=><button key={id} onClick={()=>id==='screen'?setMode('screen'):enterXR(id)} style={{padding:'8px 11px',borderRadius:11,border:`1px solid ${mode===id?'#4fe3ff':'#2d4050'}`,background:mode===id?'#0c2b39':'#081019',color:'#fff',fontWeight:900,cursor:'pointer'}}>{id.toUpperCase()}</button>)}<button onClick={()=>setMusicEnabled(v=>!v)} style={{padding:'8px 11px',borderRadius:11,border:'1px solid #e8b94466',background:'#151007',color:'#fff',fontWeight:900,cursor:'pointer'}}>♫ MUSIC {musicEnabled?'ON':'OFF'}</button></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(118px,1fr))',gap:7,marginTop:10}}>{GIFTS.map(item=><button key={item.id} onClick={()=>{setGift(item);setAmount(item.suggested)}} style={{padding:9,borderRadius:12,border:`1px solid ${gift.id===item.id?'#4fe3ff':'#26394b'}`,background:gift.id===item.id?'#0c2837':'#080d14',color:'#fff',cursor:'pointer'}}><div style={{fontSize:24}}>{item.icon}</div><div style={{fontSize:10,fontWeight:900}}>{item.label}</div><div style={{fontSize:8,color:'#899aa8',marginTop:3}}>{item.effect}</div>{item.collection&&<div style={{fontSize:7,color:item.id==='america250'?'#fff':'#e8b944',marginTop:4,letterSpacing:.6}}>{item.collection}</div>}<div style={{fontSize:8,color:'#e8b944',marginTop:3}}>{item.spatial.toUpperCase()} • MUSIC</div></button>)}</div>
    <label style={{display:'block',marginTop:10,fontSize:9,color:'#9aabb8'}}>OPTIONAL TIP (USD cents)</label>
    <input type="number" min={0} max={100000} value={amount} onChange={e=>setAmount(Math.max(0,Math.floor(Number(e.target.value||0))))} style={{width:'100%',boxSizing:'border-box',marginTop:4,padding:10,borderRadius:10,border:'1px solid #294052',background:'#03070d',color:'#fff'}}/>
    <button onClick={send} disabled={busy} style={{width:'100%',marginTop:10,padding:12,borderRadius:12,border:'1px solid #4fe3ff88',background:'linear-gradient(135deg,#0c3343,#2a1f35)',color:'#fff',fontWeight:950,cursor:'pointer'}}>{busy?'SENDING…':`SEND ${gift.icon} ${gift.label} • ${mode.toUpperCase()}${amount?` + $${(amount/100).toFixed(2)} TIP`:''}`}</button>
    <div style={{fontSize:10,lineHeight:1.5,color:'#a7b6c2',marginTop:9}}>{message}</div>
  </section>
}
