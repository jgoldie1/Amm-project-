import {useEffect,useMemo,useState} from 'react'
import {ALL_AMERICAN_24_7_CLOCK,CRYPTO_EDUCATION_SERIES} from '../data/AllAmericanNetworkPrimeRegistry'
import type {PrimeNewsroomState} from '../runtime/AllAmericanNetworkPrimeNewsroomRuntime'

const FALLBACK:PrimeNewsroomState={sections:[],weather:{configured:false,ready:false,location:'Chicago',summary:'Weather desk waiting for verified source.'},updatedAt:new Date().toISOString()}
const channelRails=[
 {label:'LIVE NOW',items:[['🔴','StreetVerse LIVE','/live?from=all-american-network'],['🎙','All American Tonight','/network/studio'],['🌟','StarVerse Showcase','/starverse'],['♫','MusicVerse LIVE','/musicverse']]},
 {label:'ALL AMERICAN ORIGINALS',items:[['🏙','StreetVerse Chicago','/streetverse'],['🎥','StreetVerse Reality','/reality-tv'],['💼','Business Showcase','/business'],['🏠','PropertyVerse','/propertyverse']]},
 {label:'NETWORKS & VERSES',items:[['📺','Free TV','/free-tv'],['★','Isaiah AI TV','/isaiah-ai-tv'],['🏆','SportsVerse','/sportverse'],['📖','FaithVerse','/faithverse']]},
] as const

function activeProgram(){
 const hour=new Date().getHours()
 const rows=[...ALL_AMERICAN_24_7_CLOCK].sort((a,b)=>a.startHour-b.startHour)
 let active=rows[0]
 for(const row of rows)if(hour>=row.startHour)active=row
 return active
}

export default function AllAmericanNetworkPrimeDeck(){
 const [news,setNews]=useState<PrimeNewsroomState>(FALLBACK)
 const [newsTab,setNewsTab]=useState('local')
 const [cryptoOpen,setCryptoOpen]=useState(false)
 const program=useMemo(activeProgram,[])
 useEffect(()=>{
  const onState=(event:Event)=>setNews((event as CustomEvent<PrimeNewsroomState>).detail||FALLBACK)
  addEventListener('tryamm:all-american-prime-newsroom-state',onState)
  dispatchEvent(new CustomEvent('tryamm:all-american-prime-newsroom-request'))
  return()=>removeEventListener('tryamm:all-american-prime-newsroom-state',onState)
 },[])
 const section=news.sections.find(x=>x.id===newsTab)
 return <section aria-label="All American Network Prime" style={page}>
  <style>{'@keyframes aanGlow{50%{box-shadow:0 0 60px #39d9ff44, inset 0 0 70px #6d42ff22}}@keyframes aanScan{from{transform:translateY(-120%)}to{transform:translateY(800%)}}'}</style>
  <div style={hero}>
   <div style={scan}/>
   <div style={{position:'relative',zIndex:2,maxWidth:760}}>
    <div style={{fontSize:10,letterSpacing:3.4,color:'#78eeff',fontWeight:950}}>ALL AMERICAN NETWORK • POWERED BY STUBBS AI</div>
    <h2 style={{fontSize:'clamp(36px,8vw,82px)',lineHeight:.94,margin:'12px 0'}}>One network.<br/>Every Verse.</h2>
    <p style={{maxWidth:690,fontSize:15,lineHeight:1.6,color:'#bfd0da'}}>Live creators, StreetVerse field coverage, local and world news, weather, crypto education, sports, music, business, faith, Reels and original shows—connected to the same production studio.</p>
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button onClick={()=>window.location.href='/live?role=host&channel=all-american-network'} style={primary}>🔴 GO LIVE</button><button onClick={()=>window.location.href='/network/studio'} style={secondary}>🎛 OPEN STUDIO</button><button onClick={()=>window.location.href='/network/broadcast-os'} style={secondary}>◉ MASTER CONTROL</button></div>
   </div>
   <div style={screen}><div style={{fontSize:9,color:'#75efff',fontWeight:950,letterSpacing:2}}>ON NOW</div><div style={{fontSize:24,fontWeight:1000,marginTop:7}}>{program.title}</div><div style={{fontSize:11,color:'#9db3c0',marginTop:6}}>{program.description}</div><div style={{display:'flex',gap:6,marginTop:12,flexWrap:'wrap'}}><span style={badge}>{program.desk.toUpperCase()}</span><span style={badge}>{program.hostMode==='human'?'HOSTED':'HOST + AI ASSIST'}</span><span style={badge}>{program.durationMinutes} MIN</span></div></div>
  </div>

  {channelRails.map(rail=><section key={rail.label} style={{marginTop:18}}><div style={sectionTitle}>{rail.label}</div><div style={railStyle}>{rail.items.map(([icon,label,path])=><button key={label} onClick={()=>window.location.href=path} style={tile}><div style={{fontSize:34}}>{icon}</div><div style={{fontSize:13,fontWeight:950,marginTop:14}}>{label}</div><div style={{fontSize:9,color:'#7f97a5',marginTop:5}}>WATCH / ENTER →</div></button>)}</div></section>)}

  <section style={{marginTop:22}}><div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center',flexWrap:'wrap'}}><div><div style={sectionTitle}>ORACLE NEWSROOM</div><div style={{fontSize:10,color:'#8fa8b5'}}>Source-linked • verification-aware • local → national → international → digital assets</div></div><button onClick={()=>window.location.href='/network/broadcast-os'} style={secondary}>OPEN NEWS DESK</button></div>
   <div style={{display:'flex',gap:6,overflowX:'auto',marginTop:9}}>{['local','national','international','crypto'].map(id=><button key={id} onClick={()=>setNewsTab(id)} style={{...chip,borderColor:newsTab===id?'#6aeaff':'#284354'}}>{id==='crypto'?'DIGITAL ASSETS':id.toUpperCase()}</button>)}</div>
   <div style={newsGrid}>{(section?.items||[]).length>0?(section?.items||[]).slice(0,6).map(item=><article key={item.id} style={newsCard}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><span style={{fontSize:8,color:item.verification==='official'?'#7dffb1':'#ffd16c',fontWeight:950}}>{String(item.verification||'UNVERIFIED').toUpperCase()}</span><span style={{fontSize:8,color:'#718796'}}>{item.sourceName}</span></div><h3 style={{fontSize:15,lineHeight:1.2,margin:'8px 0'}}>{item.headline}</h3><p style={{fontSize:10,lineHeight:1.45,color:'#9fb1bc'}}>{item.summary||'Open the source card for details.'}</p>{item.sourceUrl&&<button onClick={()=>window.open(String(item.sourceUrl),'_blank','noopener,noreferrer')} style={sourceBtn}>SOURCE ↗</button>}</article>):<article style={{...newsCard,gridColumn:'1/-1'}}><b>Oracle feed is not verified/configured yet.</b><p style={{fontSize:11,color:'#95aab6'}}>The newsroom will not invent headlines. When the Oracle/Quantum crawler has a verified backend feed, source-linked stories will populate here automatically.</p></article>}</div>
  </section>

  <section style={weatherCryptoGrid}>
   <article style={featureCard}><div style={sectionTitle}>CHICAGO WEATHER DESK</div><h3 style={{fontSize:24,margin:'8px 0'}}>{news.weather.location}</h3><p style={{fontSize:12,lineHeight:1.55,color:'#adc0ca'}}>{news.weather.summary}</p><div style={{fontSize:9,color:news.weather.ready?'#7dffb1':'#ffd16c',fontWeight:950}}>{news.weather.ready?'VERIFIED WEATHER SOURCE ACTIVE':'PROVIDER GATED / NOT YET VERIFIED'}</div></article>
   <article style={featureCard}><div style={sectionTitle}>CRYPTO CLASSROOM</div><h3 style={{fontSize:24,margin:'8px 0'}}>Learn before you risk.</h3><p style={{fontSize:12,lineHeight:1.55,color:'#adc0ca'}}>Blockchain, wallets, security, scams, stablecoins, smart contracts, regulation and risk. Education only—no guaranteed returns and no personalized financial advice.</p><button onClick={()=>setCryptoOpen(v=>!v)} style={secondary}>{cryptoOpen?'HIDE LESSONS':'OPEN LESSONS'}</button></article>
  </section>
  {cryptoOpen&&<section style={{...featureCard,marginTop:10}}><div style={railStyle}>{CRYPTO_EDUCATION_SERIES.map(series=><article key={series.id} style={{...tile,minWidth:230}}><b>{series.title}</b><div style={{fontSize:10,color:'#9fb4bf',marginTop:8,lineHeight:1.6}}>{series.lessons.join(' • ')}</div></article>)}</div></section>}

  <section style={{...featureCard,marginTop:18}}><div style={sectionTitle}>PRODUCTION FLOOR</div><h3 style={{fontSize:26,margin:'8px 0'}}>A complete TV studio behind the network.</h3><p style={{fontSize:12,lineHeight:1.55,color:'#a7bbc5'}}>CAM A/B/C • audio mixer • vision switcher • teleprompter • lower thirds • captions • virtual set/green screen • remote guests • clip playback • replay • recorder • lighting • intercom • stream router.</p><div style={{display:'flex',gap:7,flexWrap:'wrap'}}><button onClick={()=>window.location.href='/network/studio'} style={primary}>ENTER STUDIO</button><button onClick={()=>window.location.href='/free-tv'} style={secondary}>TV GUIDE</button><button onClick={()=>window.location.href='/isaiah-ai-tv'} style={secondary}>ISAIAH AI TV</button></div></section>
 </section>
}

const page:React.CSSProperties={marginTop:18}
const hero:React.CSSProperties={position:'relative',overflow:'hidden',minHeight:480,padding:'clamp(22px,5vw,54px)',display:'grid',gridTemplateColumns:'minmax(0,1.2fr) minmax(260px,.8fr)',gap:24,alignItems:'end',borderRadius:28,border:'1px solid #315d70',background:'radial-gradient(circle at 80% 20%,#18455c88,#151029 35%,#060912 72%)',animation:'aanGlow 3s ease-in-out infinite'}
const scan:React.CSSProperties={position:'absolute',left:0,right:0,top:0,height:70,background:'linear-gradient(180deg,transparent,#63eaff12,transparent)',animation:'aanScan 4s linear infinite',pointerEvents:'none'}
const screen:React.CSSProperties={position:'relative',zIndex:2,minHeight:210,padding:20,borderRadius:18,border:'1px solid #5ae7ff77',background:'linear-gradient(145deg,#071924,#120b23)',boxShadow:'0 18px 55px #000c,inset 0 0 55px #3fdcff12'}
const railStyle:React.CSSProperties={display:'flex',gap:10,overflowX:'auto',padding:'9px 1px 5px',scrollSnapType:'x mandatory'}
const tile:React.CSSProperties={scrollSnapAlign:'start',minWidth:190,minHeight:150,padding:16,borderRadius:18,border:'1px solid #263f50',background:'linear-gradient(145deg,#101927,#090b12)',color:'#fff',textAlign:'left',boxShadow:'0 9px 28px #0006',touchAction:'manipulation'}
const newsGrid:React.CSSProperties={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:9,marginTop:10}
const newsCard:React.CSSProperties={padding:13,borderRadius:16,border:'1px solid #263f50',background:'#07121bdd'}
const weatherCryptoGrid:React.CSSProperties={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:10,marginTop:20}
const featureCard:React.CSSProperties={padding:18,borderRadius:19,border:'1px solid #2c5062',background:'linear-gradient(145deg,#081723,#100c19)'}
const sectionTitle:React.CSSProperties={fontSize:10,letterSpacing:2.3,color:'#6deaff',fontWeight:950}
const primary:React.CSSProperties={minHeight:44,padding:'9px 14px',borderRadius:12,border:'1px solid #ff5678',background:'linear-gradient(135deg,#9b183a,#4a123c)',color:'#fff',fontWeight:1000}
const secondary:React.CSSProperties={minHeight:40,padding:'8px 12px',borderRadius:11,border:'1px solid #44788e',background:'#0a1c26',color:'#fff',fontWeight:900}
const chip:React.CSSProperties={minHeight:34,padding:'6px 9px',borderRadius:999,border:'1px solid #284354',background:'#07131c',color:'#fff',fontSize:8,fontWeight:950,whiteSpace:'nowrap'}
const badge:React.CSSProperties={padding:'4px 7px',borderRadius:999,border:'1px solid #436c7d',fontSize:8,fontWeight:950,color:'#9fefff'}
const sourceBtn:React.CSSProperties={minHeight:30,padding:'5px 8px',borderRadius:8,border:'1px solid #3b6171',background:'#0a1b24',color:'#c8f5ff',fontSize:8,fontWeight:950}