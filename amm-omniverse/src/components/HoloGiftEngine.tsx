import {useMemo,useRef,useState} from 'react'
import {getAccessToken} from '../services/supabaseClient'
import {Howl} from 'howler'

const API=(import.meta as any).env?.VITE_API_URL??''

type Gift={id:string;label:string;icon:string;effect:string;suggested:number;spatial:'2d'|'ar'|'vr'|'all';musicCue:string;collection:string;tier:'MICRO'|'REACTION'|'MUSIC'|'PRESTIGE'|'SET-APART'|'PK'|'WORLD'}
const G=(id:string,label:string,icon:string,effect:string,suggested:number,spatial:Gift['spatial'],musicCue:string,collection:string,tier:Gift['tier']):Gift=>({id,label,icon,effect,suggested,spatial,musicCue,collection,tier})
const GIFTS:Gift[]=[
  G('spark','Spark','✦','Cyan particle pop',0,'all','spark','QUICK REACTIONS','MICRO'),
  G('rose','Holo Rose','🌹','3D rose petals orbit the host',50,'ar','rose','QUICK REACTIONS','MICRO'),
  G('heart','Holo Heart','♡','Floating heart ribbons around host',100,'ar','heart','QUICK REACTIONS','MICRO'),
  G('fire','Fire Wave','🔥','Reactive flame wall and heat shimmer',150,'all','fire','QUICK REACTIONS','MICRO'),
  G('confetti','Celebration','🎉','Room-wide holographic confetti burst',200,'all','confetti','QUICK REACTIONS','MICRO'),
  G('kiss-me','Kiss Me','💋','Playful holographic kiss flies toward the host with heart trail',100,'ar','kiss','PLAYFUL','REACTION'),
  G('air-kiss','Air Kiss','😘','Floating kiss bubbles and pink/cyan light rings',75,'all','kiss','PLAYFUL','REACTION'),
  G('holo-hug','Holo Hug','🤗','Soft glowing arms and heart aura wrap the creator frame',125,'ar','hug','PLAYFUL','REACTION'),
  G('high-five','High Five','🖐️','Two holographic hands meet with a spark burst',100,'ar','highfive','PLAYFUL','REACTION'),
  G('wink','Wink','😉','Giant holographic wink with star sparkle',50,'all','wink','PLAYFUL','REACTION'),
  G('laugh-burst','Laugh Burst','😂','Emoji orbit erupts into a room-wide laugh wave',100,'all','laugh','COMEDY','REACTION'),
  G('boo','Boo!','👻','Cartoon ghost jump-scare pops in and dissolves',75,'ar','boo','COMEDY','REACTION'),
  G('heartbreak','Heartbreak','💔','Heart splits into holographic shards then reforms',150,'all','heartbreak','DRAMA','REACTION'),
  G('cartoon-punch','Holo Punch','🥊','Clearly virtual boxing glove flies across screen with comic POW burst',125,'all','punch','COMEDY','REACTION'),
  G('cartoon-slap','Holo Slap','🫲','Clearly virtual foam-hand slap with comic spin and stars',125,'all','slap','COMEDY','REACTION'),
  G('america250','America 250','🇺🇸','250-star red/white/blue sweep with cyan/gold finale',250,'all','america250','AMERICA 250','PRESTIGE'),
  G('eagle','American Eagle','🦅','Holographic eagle fly-through with star trail',500,'vr','eagle','AMERICA 250','PRESTIGE'),
  G('liberty-bell','Liberty Bell','🔔','Gold bell materializes with radial pulse',750,'ar','bell','AMERICA 250','PRESTIGE'),
  G('stars-stripes','Stars & Stripes','⭐','Immersive flag-light ribbon wraps the room',1000,'all','stars','AMERICA 250','PRESTIGE'),
  G('mic-drop','Mic Drop','🎤','Chrome microphone drop and crowd pulse',300,'ar','mic','MUSIC','MUSIC'),
  G('vinyl','Vinyl Spin','💿','Giant holographic record spins behind creator',600,'all','vinyl','MUSIC','MUSIC'),
  G('boombox','Boombox','📻','Retro-future boombox lands with equalizer beams',1200,'vr','boombox','MUSIC','MUSIC'),
  G('gold-record','Gold Record','🏆','Gold record plaque rises with spotlight fan',2500,'all','goldrecord','MUSIC','MUSIC'),
  G('crown','Crown Drop','♛','Gold crown halo above host',500,'all','crown','PRESTIGE','PRESTIGE'),
  G('diamond','Holo Diamond','💎','Faceted diamond refracts cyan/gold light',1500,'ar','diamond','PRESTIGE','PRESTIGE'),
  G('supercar','Supercar Arrival','🏎️','Holographic supercar circles the LIVE stage',5000,'vr','car','PRESTIGE','PRESTIGE'),
  G('private-jet','Private Jet','✈️','Jet flyover with creator name in light trail',10000,'vr','jet','PRESTIGE','PRESTIGE'),
  G('yacht','Holo Yacht','🛥️','Ocean floor rises and luxury yacht enters room',15000,'vr','yacht','PRESTIGE','PRESTIGE'),
  G('lion','Judah Lion','🦁','3D lion crest enters stage',1000,'vr','lion','HEBREW ISRAELITE','SET-APART'),
  G('twelve-tribes','Twelve Tribes','✡','Twelve-point tribal light orbit with Judah highlighted',1200,'all','tribes','HEBREW ISRAELITE','SET-APART'),
  G('shofar','Shofar Call','📯','Golden sound-wave spiral opens across the room',1500,'all','shofar','HEBREW ISRAELITE','SET-APART'),
  G('set-apart-scroll','Set-Apart Scroll','📜','Ancient scroll unfurls with cyan-gold scripture light',1800,'ar','scroll','HEBREW ISRAELITE','SET-APART'),
  G('menorah-light','Menorah Light','🕎','Seven-light holographic illumination sequence',2000,'all','menorah','HEBREW ISRAELITE','SET-APART'),
  G('jerusalem-gate','Jerusalem Gate','🕍','Holographic city gate opens into warm gold portal',2500,'vr','jerusalem','HEBREW ISRAELITE','SET-APART'),
  G('ark','Ark of Covenant','◫','Cyan-gold sacred chest reveal with light pillars',5000,'vr','ark','HEBREW ISRAELITE','SET-APART'),
  G('judah','Judah Royal','♜','Cyan/gold royal throne sequence',25000,'all','royal','HEBREW ISRAELITE','SET-APART'),
  G('pk-ko','PK Knockout','🥊','Opponent-side holographic shockwave and KO stamp',1000,'all','pkko','PK ARENA','PK'),
  G('pk-comeback','PK Comeback','⚡','Score meter reverses with lightning surge',2500,'all','pkcomeback','PK ARENA','PK'),
  G('pk-crown','PK Champion','👑','Winner pedestal, crown and victory camera sweep',5000,'vr','pkcrown','PK ARENA','PK'),
  G('galaxy','Galaxy','◎','Orbit rings and stars surround room',2500,'all','galaxy','COSMIC','WORLD'),
  G('supernova','Supernova','☀','Full-space radial blast',5000,'vr','supernova','COSMIC','WORLD'),
  G('streetverse-car','StreetVerse Drop','🚘','StreetVerse vehicle crashes through a world portal',6000,'vr','streetcar','WORLD DROPS','WORLD'),
  G('mars-drop','Mars Drop','♂','Room transforms into Mars terrain and dust storm',7500,'vr','mars','WORLD DROPS','WORLD'),
  G('starverse-stage','StarVerse Stage','🎙️','Concert stage assembles around creator',9000,'vr','stage','WORLD DROPS','WORLD'),
  G('portal','World Portal','◉','StreetVerse portal opens behind host',10000,'all','portal','WORLD DROPS','WORLD'),
  G('omnibox-premiere','Omni Box Premiere','🎬','Cinema walls rise and premiere lights sweep room',12500,'vr','premiere','WORLD DROPS','WORLD'),
  G('world-takeover','World Takeover','🌐','Entire room transforms into creator-selected world skin',25000,'vr','world','WORLD DROPS','WORLD'),
]

const SILENT_WAV='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='
const cueNames=[...new Set(GIFTS.map(g=>g.musicCue))]
const CUES:Record<string,string>=Object.fromEntries(cueNames.map(name=>[name,SILENT_WAV]))

type Props={recipientId?:string}

export default function HoloGiftEngine({recipientId='demo-host'}:Props){
  const [gift,setGift]=useState(GIFTS[0])
  const [amount,setAmount]=useState(gift.suggested)
  const [burst,setBurst]=useState(0)
  const [mode,setMode]=useState<'screen'|'ar'|'vr'>('screen')
  const [musicEnabled,setMusicEnabled]=useState(true)
  const [tier,setTier]=useState<Gift['tier']|'ALL'>('ALL')
  const [message,setMessage]=useState('Visual gifts are immediate. Cash tips require provider verification before they become payable.')
  const [busy,setBusy]=useState(false)
  const rings=useMemo(()=>Array.from({length:gift.id==='america250'?12:gift.tier==='WORLD'?10:8}),[gift.id,gift.tier])
  const soundRef=useRef<Howl|null>(null)
  const visible=tier==='ALL'?GIFTS:GIFTS.filter(item=>item.tier===tier)

  function playCue(){if(!musicEnabled)return;try{soundRef.current?.stop();soundRef.current=new Howl({src:[CUES[gift.musicCue]||SILENT_WAV],volume:.35});soundRef.current.play()}catch{}}
  async function enterXR(target:'ar'|'vr'){
    setMode(target)
    window.dispatchEvent(new CustomEvent('tryamm:holo-xr-gift-mode',{detail:{mode:target,giftId:gift.id}}))
    setMessage(`${target.toUpperCase()} gift mode armed. Compatible devices can anchor gifts in camera/world space; unsupported devices fall back to holographic screen effects.`)
  }
  async function send(){
    setBusy(true)
    try{
      const token=await getAccessToken();if(!token)throw new Error('Sign in before sending a gift or tip.')
      const response=await fetch(`${API}/api/gifts/intent`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({giftType:gift.id,recipientId,amountMinor:amount,spatialMode:mode,musicCue:gift.musicCue})})
      const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data?.error||`Gift request failed (${response.status})`)
      setBurst(v=>v+1);playCue();window.dispatchEvent(new CustomEvent('tryamm:holo-gift',{detail:{...data.intent,spatialMode:mode,musicCue:gift.musicCue,effect:gift.effect,collection:gift.collection,tier:gift.tier}}))
      setMessage(amount>0?`${gift.label} fired in ${mode.toUpperCase()} mode. Tip remains pending provider verification; no withdrawable cash was created.`:`${gift.label} visual/music effect fired in ${mode.toUpperCase()} mode.`)
    }catch(error){setMessage(error instanceof Error?error.message:'Gift failed.')}finally{setBusy(false)}
  }

  const patriotic=gift.collection==='AMERICA 250',setApart=gift.tier==='SET-APART',world=gift.tier==='WORLD'
  return <section style={{border:'1px solid #274459',borderRadius:20,background:'#07111de8',padding:14,position:'relative',overflow:'hidden'}}>
    {burst>0&&<div key={burst} aria-hidden="true" style={{position:'absolute',inset:0,pointerEvents:'none',display:'grid',placeItems:'center',animation:'tryammGiftFade 2.6s ease-out forwards',background:patriotic?'radial-gradient(circle,#ffffff22,#1447aa22 42%,#b3194222 72%,transparent)':setApart?'radial-gradient(circle,#e8b94422,#4fe3ff12 55%,transparent)':world?'radial-gradient(circle,#4fe3ff22,#7b3cff18 55%,transparent)':'transparent'}}>
      <div style={{position:'relative',width:300,height:300,display:'grid',placeItems:'center',transform:mode==='vr'?'perspective(700px) rotateX(12deg) rotateY(-10deg)':'none'}}>{rings.map((_,i)=><span key={i} style={{position:'absolute',width:45+i*22,height:45+i*22,borderRadius:'50%',border:`${Math.max(1,4-i/2)}px solid ${patriotic?['#b31942','#fff','#0a3161'][i%3]:world?['#4fe3ff','#7b3cff','#e8b944'][i%3]:i%2?'#e8b944':'#4fe3ff'}`,opacity:.84-i*.05,boxShadow:`0 0 ${20+i*7}px ${patriotic?'#ffffff44':i%2?'#e8b94466':'#4fe3ff66'}`,animation:`tryammGiftRing ${.55+i*.07}s ease-out forwards`}}/>)}<span style={{fontSize:86,filter:'drop-shadow(0 0 18px #4fe3ff) drop-shadow(0 0 32px #e8b944)',transform:mode==='ar'?'translateY(-18px) scale(1.08)':mode==='vr'?'scale(1.25)':'none'}}>{gift.icon}</span></div>
    </div>}
    <style>{`@keyframes tryammGiftRing{from{transform:scale(.15) rotate(0);opacity:1}to{transform:scale(1.9) rotate(38deg);opacity:0}}@keyframes tryammGiftFade{0%,80%{opacity:1}100%{opacity:0}}`}</style>
    <div style={{fontSize:10,letterSpacing:2.5,color:'#4fe3ff',fontWeight:950}}>TRYAMM HOLO GIFT UNIVERSE • AR / VR / MUSIC</div>
    <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:10}}>{(['screen','ar','vr'] as const).map(id=><button key={id} onClick={()=>id==='screen'?setMode('screen'):enterXR(id)} style={{padding:'8px 11px',borderRadius:11,border:`1px solid ${mode===id?'#4fe3ff':'#2d4050'}`,background:mode===id?'#0c2b39':'#081019',color:'#fff',fontWeight:900,cursor:'pointer'}}>{id.toUpperCase()}</button>)}<button onClick={()=>setMusicEnabled(v=>!v)} style={{padding:'8px 11px',borderRadius:11,border:'1px solid #e8b94466',background:'#151007',color:'#fff',fontWeight:900,cursor:'pointer'}}>♫ MUSIC {musicEnabled?'ON':'OFF'}</button></div>
    <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:9}}>{(['ALL','MICRO','REACTION','MUSIC','PRESTIGE','SET-APART','PK','WORLD'] as const).map(id=><button key={id} onClick={()=>setTier(id)} style={{padding:'6px 9px',borderRadius:999,border:`1px solid ${tier===id?'#4fe3ff':'#253645'}`,background:tier===id?'#0b2937':'#071019',color:'#dce8ef',fontSize:9,fontWeight:900,cursor:'pointer'}}>{id}</button>)}</div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(124px,1fr))',gap:7,marginTop:10,maxHeight:460,overflowY:'auto'}}>{visible.map(item=><button key={item.id} onClick={()=>{setGift(item);setAmount(item.suggested)}} style={{padding:9,borderRadius:12,border:`1px solid ${gift.id===item.id?'#4fe3ff':'#26394b'}`,background:gift.id===item.id?'#0c2837':'#080d14',color:'#fff',cursor:'pointer'}}><div style={{fontSize:25}}>{item.icon}</div><div style={{fontSize:10,fontWeight:900}}>{item.label}</div><div style={{fontSize:8,color:'#899aa8',marginTop:3}}>{item.effect}</div><div style={{fontSize:7,color:item.collection==='AMERICA 250'?'#fff':'#e8b944',marginTop:4,letterSpacing:.5}}>{item.collection}</div><div style={{fontSize:8,color:'#4fe3ff',marginTop:3}}>{item.spatial.toUpperCase()} • {item.tier}</div></button>)}</div>
    <label style={{display:'block',marginTop:10,fontSize:9,color:'#9aabb8'}}>OPTIONAL TIP (USD cents)</label><input type="number" min={0} max={100000} value={amount} onChange={e=>setAmount(Math.max(0,Math.floor(Number(e.target.value||0))))} style={{width:'100%',boxSizing:'border-box',marginTop:4,padding:10,borderRadius:10,border:'1px solid #294052',background:'#03070d',color:'#fff'}}/>
    <button onClick={send} disabled={busy} style={{width:'100%',marginTop:10,padding:12,borderRadius:12,border:'1px solid #4fe3ff88',background:'linear-gradient(135deg,#0c3343,#2a1f35)',color:'#fff',fontWeight:950,cursor:'pointer'}}>{busy?'SENDING…':`SEND ${gift.icon} ${gift.label} • ${mode.toUpperCase()}${amount?` + $${(amount/100).toFixed(2)} TIP`:''}`}</button>
    <div style={{fontSize:10,lineHeight:1.5,color:'#a7b6c2',marginTop:9}}>{message}</div>
  </section>
}
