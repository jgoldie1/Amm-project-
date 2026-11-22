import {useState,type CSSProperties} from 'react'
import {FAITHVERSE_NATION_CAST,YESHUA_TREE_ART_DIRECTION} from '../data/FaithVerseNationCastAndTree'
import {FAITHVERSE_CAST_READINESS} from '../data/FaithVerseCharacterProductionGate'

const btn:CSSProperties={minHeight:56,padding:'11px 14px',borderRadius:13,border:'1px solid #ceb98f',background:'#182f42',color:'#fff',fontSize:16,fontWeight:750,cursor:'pointer'}
type Stage='nations'|'procession'|'tree'|'scripture'|'reflection'
const SEQUENCE:readonly Stage[]=['nations','procession','tree','scripture','reflection']
const CAPTIONS:Record<Stage,string>={
 nations:'Meet the TRYAMM character ensemble: Black Hebrew families and travelers from multiple nations, with original costume designs and individually represented cultures.',
 procession:'A quiet dramatization leads from the city to a tree-and-wood setting. This scene avoids graphic violence and collective blame.',
 tree:'Yeshua is symbolically depicted as hung on a tree, as requested for this devotional interpretation. The composition is not an authenticated reconstruction.',
 scripture:'Compare passages describing being hung on wood or a tree with the Gospel narratives of Roman crucifixion.',
 reflection:'Explore themes of sacrifice, injustice, compassion and the responsibility to read ancient sources in context.'
}
export default function FaithVerseTreeAndNations({onOpenBible}:{onOpenBible?:()=>void}){
 const [stageIndex,setStageIndex]=useState(0)
 const [selected,setSelected]=useState<string>('hebrew-families')
 const [showComparisons,setShowComparisons]=useState(true)
 const [notice,setNotice]=useState('A non-graphic theological and historical study reconstruction. It is not a verified photograph or reenactment of precise ancient events.')
 const stage=SEQUENCE[stageIndex]
 const group=FAITHVERSE_NATION_CAST.find(x=>x.id===selected)||FAITHVERSE_NATION_CAST[0]
 const exportReport=()=>{
  const data={schema:'tryamm.faithverse.tree-scene.v1',scene:'hung-on-the-tree',chosenStage:stage,countryAndCast:selected,scripture:[...YESHUA_TREE_ART_DIRECTION.passages],alternateGospels:[...YESHUA_TREE_ART_DIRECTION.parallelGospelAccounts],interpretation: YESHUA_TREE_ART_DIRECTION.interpretationNote,threeDCharacterVerified:false,realWorldEventRecreated:false,exportedAt:new Date().toISOString()}
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a')
  a.href=url;a.download='FaithVerse_Tree_and_Nations_Study.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500)
  setNotice('Local educational scene evidence exported. This is not a verified 3D animation or Kingdoms Press publication.')
 }
 return <section aria-label="Nations of the Bible and Yeshua on the tree study" style={{display:'grid',gap:13,border:'1px solid #ae9b76',background:'#0b1e2a',borderRadius:17,padding:'clamp(12px,3vw,22px)',color:'#fff'}}>
  <header><div style={{fontSize:12,letterSpacing:2,color:'#f1d8a4'}}>FAITHVERSE · SCRIPTURE-GUIDED HISTORY</div><h2 style={{fontSize:24,margin:'6px 0'}}>Nations, Yeshua & the Tree</h2></header>
  <p role="status" aria-live="polite" style={{margin:0,lineHeight:1.6,borderRadius:12,padding:12,background:'#283642'}}>{notice}</p>
  <p style={{lineHeight:1.6,margin:0}}><strong>Creator-directed portrayal:</strong> Hebrew characters are represented as Black in this original TRYAMM world, and visitors from other nations are included with distinct attire and backgrounds. These are creative casting choices, not proof of every historical individual's ethnicity.</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(128px,1fr))',gap:7}}>{SEQUENCE.map((s,i)=><button key={s} aria-pressed={stage===s} style={{...btn,fontSize:13,background:stage===s?'#44604e':'#182f42'}} onClick={()=>setStageIndex(i)}>{i+1}. {s==='tree'?'Hung on the Tree':s[0].toUpperCase()+s.slice(1)}</button>)}</div>
  {stage==='nations'&&<><label htmlFor="faith-nations-select">Explore represented peoples</label><select id="faith-nations-select" value={selected} onChange={e=>setSelected(e.target.value)} style={btn}>{FAITHVERSE_NATION_CAST.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select><article style={{padding:16,borderRadius:13,background:'#172f3e',lineHeight:1.7}}><h3 style={{fontSize:19,margin:0}}>{group.name}</h3><p><strong>Role:</strong> {group.role}</p><p><strong>Costume and cast direction:</strong> {group.look}</p><p style={{fontSize:13}}>The game's visual identities are interpretations rather than authenticated historical portraits or rigid stereotypes.</p></article></>}
  {(stage==='procession'||stage==='tree')&&<div style={{minHeight:280,display:'grid',placeItems:'center',borderRadius:15,overflow:'hidden',border:'2px solid #8f9b82',background:'linear-gradient(#15293c,#656147 65%,#233e2a 66%)',padding:12}}>
   <svg role="img" aria-label="Non-graphic symbolic scene with a living tree, wooden branches and a human silhouette; no traditional cross shape" viewBox="0 0 400 280" width="min(100%,500px)" preserveAspectRatio="xMidYMid meet">
    <defs><linearGradient id="faithTreeBg" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#283a50"/><stop offset="1" stopColor="#9e8357"/></linearGradient></defs>
    <rect width="400" height="280" fill="url(#faithTreeBg)"/><circle cx="327" cy="52" r="31" fill="#f1d9ab" opacity=".78"/>
    <path d="M199 260 Q211 180 207 110 Q205 76 186 62 M207 112 Q239 86 265 72 M203 146 Q177 128 142 132" fill="none" stroke="#533823" strokeWidth="24" strokeLinecap="round"/>
    <path d="M155 74 Q119 31 169 20 Q192 -9 230 20 Q263 9 288 45 Q311 89 265 100 Q237 113 215 91 Q174 112 155 74Z" fill="#275341"/>
    <g fill="#367454"><ellipse cx="158" cy="50" rx="40" ry="27"/><ellipse cx="237" cy="37" rx="43" ry="25"/><ellipse cx="279" cy="68" rx="38" ry="29"/></g>
    {stage==='tree'&&<g opacity=".85"><circle cx="200" cy="121" r="12" fill="#523428"/><path d="M201 133 L201 189 M201 150 L182 164 M201 150 L220 164 M201 189 L184 216 M201 189 L219 215" stroke="#59372a" strokeWidth="9" strokeLinecap="round" fill="none"/><path d="M193 144 L210 144 L207 186 L195 186Z" fill="#eee1bd"/></g>}
    <path d="M0 251 Q75 236 150 257 Q220 232 400 250 L400 280 L0 280Z" fill="#3a4934"/>
   </svg>
   <p style={{textAlign:'center',fontSize:13,maxWidth:480,lineHeight:1.5}}>Symbolic, non-graphic artistic interpretation of the phrase “hung on the tree.” The scene does not claim a particular execution apparatus has been archaeologically established.</p>
  </div>}
  {stage==='scripture'&&<article style={{background:'#182f3c',padding:15,borderRadius:13,lineHeight:1.65}}><h3 style={{marginTop:0}}>Scripture comparison</h3><p><strong>Tree / wood wording:</strong> {YESHUA_TREE_ART_DIRECTION.passages.join('; ')}.</p><blockquote style={{borderLeft:'4px solid #d6b67b',padding:'8px 12px',margin:'8px 0',fontSize:16}}><strong>Acts 5:30 (KJV):</strong> “The God of our fathers raised up Jesus, whom ye slew and hanged on a tree.”</blockquote><p style={{fontSize:13}}>Compare Acts 10:39, Acts 13:29, Galatians 3:13, 1 Peter 2:24 and Deuteronomy 21:22–23 in the Bible reader for additional wording and context.</p><label style={{display:'flex',gap:11,alignItems:'center'}}><input type="checkbox" checked={showComparisons} onChange={e=>setShowComparisons(e.target.checked)} style={{width:22,height:22}}/>Also show Gospel crucifixion accounts</label>{showComparisons&&<p><strong>Gospel narratives:</strong> {YESHUA_TREE_ART_DIRECTION.parallelGospelAccounts.join('; ')}.</p>}<p>{YESHUA_TREE_ART_DIRECTION.interpretationNote}</p></article>}
  {stage==='reflection'&&<article style={{background:'#182f3c',padding:15,borderRadius:13,lineHeight:1.7}}><h3>Reflect and study</h3><p>{CAPTIONS.reflection}</p><p>Show individual actions and political authority in context. Avoid blaming Jewish people or any entire ethnic or national group for Yeshua's death.</p><p>Future completed scene should include original period-appropriate models, multilingual captions, optional narration, age-appropriate non-graphic settings and consent-based educational discussion.</p></article>}
  <p style={{margin:0,lineHeight:1.6}} aria-live="polite">{CAPTIONS[stage]}</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}><button style={btn} disabled={stageIndex===0} onClick={()=>setStageIndex(x=>Math.max(0,x-1))}>Previous scene</button><button style={btn} disabled={stageIndex>=SEQUENCE.length-1} onClick={()=>setStageIndex(x=>Math.min(SEQUENCE.length-1,x+1))}>Next scene</button><button style={btn} onClick={exportReport}>Export study evidence</button>{onOpenBible&&<button style={btn} onClick={onOpenBible}>Read Bible passages</button>}</div>
  <p style={{fontSize:12,color:'#c6ced4'}}>Real cast GLBs ready: {FAITHVERSE_CAST_READINESS.cast3DReady?'Yes':'No'}. The tree scene is stylized 2D. All characters, animation, camera continuity, device-performance and production release tests remain outstanding.</p>
 </section>
}
