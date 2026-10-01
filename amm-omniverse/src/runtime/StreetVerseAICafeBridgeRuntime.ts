type CafePriority='critical'|'high'|'normal'
let installed=false
let cafeReady=false
const pending:Array<{workstream:string;title:string;priority:CafePriority}>=[]

const emitTask=(workstream:string,title:string,priority:CafePriority='normal')=>{
  window.dispatchEvent(new CustomEvent('tryamm:ai-cafe-task',{detail:{
    workstream,title,priority,source:'streetverse-ai-cafe-bridge',requestedAt:new Date().toISOString(),
  }}))
}
const task=(workstream:string,title:string,priority:CafePriority='normal')=>{
  if(!cafeReady){pending.push({workstream,title,priority});return}
  emitTask(workstream,title,priority)
}
const flush=()=>{
  cafeReady=true
  for(const item of pending.splice(0,pending.length))emitTask(item.workstream,item.title,item.priority)
}

export function installStreetVerseAICafeBridgeRuntime(){
  if(installed||typeof window==='undefined')return()=>{}
  installed=true
  let bootQueued=false

  const onCafeState=()=>flush()

  const onSoundReady=()=>{
    if(bootQueued)return
    bootQueued=true
    task('streetverse','Tune visible StreetVerse rescue, traffic, resident and environment soundscape','high')
    task('quality','Verify sound captions, mute/volume controls, one-hand access and reduced-sensory support','high')
    task('creator','Mark rescue and birthday-alpha sound beats for Reel capture','normal')
    task('release','Verify mobile sound bank is mounted, audible after user gesture, and within performance budget','critical')
  }

  const onRescue=(event:Event)=>{
    const d=(event as CustomEvent<{kind?:string;label?:string}>).detail||{}
    task('guardian',`Coordinate responder roles, radio callouts and mission beats for ${String(d.label||d.kind||'StreetVerse incident')}`,'high')
    task('streetverse',`Populate believable NPC reactions, traffic yielding and environmental audio for ${String(d.label||d.kind||'incident')}`,'high')
  }

  const onResolved=(event:Event)=>{
    const d=(event as CustomEvent<{label?:string;kind?:string}>).detail||{}
    task('creator',`Prepare optional rescue highlight/Reel marker for ${String(d.label||d.kind||'completed rescue')}`,'normal')
  }

  const onWorldReady=()=>{
    task('quality','Run visible-world convergence audit: gameplay, sound, rescue, guard, missions, one-hand controls, memory and accessibility','high')
  }

  addEventListener('tryamm:ai-cafe-state',onCafeState)
  addEventListener('tryamm:streetverse-sound-bank-ready',onSoundReady)
  addEventListener('tryamm:streetverse-rescue-incident-start',onRescue)
  addEventListener('tryamm:streetverse-rescue-incident-resolved',onResolved)
  addEventListener('tryamm:streetverse-world-ready',onWorldReady)

  queueMicrotask(()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-ai-cafe-bridge-ready',{detail:{
    agents:['StreetVerse Director','Guardian Dispatch','Creator Producer','Access Guardian','Release Guardian'],
    authority:'planning-events-and-verification-only',
    privilegedActionsStillGated:true,
  }})))

  return()=>{
    removeEventListener('tryamm:ai-cafe-state',onCafeState)
    removeEventListener('tryamm:streetverse-sound-bank-ready',onSoundReady)
    removeEventListener('tryamm:streetverse-rescue-incident-start',onRescue)
    removeEventListener('tryamm:streetverse-rescue-incident-resolved',onResolved)
    removeEventListener('tryamm:streetverse-world-ready',onWorldReady)
    installed=false
  }
}
