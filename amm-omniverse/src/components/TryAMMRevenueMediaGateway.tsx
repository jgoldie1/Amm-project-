/** Revenue-first public discovery: these are routes to existing beta components, not payment claims. */
const destinations=[
 {name:'Aniyah 64-Track Studio',offer:'Rap vocal editing inquiry · proposed $35 starter service',action:'__showAniyah64TrackStudio',type:'SERVICE',icon:'🎚️'},
 {name:'All American Network',offer:'Explore TRYAMM TV and potential creator distribution partnerships',action:'__showTryammTV',type:'MEDIA BETA',icon:'📺'},
 {name:'Isaiah AI TV',offer:'Discover creator auditions, talent and AI-assisted shows',action:'__showIsaiahTV',type:'CREATOR BETA',icon:'🌟'},
 {name:'Omni LIVE & Creator Tools',offer:'Preview live creator features and cross-platform plans',action:'__showTryAMMLive',type:'LIVE BETA',icon:'🎙️'},
] as const
export default function TryAMMRevenueMediaGateway(){
 const navigate=(action:string)=>{const fn=(window as unknown as Record<string,unknown>)[action];if(typeof fn==='function')(fn as()=>void)();else window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'This experience is not available in the current build.'}}))}
 return <section id="tryamm-media-studios" aria-labelledby="tryamm-media-heading" style={{marginTop:28,padding:20,border:'1px solid #346e9a',borderRadius:20,background:'linear-gradient(145deg,#0b1b31,#0e0c1d)',color:'#fff'}}>
  <div style={{fontWeight:900,fontSize:11,letterSpacing:2,color:'#7ed9ff'}}>CREATE · DISTRIBUTE · GROW</div>
  <h2 id="tryamm-media-heading" style={{fontSize:'clamp(23px,4vw,33px)',margin:'8px 0'}}>All American Network & Creator Studios</h2>
  <p style={{fontSize:13,color:'#c1d0e0',lineHeight:1.6}}>Start with a studio service, discover creator experiences, then explore video distribution and LIVE. Beta experiences are not promises of available broadcasting or paid distribution.</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,200px),1fr))',gap:10}}>
   {destinations.map(d=><article key={d.name} style={{padding:16,border:'1px solid #426082',borderRadius:15,background:'#081624'}}>
    <div aria-hidden="true" style={{fontSize:26}}>{d.icon}</div>
    <div style={{color:'#a7d9f9',fontSize:10,fontWeight:800,marginTop:8}}>{d.type}</div>
    <h3 style={{fontSize:17,margin:'7px 0'}}>{d.name}</h3><p style={{fontSize:12,color:'#bdccdc',minHeight:57,lineHeight:1.6}}>{d.offer}</p>
    <button onClick={()=>navigate(d.action)} style={{minHeight:48,width:'100%',background:'#176481',color:'#fff',border:'1px solid #7bdfff',fontWeight:850,borderRadius:12,cursor:'pointer'}}>Explore {d.name}</button>
   </article>)}
  </div>
  <p style={{fontSize:11,color:'#9db0c2',marginTop:12}}>No subscription, service payment, streaming capability or media placement is initiated by these links. Paid services require a confirmed booking and checkout.</p>
 </section>
}
