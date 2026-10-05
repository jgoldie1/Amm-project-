import {useMemo,useState} from 'react'

type BibleWorld={
 id:string;icon:string;title:string;subtitle:string;description:string;action:'anchor'|'route'|'event';target:string;integrity:string
}

const WORLDS:readonly BibleWorld[]=[
 {id:'scripture-reader',icon:'📖',title:'Scripture Reader',subtitle:'READ • LISTEN • STUDY',description:'Open the working KJV reader lane with accessible chapter reading and read-aloud support.',action:'anchor',target:'reader',integrity:'Reader text is labeled by source/translation.'},
 {id:'ethiopian-canon',icon:'📚',title:'Ethiopian Canon Library',subtitle:'81-BOOK CANON METADATA',description:'Explore the Ethiopian Orthodox Tewahedo 81-book canon manifest and see which books still require a verified text corpus.',action:'event',target:'canon81',integrity:'Canon metadata and connected scripture text remain separate.'},
 {id:'curriculum-88',icon:'🕯️',title:'TRYAMM 88-Book Curriculum',subtitle:'81 OFFICIAL + 7 SOURCE-PENDING STUDY SLOTS',description:'Use the custom TRYAMM learning collection without relabeling it as the official Ethiopian canon.',action:'event',target:'curriculum88',integrity:'Custom curriculum is clearly distinguished from official canon metadata.'},
 {id:'hebrew-school',icon:'✡️',title:'Hebrew / Paleo-Hebrew School',subtitle:'ALEPH-BET • ROOTS • SCRIPT STUDY',description:'Study Hebrew letters, learner transliteration, roots and ancient-script reference glyphs.',action:'event',target:'hebrew',integrity:'Ancient-script glyphs and pronunciation aids are labeled as study aids where uncertain.'},
 {id:'strongs',icon:'🔎',title:"Strong's Study House",subtitle:'KJV WORD → NUMBER → LEMMA → ROOT',description:"Open the Strong's concordance study layer for verified KJV-linked Hebrew and Greek indexing.",action:'event',target:'strongs',integrity:"Strong's numbers are not fabricated for books outside a verified mapping."},
 {id:'kjv1611',icon:'👑',title:'KJV 1611 Study Chamber',subtitle:'EDITION COMPARISON',description:'Keep historical-edition study, current KJV reading and Ethiopian canon metadata source-labeled instead of blended.',action:'event',target:'kjv1611',integrity:'Original-edition scans/spelling remain provider/source dependent.'},
 {id:'apocrypha1611',icon:'📜',title:'KJV 1611 Apocrypha Library',subtitle:'14 BOOKS • HISTORICAL EDITION LANE',description:'Study the 14-book Apocrypha printed between the Old and New Testaments in the 1611 Authorized Version.',action:'event',target:'apocrypha',integrity:'KJV 1611 Apocrypha is kept distinct from the Ethiopian Orthodox canon.'},
 {id:'esther-jubilees',icon:'🕯️',title:'Esther + Jubilees Study Worlds',subtitle:'KJV / 1611 ADDITIONS / ETHIOPIAN CANON',description:'Follow Esther in the KJV and Ethiopian-canon lanes, Rest/Additions to Esther in the 1611 Apocrypha lane, and Jubilees in the Ethiopian-canon lane.',action:'event',target:'canon81',integrity:'Esther, Additions to Esther and Jubilees retain their own source/canon labels.'},
 {id:'faith-chrono',icon:'⏳',title:'Faith Chrono / Time Machine',subtitle:'SOURCE-LABELED RECONSTRUCTION',description:'Launch educational historical reconstructions and devotional missions through the existing TRYAMM Chrono runtime.',action:'anchor',target:'faith-chrono',integrity:'Reconstruction is not physical time travel or a claim that generated dialogue is historical fact.'},
 {id:'holo-lab',icon:'🌐',title:'Holo Lab Scripture Worlds',subtitle:'PASSAGE → MAP → WORLD → MISSION',description:'Build immersive scripture lessons and clearly labeled educational world scenes.',action:'route',target:'/holo-lab',integrity:'World scenes are visualizations/reconstructions unless directly sourced.'},
 {id:'kingdom-workbook',icon:'📝',title:'Kingdom Workbook',subtitle:'66 STEPS • REFLECTION • REMEMBRANCE',description:'Carry study into the 66-step Kingdom Workbook, family covenant and Book of Remembrance.',action:'route',target:'/kingdom-workbook',integrity:'Private journal and prayer drafts remain private by default.'},
 {id:'kingdoms-press',icon:'✍🏾',title:'Kingdoms Press',subtitle:'STUDY GUIDE • HOLOBOOK • AUDIO',description:'Turn reviewed lessons, devotionals and study guides into accessible publishing projects.',action:'route',target:'/kingdoms-press',integrity:'Public ministry/publishing output remains rights/editorial reviewed.'},
 {id:'servants',icon:'⛪',title:'Servants of Christ',subtitle:'TEACH • LIVE • SERVE',description:'Move reviewed studies into classes, LIVE teaching, reading plans and service missions.',action:'route',target:'/servants-of-christ',integrity:'Human review remains required for official ministry resources.'},
 {id:'yahisrael',icon:'👑',title:'Kingdom of Yahisrael',subtitle:'WHERE HEAVEN MEETS EARTH',description:'Return to the Kingdom and enter the playable Hebrew School / Scripture House from the living world.',action:'route',target:'/kingdom-of-yahisrael',integrity:'One Kingdom front door; the Metaverse Bible remains its study/immersive scripture world.'},
] as const

const KEY='tryamm.metaverse-bible.world-progress.v1'
function readVisited(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x.map(String):[]}catch{return []}}
function persist(ids:string[]){try{localStorage.setItem(KEY,JSON.stringify(ids))}catch{}}

export default function FaithMetaverseBibleWorldMap(){
 const [visited,setVisited]=useState<string[]>(()=>readVisited())
 const done=useMemo(()=>new Set(visited),[visited])
 const mark=(id:string)=>{if(done.has(id))return;const next=[...visited,id];setVisited(next);persist(next)}
 const open=(world:BibleWorld)=>{
  mark(world.id)
  window.dispatchEvent(new CustomEvent('tryamm:metaverse-bible-world-entered',{detail:{id:world.id,title:world.title,target:world.target,integrity:world.integrity,source:'faith-metaverse-bible-world-map'}}))
  if(world.action==='route'){window.location.href=world.target;return}
  if(world.action==='anchor'){document.getElementById(world.target)?.scrollIntoView({behavior:'smooth',block:'start'});return}
  window.dispatchEvent(new CustomEvent('tryamm:faith-holobook-layer-request',{detail:{layer:world.target,source:'metaverse-bible-world-map'}}))
  document.getElementById('faith-holobook')?.scrollIntoView({behavior:'smooth',block:'start'})
 }
 return <section id="metaverse-bible-world-map" style={shell}>
  <div style={{fontSize:10,letterSpacing:2.2,color:'#70eaff',fontWeight:950}}>METAVERSE BIBLE WORLD MAP • {visited.length}/{WORLDS.length} VISITED</div>
  <h2 style={{fontSize:'clamp(28px,5vw,48px)',margin:'7px 0'}}>Walk the Bible as a connected study world</h2>
  <p style={muted}>The Metaverse Bible is not only a reader. It connects scripture, canon metadata, Hebrew study, concordance tools, source-labeled reconstruction, Holo Lab, the Kingdom Workbook, ministry, publishing and the Kingdom of Yahisrael. Immersive scenes remain clearly labeled educational visualizations.</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(215px,1fr))',gap:9,marginTop:12}}>{WORLDS.map(world=><button key={world.id} onClick={()=>open(world)} style={{...card,borderColor:done.has(world.id)?'#7fffb3':'#3d5c66'}}>
   <div style={{display:'flex',justifyContent:'space-between',gap:8}}><span style={{fontSize:28}}>{world.icon}</span><span style={{fontSize:8,color:done.has(world.id)?'#7fffb3':'#89ddea',fontWeight:950}}>{done.has(world.id)?'VISITED':'ENTER WORLD'}</span></div>
   <strong style={{fontSize:15}}>{world.title}</strong>
   <span style={{fontSize:8,color:'#e5c56a',fontWeight:900}}>{world.subtitle}</span>
   <span style={{fontSize:10,color:'#d6dfe3',lineHeight:1.45}}>{world.description}</span>
   <small style={{fontSize:8,color:'#a9b6bd',lineHeight:1.4,borderTop:'1px solid #2d4148',paddingTop:6}}>{world.integrity}</small>
  </button>)}</div>
 </section>
}

const shell:React.CSSProperties={marginTop:18,border:'2px solid #3e8390',borderRadius:20,padding:16,background:'linear-gradient(145deg,#06131a,#0b0a07 60%,#171007)',color:'#fff'}
const card:React.CSSProperties={display:'grid',gap:5,textAlign:'left',padding:12,border:'1px solid #3d5c66',borderRadius:14,background:'#071117',color:'#fff',cursor:'pointer'}
const muted:React.CSSProperties={color:'#d2dce0',lineHeight:1.6}
