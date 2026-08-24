import type { LivingWorldSnapshot, WorldQuality, WorldWeather } from './StreetVerseLivingWorldRuntime'

const MEMORY_KEY='tryamm_streetverse_world_memory_v1'
const MAX_AGE_MS=1000*60*60*24*7

type WorldMemory={
  snapshot:LivingWorldSnapshot
  savedAt:number
  lastEnteredAt?:number
  lastLeftAt?:number
}

let installed=false
let current:WorldMemory|null=null

function validWeather(value:unknown):value is WorldWeather{
  return ['clear','golden_hour','rain','fog','storm'].includes(String(value))
}
function validQuality(value:unknown):value is WorldQuality{
  return ['ultra','high','balanced','data-saver'].includes(String(value))
}
function readMemory():WorldMemory|null{
  try{
    const parsed=JSON.parse(localStorage.getItem(MEMORY_KEY)||'null') as WorldMemory|null
    if(!parsed?.snapshot||!Number.isFinite(parsed.savedAt))return null
    if(Date.now()-parsed.savedAt>MAX_AGE_MS){localStorage.removeItem(MEMORY_KEY);return null}
    if(!validWeather(parsed.snapshot.weather)||!validQuality(parsed.snapshot.budget?.quality))return null
    return parsed
  }catch{return null}
}
function writeMemory(memory:WorldMemory){
  current=memory
  try{localStorage.setItem(MEMORY_KEY,JSON.stringify(memory))}catch{}
}
function emitRestore(memory:WorldMemory){
  window.dispatchEvent(new CustomEvent('tryamm:world-weather',{detail:{weather:memory.snapshot.weather,source:'world-memory'}}))
  window.dispatchEvent(new CustomEvent('tryamm:quantum-lag-buster',{detail:{quality:memory.snapshot.budget.quality,metrics:{fps:60,rtt:0},source:'world-memory'}}))
  window.dispatchEvent(new CustomEvent('tryamm:living-world-memory-restored',{detail:{snapshot:memory.snapshot,savedAt:memory.savedAt}}))
}

export function installStreetVerseWorldMemory(){
  if(installed||typeof window==='undefined')return
  installed=true
  current=readMemory()
  if(current)queueMicrotask(()=>emitRestore(current!))

  window.addEventListener('tryamm:living-world-state',(event:Event)=>{
    const snapshot=(event as CustomEvent<LivingWorldSnapshot>).detail
    if(!snapshot?.generatedAt)return
    writeMemory({snapshot,savedAt:Date.now(),lastEnteredAt:current?.lastEnteredAt,lastLeftAt:current?.lastLeftAt})
  })

  window.addEventListener('tryamm:streetverse-enter',()=>{
    const memory=current||readMemory()
    if(memory){memory.lastEnteredAt=Date.now();writeMemory(memory);emitRestore(memory)}
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-transition',{detail:{phase:'entered',restored:Boolean(memory),at:Date.now()}}))
  })

  window.addEventListener('tryamm:streetverse-leave',()=>{
    const memory=current||readMemory()
    if(memory){memory.lastLeftAt=Date.now();writeMemory(memory)}
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-transition',{detail:{phase:'left',saved:Boolean(memory),at:Date.now()}}))
  })

  window.addEventListener('tryamm:streetverse-memory-clear',()=>{
    current=null
    try{localStorage.removeItem(MEMORY_KEY)}catch{}
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-transition',{detail:{phase:'memory-cleared',at:Date.now()}}))
  })
}
