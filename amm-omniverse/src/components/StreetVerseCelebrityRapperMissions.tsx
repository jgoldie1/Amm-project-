import {useEffect,useMemo,useState} from 'react'
import {CHICAGO_MUSIC_LEGACY_ARTISTS,chicagoMusicLegacyMissionId,createChicagoMusicLegacySteps} from '../data/ChicagoMusicLegacyMissionRegistry'
import {STREETVERSE_ORIGINAL_GENRE_LINEUP,STREETVERSE_MUSIC_GENRES} from '../data/StreetVerseOmniCastProduction'

type Pos={x?:number;z?:number}
type Step={speaker:string;text:string;objective:string;x:number;z:number}
type Mission={id:string;title:string;lane:'CELEBRITY BOSS'|'RAPPER'|'SINGER'|'MUSIC LEGACY';xp:number;steps:Step[];rightsGated?:boolean;fictional?:boolean;genre?:string;performerId?:string}

const MUSIC_LEGACY_MISSIONS:Mission[]=CHICAGO_MUSIC_LEGACY_ARTISTS.map((artist,index)=>({
 id:chicagoMusicLegacyMissionId(artist.id),
 title:`Chicago Music Legacy: ${artist.displayName} — ${artist.legacyLabel}`,
 lane:artist.missionLane,
 xp:420+(index%4)*25,
 steps:createChicagoMusicLegacySteps(artist),
 rightsGated:true,
}))
// Genre-inspired original performers are not copies of identifiable real musicians.
const ORIGINAL_GENRE_MISSIONS:Mission[]=STREETVERSE_ORIGINAL_GENRE_LINEUP.map((artist,index)=>({
 id:'streetverse-original-music-'+artist.id,
 title:artist.genre+' • '+artist.name,
 genre:artist.genre,performerId:artist.id,fictional:true,rightsGated:true,
 lane:(/rap|hip-hop|trap|drill|spoken word|boom bap/i.test(artist.genre)?'RAPPER':/house|techno|edm|jazz|blues|disco|funk|afrofutur|ambient|experimental|orchestral|classical|lo-fi|film score/i.test(artist.genre)?'MUSIC LEGACY':'SINGER') as Mission['lane'],
 xp:280+(index%5)*20,
 steps:[
  {speaker:'Aniyah 64-Track Studio',text:'Create an original '+artist.genre+' track or live performance with '+artist.name+'. Choose your own or licensed instruments and samples.',objective:'Start the 64-Track Studio session',x:-42,z:-30},
  {speaker:artist.name,text:'Build a fresh '+artist.genre+' performance. Write new lyrics, arrange the music or design an original dance scene.',objective:'Complete an original music creation task',x:10,z:-18},
  {speaker:'Music Rights Coordinator',text:'Credit every contributor. Check recording, composition, sample and voice permissions before any public release.',objective:'Finish the rights and credits checkpoint',x:20,z:28},
  {speaker:'Creator Stage Host',text:'Showcase your own work at the stage, then capture an original StreetVerse Reel.',objective:'Reach the stage and finish the showcase',x:38,z:38},
 ],
}))
const MISSIONS:Mission[]=[
 {id:'celebrity-boss-01',title:'Celebrity Boss: The Headliner',lane:'CELEBRITY BOSS',xp:420,steps:[
  {speaker:'Bennie',text:'Big arrival in the city. Keep the route clean, get the headliner to soundcheck, and make the moment worth clipping.',objective:'Meet the headliner convoy',x:34,z:-8},
  {speaker:'Nova Crown',text:'I do not need a red carpet. I need a flawless entrance, a live crowd, and a Reel people replay tomorrow.',objective:'Escort Nova Crown to the venue',x:-34,z:34},
  {speaker:'Tour Manager',text:'Soundcheck is late. Get the production crate from the studio before doors open.',objective:'Collect the production crate',x:-42,z:-30},
  {speaker:'Nova Crown',text:'That is how you run a city. Give the crowd one clean finish and we are live.',objective:'Reach the performance stage',x:38,z:38}]},
 {id:'rapper-studio-01',title:'Rapper Mission: Studio Pressure',lane:'RAPPER',xp:300,steps:[
  {speaker:'Bennie',text:'Studio session just went hot. The artist needs the beat pack, the engineer, and a clean take before the deadline.',objective:'Report to Aniyah 64 Track Studio',x:-42,z:-30},
  {speaker:'Kilo Verse',text:'I got the hook. Bring the beat pack and keep the room focused. No wasted bars tonight.',objective:'Pick up the beat pack',x:10,z:-18},
  {speaker:'Engineer Rae',text:'Levels are set. Get back in the booth zone and lock the final take.',objective:'Return for the final take',x:-42,z:-30}]},
 {id:'rapper-city-02',title:'Rapper Mission: City Rollout',lane:'RAPPER',xp:360,steps:[
  {speaker:'Bennie',text:'The single is finished. Now turn the whole city into the rollout.',objective:'Meet the artist at the Riverwalk',x:28,z:-12},
  {speaker:'Jett South',text:'One verse, three locations, no dead energy. We shoot it moving.',objective:'Shoot the downtown Reel moment',x:20,z:28},
  {speaker:'Jett South',text:'Now take it to the neighborhood. I want the business stop in the video too.',objective:'Hit the West Side business stop',x:-72,z:10},
  {speaker:'Bennie',text:'Rollout complete. Push the final moment to Reels and close the mission.',objective:'Finish at the creator stage',x:38,z:38}]},
 ...MUSIC_LEGACY_MISSIONS,
 ...ORIGINAL_GENRE_MISSIONS,
]

const emitDialogue=(mission:Mission,index:number)=>{const line=mission.steps[index];if(!line)return;dispatchEvent(new CustomEvent('tryamm:streetverse-dialogue',{detail:{missionId:mission.id,speaker:line.speaker,text:line.text,objective:line.objective,step:index}}))}

export default function StreetVerseCelebrityRapperMissions(){
 const [pos,setPos]=useState({x:0,z:0}),[mission,setMission]=useState<Mission|null>(null),[step,setStep]=useState(0),[open,setOpen]=useState(false)
 const [search,setSearch]=useState(''),[laneView,setLaneView]=useState<'original'|'history'|'all'>('original'),[page,setPage]=useState(0)
 const changeSearch=(value:string)=>{setSearch(value);setPage(0)}
 const changeView=(value:'original'|'history'|'all')=>{setLaneView(value);setPage(0)}
 const filtered=useMemo(()=>MISSIONS.filter(m=>{
  if(laneView==='original'&&(!m.fictional&&m.title.startsWith('Chicago Music Legacy:')))return false
  if(laneView==='history'&&!m.title.startsWith('Chicago Music Legacy:'))return false
  const q=search.trim().toLocaleLowerCase()
  return !q||(m.title+' '+(m.genre||'')+' '+m.lane).toLocaleLowerCase().includes(q)
 }),[laneView,search])
 const pageSize=12,maxPage=Math.max(0,Math.ceil(filtered.length/pageSize)-1)
 const shown=filtered.slice(Math.min(page,maxPage)*pageSize,(Math.min(page,maxPage)+1)*pageSize)
 useEffect(()=>{const fn=(e:Event)=>{const d=(e as CustomEvent<Pos>).detail||{};setPos({x:Number(d.x||0),z:Number(d.z||0)})};addEventListener('tryamm:streetverse-player-position',fn);return()=>removeEventListener('tryamm:streetverse-player-position',fn)},[])
 const current=mission?.steps[step],distance=current?Math.hypot(pos.x-current.x,pos.z-current.z):999
 const nearest=useMemo(()=>MISSIONS.map(m=>({...m,d:Math.hypot(pos.x-m.steps[0].x,pos.z-m.steps[0].z)})).sort((a,b)=>a.d-b.d)[0],[pos])
 const start=(m:Mission)=>{setMission(m);setStep(0);setOpen(true);dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail:{missionId:m.id,label:m.title,financialReward:false,lane:m.lane,genre:m.genre||null,performerId:m.performerId||null,fictional:Boolean(m.fictional),xp:m.xp,rightsGated:Boolean(m.rightsGated),originalMissionWriting:true}}));emitDialogue(m,0)}
 const advance=()=>{if(!mission||!current||distance>10)return;dispatchEvent(new CustomEvent('tryamm:streetverse-objective-complete',{detail:{missionId:mission.id,step,objective:current.objective,x:current.x,z:current.z}}));if(step<mission.steps.length-1){const next=step+1;setStep(next);emitDialogue(mission,next)}else{dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:{missionId:mission.id,label:mission.title,xp:mission.xp,financialReward:false,lane:mission.lane}}));dispatchEvent(new CustomEvent('tryamm:streetverse-reel-moment',{detail:{missionId:mission.id,title:mission.title,lane:mission.lane}}));dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'streetverse-star-mission',missionId:mission.id,title:`${mission.title} Highlight`,caption:`${mission.title} complete in StreetVerse • #TRYAMM #StreetVerse`}}));setMission(null);setStep(0);setOpen(false)}}
 return <div style={{position:'fixed',left:12,top:330,zIndex:16996,fontFamily:'system-ui',color:'#fff'}}>
  {!mission&&!open&&<button onClick={()=>setOpen(true)} style={btn('#ff74c8')}>🎤 STAR MISSIONS</button>}
  {open&&!mission&&<div style={{...panel,maxHeight:'min(78vh,700px)',overflowY:'auto'}}><b>🎤 MUSICVERSE • {STREETVERSE_MUSIC_GENRES.length} GENRES</b><div style={{opacity:.72,fontSize:11,margin:'5px 0 8px'}}>Original rappers, singers, DJs and producers across every genre • Chicago legacy references are separate</div><div style={{fontSize:10,opacity:.65,marginBottom:7}}>Nearest: {nearest.title} • {Math.round(nearest.d)}m</div><div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:7}}>{(['original','history','all'] as const).map(view=><button key={view} onClick={()=>changeView(view)} aria-pressed={laneView===view} style={{...btn(laneView===view?'#85ffd6':'#ddd'),flex:1}}>{view.toUpperCase()}</button>)}</div><input aria-label="Search music genres and performers" placeholder="Try house, trap, gospel, Afrobeats..." value={search} onChange={e=>changeSearch(e.target.value)} style={{width:'100%',boxSizing:'border-box',padding:9,borderRadius:9,background:'#19223c',color:'#fff',border:'1px solid #bca3ff'}}/><div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:6}}>{['House','Trap','Drill','R&B','Hip-Hop','Gospel','Afrobeats'].map(genre=><button key={genre} onClick={()=>changeSearch(genre)} style={{...btn('#bcd2ff'),fontSize:10,minHeight:31,padding:'4px 6px'}}>{genre}</button>)}<button onClick={()=>changeSearch('')} style={{...btn('#ddd'),fontSize:10,minHeight:31,padding:'4px 6px'}}>All genres</button></div><div style={{fontSize:10,color:'#b8c9e2',marginTop:8}}>{filtered.length} missions • page {Math.min(page,maxPage)+1}/{maxPage+1} • original music or cleared recordings only</div>{shown.map(m=><button key={m.id} onClick={()=>start(m)} style={{...btn(m.lane==='CELEBRITY BOSS'?'#ffd36b':m.lane==='SINGER'?'#ff9be6':m.lane==='MUSIC LEGACY'?'#c9a7ff':'#77e7ff'),display:'block',width:'100%',marginTop:6,textAlign:'left'}}>{m.title} • {m.xp} XP{m.fictional?' • ORIGINAL PERFORMER':m.rightsGated?' • LEGACY / RIGHTS GATED':''}</button>)}<div style={{display:'flex',gap:6,marginTop:7}}><button disabled={page<=0} onClick={()=>setPage(p=>Math.max(0,p-1))} style={btn('#ddd')}>Prev</button><button disabled={page>=maxPage} onClick={()=>setPage(p=>Math.min(maxPage,p+1))} style={btn('#ddd')}>Next</button><button onClick={()=>setOpen(false)} style={btn('#ddd')}>Close</button></div></div>}
  {mission&&current&&<div style={panel}><b>{mission.title}</b><div style={{fontSize:11,opacity:.7,marginTop:3}}>STEP {step+1}/{mission.steps.length} • {Math.round(distance)}m</div><div style={{marginTop:8,fontWeight:900,color:'#ffd36b'}}>{current.speaker}</div><div style={{fontSize:12,lineHeight:1.35,marginTop:3}}>{current.text}</div><div style={{fontSize:11,marginTop:8,opacity:.8}}>OBJECTIVE: {current.objective}</div><button disabled={distance>10} onClick={advance} style={{...btn(distance<=10?'#88ffad':'#777'),marginTop:9,width:'100%'}}>{distance<=10?(step===mission.steps.length-1?'COMPLETE + OPEN REEL':'COMPLETE OBJECTIVE'):'GO TO OBJECTIVE'}</button></div>}
 </div>
}
const panel:React.CSSProperties={width:300,padding:12,borderRadius:14,background:'rgba(10,7,20,.94)',border:'1px solid #ff74c866',boxShadow:'0 12px 34px #0009'}
const btn=(color:string):React.CSSProperties=>({minHeight:40,padding:'8px 11px',borderRadius:10,border:'1px solid #ffffff33',background:'#111827ee',color,fontWeight:900,fontSize:11,cursor:'pointer'})
