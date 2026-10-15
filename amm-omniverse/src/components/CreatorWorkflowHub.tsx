import {lazy,Suspense,useState} from 'react'

const MediaStudioLauncher=lazy(()=>import('./MediaStudioLauncher'))
const HoloDramaLauncher=lazy(()=>import('./HoloDramaLauncher'))

export type CreatorEntryMode='home'|'reel'|'omnibox'|'drama'
type Route={id:CreatorEntryMode;label:string;icon:string;href:string;description:string}

const routes:Route[]=[
  {id:'home',label:'Create',icon:'✦',href:'/create',description:'Your creator workspace'},
  {id:'reel',label:'Reels',icon:'🎬',href:'/reel-creator',description:'Record • Edit • Save'},
  {id:'omnibox',label:'Omni Box',icon:'📦',href:'/omni-box',description:'Store • Publish • Share'},
  {id:'drama',label:'Holo Drama',icon:'🎭',href:'/holo-drama/create',description:'Write • Scenes • Episodes'},
]

const panel:React.CSSProperties={background:'#0c1727',border:'1px solid #29415b',borderRadius:20,padding:18}
const button:React.CSSProperties={display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,minHeight:54,padding:'12px 16px',borderRadius:14,border:'1px solid #47728e',background:'#122538',color:'#f0f8ff',font:'800 15px system-ui',cursor:'pointer',textDecoration:'none',boxSizing:'border-box'}
const notes:Record<CreatorEntryMode,{title:string;description:string;steps:string[];limitations:string}> = {
 home:{title:'Make something people can watch',description:'One place to create, edit, save, and publish across TRYAMM.',steps:['Pick a format','Add your video or story','Edit and preview','Save or publish'],limitations:'Publishing requires a signed-in creator account. Save your own file before publishing.'},
 reel:{title:'Make a Reel',description:'Record StreetVerse gameplay or import a clip from your phone.',steps:['Record on phone or upload','Add caption, sticker, or background','Render if supported','Save to phone or publish'],limitations:'iPhone Safari generally cannot capture the screen from a webpage. Use iPhone Control Center Screen Recording, then import your clip. Video render/export depends on browser support; original upload and save remain available.'},
 omnibox:{title:'Omni Box',description:'Your destination for releasing a finished Reel, clip, or movie file.',steps:['Import existing media','Check title and caption','Choose Omni Box destination','Sign in and upload/publish'],limitations:'Omni Box cloud publishing requires sign-in, an upload, and a successful server response. Choosing a destination alone does not publish.'},
 drama:{title:'Create Holo Drama',description:'Create a story with ordered scenes and hand each scene to Reel Creator.',steps:['Name the project','Add and write scenes','Save the story draft','Send a scene to Reel Creator'],limitations:'The story editor saves its project on this device; it does not automatically generate a finished feature film. Holo Drama episode publishing is a separate authenticated flow.'}
}

export default function CreatorWorkflowHub({initialMode='home'}:{initialMode?:CreatorEntryMode}){
  const [mode,setMode]=useState<CreatorEntryMode>(initialMode)
  const [studioAction,setStudioAction]=useState<{mode:'reel'|'omnibox';seq:number}|null>(()=>initialMode==='reel'||initialMode==='omnibox'?{mode:initialMode,seq:1}:null)
  const [dramaAction,setDramaAction]=useState(()=>initialMode==='drama')
  const current=notes[mode]
  const launch=(choice:CreatorEntryMode)=>{
    setMode(choice)
    const url=routes.find(x=>x.id===choice)?.href||'/create'
    history.replaceState(history.state,'',url)
    if(choice==='reel'||choice==='omnibox')setStudioAction(v=>({mode:choice,seq:(v?.seq||0)+1}))
    if(choice==='drama')setDramaAction(true)
  }
  const openStudio=(target:'reel'|'omnibox')=>{
    window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{
      source:'creator-workflow-hub',target,
      destinations:target==='omnibox'?['omnibox']:['reel','omnibox','creator-profile'],
    }}))
  }
  const openDrama=()=>window.dispatchEvent(new Event('tryamm:holo-drama-open'))
  return <main aria-label="TRYAMM Creator Center" style={{minHeight:'100dvh',background:'radial-gradient(ellipse at 50% 0,#183855 0,#07121e 48%,#03070c 100%)',color:'#f3f8ff',fontFamily:'system-ui,sans-serif',padding:'env(safe-area-inset-top) 0 calc(104px + env(safe-area-inset-bottom))'}}>
    <div style={{maxWidth:1060,margin:'0 auto',padding:'18px max(14px,env(safe-area-inset-left))'}}>
      <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:24}}>
        <a href="/" style={{...button,minWidth:76,minHeight:48,padding:'8px 12px'}}>⌂ Home</a>
        <span style={{color:'#8ddfff',fontSize:12,fontWeight:950,letterSpacing:2}}>TRYAMM / STUBBS AI</span>
        <a href="/streetverse" style={{...button,minWidth:76,minHeight:48,padding:'8px 12px'}}>🎮 Play</a>
      </header>
      <div style={{display:'flex',flexWrap:'wrap',gap:8,alignItems:'center',marginBottom:9}}>
        <span style={{border:'1px solid #44c9ec',background:'#113047',borderRadius:999,padding:'6px 10px',fontSize:11,fontWeight:900}}>CREATOR CENTER</span>
        <span style={{fontSize:11,color:'#b6cadd'}}>Phone-first • One hand • Save before posting</span>
      </div>
      <h1 style={{fontWeight:950,fontSize:'clamp(30px,7.4vw,52px)',lineHeight:1.12,margin:'10px 0'}}>Create. Save. Share.</h1>
      <p style={{maxWidth:680,color:'#acc2d7',fontSize:15,lineHeight:1.6,margin:'12px 0 22px'}}>Reels, Omni Box and Holo Drama now have one starting point. Select a destination and follow the four steps.</p>
      <nav aria-label="Creator tools" style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10,marginBottom:22}}>
        {routes.filter(x=>x.id!=='home').map(r=><button key={r.id} onClick={()=>launch(r.id)} aria-pressed={mode===r.id} style={{...panel,textAlign:'left',minHeight:116,padding:14,borderColor:mode===r.id?'#64eecc':'#29415b',background:mode===r.id?'linear-gradient(135deg,#133953,#0a2830)':'#0c1727',color:'inherit',cursor:'pointer'}}>
          <span style={{fontSize:27}}>{r.icon}</span><strong style={{display:'block',fontSize:17,marginTop:5}}>{r.label}</strong><small style={{display:'block',color:'#9fc3d3',marginTop:3}}>{r.description}</small>
        </button>)}
        <a href="/holo-drama" style={{...panel,display:'block',textDecoration:'none',color:'inherit',minHeight:116,padding:14,boxSizing:'border-box'}}><span style={{fontSize:27}}>▶</span><strong style={{display:'block',fontSize:17,marginTop:5}}>Watch Drama</strong><small style={{display:'block',color:'#9fc3d3',marginTop:3}}>Feed • Episodes • Publish</small></a>
      </nav>
      <section style={panel} aria-live="polite">
        <div style={{color:'#8ceef5',fontSize:11,fontWeight:900,letterSpacing:1}}>YOUR WORKFLOW</div>
        <h2 style={{margin:'8px 0',fontSize:24}}>{current.title}</h2>
        <p style={{color:'#b7cee1',lineHeight:1.5,margin:'0 0 14px'}}>{current.description}</p>
        <ol style={{paddingLeft:24,margin:'0 0 18px',display:'grid',gap:12,lineHeight:1.5}}>{current.steps.map((step,i)=><li key={step}><span style={{fontWeight:700}}>{step}</span></li>)}</ol>
        <div style={{display:'grid',gap:10}}>
          {mode==='home'?<>
            <button style={{...button,background:'linear-gradient(110deg,#60e5ff,#95ffd4)',color:'#042027'}} onClick={()=>launch('reel')}>🎬 MAKE MY FIRST REEL</button>
            <button style={button} onClick={()=>launch('drama')}>🎭 START A HOLO DRAMA</button>
          </>:mode==='reel'||mode==='omnibox'?<button style={{...button,background:'linear-gradient(110deg,#60e5ff,#95ffd4)',color:'#042027'}} onClick={()=>openStudio(mode)}>{mode==='reel'?'🎬 OPEN REEL EDITOR':'📦 OPEN OMNI BOX PUBLISHER'}</button>:<>
            <button style={{...button,background:'linear-gradient(110deg,#60e5ff,#95ffd4)',color:'#042027'}} onClick={openDrama}>🎭 OPEN STORY EDITOR</button>
            <a style={button} href="/holo-drama">▶ WATCH / PUBLISH EPISODES</a>
          </>}
          <p style={{fontSize:12,color:'#a8c7d4',lineHeight:1.55,margin:'3px 0'}}>{current.limitations}</p>
        </div>
      </section>
      <p style={{fontSize:12,color:'#849bb1',lineHeight:1.5,marginTop:16}}>No paid AI generation starts when you open this page. Publishing and paid services require their own confirmations.</p>
    </div>
    <nav aria-label="Creator bottom navigation" style={{position:'fixed',bottom:0,left:0,right:0,zIndex:1200,display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:3,padding:'8px 8px calc(8px + env(safe-area-inset-bottom))',background:'#091828ef',borderTop:'1px solid #365773'}}>
      {routes.map(r=><button key={r.id} aria-label={'Open '+r.label} aria-current={mode===r.id?'page':undefined} onClick={()=>launch(r.id)} style={{background:mode===r.id?'#14495a':'transparent',color:mode===r.id?'#b1fff4':'#b2cce3',border:0,borderRadius:10,minHeight:52,fontWeight:800,fontSize:11}}><span style={{display:'block',fontSize:20,marginBottom:3}}>{r.icon}</span>{r.label}</button>)}
    </nav>
    <Suspense fallback={null}>
      <MediaStudioLauncher launchRequest={studioAction}/>
      <HoloDramaLauncher initiallyOpen={dramaAction}/>
    </Suspense>
  </main>
}
