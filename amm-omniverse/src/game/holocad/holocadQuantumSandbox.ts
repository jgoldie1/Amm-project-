/**
 * HoloCAD Quantum Sandbox: SMALL CLASSICAL quantum-circuit state-vector simulator.
 *
 * This is a browser-local teaching engine. No physical qubits, quantum server
 * connection, quantum sensing, optimization advantage, robot control, or
 * access to mission rewards. Payload semantics match the separately drafted
 * TRYAMM Quantum Server's 1–4 qubit H/X/Z/S/T/CX API.
 */
import type {HoloCADSubject} from './livingSystemsPresets'

export type HoloCADQuantumGate={
 type:'H'|'X'|'Z'|'S'|'T'|'CX'
 target:number
 control?:number
}
export type HoloCADQuantumCircuit={
 qubits:number
 gates:readonly HoloCADQuantumGate[]
 shots:number
}
export type HoloCADQuantumResult={
 backend:'classical-statevector-simulator'
 physicalQuantumHardware:false
 realQuantumProviderConnected:false
 qubits:number
 shots:number
 results:{state:string;probability:number;counts:number}[]
}
export type HoloCADQuantumLessonId='superposition'|'bell'|'interference'|'phase'
export type HoloCADQuantumLesson={
 id:HoloCADQuantumLessonId
 title:string
 goal:string
 note:string
 qubits:number
 gates:readonly HoloCADQuantumGate[]
}

export const HOLOCAD_QUANTUM_LESSONS:readonly HoloCADQuantumLesson[]=[
 {
  id:'superposition',title:'1 QUBIT • SUPERPOSITION',
  goal:'Compare two possible measurement results from one simulated qubit.',
  note:'The quantum measurement result does not read an aerospace sensor or predict a component fault.',
  qubits:1,gates:[{type:'H',target:0}]
 },
 {
  id:'bell',title:'2 QUBITS • BELL CORRELATION',
  goal:'Observe correlated |00⟩ and |11⟩ outcomes after H then CX.',
  note:'This demonstration does not create actual entanglement between physical craft, players or robots.',
  qubits:2,gates:[{type:'H',target:0},{type:'CX',control:0,target:1}]
 },
 {
  id:'interference',title:'1 QUBIT • PHASE INTERFERENCE',
  goal:'Use H–Z–H to change the measurement from |0⟩ to |1⟩.',
  note:'The interference is mathematical; it is not a real navigation or propulsion system.',
  qubits:1,gates:[{type:'H',target:0},{type:'Z',target:0},{type:'H',target:0}]
 },
 {
  id:'phase',title:'1 QUBIT • T PHASE GATE',
  goal:'Compare probabilities when a phase gate is placed between two H gates.',
  note:'This is not a speed, antigravity or energy-harvesting booster.',
  qubits:1,gates:[{type:'H',target:0},{type:'T',target:0},{type:'H',target:0}]
 },
]

export function suggestedHoloCADQuantumLesson(subject:HoloCADSubject):HoloCADQuantumLessonId{
 if(['spacecraft','satellite','rover','robot-dog','humanoid-robot'].includes(subject))return 'bell'
 if(['aircraft','drone','automobile','robotic-arm'].includes(subject))return 'superposition'
 if(['building','exoskeleton'].includes(subject))return 'interference'
 return 'phase'
}

const int=(v:number,min:number,max:number)=>Number.isInteger(v)&&v>=min&&v<=max
const INV_SQRT_2=Math.SQRT1_2

export function simulateHoloCADQuantumCircuit(
 circuit:HoloCADQuantumCircuit,
 random:()=>number=Math.random
):HoloCADQuantumResult{
 if(!int(circuit.qubits,1,4))throw Error('qubits_must_be_1_to_4')
 if(!Array.isArray(circuit.gates)||circuit.gates.length>48)throw Error('gates_must_be_array_max_48')
 if(!int(circuit.shots,1,2048))throw Error('shots_must_be_1_to_2048')
 const width=1<<circuit.qubits
 const re=new Float64Array(width)
 const im=new Float64Array(width)
 re[0]=1
 for(const gate of circuit.gates){
  if(!gate||!['H','X','Z','S','T','CX'].includes(gate.type))throw Error('unsupported_gate')
  if(!int(gate.target,0,circuit.qubits-1))throw Error('invalid_target')
  if(gate.type==='CX'&&(!int(gate.control!,0,circuit.qubits-1)||gate.control===gate.target))throw Error('invalid_control')
  const bit=1<<gate.target
  const control=gate.type==='CX'?1<<gate.control!:0
  for(let index=0;index<width;index++){
   if(gate.type==='H'&&!(index&bit)){
    const partner=index|bit
    const a=re[index],b=im[index],c=re[partner],d=im[partner]
    re[index]=(a+c)*INV_SQRT_2;im[index]=(b+d)*INV_SQRT_2
    re[partner]=(a-c)*INV_SQRT_2;im[partner]=(b-d)*INV_SQRT_2
   }else if((gate.type==='X'||gate.type==='CX')&&!(index&bit)&&
      (gate.type==='X'||Boolean(index&control))){
    const partner=index|bit
    const r=re[index],j=im[index]
    re[index]=re[partner];im[index]=im[partner]
    re[partner]=r;im[partner]=j
   }else if(gate.type==='Z'&&(index&bit)){
    re[index]=-re[index];im[index]=-im[index]
   }else if(gate.type==='S'&&(index&bit)){
    const r=re[index];re[index]=-im[index];im[index]=r
   }else if(gate.type==='T'&&(index&bit)){
    const r=re[index],j=im[index]
    re[index]=(r-j)*INV_SQRT_2
    im[index]=(r+j)*INV_SQRT_2
   }
  }
 }
 const weights=Array.from(re,(r,i)=>r*r+im[i]*im[i])
 const norm=weights.reduce((sum,value)=>sum+value,0)
 if(!(norm>0))throw Error('invalid_quantum_norm')
 const probs=weights.map(value=>value/norm)
 const counts=new Array<number>(width).fill(0)
 for(let shot=0;shot<circuit.shots;shot++){
  const p=random()
  if(!(p>=0&&p<1))throw Error('invalid_sample')
  let sum=0,picked=width-1
  for(let i=0;i<width;i++){
   sum+=probs[i]
   if(p<sum){picked=i;break}
  }
  counts[picked]++
 }
 return{
  backend:'classical-statevector-simulator',
  physicalQuantumHardware:false,
  realQuantumProviderConnected:false,
  qubits:circuit.qubits,
  shots:circuit.shots,
  results:probs.map((probability,i)=>({
   state:i.toString(2).padStart(circuit.qubits,'0'),
   probability:Number(probability.toFixed(12)),
   counts:counts[i]
  }))
 }
}
