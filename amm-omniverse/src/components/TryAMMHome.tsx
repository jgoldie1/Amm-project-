import { useGameStore } from '../game/state/useGameStore'

const cyan='#4FE3FF'
const gold='#E8B944'
const black='#04050E'

const statusStyle=(kind:'LIVE'|'BETA'|'COMING SOON'|'VERIFIED')=>({
  display:'inline-flex',alignItems:'center',borderRadius:999,padding:'3px 7px',fontSize:8,fontWeight:900,letterSpacing:1,
  border:`1px solid ${kind==='LIVE'?'#ff5b72':kind==='VERIFIED'?'#62e89b':kind==='BETA'?gold:'#596174'}`,
  color:kind==='LIVE'?'#ff8da0':kind==='VERIFIED'?'#8fffc1':kind==='BETA'?'#ffe08a':'#9ca5b5',
  background:kind==='LIVE'?'#2a0b13':kind==='VERIFIED'?'#092319':kind==='BETA'?'#2a210b':'#111522'
} as const)

function openGlobal(name:string){
  const fn=(window as any)[name]
  if(typeof fn==='function') fn()
}

export default function TryAMMHome(){
  const store=useGameStore()
  const enter=(screen:'login'|'city'|'sports'|'marketplace'|'music'|'faith'|'blockchain')=>store.setScreen(screen)
  const cards=[
    {icon:'🛍️',title:'Commerce OS',copy:'Buy now, auction, make offers, LIVE shopping, wholesale, services, digital goods and preorders.',status:'BETA' as const,action:()=>enter('marketplace')},
    {icon:'●',title:'TRYAMM LIVE',copy:'Create, watch, sell, collaborate and go LIVE with protected phone-call and break pause.',status:'LIVE' as const,action:()=>openGlobal('__showTryAMMLive')},
    {icon:'🎮',title:'Living Worlds',copy:'Enter the evolving city, sports and GameVerse experiences from one persistent identity.',status:'BETA' as const,action:()=>enter('city')},
    {icon:'✦',title:'Stubbs AI',copy:'Ask, create, compare, plan and navigate TRYAMM through one intelligence layer.',status:'BETA' as const,action:()=>openGlobal('__showBennie')},
    {icon:'🎵',title:'Music + Creator',copy:'Create, publish, perform, sell and grow your audience across music, LIVE and commerce.',status:'BETA' as const,action:()=>enter('music')},
    {icon:'♿',title:'Omni Access',copy:'Accessibility-first controls including sign language, voice and universal remote experiences.',status:'BETA' as const,action:()=>openGlobal('__showOmniAccess')},
    {icon:'🚗',title:'Holo Ride + Delivery',copy:'Mobility and delivery network with safety, identity and future local-commerce fulfillment.',status:'BETA' as const,action:()=>openGlobal('__showHoloServices')},
    {icon:'▣',title:'Isaiah AI TV',copy:'OTT, creator programming and interactive watch-and-shop entertainment.',status:'BETA' as const,action:()=>openGlobal('__showIsaiahTV')},
  ]

  return <main aria-label="TRYAMM home" style={{width:'100%',height:'100%',overflowY:'auto',background:`radial-gradient(circle at 50% -10%,#12263c 0,${black} 48%,#010207 100%)`,color:'#fff',fontFamily:'Inter,ui-sans-serif,system-ui,sans-serif'}}>
    <div style={{maxWidth:1180,margin:'0 auto',padding:'22px 18px 110px'}}>
      <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:34}}>
        <div style={{display:'flex',alignItems:'center',gap:11}}>
          <div aria-hidden="true" style={{width:46,height:46,borderRadius:16,border:`1px solid ${gold}99`,display:'grid',placeItems:'center',background:'linear-gradient(145deg,#111729,#070913)',boxShadow:`0 0 28px ${cyan}22`,fontSize:26}}>🦁</div>
          <div><div style={{fontWeight:950,letterSpacing:2,fontSize:18}}>TRYAMM</div><div style={{fontSize:9,color:'#8fa1b8',letterSpacing:2}}>LIVING WORLDS • COMMERCE • LIVE • AI</div></div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <span style={statusStyle('VERIFIED')}>SAFETY ON</span>
          <button onClick={()=>enter('login')} style={{border:`1px solid ${cyan}88`,background:'#07131d',color:cyan,borderRadius:999,padding:'9px 13px',fontWeight:900,cursor:'pointer'}}>SIGN IN</button>
        </div>
      </header>

      <section style={{display:'grid',gridTemplateColumns:'minmax(0,1.25fr) minmax(260px,.75fr)',gap:22,alignItems:'stretch',marginBottom:24}} className="tryamm-home-hero">
        <div style={{border:'1px solid #20364d',borderRadius:28,padding:'clamp(24px,5vw,54px)',background:'linear-gradient(145deg,rgba(9,20,34,.95),rgba(5,7,15,.9))',boxShadow:'0 24px 80px #0008',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',width:280,height:280,borderRadius:'50%',right:-80,top:-100,background:`radial-gradient(circle,${cyan}22,transparent 66%)`}}/>
          <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:18}}><span style={statusStyle('LIVE')}>LIVE</span><span style={statusStyle('BETA')}>COMMERCE OS</span><span style={statusStyle('BETA')}>LIVING WORLDS</span></div>
          <div style={{color:gold,fontSize:12,fontWeight:900,letterSpacing:3,marginBottom:10}}>THE ALL-IN-ONE DIGITAL WORLD</div>
          <h1 style={{fontSize:'clamp(38px,7vw,76px)',lineHeight:.96,letterSpacing:-3,margin:'0 0 18px',maxWidth:760}}>Watch. Play. Shop. Build. Earn. <span style={{color:cyan}}>Live.</span></h1>
          <p style={{color:'#b8c6d8',fontSize:'clamp(15px,2vw,19px)',lineHeight:1.55,maxWidth:720,margin:'0 0 24px'}}>TRYAMM connects LIVE creators, open worlds, AI, commerce, music, business, accessibility and local services through one Living Worlds Passport.</p>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            <button onClick={()=>enter('login')} style={{border:0,borderRadius:14,padding:'14px 20px',background:`linear-gradient(135deg,${cyan},#66a6ff)`,color:'#04111a',fontWeight:950,cursor:'pointer',boxShadow:`0 0 28px ${cyan}33`}}>ENTER TRYAMM</button>
            <button onClick={()=>openGlobal('__showTryAMMLive')} style={{border:'1px solid #ff617a88',borderRadius:14,padding:'14px 20px',background:'#250b14',color:'#ff9aad',fontWeight:950,cursor:'pointer'}}>● WATCH LIVE</button>
            <button onClick={()=>openGlobal('__showBennie')} style={{border:`1px solid ${gold}88`,borderRadius:14,padding:'14px 20px',background:'#201807',color:'#ffe49b',fontWeight:950,cursor:'pointer'}}>✦ TALK TO STUBBS AI</button>
          </div>
        </div>

        <aside style={{border:`1px solid ${gold}55`,borderRadius:28,padding:24,background:'linear-gradient(180deg,#16120b,#080a12)',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:46,marginBottom:12}}>🦁</div>
            <div style={{fontSize:11,color:gold,fontWeight:900,letterSpacing:3}}>JUDAH • TRYAMM</div>
            <h2 style={{fontSize:27,margin:'8px 0 10px'}}>One identity. One world.</h2>
            <p style={{fontSize:13,color:'#a7b0bf',lineHeight:1.55}}>Your Passport connects creator identity, purchases, worlds, LIVE participation, safety settings and future services without rebuilding your account for every experience.</p>
          </div>
          <div style={{borderTop:'1px solid #2e2a20',paddingTop:16,marginTop:18,display:'grid',gap:9,fontSize:12,color:'#d5dae3'}}>
            <div>🛡 Report • Block • Mute</div><div>⏸ Protected LIVE pause</div><div>🛒 Unified Commerce OS</div><div>♿ Accessibility-first</div>
          </div>
        </aside>
      </section>

      <section aria-labelledby="explore-tryamm">
        <div style={{display:'flex',alignItems:'end',justifyContent:'space-between',gap:12,margin:'34px 0 14px'}}><div><div style={{color:cyan,fontSize:10,fontWeight:900,letterSpacing:3}}>EXPLORE</div><h2 id="explore-tryamm" style={{margin:'5px 0 0',fontSize:28}}>One ecosystem, many ways in</h2></div><button onClick={()=>enter('marketplace')} style={{background:'transparent',border:0,color:'#9acfff',fontWeight:800,cursor:'pointer'}}>Explore Marketplace →</button></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:12}}>
          {cards.map(card=><button key={card.title} onClick={card.action} style={{textAlign:'left',minHeight:190,padding:19,border:'1px solid #182638',borderRadius:20,background:'linear-gradient(155deg,#0b111d,#070910)',color:'#fff',cursor:'pointer',display:'flex',flexDirection:'column'}}>
            <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}><span style={{fontSize:27}}>{card.icon}</span><span style={statusStyle(card.status)}>{card.status}</span></div>
            <div style={{fontSize:18,fontWeight:950,marginTop:18}}>{card.title}</div>
            <div style={{fontSize:12,color:'#98a8ba',lineHeight:1.5,marginTop:7}}>{card.copy}</div>
            <div style={{marginTop:'auto',paddingTop:14,color:cyan,fontSize:11,fontWeight:900}}>OPEN →</div>
          </button>)}
        </div>
      </section>

      <section style={{marginTop:30,border:'1px solid #193143',borderRadius:22,padding:20,background:'#07101a'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14}}>
          {[['SELL EVERYWHERE','One listing → Marketplace, LIVE, creator storefronts and future world stores.'],['SHOP YOUR WAY','Buy Now • Auction • Offer • Wholesale • Service • Digital • Preorder.'],['CREATE + EARN','Creators connect content, LIVE, audiences and commerce without leaving TRYAMM.'],['TRUST BUILT IN','Evidence-backed reporting, appeals, buyer protection and persistent block/mute controls.']].map(([title,copy])=><div key={title}><div style={{fontSize:11,color:gold,fontWeight:950,letterSpacing:1}}>{title}</div><div style={{fontSize:12,color:'#9eacbd',lineHeight:1.5,marginTop:6}}>{copy}</div></div>)}
        </div>
      </section>

      <footer style={{marginTop:30,textAlign:'center',color:'#657185',fontSize:10,lineHeight:1.7}}>TRYAMM features are labeled by readiness. BETA and COMING SOON experiences may change and can require provider configuration, eligibility or regional availability.</footer>
    </div>
    <style>{`@media(max-width:760px){.tryamm-home-hero{grid-template-columns:1fr!important}.tryamm-home-hero h1{letter-spacing:-1.5px!important}}`}</style>
  </main>
}
