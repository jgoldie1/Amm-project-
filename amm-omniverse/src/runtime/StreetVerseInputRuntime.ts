import { installFonStreetVerseTransport } from './FonStreetVerseTransport'
import { installUniversalIntentRuntime } from './UniversalIntentRuntime'

export type StreetVerseInput={source:'keyboard'|'gamepad'|'remote'|'touch'|'intent';x:number;y:number;buttons?:Record<string,boolean>;timestamp:number}

let installed=false
const DEADZONE=.18
const held=new Set<string>()
const heldButtons=new Set<string>()

function clamp(v:number){return Math.max(-1,Math.min(1,v))}
function emit(detail:StreetVerseInput){
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-input',{detail}))
}
function keyEvent(type:'keydown'|'keyup',key:string){
  window.dispatchEvent(new KeyboardEvent(type,{key,bubbles:true,cancelable:true}))
}
function syncKeys(x:number,y:number){
  const wanted=new Set<string>()
  if(y<-DEADZONE)wanted.add('w')
  if(y>DEADZONE)wanted.add('s')
  if(x<-DEADZONE)wanted.add('a')
  if(x>DEADZONE)wanted.add('d')
  for(const key of held){if(!wanted.has(key)){keyEvent('keyup',key);held.delete(key)}}
  for(const key of wanted){if(!held.has(key)){keyEvent('keydown',key);held.add(key)}}
}
function syncSemanticButtons(buttons:Record<string,boolean>={},source:StreetVerseInput['source']='remote'){
  const next=new Set(Object.entries(buttons).filter(([,pressed])=>Boolean(pressed)).map(([name])=>name))
  for(const name of next){
    if(!heldButtons.has(name)){
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-action',{detail:{action:name,pressed:true,source,timestamp:performance.now()}}))
      heldButtons.add(name)
    }
  }
  for(const name of [...heldButtons]){
    if(!next.has(name)){
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-action',{detail:{action:name,pressed:false,source,timestamp:performance.now()}}))
      heldButtons.delete(name)
    }
  }
}
function releaseAll(){syncKeys(0,0);syncSemanticButtons({})}
function applyInput(source:StreetVerseInput['source'],raw:any){
  const x=clamp(Number(raw?.x)||0),y=clamp(Number(raw?.y)||0)
  const buttons=raw?.buttons&&typeof raw.buttons==='object'?raw.buttons:{}
  syncKeys(x,y)
  syncSemanticButtons(buttons,source)
  emit({source,x,y,buttons,timestamp:performance.now()})
}

export function installStreetVerseInputRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  installUniversalIntentRuntime()
  installFonStreetVerseTransport()

  let raf=0
  const poll=()=>{
    const pads=typeof navigator.getGamepads==='function'?Array.from(navigator.getGamepads()).filter(Boolean):[]
    const pad=pads[0] as Gamepad|undefined
    if(pad){
      const x=clamp(Math.abs(pad.axes[0]||0)>DEADZONE?(pad.axes[0]||0):0)
      const y=clamp(Math.abs(pad.axes[1]||0)>DEADZONE?(pad.axes[1]||0):0)
      const buttons={
        primary:!!pad.buttons[0]?.pressed,
        secondary:!!pad.buttons[1]?.pressed,
        menu:!!pad.buttons[9]?.pressed,
        sprint:!!pad.buttons[10]?.pressed,
      }
      applyInput('gamepad',{x,y,buttons})
    }
    raf=requestAnimationFrame(poll)
  }
  raf=requestAnimationFrame(poll)

  window.addEventListener('gamepadconnected',(e:Event)=>{
    const g=(e as GamepadEvent).gamepad
    window.dispatchEvent(new CustomEvent('tryamm:controller-status',{detail:{connected:true,index:g.index,id:g.id,mapping:g.mapping}}))
  })
  window.addEventListener('gamepaddisconnected',(e:Event)=>{
    const g=(e as GamepadEvent).gamepad
    releaseAll()
    window.dispatchEvent(new CustomEvent('tryamm:controller-status',{detail:{connected:false,index:g.index,id:g.id}}))
  })

  window.addEventListener('tryamm:remote-controller-input',(e:Event)=>applyInput('remote',(e as CustomEvent<any>).detail||{}))
  window.addEventListener('tryamm:touch-controller-input',(e:Event)=>applyInput('touch',(e as CustomEvent<any>).detail||{}))
  window.addEventListener('tryamm:universal-controller-input',(e:Event)=>applyInput('intent',(e as CustomEvent<any>).detail||{}))
  window.addEventListener('blur',releaseAll)
  document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseAll()})

  ;(window as any).__streetverseController={
    inject:(input:{x?:number;y?:number;buttons?:Record<string,boolean>})=>window.dispatchEvent(new CustomEvent('tryamm:remote-controller-input',{detail:input})),
    capabilities:{
      keyboard:true,
      touch:true,
      gamepad:typeof navigator.getGamepads==='function',
      remoteEventBridge:true,
      crossDeviceTransport:true,
      universalIntent:true,
      nonInvasiveAdapters:true,
      webxr:'xr'in navigator
    },
    release:releaseAll,
    note:'Unified StreetVerse input runtime. Holo FON cross-device transport uses authenticated private Supabase Realtime; non-invasive EEG/EOG/EMG adapters feed calibrated intent samples through __tryammIntent.'
  }

  return()=>{
    cancelAnimationFrame(raf)
    releaseAll()
  }
}
