type Experience={id:string;title:string;era:string;mode:string;evidenceLevel:string;description:string;objective:string}

const EXPERIENCES:Experience[]=[
  {id:'walk-with-messiah',title:'Walk the Earth in the Time of the Messiah',era:'First-century Judea and Galilee',mode:'RECONSTRUCTION',evidenceLevel:'mixed',description:'Explore source-grounded places, travel routes, teaching settings and daily life associated with the earthly ministry of the Messiah.',objective:'Enter the reconstruction, inspect source labels, visit a teaching setting and save a return checkpoint.'},
  {id:'galilee-fishing',title:'Go Fishing on the Sea of Galilee',era:'First-century Galilee',mode:'RECONSTRUCTION_ADVENTURE',evidenceLevel:'mixed',description:'Experience reconstructed boats, shoreline, fishing methods, geography and discipleship-era context.',objective:'Prepare the boat, complete a fishing activity, inspect historical context and return through the Chrono portal.'},
  {id:'prayer-reflection-yahavah',title:'Prayer and Reflection with Yahavah',era:'Devotional present',mode:'DEVOTIONAL',evidenceLevel:'documented',description:'A private scripture, prayer and journaling space. Generated prompts support reflection but are never presented as direct divine speech.',objective:'Choose a passage, enter prayer/reflection mode, journal privately and save the session checkpoint.'},
  {id:'ruach-study-reflection',title:'Ruach Study and Reflection',era:'Scripture-linked study',mode:'DEVOTIONAL_STUDY',evidenceLevel:'documented',description:'A source-labeled study lane for passages and teaching about the Ruach, with commentary and generated explanation kept separate from scripture.',objective:'Open a passage set, inspect source labels, compare study notes and save a learning checkpoint.'},
]

function launch(exp:Experience){
  window.dispatchEvent(new CustomEvent('tryamm:chrono-run-started',{detail:{
    id:`faith-${exp.id}`,
    scenarioId:exp.id,
    slug:exp.id,
    name:exp.title,
    era:exp.era,
    scenarioType:exp.mode,
    evidenceLevel:exp.evidenceLevel,
    description:exp.description,
    returnPoint:'streetverse',
    source:'ethiopian-bible-metaverse',
    objective:exp.objective,
    integrity:{physicalTimeTravel:false,generatedDialogue:'educational-simulation',divineCommunicationClaim:false}
  }}))
  window.dispatchEvent(new CustomEvent('tryamm:faith-chrono-launched',{detail:{id:exp.id,title:exp.title,mode:exp.mode}}))
}

export default function FaithChronoLauncher(){
  return <section style={{marginTop:18,border:'1px solid #7f6b32',borderRadius:20,padding:18,background:'linear-gradient(145deg,#171107,#080807 65%,#0c1720)'}}>
    <div style={{fontSize:11,letterSpacing:2.4,color:'#f1d36d',fontWeight:950}}>QUANTUM TIME MACHINE · FAITH CHRONO LAB</div>
    <h2 style={{margin:'7px 0 8px',fontSize:'clamp(25px,4vw,42px)'}}>Bring the Bible world to life</h2>
    <p style={{maxWidth:900,color:'#d9cfb3',lineHeight:1.65}}>Launch source-grounded immersive experiences through the existing TRYAMM Chrono runtime. Historical scenes use reconstruction/simulation labels. Scripture quotations must come from identified sources; generated character dialogue is educational simulation, not a claim of literal time travel or direct divine communication.</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(235px,1fr))',gap:12}}>{EXPERIENCES.map(exp=><article key={exp.id} style={{border:'1px solid #55472c',borderRadius:16,padding:15,background:'#0c0b08'}}>
      <div style={{fontSize:10,fontWeight:900,color:'#8fdcff'}}>{exp.mode.replaceAll('_',' ')}</div>
      <h3 style={{margin:'6px 0'}}>{exp.title}</h3>
      <div style={{fontSize:11,color:'#e5c56a'}}>{exp.era}</div>
      <p style={{fontSize:13,color:'#d9cfb3',lineHeight:1.5}}>{exp.description}</p>
      <p style={{fontSize:12,color:'#9fb4c1',lineHeight:1.45}}><b>Mission:</b> {exp.objective}</p>
      <button type="button" onClick={()=>launch(exp)} style={button}>ENTER TIME MACHINE</button>
    </article>)}</div>
    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}>
      <a href="/holo-lab" style={link}>OPEN HOLO LAB</a>
      <a href="/streetverse" style={link}>RETURN TO STREETVERSE</a>
      <a href="/kingdoms-press" style={link}>PUBLISH THROUGH KINGDOMS PRESS</a>
    </div>
  </section>
}

const button:React.CSSProperties={minHeight:42,padding:'0 13px',border:'1px solid #e5c56a88',borderRadius:10,background:'#2a210d',color:'#fff',fontWeight:950,cursor:'pointer'}
const link:React.CSSProperties={display:'inline-block',padding:'10px 12px',border:'1px solid #486574',borderRadius:999,background:'#0c1820',color:'#fff',fontWeight:900,textDecoration:'none',fontSize:11}
