import { FAMILY_BUSINESS_REGISTRY } from '../data/familyBusinessRegistry'

export default function FamilyBusinessDirectory(){
 return <main style={{position:'fixed',inset:0,zIndex:22000,overflow:'auto',background:'linear-gradient(145deg,#04070b,#0a1720 55%,#151008)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}>
  <section style={{maxWidth:1120,margin:'0 auto',padding:'28px 20px 56px'}}>
   <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}><button onClick={()=>{window.location.href='/'}} style={btn}>← TRYAMM</button><div style={{fontSize:11,letterSpacing:2,color:'#e8b944',fontWeight:900}}>ALL AMERICAN MARKETPLACE BUSINESS NETWORK</div></header>
   <div style={{padding:'60px 0 26px'}}><div style={{fontSize:11,color:'#4fe3ff',fontWeight:900,letterSpacing:2}}>PUBLIC BUSINESS DIRECTORY</div><h1 style={{fontSize:'clamp(38px,7vw,72px)',lineHeight:1,margin:'8px 0 14px'}}>Friends & Family Business Network</h1><p style={{maxWidth:760,color:'#9fb1be',lineHeight:1.7}}>These recovered profiles now have working TRYAMM microsite routes. Custom domains, booking providers, payment providers and inventory connections remain pre-launch until separately verified.</p></div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12}}>{FAMILY_BUSINESS_REGISTRY.map(p=><article key={p.id} style={card}><div style={{fontSize:10,color:'#e8b944',fontWeight:900}}>{p.region.toUpperCase()}</div><h2 style={{margin:'7px 0 6px',fontSize:23}}>{p.owner}</h2><div style={{color:'#c8d5dc',fontSize:13,minHeight:42}}>{p.ventures.join(' • ')}</div><div style={{marginTop:12,fontSize:10,color:'#8ba0ad'}}>{p.status==='live'?'LIVE':'PRE-LAUNCH'}</div><button onClick={()=>{window.location.href=`/business/${p.id}`}} style={{...btn,marginTop:12,width:'100%'}}>OPEN BUSINESS SITE</button></article>)}</div>
  </section>
 </main>
}
const card:React.CSSProperties={padding:16,borderRadius:16,border:'1px solid #263944',background:'#081017cc'}
const btn:React.CSSProperties={padding:'10px 13px',borderRadius:10,border:'1px solid #39505e',background:'#0b1720',color:'#fff',fontWeight:850,cursor:'pointer'}
