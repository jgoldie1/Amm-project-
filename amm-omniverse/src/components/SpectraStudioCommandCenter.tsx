import { useMemo } from 'react'

type Lane={title:string;copy:string;features:string[];href:string}

const lanes:Lane[]=[
  {title:'STUDIO SLATE',copy:'Develop film, series, shorts, documentaries, live specials, music specials and games from one slate.',features:['development','greenlight review','production','post','release ready'],href:'/spectra-entertainment'},
  {title:'FREE → PREMIUM FUNNEL',copy:'Use Free TV, clips, Reels and Holo Drama to acquire audiences, then move qualified fans into premium episodes, subscriptions, LIVE events and commerce.',features:['Free TV','Holo Drama','Reels','LIVE','subscriptions'],href:'/free-tv'},
  {title:'FRANCHISE WORLDS',copy:'Turn one original TRYAMM property into coordinated extensions across StreetVerse, games, music, books, merch, podcasts and LIVE.',features:['StreetVerse','games','Holo Music','merch','podcasts'],href:'/streetverse'},
  {title:'RIGHTS + CLEARANCE',copy:'Track ownership, licenses, territories, expirations and restrictions before publishing or monetizing.',features:['music rights','talent releases','footage','territories','license expiry'],href:'/workstation'},
  {title:'GLOBAL RELEASE WINDOWS',copy:'Plan festival, theatrical, premium VOD, subscription, ad-supported, network, LIVE and licensing windows without conflicting rights.',features:['territories','release timing','provider readiness','window status','distribution'],href:'/network'},
  {title:'AD + COMMERCE',copy:'Package sponsorship, product placement, merch, creator commerce and Holo Ads around approved projects.',features:['sponsorship','product placement','merch','Holo Ads','creator commerce'],href:'/omni-cash'},
]

export default function SpectraStudioCommandCenter(){
  const loop=useMemo(()=>['ORIGINAL IDEA','SLATE','RIGHTS','PRODUCTION','CLIPS + FREE TV','PREMIUM RELEASE','LIVE EVENT','STREETVERSE / GAME','MERCH + MUSIC','GLOBAL LICENSING','OMNI CASH'],[])
  return <main style={{minHeight:'100vh',padding:'28px 18px 120px',background:'radial-gradient(circle at top,#24113a,#090711 46%,#050505)',color:'#fff',fontFamily:'system-ui,sans-serif'}}>
    <div style={{maxWidth:1160,margin:'0 auto'}}>
      <div style={{fontSize:12,fontWeight:950,letterSpacing:2,color:'#ff9bf2'}}>SPECTRA ENTERTAINMENT • STUDIO SYSTEM</div>
      <h1 style={{fontSize:'clamp(40px,8vw,82px)',lineHeight:.93,margin:'8px 0 14px'}}>SPECTRA STUDIOS COMMAND</h1>
      <p style={{maxWidth:900,fontSize:18,lineHeight:1.6,color:'#d4c7df'}}>A TRYAMM-owned studio operating system inspired by proven media-company patterns: unified streaming, free-to-premium discovery, franchise management, studio slates, rights clearance, games, advertising and global distribution—without using Paramount, Warner Bros., HBO, DC or any other third-party intellectual property.</p>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'18px 0'}}><a href='/spectra-entertainment' style={button}>SPECTRA ENTERTAINMENT</a><a href='/holo-drama' style={button}>HOLO DRAMA</a><a href='/holo-music' style={button}>HOLO MUSIC</a><a href='/network' style={button}>ALL AMERICAN NETWORK</a><a href='/streetverse' style={button}>STREETVERSE</a></div>
      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:12}}>{lanes.map(l=><article key={l.title} style={card}><div style={{fontSize:12,fontWeight:950,color:'#ff9bf2'}}>{l.title}</div><p style={muted}>{l.copy}</p><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{l.features.map(f=><span key={f} style={chip}>{f.toUpperCase()}</span>)}</div><a href={l.href} style={{...button,display:'inline-block',marginTop:12}}>OPEN</a></article>)}</section>
      <section style={{...card,marginTop:18}}><div style={{fontSize:12,fontWeight:950,letterSpacing:1.5,color:'#83ffd0'}}>ONE-IP ECONOMY LOOP</div><div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>{loop.map((x,i)=><span key={x} style={{...chip,borderColor:i===0?'#83ffd0':'#4b3a58'}}>{i+1}. {x}</span>)}</div><p style={{...muted,marginBottom:0}}>The goal is for one successful original story or creator property to generate multiple rights-cleared revenue surfaces instead of one isolated release.</p></section>
      <section style={{...card,marginTop:18,borderColor:'#8a7430',background:'#1a160a'}}><strong>RIGHTS + PROVIDER GATE</strong><p style={{marginBottom:0,color:'#ffe3a2',lineHeight:1.55}}>No third-party movies, shows, characters, music, sports feeds or trademarks are included unless TRYAMM has verified rights. The system manages original TRYAMM/Spectra properties and properly licensed partner content.</p></section>
    </div>
  </main>
}

const card={padding:18,border:'1px solid #463452',borderRadius:18,background:'#100c16e8'} as const
const muted={color:'#d4c7df',lineHeight:1.55} as const
const chip={display:'inline-block',padding:'7px 9px',border:'1px solid #4b3a58',borderRadius:999,background:'#0b0810',fontSize:11,fontWeight:900} as const
const button={padding:'10px 13px',border:'1px solid #6d4f79',borderRadius:999,background:'#1a1021',color:'#fff',fontWeight:900,textDecoration:'none'} as const
