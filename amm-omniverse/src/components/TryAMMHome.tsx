import { useGameStore } from '../game/state/useGameStore'
import LivingWorldsUniverse from './LivingWorldsUniverse'

const cyan='#4FE3FF'
const gold='#E8B944'
const black='#04050E'

function openGlobal(name:string){
  const fn=(window as any)[name]
  if(typeof fn==='function') fn()
}

function openInstall(){
  const fn=(window as any).__showInstallTRYAMM
  if(typeof fn==='function') fn()
  else window.dispatchEvent(new Event('tryamm:install-open'))
}

function openAAU(){
  localStorage.setItem('tryamm_school_network_target','aau')
  openGlobal('__showSchoolNetwork')
}

const badge=(label:string,tone:'cyan'|'gold'|'green'|'red'='cyan')=>({
  display:'inline-flex',alignItems:'center',borderRadius:999,padding:'4px 8px',fontSize:8,fontWeight:950,letterSpacing:1,
  border:`1px solid ${tone==='gold'?gold:tone==='green'?'#62e89b':tone==='red'?'#ff617a':cyan}88`,
  color:tone==='gold'?'#ffe49b':tone==='green'?'#8fffc1':tone==='red'?'#ff9aad':cyan,
  background:tone==='gold'?'#211907':tone==='green'?'#092319':tone==='red'?'#250b14':'#071d27'
} as const)

export default function TryAMMHome(){
  const store=useGameStore()
  const enter=(screen:'login'|'city'|'sports'|'marketplace'|'music'|'faith'|'blockchain')=>store.setScreen(screen)

  const ecosystem=[
    {icon:'◈',title:'Middleverse',copy:'Context-preserving orchestration connecting Holoverse, Stubbs AI, Workforce, Commerce, LIVE, Safety and Living Worlds.',action:()=>openGlobal('__showMiddleverseWorkstation'),label:'NEW'},
    {icon:'🎧',title:'AI Workforce + WFH',copy:'Approved scripts, rebuttals, DNC checks, interaction logging, QA, supervisor/compliance escalation and AI assistance.',action:()=>openGlobal('__showMiddleverseWorkstation'),label:'NEW'},
    {icon:'🎓',title:'All American University',copy:'AI-assisted classes with real teachers, trade school, career academy, supervised labs, apprenticeships, portfolios and workforce pathways.',action:openAAU,label:'NEW'},
    {icon:'🏫',title:'School Network + Student JARVIS',copy:'Greenville student context, HBCU pathways, College Book/library, AAU, AI Café, Jacobie Vision, internships and portfolio-to-paid-work routing.',action:()=>openGlobal('__showSchoolNetwork'),label:'NEW'},
    {icon:'◈',title:'HoloGPT',copy:'TRYAMM orchestration intelligence for education, worlds, games, creator tools, workforce, business, accessibility, deployment and verified system status.',action:()=>openGlobal('__showHoloGPT'),label:'NEW'},
    {icon:'●',title:'TRYAMM LIVE',copy:'Create, watch, collaborate and sell through LIVE with protected pause and safety tools.',action:()=>openGlobal('__showTryAMMLive'),label:'LIVE'},
    {icon:'🛍️',title:'Commerce OS',copy:'Marketplace, Buy Now, auctions, offers, wholesale, services, digital products and live commerce.',action:()=>enter('marketplace'),label:'BETA'},
    {icon:'✦',title:'Stubbs AI',copy:'AI navigation, tutoring, coaching and creation across TRYAMM experiences, work and connected services.',action:()=>openGlobal('__showBennie'),label:'BETA'},
    {icon:'♿',title:'Omni Access',copy:'Accessibility-first controls with sign language, voice and universal interaction tools.',action:()=>openGlobal('__showOmniAccess'),label:'BETA'},
  ]

  return <main aria-label="TRYAMM home" style={{width:'100%',height:'100%',overflowY:'auto',background:`radial-gradient(circle at 50% -10%,#132941 0,${black} 44%,#010207 100%)`,color:'#fff',fontFamily:'Inter,ui-sans-serif,system-ui,sans-serif'}}>
    <div style={{maxWidth:1240,margin:'0 auto',padding:'18px 18px 120px'}}>
      <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap',padding:'5px 0 24px'}}>
        <div style={{display:'flex',alignItems:'center',gap:11}}>
          <div aria-hidden="true" style={{width:52,height:52,borderRadius:17,border:`1px solid ${gold}99`,display:'grid',placeItems:'center',background:'linear-gradient(145deg,#111729,#070913)',boxShadow:`0 0 30px ${cyan}22`,fontSize:29}}>🦁</div>
          <div><div style={{fontWeight:1000,letterSpacing:2.5,fontSize:20}}>TRYAMM</div><div style={{fontSize:9,color:'#8fa1b8',letterSpacing:2}}>LIVING WORLDS • GAMEVERSE • HOLOVERSE • AI • UNIVERSITY • WORKFORCE</div></div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <span style={badge('CONNECTED ECOSYSTEM','cyan')}>CONNECTED ECOSYSTEM</span>
          <span style={badge('SAFETY ON','green')}>SAFETY ON</span>
          <button onClick={()=>openGlobal('__showHoloGPT')} style={{border:`1px solid ${cyan}88`,background:'#071d27',color:cyan,borderRadius:999,padding:'10px 14px',fontWeight:950,cursor:'pointer'}}>◈ ASK HOLOGPT</button>
          <button onClick={openInstall} style={{border:`1px solid ${gold}88`,background:'#201807',color:'#ffe49b',borderRadius:999,padding:'10px 14px',fontWeight:950,cursor:'pointer'}}>⬇ INSTALL TRYAMM</button>
          <button onClick={()=>enter('login')} style={{border:`1px solid ${cyan}88`,background:'#07131d',color:cyan,borderRadius:999,padding:'10px 14px',fontWeight:950,cursor:'pointer'}}>SIGN IN</button>
        </div>
      </header>

      <section className="tryamm-world-hero" style={{display:'grid',gridTemplateColumns:'minmax(0,1.45fr) minmax(270px,.55fr)',gap:18,alignItems:'stretch'}}>
        <div style={{position:'relative',overflow:'hidden',border:'1px solid #21415a',borderRadius:30,padding:'clamp(28px,5vw,58px)',background:'linear-gradient(145deg,rgba(8,22,38,.97),rgba(5,7,15,.92))',boxShadow:'0 28px 90px #0009'}}>
          <div style={{position:'absolute',width:430,height:430,borderRadius:'50%',right:-170,top:-160,background:`radial-gradient(circle,${cyan}2a,transparent 67%)`}}/>
          <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:18}}><span style={badge('LIVING WORLDS','gold')}>LIVING WORLDS</span><span style={badge('AR • VR • MR','cyan')}>AR • VR • MR</span><span style={badge('AAU + WORKFORCE','cyan')}>AAU + WORKFORCE</span><span style={badge('LIVE','red')}>LIVE</span></div>
          <div style={{fontSize:11,color:gold,fontWeight:950,letterSpacing:4,marginBottom:10}}>ONE PASSPORT. LEARN. BUILD. PLAY. EARN.</div>
          <h1 style={{margin:'0 0 18px',fontSize:'clamp(42px,7.5vw,86px)',lineHeight:.91,letterSpacing:'clamp(-4px,-.3vw,-1px)'}}>Enter the <span style={{color:cyan}}>Living Worlds.</span></h1>
          <p style={{margin:'0 0 25px',maxWidth:790,color:'#bdcada',fontSize:'clamp(15px,2vw,20px)',lineHeight:1.58}}>TRYAMM connects games, open worlds, AR/VR/MR, music, creators, LIVE, commerce, All American University, AI training and workforce opportunities in one ecosystem.</p>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            <button onClick={()=>enter('city')} style={{border:0,borderRadius:14,padding:'15px 21px',background:`linear-gradient(135deg,${cyan},#66a6ff)`,color:'#031018',fontWeight:1000,cursor:'pointer',boxShadow:`0 0 30px ${cyan}33`}}>🎮 ENTER GAMEVERSE</button>
            <button onClick={openAAU} style={{border:`1px solid ${gold}88`,borderRadius:14,padding:'15px 21px',background:'#211907',color:'#ffe49b',fontWeight:1000,cursor:'pointer'}}>🎓 ALL AMERICAN UNIVERSITY</button>
            <button onClick={()=>openGlobal('__showImmersiveWorlds')} style={{border:`1px solid ${cyan}66`,borderRadius:14,padding:'15px 21px',background:'#07131d',color:cyan,fontWeight:1000,cursor:'pointer'}}>🥽 AR • VR • MIXED REALITY</button>
            <button onClick={()=>enter('music')} style={{border:'1px solid #9b77ff88',borderRadius:14,padding:'15px 21px',background:'#171029',color:'#cdbaff',fontWeight:1000,cursor:'pointer'}}>🎵 MUSIC & CULTURE</button>
          </div>
        </div>

        <aside style={{border:`1px solid ${gold}55`,borderRadius:30,padding:24,background:'linear-gradient(180deg,#17120a,#080a12)',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
          <div><div style={{fontSize:52}}>🦁</div><div style={{fontSize:10,color:gold,fontWeight:950,letterSpacing:3,marginTop:10}}>TRYAMM LIVING WORLDS PASSPORT</div><h2 style={{fontSize:28,margin:'8px 0 10px'}}>Your identity travels with you.</h2><p style={{fontSize:13,color:'#a9b4c3',lineHeight:1.6}}>Shared identity, learning progress, workforce evidence, safety settings, creator relationships, commerce and cross-world progression.</p></div>
          <div style={{display:'grid',gap:9,borderTop:'1px solid #31291e',paddingTop:16,marginTop:18,fontSize:12,color:'#d5dbe4'}}><div>🎮 Game Worlds</div><div>🎓 All American University</div><div>🧑‍🏫 Real Teachers + Stubbs AI</div><div>💼 Workforce + Paid Work</div><div>📱 AR Portals</div><div>🥽 VR/MR Worlds</div><div>🎵 Music & Culture</div><div>🌐 Holoverse + Middleverse</div></div>
        </aside>
      </section>

      <LivingWorldsUniverse onSports={()=>enter('sports')} onCity={()=>enter('city')} onMusic={()=>enter('music')} />

      <section aria-labelledby="tryamm-platform" style={{marginTop:40}}>
        <div style={{color:cyan,fontSize:10,fontWeight:950,letterSpacing:3}}>CONNECTED PLATFORM</div>
        <h2 id="tryamm-platform" style={{fontSize:30,margin:'6px 0 15px'}}>Everything around the worlds</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:11}}>
          {ecosystem.map(item=><button key={item.title} onClick={item.action} style={{textAlign:'left',minHeight:175,padding:18,border:'1px solid #1a2b3e',borderRadius:19,background:'linear-gradient(155deg,#0b111d,#070910)',color:'#fff',cursor:'pointer'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:26}}>{item.icon}</span><span style={badge(item.label,item.label==='LIVE'?'red':item.label==='NEW'?'cyan':'gold')}>{item.label}</span></div>
            <div style={{fontSize:18,fontWeight:950,marginTop:16}}>{item.title}</div><div style={{fontSize:11,color:'#9aaabd',lineHeight:1.5,marginTop:7}}>{item.copy}</div><div style={{color:cyan,fontSize:9,fontWeight:950,marginTop:13}}>OPEN →</div>
          </button>)}
        </div>
      </section>

      <section style={{marginTop:30,border:'1px solid #193143',borderRadius:22,padding:20,background:'#07101a'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:16}}>
          {[['ONE PASSPORT','Games, education, labs, worlds, LIVE, commerce, creators and workforce are designed around one connected identity.'],['LEARN → WORK','AAU + Student JARVIS + real teachers + Stubbs AI connect learning evidence to supervised internships, apprenticeships and approved paid work.'],['DEVICE FLEXIBLE','Start on web/phone, then extend into installed PWA, TV, controllers, AR, VR and MR experiences.'],['MIDDLEVERSE ROUTING','Tasks and context can move between Holoverse, HoloGPT, Stubbs AI, Workforce, Commerce, LIVE, Safety and Living Worlds.'],['TRUST + SAFETY','Report, block, mute, appeals, academic integrity, licensing gates and protected LIVE controls remain part of the shared platform.']].map(([title,copy])=><div key={title}><div style={{color:gold,fontSize:10,fontWeight:950,letterSpacing:1}}>{title}</div><div style={{color:'#9eacbd',fontSize:12,lineHeight:1.55,marginTop:6}}>{copy}</div></div>)}
        </div>
      </section>

      <footer style={{marginTop:32,textAlign:'center',fontSize:10,color:'#68778b',lineHeight:1.7}}>TRYAMM LIVING WORLDS • ALL AMERICAN UNIVERSITY • HOLOGPT • WORKFORCE • Prototype/beta labels indicate readiness and do not claim accreditation, licensure, employment or complete multiplayer production where not separately verified.</footer>
    </div>
    <style>{`@media(max-width:780px){.tryamm-world-hero{grid-template-columns:1fr!important}}`}</style>
  </main>
}
