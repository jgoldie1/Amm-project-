import {useState} from 'react'
/** Self-contained pilot walkthrough. Never writes actual game progress or takes payment. */
const steps=[
 {title:'Enter Circle Park',detail:'Begin at the guarded neighborhood entrance.'},
 {title:'Find BJ',detail:'Navigate toward BJ using the accessible controls in the actual game build.'},
 {title:'Talk to the NPC',detail:'Start the mission dialogue.'},
 {title:'Complete the mission',detail:'Perform the assigned action and verify completion.'},
 {title:'Open business storefront',detail:'Travel from the experience to a real business inquiry.'},
] as const
const base:React.CSSProperties={border:'1px solid #6fa6c3',borderRadius:11,minHeight:44,padding:'10px 13px',background:'#12405a',color:'#fff',fontWeight:800}
export default function StreetVersePilotDemo(){
 const [step,setStep]=useState(0)
 const [checks,setChecks]=useState<Record<number,boolean>>({})
 const [note,setNote]=useState('')
 const passed=steps.every((_,i)=>checks[i]===true)
 return <section id="living-worlds-proof" aria-label="StreetVerse gameplay and storefront pilot" style={{marginTop:25,padding:20,border:'1px solid #5486a0',borderRadius:19,background:'#0a1829',color:'#fff'}}>
  <div style={{fontSize:11,color:'#9bdfff',fontWeight:900,letterSpacing:2}}>LIVING WORLDS · GAMEPLAY + BUSINESS PILOT</div>
  <h2 style={{fontSize:25,margin:'8px 0'}}>One mission. One storefront. Measurable proof.</h2>
  <p style={{fontSize:13,color:'#c0d1de',lineHeight:1.6}}>This is a manual demonstration checklist, not the live StreetVerse game. Check off steps only after verifying them in the actual game. No game state, rewards, orders or payments are affected.</p>
  <div role="group" aria-label="Pilot demonstration steps" style={{display:'flex',flexWrap:'wrap',gap:7}}>{steps.map((s,i)=><button key={s.title} aria-pressed={step===i} onClick={()=>setStep(i)} style={{...base,background:step===i?'#1f7289':'#142b42'}}>{i+1}. {s.title}</button>)}</div>
  <div style={{marginTop:15,padding:15,border:'1px solid #4f788d',borderRadius:13}}><div style={{fontSize:11,color:'#a4cfde'}}>STEP {step+1} OF {steps.length}</div><h3 style={{fontSize:21,margin:'7px 0'}}>{steps[step].title}</h3><p style={{fontSize:13,color:'#b6cbd9'}}>{steps[step].detail}</p>
   <label style={{display:'flex',gap:9,alignItems:'center',fontSize:13}}><input type="checkbox" style={{width:24,height:24}} checked={checks[step]===true} onChange={e=>setChecks(c=>({...c,[step]:e.target.checked}))}/>I verified this step in the actual build</label>
   <div style={{display:'flex',gap:9,marginTop:13,flexWrap:'wrap'}}><button style={base} onClick={()=>setStep(i=>Math.max(0,i-1))} disabled={step===0}>Previous</button><button style={base} onClick={()=>setStep(i=>Math.min(steps.length-1,i+1))} disabled={step===steps.length-1}>Next</button></div>
  </div>
  <div role="status" style={{marginTop:11,fontSize:12,color:'#b9e2ef'}}>{Object.values(checks).filter(Boolean).length} of {steps.length} manually checked. {passed?'All boxes checked locally; independent testing evidence still required.':'Gameplay demonstration not yet fully verified.'}</div>
  <label style={{display:'block',fontSize:12,marginTop:10}}>Test notes (not saved)<textarea value={note} onChange={e=>setNote(e.target.value.slice(0,500))} placeholder="Device, failed steps, evidence URL or observations" style={{display:'block',width:'100%',boxSizing:'border-box',marginTop:5,minHeight:76,padding:10,borderRadius:11,border:'1px solid #6691a6',background:'#091e30',color:'#fff'}}/></label>
  <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}><a href="/streetverse" style={{...base,textDecoration:'none',display:'inline-flex',alignItems:'center'}}>Open StreetVerse game</a><a href="#start-with-tryamm" style={{...base,textDecoration:'none',display:'inline-flex',alignItems:'center'}}>Open business inquiry</a><button style={base} onClick={()=>{const report=steps.map((s,i)=>s.title+': '+(checks[i]?'manually checked':'not verified')).join('\n')+'\nNotes: '+note+'\nThis is a self-reported checklist, not automated test evidence.';navigator.clipboard?.writeText(report)}}>Copy pilot checklist</button></div>
  <p style={{fontSize:11,color:'#aabdc8'}}>For sponsors and universities, supplement this self-reported checklist with unedited device recordings, build and commit identifiers, reproducible test results, and a real customer inquiry receipt.</p>
 </section>
}
