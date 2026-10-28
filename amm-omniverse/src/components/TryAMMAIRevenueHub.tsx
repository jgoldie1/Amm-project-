/** Revenue discovery, not a claim of live sales, AI search coverage or redeemable credits. */
const offers=[
 {name:"Stubbs AI",kind:"AI BUSINESS",desc:"AI assistant, website customer support and business workflow inquiries.",target:"start-with-tryamm",state:"Service inquiry"},
 {name:"Lyon Tech AI",kind:"TECHNOLOGY",desc:"Ask about the Lyon Tech AI partnership or technology concept; features subject to verification.",target:"start-with-tryamm",state:"Concept inquiry"},
 {name:"MiddleVerse AI",kind:"AUTOMATION",desc:"Remote-work assistance, lead qualification and business workflow tools.",url:"/middleverse",state:"Beta entry"},
 {name:"HoloGPT Search",kind:"AI DISCOVERY",desc:"Explore the existing HoloGPT assistant. Historical-web indexing and independently verified search coverage are not established.",open:"__showHoloGPT",state:"Beta assistant"},
 {name:"Holo Credits",kind:"DIGITAL CREDITS",desc:"Learn about proposed usage credits. No purchase, transfer or redemption is activated here.",target:"start-with-tryamm",state:"Not for sale"},
 {name:"WFH / Remote Work",kind:"WORKFORCE",desc:"Learn about AI-assisted work workflows; not a job guarantee or open-position listing.",url:"/middleverse",state:"Beta entry"},
 {name:"Reels & Short Drama",kind:"CREATOR MEDIA",desc:"Creative services, scripted shorts, creator promos and future show production.",target:"tryamm-media-studios",state:"Production inquiry"},
 {name:"TRYAMM AI Café",kind:"EDUCATION + EVENTS",desc:"Plan workshops, creator training, desk sessions and community demos. Food service requires location, permits and operating budgets.",target:"start-with-tryamm",state:"Pilot inquiry"},
 {name:"12D Printer / Nano Factory",kind:"R&D + FABRICATION",desc:"Proposed advanced fabrication lab. Validate hardware, materials, safety and costs before accepting fabrication orders.",target:"start-with-tryamm",state:"R&D concept"},
 {name:"All American Network",kind:"MEDIA",desc:"Explore planned distribution and creator programming partnerships.",target:"tryamm-media-studios",state:"Beta showcase"},
] as const
export default function TryAMMAIRevenueHub(){
 const go=(offer:typeof offers[number])=>{
  if('url'in offer&&offer.url){window.location.assign(offer.url);return}
  if('open'in offer&&offer.open){const handler=(window as unknown as Record<string,unknown>)[offer.open];if(typeof handler==='function'){(handler as()=>void)();return}}
  if('target'in offer&&offer.target)document.getElementById(offer.target)?.scrollIntoView({behavior:'smooth',block:'start'})
 }
 return <section id="tryamm-ai-revenue" aria-labelledby="tryamm-ai-revenue-title" style={{marginTop:26,padding:20,borderRadius:22,background:"linear-gradient(145deg,#102239,#080c17)",border:"1px solid #65a9df",color:"#fff"}}>
  <div style={{fontSize:11,color:"#8edfff",fontWeight:900,letterSpacing:2}}>AI · WORK · MEDIA · DIGITAL SERVICES</div>
  <h2 id="tryamm-ai-revenue-title" style={{fontSize:"clamp(24px,4vw,36px)",margin:"8px 0"}}>Discover the TRYAMM AI & Creator Economy</h2>
  <p style={{maxWidth:760,fontSize:13,color:"#c5d5e3",lineHeight:1.6}}>From business AI and remote-work tools to media production and HoloGPT, find a clear entry point or request information. Availability varies by service.</p>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,220px),1fr))",gap:10}}>
  {offers.map(offer=><article key={offer.name} style={{padding:15,borderRadius:15,background:"#0d1b2b",border:"1px solid #46657d"}}>
   <div style={{fontSize:10,fontWeight:900,color:"#93dfff"}}>{offer.kind} · {offer.state}</div><h3 style={{fontSize:18,margin:"9px 0"}}>{offer.name}</h3><p style={{fontSize:12,lineHeight:1.6,color:"#c1d1de",minHeight:65}}>{offer.desc}</p>
   <button type="button" onClick={()=>go(offer)} style={{minHeight:48,width:"100%",borderRadius:11,border:"1px solid #83dfff",background:"#174561",fontWeight:800,color:"#fff"}}>{offer.state==="Not for sale"?"Ask about roadmap":"Explore / Inquire"}</button>
  </article>)}
  </div><p style={{fontSize:11,color:"#adbfd1",marginTop:12}}>No active Holo Credits sale or guaranteed employment. Fees, plans, streaming rights and AI search claims must be verified before commercialization. No paid checkout starts here.</p>
 </section>
}