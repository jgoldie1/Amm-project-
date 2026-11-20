import {useEffect,useState} from 'react'
import {AI_CAFE_EXERCISES,AI_CAFE_PLAYGROUND_KEY,findPlaygroundExercise,loadPlaygroundAttempts,playgroundAttemptComplete,type PlaygroundAttempt} from '../runtime/AICafePlaygroundRuntime'

/** One-hand-friendly, local-first learning lab. Uses existing JARVIS Deluxe/HoloGPT;
 * never claims a queued Café task ran or that an exercise is externally certified.
 */
export default function AICafePlayground(){
 const [selected,setSelected]=useState(AI_CAFE_EXERCISES[0].id)
 const exercise=findPlaygroundExercise(selected)||AI_CAFE_EXERCISES[0]
 const [prompt,setPrompt]=useState<string>(exercise.starterPrompt)
 const [checks,setChecks]=useState<string[]>([])
 const [note,setNote]=useState('')
 const [attempts,setAttempts]=useState<PlaygroundAttempt[]>(()=>{
  try{return loadPlaygroundAttempts(localStorage.getItem(AI_CAFE_PLAYGROUND_KEY))}catch{return []}
 })
 const [message,setMessage]=useState('')
 useEffect(()=>{setPrompt(exercise.starterPrompt);setChecks([]);setNote('');setMessage('')},[exercise.id])
 const verified=attempts.filter(playgroundAttemptComplete).length
 const button:React.CSSProperties={minHeight:46,borderRadius:10,border:'1px solid #4fc6ca70',background:'#102a32',color:'#e0fcff',fontWeight:850,fontSize:13,padding:'10px 14px',cursor:'pointer',touchAction:'manipulation'}
 const openJarvis=()=>{
  // Opens the existing model interface. A generated answer is not evidence of an external action.
  window.dispatchEvent(new CustomEvent('tryamm:hologpt-study-context',{detail:{prompt:prompt.trim().slice(0,4000)}}))
  setMessage('JARVIS Deluxe was opened with your prompt. Review its answer before saving learning evidence.')
 }
 const submit=()=>{
  if(!prompt.trim()){setMessage('Write your prompt first.');return}
  const item:PlaygroundAttempt={exerciseId:exercise.id,prompt:prompt.trim().slice(0,4000),completedChecks:checks,submittedAt:new Date().toISOString(),status:'self-reported',evidenceNote:note.trim().slice(0,1200)}
  const next=[item,...attempts].slice(0,40);setAttempts(next)
  try{localStorage.setItem(AI_CAFE_PLAYGROUND_KEY,JSON.stringify(next))}catch{setMessage('Saved in this session only; browser storage unavailable.')}
  // Queues a PLANNING item, not a background worker or an employment approval.
  window.dispatchEvent(new CustomEvent('tryamm:ai-cafe-task',{detail:{workstream:exercise.workstream,title:'Playground review: '+exercise.title,priority:'normal',source:'ai-cafe-playground',execution:'planning-only',evidenceStatus:'self-reported'}}))
  window.dispatchEvent(new CustomEvent('tryamm:ai-cafe-playground-submission',{detail:{exerciseId:exercise.id,checksCompleted:checks.length,checksRequired:exercise.checklist.length,verifiedByHuman:false,fictional:true}}))
  setMessage(playgroundAttemptComplete(item)?'Practice checklist saved. Your work is self-reported and still needs review.':'Draft practice saved. Finish the checklist when you are ready.')
 }
 return <section aria-label="AI Playground in AI Café" style={{marginTop:14,border:'1px solid #37d1d477',borderRadius:15,background:'#07161d',color:'#e9faff',padding:14,fontFamily:'system-ui',lineHeight:1.5}}>
  <header style={{display:'flex',gap:12,justifyContent:'space-between',flexWrap:'wrap',alignItems:'center'}}>
   <div><h3 style={{margin:0,fontSize:20}}>🧪 AI Playground · JARVIS Deluxe</h3><p style={{margin:'4px 0 0',fontSize:12,color:'#9ed4da'}}>Practice with AI, explore Café jobs, test NPCs and characters. No real charges or automated employment.</p></div>
   <strong style={{fontSize:12,color:'#8de4d1'}}>{verified} practice checklist{verified===1?'':'s'} completed</strong>
  </header>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))',gap:7,margin:'12px 0'}}>
   {AI_CAFE_EXERCISES.map(item=><button key={item.id} aria-pressed={item.id===selected} onClick={()=>setSelected(item.id)} style={{...button,borderColor:item.id===selected?'#e4bb71':'#4fc6ca55',background:item.id===selected?'#3b2b20':'#102a32',textAlign:'left'}}>{item.title}</button>)}
  </div>
  <div style={{padding:12,background:'#12232d',borderRadius:12}}>
   <strong>{exercise.title}</strong><p style={{margin:'4px 0 9px',fontSize:12,color:'#c4dde3'}}>{exercise.goal}</p>
   <label htmlFor="ai-cafe-prompt" style={{display:'block',fontSize:12,fontWeight:800}}>Your JARVIS experiment</label>
   <textarea id="ai-cafe-prompt" value={prompt} onChange={e=>setPrompt(e.target.value.slice(0,4000))} rows={4} style={{boxSizing:'border-box',width:'100%',marginTop:6,padding:10,border:'1px solid #386c78',borderRadius:10,background:'#091922',color:'#fff',fontSize:14}}/>
   <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'9px 0'}}>
    <button onClick={openJarvis} style={button}>◈ ASK JARVIS</button>
    <button onClick={()=>setPrompt(exercise.starterPrompt)} style={button}>RESET PROMPT</button>
   </div>
   <strong style={{fontSize:13}}>Learning checklist</strong>
   <div style={{display:'grid',gap:8,margin:'8px 0'}}>
    {exercise.checklist.map(check=><label key={check} style={{display:'flex',alignItems:'center',gap:10,fontSize:13,minHeight:36}}><input type="checkbox" checked={checks.includes(check)} onChange={e=>setChecks(old=>e.target.checked?[...old,check]:old.filter(v=>v!==check))} style={{width:21,height:21}}/>{check}</label>)}
   </div>
   <label htmlFor="ai-cafe-notes" style={{display:'block',fontSize:12,fontWeight:800}}>Practice notes or evidence</label>
   <textarea id="ai-cafe-notes" value={note} onChange={e=>setNote(e.target.value.slice(0,1200))} placeholder="What did you test? What worked, and what needs improving?" rows={2} style={{boxSizing:'border-box',width:'100%',margin:'6px 0 10px',padding:9,border:'1px solid #386c78',borderRadius:9,background:'#091922',color:'#fff',fontSize:13}}/>
   <button onClick={submit} style={{...button,background:'#244b38',borderColor:'#75d7a5'}}>SAVE PRACTICE & QUEUE REVIEW</button>
   {message&&<p role="status" style={{fontSize:12,color:'#ffe8b0'}}>{message}</p>}
  </div>
  <p style={{fontSize:11,color:'#9db9bf',margin:'10px 0 0'}}>Learning records are stored locally in this browser and are self-reported. Café agents may queue a planning task, but that does not start a coding worker, grant a certificate, pay wages, or deploy an app. JARVIS answers depend on its actual AI-provider connection.</p>
 </section>
}
