import {useEffect,useState,type CSSProperties} from 'react'
import {FAITHVERSE_ANCIENT_STORIES,ANCIENT_STORY_RELEASE_GATE,type AncientStoryId} from '../data/FaithVerseAncientStories'
const KEY='tryamm:faithverse:ancient-story-progress:v1'
const btn:CSSProperties={minHeight:56,padding:'12px 13px',borderRadius:13,border:'1px solid #b4ced8',background:'#16364d',color:'#fff',fontSize:16,fontWeight:800,cursor:'pointer',touchAction:'manipulation'}
type Progress={id:AncientStoryId;stages:number[];updatedAt:string}
function readProgress():Progress[]{try{const data=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(data)?data.filter(x=>x&&typeof x.id==='string'&&Array.isArray(x.stages)).slice(-20):[]}catch{return[]}}
function StoryView({styleId,active}:{styleId:string;active:boolean}){
 const storm=styleId==='flood'||styleId==='sea'
 const giants=styleId==='giants'||styleId==='watchers'||styleId==='battle'
 const dark=styleId==='watchers'
 return <svg viewBox="0 0 600 300" width="100%" role="img" aria-label={dark?'Original unsettling fallen-angel silhouette landscape':styleId==='flood'?'Noah’s Ark amid rising floodwater':styleId==='battle'?'David and a towering armored Goliath in an ancient valley':styleId==='giants'?'Giant silhouettes in a fictional ancient landscape':styleId==='sea'?'Water parting in an Exodus illustration':'Ancient tower and city'}>
 <defs><linearGradient id="ancSky" x1="0" y1="0" x2="0" y2="1"><stop stopColor={dark?'#18122b':'#344c6b'}/><stop offset="1" stopColor={dark?'#7c3153':'#8f7556'}/></linearGradient></defs>
 <rect width="600" height="300" fill="url(#ancSky)"/>
 <circle cx="500" cy="62" r="27" fill={dark?'#bc5474':'#f0dc9f'} opacity=".8"/>
 {storm&&<><path d="M0 208 Q90 180 170 208 T340 208 T510 208 T700 208 L700 300 L0 300Z" fill="#125776"/>
 <path d="M0 222 Q140 194 280 222 T560 222 T700 222" stroke="#a9dae8" strokeWidth="5" fill="none" className={active?'faith-story-water':''}/>
 {styleId==='flood'?<><path d="M172 173 L360 173 L334 214 L204 214Z" fill="#754c33" stroke="#d3b38b" strokeWidth="5"/><path d="M203 176 L218 126 L323 126 L350 176Z" fill="#8f613b"/><path d="M218 126 L270 90 L323 126Z" fill="#ba986f"/></>:<><path d="M232 220 Q280 142 326 220" stroke="#e8d5a7" strokeWidth="20" fill="none"/><path d="M0 221 Q95 219 166 286 L0 300Z M600 221 Q512 219 430 286 L600 300Z" fill="#92c3df"/></>}</>}
 {giants&&<><path d="M0 240 Q160 204 315 244 Q450 207 600 237 L600 300 L0 300Z" fill="#313d32"/>
 <g fill={dark?'#2c152a':styleId==='battle'?'#45392f':'#303345'} stroke={dark?'#aa4868':'#59637a'} strokeWidth="5">
 <circle cx="395" cy="74" r="29"/><path d="M357 111 Q390 95 425 111 L448 219 L345 219Z"/><path d="M365 130 L310 198 M424 127 L487 189 M371 219 L355 282 M420 219 L441 282" fill="none" strokeWidth="23" strokeLinecap="round"/></g>
 {dark&&<><path d="M349 140 Q267 60 218 157 Q293 128 343 180 M425 139 Q535 63 566 170 Q485 117 437 183" fill="#56324c" stroke="#ad567d" strokeWidth="5"/><path d="M367 75 L351 32 M426 70 L450 31" stroke="#b56a72" strokeWidth="8" strokeLinecap="round"/><circle cx="383" cy="77" r="4" fill="#e5bd75"/><circle cx="410" cy="77" r="4" fill="#e5bd75"/></>}
 {styleId==='battle'&&<g fill="#5b392d" stroke="#c2ae85" strokeWidth="3"><circle cx="175" cy="189" r="15"/><path d="M159 210 L195 210 L201 258 L153 258Z"/><path d="M186 218 L235 177" strokeWidth="4"/></g>}</>}
 {!storm&&!giants&&<><path d="M0 252 Q250 219 600 250 L600 300 L0 300Z" fill="#56492e"/><path d="M216 261 L239 180 L349 180 L378 261Z" fill="#9f8765"/><path d="M244 179 L260 135 L332 135 L345 179Z" fill="#b5a07d"/><path d="M265 135 L278 99 L314 99 L331 135Z" fill="#cbb695"/></>}
 <rect x="10" y="264" width="580" height="26" rx="9" fill="#091827bb"/><text x="300" y="281" textAnchor="middle" fill="#fff" fontSize="15">Illustrative original 2D scene · Not authenticated history</text>
 <style>{'@keyframes faithFlood{0%{transform:translateY(0)}50%{transform:translateY(8px)}100%{transform:translateY(0)}}.faith-story-water{animation:faithFlood 2.5s infinite ease-in-out}@media(prefers-reduced-motion:reduce){.faith-story-water{animation:none}}'}</style>
 </svg>
}
export default function FaithVerseAncientStoriesTheater({onOpenBible}:{onOpenBible:()=>void}){
 const [selected,setSelected]=useState<AncientStoryId>('creation-flood')
 const [stage,setStage]=useState(0)
 const [progress,setProgress]=useState<Progress[]>(readProgress)
 const [motion,setMotion]=useState(false)
 const [notice,setNotice]=useState('Choose a scripture-guided ancient story. Nephilim and Watchers imagery is fictional, not a verified depiction of supernatural beings.')
 const story=FAITHVERSE_ANCIENT_STORIES.find(x=>x.id===selected)||FAITHVERSE_ANCIENT_STORIES[0]
 const save=()=>{const earlier=progress.find(p=>p.id===story.id);const stages=Array.from(new Set([...(earlier?.stages||[]),stage]));const next=[...progress.filter(x=>x.id!==story.id),{id:story.id,stages,updatedAt:new Date().toISOString()}].slice(-20);setProgress(next);try{localStorage.setItem(KEY,JSON.stringify(next));setNotice('Stage saved on this device. No cloud reward or school credit was awarded.')}catch{setNotice('Local storage unavailable.')}} 
 const narrate=()=>{if(!('speechSynthesis'in window)){setNotice('Device voice is unavailable; written story remains accessible.');return}window.speechSynthesis.cancel();const v=new SpeechSynthesisUtterance(story.title+'. '+story.storySteps[stage]+'. Read '+story.primary.join(', '));v.rate=.9;window.speechSynthesis.speak(v);setNotice('Playing original narrated paraphrase, not a verbatim scripture recording.')}
 const exportReceipt=()=>{const payload={schema:'tryamm.faithverse.ancientstories.v1',studyOnly:true,storyId:story.id,stages:progress,scripture:story.primary,otherTraditions:story.additional,deviceVerified:false,threeDVerified:false,cloudSaved:false};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='FaithVerse_AncientStories_Study.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),750)}
 useEffect(()=>()=>{if('speechSynthesis'in window)window.speechSynthesis.cancel()},[])
 return <section aria-label="Ancient Bible stories immersive learning theater" style={{background:'#0a1727',border:'1px solid #a79778',color:'#fff',borderRadius:17,padding:'clamp(12px,3vw,22px)',display:'grid',gap:14}}>
  <h2 style={{fontSize:25,margin:0}}>Ancient Bible World · Floods, Giants and David</h2>
  <p style={{fontSize:14,lineHeight:1.7,margin:0}}>Explore Noah’s Ark, Nephilim, the Watchers tradition, David and Goliath, Babel and the sea crossing as original dramatized learning scenes. These are symbolic 2D previews, not yet walkable multi-character 3D worlds.</p>
  <label htmlFor="ancient-story-choose">Choose a chapter</label>
  <select style={btn} id="ancient-story-choose" value={story.id} onChange={e=>{setSelected(e.target.value as AncientStoryId);setStage(0)}}>{FAITHVERSE_ANCIENT_STORIES.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
  <StoryView styleId={story.style} active={motion}/>
  <h3 style={{fontSize:21,margin:'2px 0'}}>{story.title} · Scene {stage+1} of 4</h3>
  <p role="status" aria-live="polite" style={{lineHeight:1.65,borderLeft:'4px solid #c6a87a',padding:'10px 13px',margin:0}}>{story.storySteps[stage]}</p>
  <p style={{fontSize:13,lineHeight:1.65,margin:0}}>Main references: {story.primary.join('; ')}. {story.additional.length?'Related source tradition: '+story.additional.join('; ')+'.':''}</p>
  <p style={{fontSize:13,lineHeight:1.65,margin:0}}><strong>Study boundary:</strong> {story.interpretation}</p>
  {story.stageAge==='teen'&&<p style={{fontSize:13,color:'#f0dbb5'}}>Teen-level dramatic scene: non-graphic imagery, no horror gore, and no demon-related claims presented as proven history.</p>}
  <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>
   <button style={btn} onClick={()=>setStage(x=>Math.max(0,x-1))} disabled={stage===0}>Previous scene</button>
   <button style={btn} onClick={()=>{save();setStage(x=>Math.min(3,x+1))}}>{stage===3?'Save chapter':'Next scene'}</button>
   <button style={btn} onClick={()=>setMotion(x=>!x)} aria-pressed={motion}>{motion?'Pause effects':'Animate effects'}</button>
   <button style={btn} onClick={narrate}>Read aloud</button>
   <button style={btn} onClick={()=>window.speechSynthesis?.cancel()}>Stop narration</button>
   <button style={btn} onClick={onOpenBible}>Open Bible source</button>
   <button style={btn} onClick={save}>Save checkpoint</button>
   <button style={btn} onClick={exportReceipt}>Export study report</button>
  </div>
  <p role="status" aria-live="polite" style={{margin:0,fontSize:13}}>{notice}</p>
  <p style={{fontSize:12,color:'#cfdae0'}}>3D rigs verified: {ANCIENT_STORY_RELEASE_GATE.verifiedRiggedGLB?'Yes':'No'} · Multiplayer verified: No · Device acceptance verified: No. Story art is not a substitute for licensed scripture translations or editorial review.</p>
 </section>
}
