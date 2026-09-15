import { useMemo, useState } from 'react'

const formats=['REEL','EPISODE','30 MIN','60 MIN','90 MIN','120 MIN'] as const
const bibleSections=['Story','Characters','Visual','Audio','Continuity','Rights','Ratings & Safety','Accessibility','Commerce & Placement'] as const

export default function MovieStudioCenter({onClose}:{onClose:()=>void}){
  const [format,setFormat]=useState<(typeof formats)[number]>('90 MIN')
  const [section,setSection]=useState<(typeof bibleSections)[number]>('Story')
  const [scene,setScene]=useState(1)
  const [shot,setShot]=useState(1)
  const progress=useMemo(()=>Math.min(100,Math.round(((scene-1)*4+shot)/48*100)),[scene,shot])
  return <div role="dialog" aria-modal="true" aria-label="TRYAMM Movie Studio" style={{position:'fixed',inset:0,zIndex:12000,background:'radial-gradient(circle at 50% 0%,#17273b,#050711 55%)',color:'#fff',overflowY:'auto',fontFamily:'system-ui,sans-serif'}}>
    <header style={{position:'sticky',top:0,zIndex:2,display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,padding:'14px 16px',background:'#050711ee',borderBottom:'1px solid #4fe3ff44',backdropFilter:'blur(14px)'}}>
      <div><div style={{fontSize:10,letterSpacing:3,color:'#4fe3ff',fontWeight:900}}>TRYAMM CREATOR OMNIVERSE</div><div style={{fontSize:22,fontWeight:950}}>Movie Studio</div></div>
      <button onClick={onClose} aria-label="Close Movie Studio" style={{width:42,height:42,borderRadius:'50%',border:'1px solid #40516a',background:'#101827',color:'#fff',fontSize:20}}>×</button>
    </header>
    <main style={{width:'min(1100px,94vw)',margin:'0 auto',padding:'18px 0 90px'}}>
      <section style={{padding:18,border:'1px solid #2b4058',borderRadius:22,background:'linear-gradient(145deg,#0d1624,#090b13)',boxShadow:'0 22px 70px #0008'}}>
        <div style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between',gap:14}}><div><div style={{color:'#e8b944',fontSize:11,fontWeight:900}}>PROJECT</div><h2 style={{margin:'4px 0'}}>Untitled TRYAMM Feature</h2><div style={{color:'#9fb0c5',fontSize:12}}>Production Bible v1 · Clean archival master protected</div></div><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{formats.map(f=><button key={f} onClick={()=>setFormat(f)} style={{border:`1px solid ${format===f?'#4fe3ff':'#344357'}`,background:format===f?'#113247':'#0a101a',color:'#fff',borderRadius:999,padding:'9px 12px',fontWeight:850,fontSize:10}}>{f}</button>)}</div></div>
      </section>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:14,marginTop:14}}>
        <section style={{padding:16,border:'1px solid #26384d',borderRadius:18,background:'#090e17'}}><div style={{color:'#4fe3ff',fontWeight:900,fontSize:11}}>PRODUCTION BIBLE</div><p style={{color:'#93a4b8',fontSize:12,lineHeight:1.5}}>One versioned memory for story, characters, continuity, rights, ratings, accessibility and commerce.</p><div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:7}}>{bibleSections.map(s=><button key={s} onClick={()=>setSection(s)} style={{minHeight:48,textAlign:'left',border:`1px solid ${section===s?'#e8b944':'#253246'}`,background:section===s?'#241d0d':'#0d1420',color:'#fff',borderRadius:11,padding:9,fontSize:10,fontWeight:850}}>{s}</button>)}</div><div style={{marginTop:12,padding:12,borderRadius:12,background:'#101927',fontSize:12}}><strong>{section}</strong><div style={{color:'#91a2b7',marginTop:5}}>Editor workspace ready for persistent project data.</div></div></section>

        <section style={{padding:16,border:'1px solid #26384d',borderRadius:18,background:'#090e17'}}><div style={{color:'#e8b944',fontWeight:900,fontSize:11}}>MOVIE MEMORY · SCENE / SHOT</div><div style={{display:'flex',gap:10,margin:'14px 0'}}><label style={{fontSize:11,color:'#aab7c7'}}>Scene<input aria-label="Scene number" type="number" min={1} value={scene} onChange={e=>setScene(Math.max(1,Number(e.target.value)||1))} style={{display:'block',width:80,marginTop:5,padding:10,borderRadius:9,border:'1px solid #34465c',background:'#080d15',color:'#fff'}}/></label><label style={{fontSize:11,color:'#aab7c7'}}>Shot<input aria-label="Shot number" type="number" min={1} value={shot} onChange={e=>setShot(Math.max(1,Number(e.target.value)||1))} style={{display:'block',width:80,marginTop:5,padding:10,borderRadius:9,border:'1px solid #34465c',background:'#080d15',color:'#fff'}}/></label></div><div style={{fontSize:12,lineHeight:1.7,color:'#aab7c7'}}>Before generation, Movie Memory retrieves character identity, wardrobe, location, props, prior-scene consequences, rights grants and approved placements.</div><div style={{height:8,background:'#161e2a',borderRadius:999,marginTop:14,overflow:'hidden'}}><div style={{height:'100%',width:`${progress}%`,background:'linear-gradient(90deg,#4fe3ff,#e8b944)'}}/></div><div style={{fontSize:10,color:'#74869b',marginTop:6}}>Storyboard progress demo · {progress}%</div></section>

        <section style={{padding:16,border:'1px solid #26384d',borderRadius:18,background:'#090e17'}}><div style={{color:'#ff8fd8',fontWeight:900,fontSize:11}}>HOLOGRAPHIC COMMERCE</div><div style={{display:'grid',gap:8,marginTop:12}}>{['Physical prop','Background placement','Virtual 3D product','StreetVerse interactive object','Holographic overlay','Dynamic placement zone'].map(x=><div key={x} style={{padding:10,borderRadius:10,background:'#101522',border:'1px solid #2b3343',fontSize:11}}>{x}</div>)}</div><p style={{fontSize:11,color:'#8e9db0',lineHeight:1.5}}>Only authorized placements render. Purchases, refunds, settlement, campaign budgets and payable balances remain server-authoritative.</p></section>
      </div>

      <section style={{marginTop:14,padding:16,border:'1px solid #3a3150',borderRadius:18,background:'#100d18'}}><div style={{fontSize:11,fontWeight:900,color:'#caa8ff'}}>DIRECTOR WORKFLOW</div><div style={{marginTop:10,fontSize:12,lineHeight:1.8,color:'#c1b8cf'}}>Idea → Script → Production Bible → Storyboard → Scene → Shot → Movie Memory retrieval → AI generation candidates → continuity / rights check → director approval → locked shot → edit → audio / accessibility → clean master → authorized holographic commerce → distribution.</div></section>
    </main>
  </div>
}
