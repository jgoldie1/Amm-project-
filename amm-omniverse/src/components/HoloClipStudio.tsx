import {useMemo,useState} from 'react'
import {DotLottieReact} from '@lottiefiles/dotlottie-react'

type Props={onClose:()=>void}
type Effect={id:string;label:string;kind:'lottie'|'holo'|'gift'|'pk'|'portal';description:string}
type Gift={id:string;label:string;icon:string;credits:number;effect:string}

const EFFECTS:Effect[]=[
  {id:'holo-pulse',label:'Holo Pulse',kind:'holo',description:'Cyan volumetric pulse with depth glow.'},
  {id:'lion-crown',label:'Judah Crown Burst',kind:'lottie',description:'Brand crown/lion reveal layer.'},
  {id:'portal',label:'World Portal',kind:'portal',description:'Turns a clip into a tap-back entry to its world or LIVE room.'},
  {id:'pk-win',label:'PK Victory',kind:'pk',description:'Battle win burst, score sweep and winner halo.'},
  {id:'gift-rain',label:'Gift Rain',kind:'gift',description:'Animated gift particles across the clip.'},
  {id:'neon-trails',label:'Neon Motion Trails',kind:'holo',description:'Reactive cyan/gold motion streaks.'},
  {id:'scanlines',label:'Hologram Scan',kind:'holo',description:'Depth scanlines and light-sheet effect.'},
  {id:'depth-card',label:'3D Depth Card',kind:'holo',description:'Parallax foreground/background framing.'},
  {id:'reaction-ring',label:'Reaction Ring',kind:'lottie',description:'Floating reaction/emote orbit.'},
  {id:'milestone',label:'Milestone Burst',kind:'lottie',description:'Follower, level, gift-goal or XP celebration.'},
]

const GIFTS:Gift[]=[
  {id:'spark',label:'Spark',icon:'✦',credits:10,effect:'holo-pulse'},
  {id:'crown',label:'Crown',icon:'♛',credits:100,effect:'lion-crown'},
  {id:'lion',label:'Judah Lion',icon:'🦁',credits:250,effect:'gift-rain'},
  {id:'portal',label:'Portal',icon:'◎',credits:500,effect:'portal'},
  {id:'galaxy',label:'Galaxy',icon:'✧',credits:1000,effect:'neon-trails'},
]

const SAMPLE_LOTTIE='https://lottie.host/4db68bbd-31f6-4cd8-84eb-189de081159a/IGmMCqhzpt.lottie'

export default function HoloClipStudio({onClose}:Props){
  const [clipTitle,setClipTitle]=useState('StreetVerse Holo Clip')
  const [clipUrl,setClipUrl]=useState('')
  const [effect,setEffect]=useState('holo-pulse')
  const [message,setMessage]=useState('HOLO CLIP → EFFECT → GIFT/TIP → SAVE/PUBLISH → TAP BACK INTO WORLD')
  const [gift,setGift]=useState<Gift|null>(null)
  const selected=useMemo(()=>EFFECTS.find(x=>x.id===effect)!,[effect])

  function sendGift(next:Gift){
    setGift(next);setEffect(next.effect)
    window.dispatchEvent(new CustomEvent('tryamm:gift-tip-intent',{detail:{giftId:next.id,label:next.label,credits:next.credits,clipTitle,clipUrl,settlement:'requires-money-engine-approval'}}))
    setMessage(`${next.label} gift intent created for ${next.credits} credits. Visual effect is immediate; real settlement must pass TRYAMM Money Engine approval.`)
  }
  function openMedia(){window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'holo-clip'}}));setMessage('Opened TRYAMM Media Studio for final render/save/publish.')}
  function returnToWorld(){window.dispatchEvent(new CustomEvent('tryamm:return-to-world',{detail:{source:'holo-clip',clipTitle}}));setMessage('Return-to-world event fired. A published Holo Clip can deep-link viewers back to the originating room/world.')}

  const card:React.CSSProperties={background:'#07111bd9',border:'1px solid #244156',borderRadius:18,padding:14}
  const btn=(active=false):React.CSSProperties=>({border:active?'1px solid #4fe3ff':'1px solid #2a3b49',background:active?'linear-gradient(135deg,#0d3545,#17172a)':'#091019',color:'#fff',borderRadius:12,padding:'10px 12px',fontWeight:850,cursor:'pointer'})
  return <div role="dialog" aria-label="Holo Clip Studio" style={{position:'fixed',inset:0,zIndex:10120,overflowY:'auto',background:'radial-gradient(circle at 50% 0,#103145,#02050b 48%,#000)',color:'#fff'}}>
    <div style={{maxWidth:1150,margin:'0 auto',padding:'18px 14px 80px'}}>
      <header style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center'}}><div><div style={{fontSize:10,letterSpacing:3,fontWeight:950,color:'#4fe3ff'}}>TRYAMM HOLOGRAPHIC SOCIAL FORMAT</div><h1 style={{margin:'4px 0',fontSize:'clamp(28px,5vw,46px)'}}>Holo Clip</h1><div style={{color:'#a6b7c3'}}>Short-form clip + holographic effects + gifting + world deep-link.</div></div><button aria-label="Close" onClick={onClose} style={{...btn(),fontSize:22}}>×</button></header>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:14,marginTop:14}}>
        <section style={card}><b>CLIP SOURCE</b><input value={clipTitle} onChange={e=>setClipTitle(e.target.value)} placeholder="Clip title" style={{width:'100%',boxSizing:'border-box',marginTop:10,padding:10,borderRadius:10,border:'1px solid #294151',background:'#03080e',color:'#fff'}}/><input value={clipUrl} onChange={e=>setClipUrl(e.target.value)} placeholder="Optional authorized clip URL" style={{width:'100%',boxSizing:'border-box',marginTop:8,padding:10,borderRadius:10,border:'1px solid #294151',background:'#03080e',color:'#fff'}}/><div style={{height:220,marginTop:10,borderRadius:16,overflow:'hidden',position:'relative',background:'radial-gradient(circle,#12394a,#02050b 65%)'}}><div style={{position:'absolute',inset:0,display:'grid',placeItems:'center'}}><div style={{width:160,height:160,filter:'drop-shadow(0 0 24px #4fe3ff)',opacity:.9}}><DotLottieReact src={SAMPLE_LOTTIE} autoplay loop/></div></div><div style={{position:'absolute',left:12,bottom:12,right:12,padding:10,border:'1px solid #4fe3ff55',borderRadius:12,background:'#021019cc'}}><b>{selected.label}</b><div style={{fontSize:10,color:'#a8bac6',marginTop:3}}>{selected.description}</div></div></div></section>
        <section style={card}><b>LOTTIE + HOLOGRAPHIC EFFECT STACK</b><div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:7,marginTop:10}}>{EFFECTS.map(x=><button key={x.id} onClick={()=>setEffect(x.id)} style={{...btn(effect===x.id),textAlign:'left'}}><div>{x.label}</div><div style={{fontSize:9,color:'#92a4af',marginTop:3}}>{x.kind.toUpperCase()}</div></button>)}</div><div style={{fontSize:10,color:'#869ba9',marginTop:10,lineHeight:1.5}}>Runtime supports classic Lottie JSON plus dotLottie `.lottie` packages. Effects stay modular so new gift animations, branded reactions and event packs can be added without rebuilding Holo Clip.</div></section>
        <section style={card}><b>GIFT + TIP OVERLAY</b><div style={{display:'grid',gap:7,marginTop:10}}>{GIFTS.map(x=><button key={x.id} onClick={()=>sendGift(x)} style={{...btn(gift?.id===x.id),display:'flex',justifyContent:'space-between',alignItems:'center'}}><span>{x.icon} {x.label}</span><span style={{color:'#e8b944'}}>{x.credits} credits</span></button>)}</div><div style={{fontSize:10,color:'#9cafbb',marginTop:10,lineHeight:1.5}}>Gift animation can display instantly. Monetary settlement is deliberately separate and must pass the existing approval/step-up Money Engine path.</div></section>
      </div>
      <div style={{...card,marginTop:14,display:'flex',gap:8,flexWrap:'wrap'}}><button onClick={openMedia} style={btn(true)}>RENDER / SAVE / PUBLISH</button><button onClick={returnToWorld} style={btn()}>RETURN TO WORLD</button><button onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:holo-social-open'))} style={btn()}>OPEN HOLO SOCIAL</button><div style={{width:'100%',fontSize:11,color:'#9db0bd',lineHeight:1.5}}>{message}</div></div>
    </div>
  </div>
}
