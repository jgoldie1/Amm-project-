import {useEffect,useMemo,useState,type CSSProperties} from 'react'
import FaithVerseYeshuaPortrait from './FaithVerseYeshuaPortrait'
import {MIRACLE_SCENES,miracleById,sceneEvidence,type MiracleStage,type MiracleScene} from '../data/FaithVerseMiraclesCatalog'

const KEY='tryamm:faithverse:miracles:local-studies:v1'
const STAGES:readonly MiracleStage[]=['introduction','witness','event','reflection']
type SavedProgress={sceneId:string;stages:MiracleStage[];updatedAt:string}
function readSaved():SavedProgress[]{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(v))return [];return v.filter(x=>x&&typeof x.sceneId==='string'&&Array.isArray(x.stages)).slice(-30)}catch{return []}}
const button:CSSProperties={minHeight:58,padding:'11px 14px',borderRadius:14,border:'1px solid #acc8d9',background:'#16374b',color:'#fff',fontSize:16,fontWeight:800,cursor:'pointer',touchAction:'manipulation'}
function StageVisual({scene,stage,motion}:{scene:MiracleScene;stage:MiracleStage;motion:boolean}){
 const water=scene.effect==='walk-water'||scene.effect==='waves'||scene.effect==='net'
 const walking=scene.effect==='walk-water'&&stage==='event'
 const special=stage==='event'
 return <div aria-label={scene.title+' reconstructed study scene'} style={{position:'relative',isolation:'isolate',border:'2px solid #75a9ad',borderRadius:20,overflow:'hidden',minHeight:300,background:water?'linear-gradient(180deg,#08162a,#243e5f 50%,#15577b 51%,#06364f)':'linear-gradient(180deg,#192e3a,#7e7557 55%,#4b5a39 56%,#243525)',display:'grid',placeItems:'center'}}>
  <style>{`@keyframes faithWalkWater{0%{transform:translate(-55px,7px)}100%{transform:translate(55px,-7px)}}@keyframes faithWave{0%,100%{transform:translateY(0)}50%{transform:translateY(10px)}}@keyframes faithShine{0%,100%{opacity:.25;transform:scale(.92)}50%{opacity:.85;transform:scale(1.06)}}@media(prefers-reduced-motion:reduce){.faith-miracle-move{animation:none!important}}`}</style>
  <div aria-hidden="true" style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 18%,#d8ca9e44,transparent 58%)'}}/>
  {water&&<div aria-hidden="true" className={motion?'faith-miracle-move':''} style={{position:'absolute',inset:'63% 0 0',background:'repeating-linear-gradient(170deg,transparent 0px,transparent 14px,#70b2cb55 16px,transparent 20px)',animation:motion?'faithWave 2s ease-in-out infinite':'none'}}/>}
  {(scene.effect==='food'||scene.effect==='water-jars'||scene.effect==='awakening'||scene.effect==='radiance'||scene.effect==='healing')&&<div aria-hidden="true" style={{position:'absolute',top:26,right:26,fontSize:56,opacity:.85}}>{scene.effect==='food'?'🧺':scene.effect==='water-jars'?'🏺':scene.effect==='awakening'?'🌅':scene.effect==='radiance'?'✨':'🌿'}</div>}
  {water&&<div aria-hidden="true" style={{position:'absolute',bottom:36,left:'8%',fontSize:57}}>{scene.effect==='walk-water'?'⛵':scene.effect==='net'?'🎣':'⛵'}</div>}
  {special&&<div aria-hidden="true" className={motion?'faith-miracle-move':''} style={{position:'absolute',width:185,height:185,borderRadius:'50%',background:'radial-gradient(circle,#ffe3ac77,transparent 69%)',left:'50%',top:'22%',transform:'translateX(-50%)',animation:motion?'faithShine 2.3s ease-in-out infinite':'none'}}/>}
  <div className={walking&&motion?'faith-miracle-move':''} style={{position:'relative',zIndex:1,width:'min(43%,180px)',filter:'drop-shadow(0 7px 13px #04131a)',animation:walking&&motion?'faithWalkWater 4s ease-in-out infinite alternate':'none'}}>
    <FaithVerseYeshuaPortrait />
  </div>
  <div style={{position:'absolute',left:12,bottom:9,right:12,zIndex:2,borderRadius:10,background:'#071726d9',color:'#fff',padding:'8px 12px',textAlign:'center',fontSize:13,lineHeight:1.55}}>{walking?'Yeshua approaches across the water — animated 2D visual reconstruction':special?'Illustrative scene effect: '+scene.effect.replaceAll('-',' '):'Scripture-guided scene setup'} · Cast: {scene.cast.join(', ')}</div>
 </div>
}
export default function FaithVerseMiraclesTheater({onClose,onOpenBible,onReturnToGalilee}:{onClose?:()=>void;onOpenBible?:()=>void;onReturnToGalilee?:()=>void}){
 const [sceneId,setSceneId]=useState<string>('water-walk')
 const [stageIndex,setStageIndex]=useState(0)
 const [playerRole,setPlayerRole]=useState('witness')
 const [progress,setProgress]=useState<SavedProgress[]>(readSaved)
 const [filter,setFilter]=useState('All')
 const [captions,setCaptions]=useState(true)
 const [motion,setMotion]=useState(false)
 const [notice,setNotice]=useState('Scripture-guided miracle scenes are devotional reconstructions, not historical footage or actual divine intervention.')
 const scene=miracleById(sceneId)||MIRACLE_SCENES[0]
 const stage=STAGES[stageIndex]
 const narrative=scene[stage]
 const filterScenes=useMemo(()=>MIRACLE_SCENES.filter(s=>filter==='All'||s.group===filter),[filter])
 const done=progress.find(p=>p.sceneId===scene.id)
 const save=()=>{
  const earlier=progress.find(x=>x.sceneId===scene.id)
  const stages=Array.from(new Set([...(earlier?.stages||[]),stage])) as MiracleStage[]
  const next=[...progress.filter(x=>x.sceneId!==scene.id),{sceneId:scene.id,stages,updatedAt:new Date().toISOString()}].slice(-30)
  setProgress(next)
  try{localStorage.setItem(KEY,JSON.stringify(next));setNotice('Educational chapter checkpoint saved locally. No real-game rewards or shared Mycelium ledger entries were created.')}catch{setNotice('Local storage is not available. Export the study report.')}
 }
 const next=()=>{save();if(stageIndex<STAGES.length-1)setStageIndex(i=>i+1);else{setNotice('Story chapter complete locally. Explore another miracle or return to Bible study.');window.dispatchEvent(new CustomEvent('tryamm:faithverse-miracle-local-chapter',{detail:{sceneId:scene.id,source:'faithverse',isSimulation:true,serverVerified:false,rewardClaimed:false}}))}}
 const narrate=()=>{if(!('speechSynthesis'in window)){setNotice('Device text-to-speech is not supported. Captions remain available.');return}window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(scene.title+'. '+narrative+'. Source: '+scene.primary);utterance.rate=.9;utterance.lang='en-US';window.speechSynthesis.speak(utterance);setNotice('Device narrator reading an original paraphrase. This is not the recorded voice of Yeshua.')}
 const exportStudy=()=>{
  const output={schema:'tryamm.faithverse.miracles.v1',exportedAt:new Date().toISOString(),chapters:progress,currentlySelected:sceneEvidence(scene),selectedLocalRole:playerRole,multiplayerVerified:false,studyOnly:true,serverVerified:false,rewardClaimed:false,rigged3DCharactersVerified:false,deviceAcceptanceVerified:false}
  const blob=new Blob([JSON.stringify(output,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='FaithVerse_Miracles_Study_Report.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500)
  setNotice('Local educational report exported. No transcript, health data or cloud data sent.')
 }
 useEffect(()=>()=>{if('speechSynthesis'in window)window.speechSynthesis.cancel()},[])
 const main=<div style={{maxWidth:780,margin:'0 auto',display:'grid',gap:14}}>
   <header style={{display:'flex',gap:12,alignItems:'center',justifyContent:'space-between'}}>
    <div><div style={{fontSize:12,fontWeight:900,letterSpacing:2,color:'#d5bd87'}}>FAITHVERSE · IMMERSIVE BIBLE STUDY</div><h2 style={{fontSize:27,margin:'5px 0'}}>Miracles of Yeshua</h2></div>
    {onClose&&<button style={button} onClick={onClose}>Close</button>}
   </header>
   <p style={{lineHeight:1.6,margin:0}}>Explore {MIRACLE_SCENES.length} scripture-linked miracle stories with accessible scene controls, an ensemble cast, narration, and local chapter progress. These artistic reenactments are not exhaustive, and are not yet real skinned 3D avatars.</p>
   <p role="status" aria-live="polite" style={{padding:12,borderRadius:12,background:'#293844',margin:0,fontSize:13,lineHeight:1.5}}>{notice}</p>
   <label htmlFor="faith-miracle-category">Choose a story category</label>
   <select style={button} id="faith-miracle-category" value={filter} onChange={e=>{const value=e.target.value;setFilter(value);const target=MIRACLE_SCENES.find(x=>value==='All'||x.group===value);if(target){setSceneId(target.id);setStageIndex(0)}}}>
    {['All','Nature','Provision','Healing','Restoration'].map(g=><option key={g}>{g}</option>)}
   </select>
   <label htmlFor="faith-miracle-scene">Choose miracle chapter</label>
   <select style={button} id="faith-miracle-scene" value={scene.id} onChange={e=>{setSceneId(e.target.value);setStageIndex(0)}}>{filterScenes.map(x=><option key={x.id} value={x.id}>{x.title} · {x.primary}</option>)}</select>
   <label htmlFor="faith-miracle-coop-role">Choose a role in this chapter</label>
   <select id="faith-miracle-coop-role" style={button} value={scene.cast.includes(playerRole)?playerRole:'witness'} onChange={e=>{setPlayerRole(e.target.value);setNotice('Local role selection: '+e.target.value+'. Live multiplayer/co-op casting is not connected yet.')}}><option value="witness">Witness / learner</option>{scene.cast.map(x=><option key={x} value={x}>{x} (educational roleplay)</option>)}</select>
   <p style={{fontSize:12,color:'#d1dee0',margin:0}}>Co-op preparation: individual characters and participant roles are cataloged, but remote players, authoritative sessions and 3D animated performances are still awaiting integration.</p>
   <StageVisual scene={scene} stage={stage} motion={motion}/>
   <h3 style={{fontSize:22,margin:'4px 0'}}>{scene.title} · {stage==='event'?'Witness the account':stage[0].toUpperCase()+stage.slice(1)}</h3>
   {captions&&<p role="status" aria-live="polite" style={{fontSize:16,lineHeight:1.7,margin:0,borderLeft:'4px solid #d3b77d',padding:'8px 12px'}}>{narrative}</p>}
   <p style={{fontSize:14,margin:0,color:'#dce4e6'}}><strong>Scripture:</strong> {scene.primary}{scene.parallel.length?', compare '+scene.parallel.join(', '):''}. <strong>Setting:</strong> {scene.setting}.</p>
   <div aria-label="Story chapter navigation" style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:9}}>
    <button style={button} disabled={stageIndex===0} onClick={()=>setStageIndex(i=>Math.max(0,i-1))}>Previous scene</button>
    <button style={{...button,background:'#2a594b'}} onClick={next}>{stageIndex===3?'Complete chapter':'Continue story'}</button>
    <button style={button} aria-pressed={motion} onClick={()=>setMotion(x=>!x)}>{motion?'Pause visual motion':'Animate scene'}</button>
    <button style={button} aria-pressed={captions} onClick={()=>setCaptions(x=>!x)}>{captions?'Captions ON':'Captions OFF'}</button>
    <button style={button} onClick={narrate}>Read aloud</button>
    <button style={button} onClick={()=>window.speechSynthesis?.cancel()}>Stop voice</button>
    <button style={button} onClick={save}>Save study checkpoint</button>
    <button style={button} onClick={exportStudy}>Export report</button>
   </div>
   <div aria-label="Study stages" style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:6}}>{STAGES.map((name,i)=><button key={name} style={{...button,fontSize:12,padding:'7px 5px',minHeight:50,background:stageIndex===i?'#405e6a':'#16374b'}} aria-pressed={stageIndex===i} onClick={()=>setStageIndex(i)}>{done?.stages.includes(name)?'✓ ':''}{name}</button>)}</div>
   <p style={{color:'#e7d1a4',margin:0,fontSize:13}}>Completed locally: {progress.filter(p=>p.stages.length===4).length} of {MIRACLE_SCENES.length} chapters. No verified cloud sync or monetary rewards.</p>
   {(onOpenBible||onReturnToGalilee)&&<div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:9}}>{onOpenBible&&<button style={button} onClick={onOpenBible}>Read Bible passage</button>}{onReturnToGalilee&&<button style={button} onClick={onReturnToGalilee}>Return to Galilee</button>}</div>}
   <p style={{fontSize:12,color:'#c4d7d9',lineHeight:1.65}}>TRYAMM’s Black Hebrew high-priest Yeshua image is an artistic interpretation, not a verified historical likeness. Miracle effects are fictional visual representations of Gospel narratives, not medical claims, literal time travel, or authenticated recorded speech.</p>
 </div>
 return onClose?<section role="dialog" aria-modal="true" aria-label="FaithVerse Miracle theater" style={{position:'fixed',inset:0,zIndex:2147483620,overflowY:'auto',background:'#071420',color:'#fff',padding:'max(16px,env(safe-area-inset-top)) 14px max(32px,env(safe-area-inset-bottom))'}}>{main}</section>:<section aria-label="FaithVerse Miracle theater" style={{color:'#fff'}}>{main}</section>
}
