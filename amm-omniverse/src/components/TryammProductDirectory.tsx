import {TRYAMM_APP_FEATURES,TRYAMM_GAME_FEATURES,TRYAMM_PRODUCT_BOUNDARY,TRYAMM_SHARED_SERVICES,type TryammFeatureGroup} from '../data/TryammProductBoundary'

const section=(title:string,subtitle:string,groups:readonly TryammFeatureGroup[])=><section style={{marginTop:18}}>
  <div style={{fontSize:11,fontWeight:950,letterSpacing:2,color:'#73e8ff'}}>{title}</div>
  <div style={{fontSize:12,color:'#9db2c2',marginTop:4,lineHeight:1.45}}>{subtitle}</div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10,marginTop:10}}>
    {groups.map(group=><article key={group.id} style={{border:'1px solid #294354',borderRadius:16,background:'#07111ae8',padding:12}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}><b style={{fontSize:13}}>{group.label}</b><span style={{fontSize:8,fontWeight:950,color:group.side==='game'?'#ffd66b':group.side==='shared'?'#c6a6ff':'#7fffc3'}}>{group.side.toUpperCase()}</span></div>
      <p style={{fontSize:10,lineHeight:1.45,color:'#a8bac7',margin:'7px 0 9px'}}>{group.summary}</p>
      <div style={{display:'grid',gap:5}}>{group.features.map(feature=><div key={feature} style={{fontSize:10,color:'#eef7fb'}}>• {feature}</div>)}</div>
      {group.route&&<a href={group.route} style={{display:'inline-block',marginTop:10,border:'1px solid #385b70',borderRadius:999,padding:'7px 10px',color:'#fff',fontSize:9,fontWeight:900,textDecoration:'none'}}>OPEN {group.label.toUpperCase()}</a>}
    </article>)}
  </div>
</section>

export default function TryammProductDirectory(){
  return <main aria-label="TRYAMM app and game feature directory" style={{minHeight:'100dvh',background:'linear-gradient(180deg,#02060b,#06111b)',color:'#fff',fontFamily:'system-ui,sans-serif',padding:'max(18px,env(safe-area-inset-top)) 14px max(30px,env(safe-area-inset-bottom))'}}>
    <div style={{maxWidth:1100,margin:'0 auto'}}>
      <header style={{display:'flex',gap:10,justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap'}}>
        <div><div style={{fontSize:10,fontWeight:950,letterSpacing:3,color:'#59e7ff'}}>TRYAMM PRODUCT MAP</div><h1 style={{fontSize:'clamp(24px,7vw,44px)',margin:'5px 0'}}>App and Game are separate products</h1><p style={{maxWidth:760,fontSize:12,lineHeight:1.55,color:'#a9bdca'}}>The TRYAMM app handles your network, creators, business, work, communications and real services. StreetVerse is the playable game. Shared server services connect them without mixing real-money authority into the game simulation.</p></div>
        <div style={{display:'flex',gap:7}}><a href="/" style={{border:'1px solid #4c6678',borderRadius:12,padding:'10px 12px',color:'#fff',fontSize:10,fontWeight:950,textDecoration:'none'}}>APP HOME</a><a href="/streetverse" style={{border:'1px solid #ffd66b88',borderRadius:12,padding:'10px 12px',color:'#ffe59b',fontSize:10,fontWeight:950,textDecoration:'none'}}>PLAY STREETVERSE</a></div>
      </header>
      <div style={{marginTop:15,padding:12,border:'1px solid #294354',borderRadius:16,background:'#061019'}}>
        <b style={{fontSize:11}}>BOUNDARY RULES</b>
        <div style={{display:'grid',gap:5,marginTop:7}}>{TRYAMM_PRODUCT_BOUNDARY.rules.map(rule=><div key={rule} style={{fontSize:10,color:'#c6d5df'}}>✓ {rule}</div>)}</div>
      </div>
      {section('TRYAMM APP','Everything people use as a platform, business, creator, work, communication or service product.',TRYAMM_APP_FEATURES)}
      {section('STREETVERSE GAME','Everything that belongs to the playable world, simulation, missions, characters and game progression.',TRYAMM_GAME_FEATURES)}
      {section('SHARED BRIDGE SERVICES','Infrastructure both products can call through controlled interfaces.',TRYAMM_SHARED_SERVICES)}
    </div>
  </main>
}
