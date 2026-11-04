import {useEffect,useState,type CSSProperties} from 'react'
import {
 HOLOCAD_QUANTUM_LESSONS,suggestedHoloCADQuantumLesson,simulateHoloCADQuantumCircuit,
 type HoloCADQuantumGate,type HoloCADQuantumLessonId,type HoloCADQuantumResult
} from '../game/holocad/holocadQuantumSandbox'
import type {HoloCADSubject} from '../game/holocad/livingSystemsPresets'
import {createHoloCADResearchResult,publishHoloCADResearchResult} from '../game/holocad/holocadResearchBridge'

const ctl:CSSProperties={
 minHeight:44,borderRadius:10,padding:'8px 11px',
 border:'1px solid #9d95ed77',background:'#192345',
 font:'800 11px system-ui',color:'#f7f5ff',touchAction:'manipulation'
}
const select:CSSProperties={...ctl,fontSize:13}
type GateType=HoloCADQuantumGate['type']

export default function HoloCADQuantumSandboxPanel({
 subject,affectedParts,onClose
}:{subject:HoloCADSubject;affectedParts:number;onClose:()=>void}){
 const [lessonId,setLessonId]=useState<HoloCADQuantumLessonId>(()=>suggestedHoloCADQuantumLesson(subject))
 const lesson=HOLOCAD_QUANTUM_LESSONS.find(l=>l.id===lessonId)??HOLOCAD_QUANTUM_LESSONS[0]
 const [gates,setGates]=useState<HoloCADQuantumGate[]>(()=>[...lesson.gates])
 const [shots,setShots]=useState(128)
 const [newGate,setNewGate]=useState<GateType>('H')
 const [target,setTarget]=useState(0)
 const [control,setControl]=useState(1)
 const [result,setResult]=useState<HoloCADQuantumResult|null>(null)
 const [message,setMessage]=useState('Choose a circuit and press RUN LOCAL SIMULATION.')

 useEffect(()=>{
  const id=suggestedHoloCADQuantumLesson(subject)
  const suggested=HOLOCAD_QUANTUM_LESSONS.find(l=>l.id===id)??HOLOCAD_QUANTUM_LESSONS[0]
  setLessonId(id);setGates([...suggested.gates]);setResult(null)
  setTarget(0);setControl(1)
  setMessage('Loaded a classroom circuit for '+subject.replaceAll('-',' ')+'. It is not connected to physical hardware.')
 },[subject])
 const chooseLesson=(id:HoloCADQuantumLessonId)=>{
  const chosen=HOLOCAD_QUANTUM_LESSONS.find(l=>l.id===id)??HOLOCAD_QUANTUM_LESSONS[0]
  setLessonId(id);setGates([...chosen.gates]);setResult(null)
  setTarget(0);setControl(1);setMessage('Circuit selected. Press RUN LOCAL SIMULATION.')
 }
 const addGate=()=>{
  if(gates.length>=48){setMessage('Circuit limit is 48 gates.');return}
  if(newGate==='CX'&&(lesson.qubits<2||control===target)){
   setMessage('CX requires two different qubits.');return
  }
  setGates(current=>[...current,newGate==='CX'
   ?{type:'CX',target,control}:{type:newGate,target}])
  setResult(null);setMessage('Gate added. Run again to calculate new results.')
 }
 const run=()=>{
  try{
   const outcome=simulateHoloCADQuantumCircuit({qubits:lesson.qubits,gates,shots})
   setResult(outcome)
   publishHoloCADResearchResult(createHoloCADResearchResult({kind:'quantum-circuit',subject,experiment:lessonId,summary:'Completed '+outcome.qubits+' simulated qubit(s), '+outcome.shots+' measurement shots.'}))
   setMessage('Local CPU simulation completed. Probabilities are mathematical; sampled counts can vary.')
  }catch(e){setResult(null);setMessage('Circuit rejected: '+(e instanceof Error?e.message:'invalid input'))}
 }
 const reset=()=>{
  setGates([...lesson.gates]);setResult(null)
  setMessage('Restored the original classroom circuit.')
 }
 return <section aria-label="HoloCAD Quantum Sandbox" style={{
  marginTop:11,border:'1px solid #8878d9',borderRadius:14,padding:11,
  background:'linear-gradient(125deg,#11152a,#191331)',color:'#f0eaff',fontFamily:'system-ui'}}>
  <div style={{display:'flex',gap:8,alignItems:'start',justifyContent:'space-between'}}>
   <div>
    <div style={{fontSize:10,fontWeight:900,letterSpacing:1.4,color:'#bab0ff'}}>HOLOCAD • QUANTUM SANDBOX</div>
    <div style={{fontSize:15,fontWeight:900,marginTop:5}}>⚛️ CPU QUANTUM CIRCUIT LAB</div>
   </div>
   <button type="button" style={ctl} onClick={onClose} aria-label="Close HoloCAD Quantum Sandbox">CLOSE ×</button>
  </div>
  <p style={{fontSize:11,lineHeight:1.55,color:'#d5caff'}}>
   Explore quantum-circuit principles alongside the {subject.replaceAll('-',' ')} teardown.
   No hardware connection, physical quantum processor, robot control, propulsion, power gain,
   biological sensing or real-world diagnosis is involved.
  </p>
  <label htmlFor="holocad-quantum-lesson" style={{display:'block',fontSize:11,fontWeight:900,marginBottom:5}}>EXPERIMENT</label>
  <select id="holocad-quantum-lesson" style={{...select,width:'100%'}} value={lessonId}
   onChange={event=>chooseLesson(event.target.value as HoloCADQuantumLessonId)}>
   {HOLOCAD_QUANTUM_LESSONS.map(l=><option key={l.id} value={l.id}>{l.title}</option>)}
  </select>
  <p style={{fontSize:11,lineHeight:1.5}}>{lesson.goal} {lesson.note}</p>
  <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:8}} aria-label="Current circuit gates">
   {gates.length?gates.map((g,i)=><span key={i} style={{
    padding:'6px 8px',borderRadius:8,background:'#35417a',fontSize:11,fontWeight:850
   }}>{i+1}. {g.type} q{g.target}{g.type==='CX'?' ← q'+g.control:''}</span>):
    <span style={{fontSize:11}}>Empty circuit: |0⟩ state</span>}
  </div>
  <div style={{display:'flex',flexWrap:'wrap',gap:7,alignItems:'end'}}>
   <label style={{fontSize:10,fontWeight:800}}>ADD GATE
    <select aria-label="Quantum gate type" style={{...select,display:'block',marginTop:5}} value={newGate}
     onChange={event=>setNewGate(event.target.value as GateType)}>
     {(['H','X','Z','S','T','CX'] as const).map(g=><option key={g} value={g}>{g}</option>)}
    </select>
   </label>
   <label style={{fontSize:10,fontWeight:800}}>TARGET
    <select aria-label="Gate target qubit" style={{...select,display:'block',marginTop:5}} value={target}
     onChange={event=>setTarget(Number(event.target.value))}>
     {Array.from({length:lesson.qubits},(_,i)=><option key={i} value={i}>q{i}</option>)}
    </select>
   </label>
   {newGate==='CX'&&<label style={{fontSize:10,fontWeight:800}}>CONTROL
    <select aria-label="Controlled X source qubit" style={{...select,display:'block',marginTop:5}} value={control}
     onChange={event=>setControl(Number(event.target.value))}>
     {Array.from({length:lesson.qubits},(_,i)=><option key={i} value={i}>q{i}</option>)}
    </select>
   </label>}
   <button type="button" style={ctl} onClick={addGate}>+ ADD</button>
   <button type="button" style={ctl} disabled={!gates.length}
    onClick={()=>{setGates(current=>current.slice(0,-1));setResult(null)}}>UNDO GATE</button>
   <button type="button" style={ctl} onClick={reset}>RESET CIRCUIT</button>
  </div>
  <label htmlFor="holocad-quantum-shots" style={{display:'block',marginTop:12,fontSize:11,fontWeight:900}}>
   MEASUREMENT SHOTS • {shots}
  </label>
  <input id="holocad-quantum-shots" type="range" min="64" max="1024" step="64"
   value={shots} onChange={event=>setShots(Number(event.target.value))}
   style={{width:'100%',height:44,touchAction:'pan-x'}} />
  <button type="button" style={{...ctl,background:'#45479a',width:'100%',fontSize:13}}
   onClick={run}>▶ RUN LOCAL SIMULATION</button>
  <div role="status" aria-label="Quantum Sandbox run result" style={{
   marginTop:8,padding:8,borderRadius:9,background:'#20203b',fontSize:11,lineHeight:1.5
  }}>{message}</div>
  {result&&<section aria-label="Quantum circuit measurement probabilities" style={{marginTop:10}}>
   <div style={{fontSize:11,fontWeight:900,marginBottom:8}}>
    {result.qubits} SIMULATED QUBIT(S) • {result.shots} SHOTS • NO REAL QUANTUM HARDWARE
   </div>
   {result.results.map(out=><div key={out.state} style={{marginBottom:8}}>
    <div style={{fontSize:11,display:'flex',justifyContent:'space-between',gap:6}}>
     <span>|{out.state}⟩</span><span>{(out.probability*100).toFixed(2)}% • {out.counts} measured</span>
    </div>
    <div style={{background:'#1f2749',height:13,borderRadius:7,overflow:'hidden'}}>
     <div style={{width:String(out.probability*100)+'%',height:'100%',background:'#8e97fb'}}/>
    </div>
   </div>)}
  </section>}
  <p style={{fontSize:10,lineHeight:1.5,color:'#aca5d0',marginTop:10}}>
   HoloCAD training context: {affectedParts} manually marked/detached part(s). The quantum-circuit
   output is independent of those flags and must not determine safety, repairs or mission rewards.
   Compatible circuit format with draft TRYAMM Quantum Server; this screen runs locally,
   does not send API requests or expose server credentials.
  </p>
 </section>
}
