import { useMemo } from 'react'

type Mode='network'|'free-tv'|'isaiah-ai-tv'|'starverse'

const routes:{mode:Mode;label:string;path:string;status:'LIVE'|'BETA'}[]=[
  {mode:'network',label:'All American Network',path:'/network',status:'LIVE'},
  {mode:'free-tv',label:'Free TV',path:'/free-tv',status:'BETA'},
  {mode:'isaiah-ai-tv',label:'Isaiah AI TV',path:'/isaiah-ai-tv',status:'BETA'},
  {mode:'starverse',label:'StarVerse • Anyone Can Be a Star',path:'/starverse',status:'BETA'},
]

const info:Record<Mode,{eyebrow:string;title:string;copy:string;features:string[]}>= {
  network:{eyebrow:'TRYAMM MEDIA NETWORK',title:'All American Network',copy:'The umbrella media layer connecting Free TV, Isaiah AI TV, StarVerse, LIVE, Reels, StreetVerse and creator publishing.',features:['Free ad-supported viewing lane','Isaiah AI TV news and entertainment desk','StarVerse talent showcases','LIVE / PK / Reels bridge','StreetVerse event coverage','Accessible captions and translation','Cross-platform sharing']},
  'free-tv':{eyebrow:'FREE TV • BETA',title:'Free TV',copy:'A viewer-facing television hub for free channels, community programming, creator shows, news, music, sports and family-safe entertainment. Real channel playback remains provider/feed-gated until a verified stream source is attached.',features:['FAST-style channel guide','Creator and community channels','News, music, sports and family lanes','Captions and screen-reader labels','Language preferences','Save and continue watching','Share to supported apps']},
  'isaiah-ai-tv':{eyebrow:'ISAIAH AI TV • BETA',title:'Isaiah AI TV',copy:'The TRYAMM media desk for StreetVerse highlights, StarVerse winners, creator battles, sports results, business stories and upcoming events. AI-assisted segments require an approved AI/video provider and human publish approval.',features:['StreetVerse highlights','StarVerse results','Creator interviews','Sports and community desk','Business spotlight','Reel-to-TV publishing','Human approval before publish']},
  starverse:{eyebrow:'STARVERSE • BETA',title:'Anyone Can Be a Star',copy:'A talent and showcase system where creators can audition, perform, receive audience feedback, build a profile and connect winning moments to Isaiah AI TV and OmniReel.',features:['Talent profiles and auditions','Showcase stages','Audience voting','Judges/host workflow','Youth/parent safety lane','Accessible performance controls','Winning clips to Isaiah AI TV and Reels']},
}

export default function AllAmericanNetworkHub(){
  const path=window.location.pathname
  const mode:Mode=path.startsWith('/free-tv')?'free-tv':path.startsWith('/isaiah-ai-tv')?'isaiah-ai-tv':path.startsWith('/starverse')?'starverse':'network'
  const current=useMemo(()=>info[mode],[mode])
  const share=async()=>{const data={title:current.title,text:current.copy,url:window.location.href};if(navigator.share){try{await navigator.share(data);return}catch{}}try{await navigator.clipboard.writeText(window.location.href);window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'Link copied'}}))}catch{}}
  return <main style={{minHeight:'100vh',background:'radial-gradient(circle at 20% 0,#3a173d 0,#0b0b18 38%,#020308 100%)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}>
    <div style={{maxWidth:1120,margin:'0 auto',padding:'24px 16px 70px'}}>
      <nav aria-label="All American Network" style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
        <a href="/" style={pill}>TRYAMM HOME</a><a href="/workstation" style={pill}>OMNI WORKSTATION</a>{routes.map(r=><a key={r.mode} href={r.path} aria-current={r.mode===mode?'page':undefined} style={{...pill,borderColor:r.mode===mode?'#ff77e8':'#3c3750',color:r.mode===mode?'#fff':'#c9c2d8'}}>{r.label}</a>)}
      </nav>
      <section style={{padding:'70px 0 28px'}}><div style={{fontSize:11,letterSpacing:3,color:'#ff77e8',fontWeight:950}}>{current.eyebrow}</div><h1 style={{fontSize:'clamp(42px,8vw,88px)',lineHeight:.95,margin:'10px 0 18px'}}>{current.title}</h1><p style={{maxWidth:800,color:'#c0b8ce',fontSize:18,lineHeight:1.65}}>{current.copy}</p><div style={{display:'flex',gap:10,flexWrap:'wrap'}}><button onClick={share} style={button}>SHARE</button><a href="/workstation" style={{...button,textDecoration:'none'}}>CREATE / PUBLISH</a><a href="/accessibility" style={{...button,textDecoration:'none'}}>ACCESSIBILITY</a></div></section>
      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>{current.features.map(x=><article key={x} style={card}><strong>{x}</strong></article>)}</section>
      <section aria-labelledby="network-status" style={{...card,marginTop:20}}><h2 id="network-status" style={{marginTop:0}}>Production status</h2><p style={{color:'#c0b8ce',lineHeight:1.6}}>The network shell and navigation are connected. Features marked BETA do not claim real 24/7 channel feeds, licensed programming, AI-generated broadcasts, payments or distribution until the required providers, rights and backend jobs are verified.</p><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{routes.map(r=><span key={r.mode} style={{...pill,color:r.status==='LIVE'?'#7dffb2':'#ffd166'}}>{r.label}: {r.status}</span>)}</div></section>
      <section style={{...card,marginTop:20}}><h2 style={{marginTop:0}}>Global access</h2><p style={{color:'#c0b8ce',lineHeight:1.6}}>Designed to inherit TRYAMM account preferences for captions, reduced motion, high contrast, screen-reader optimization, voice control, large touch targets and preferred translation languages, with Web Share/clipboard fallback for cross-platform sharing.</p></section>
    </div>
  </main>
}

const pill:React.CSSProperties={border:'1px solid #3c3750',borderRadius:999,padding:'9px 12px',textDecoration:'none',fontSize:12,fontWeight:850,color:'#fff',background:'#0b0a12'}
const button:React.CSSProperties={border:'1px solid #604b68',borderRadius:12,padding:'12px 14px',background:'#17101d',color:'#fff',fontWeight:900,cursor:'pointer'}
const card:React.CSSProperties={border:'1px solid #342e42',borderRadius:18,padding:18,background:'#0d0b15cc'}
