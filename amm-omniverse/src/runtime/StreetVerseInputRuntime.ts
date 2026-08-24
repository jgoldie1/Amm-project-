export type StreetVerseInput={source:'keyboard'|'gamepad'|'remote'|'touch';x:number;y:number;buttons?:Record<string,boolean>;timestamp:number}

let installed=false
const DEADZONE=.18
const held=new Set<string>()

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

export function installStreetVerseInputRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true

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
      syncKeys(x,y)
      emit({source:'gamepad',x,y,buttons,timestamp:performance.now()})
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
    syncKeys(0,0)
    window.dispatchEvent(new CustomEvent('tryamm:controller-status',{detail:{connected:false,index:g.index,id:g.id}}))
  })

  window.addEventListener('tryamm:remote-controller-input',(e:Event)=>{
    const d=(e as CustomEvent<any>).detail||{}
    const x=clamp(Number(d.x)||0),y=clamp(Number(d.y)||0)
    syncKeys(x,y)
    emit({source:'remote',x,y,buttons:d.buttons||{},timestamp:performance.now()})
  })

  window.addEventListener('tryamm:touch-controller-input',(e:Event)=>{
    const d=(e as CustomEvent<any>).detail||{}
    const x=clamp(Number(d.x)||0),y=clamp(Number(d.y)||0)
    syncKeys(x,y)
    emit({source:'touch',x,y,buttons:d.buttons||{},timestamp:performance.now()})
  })

  ;(window as any).__streetverseController={
    inject:(input:{x?:number;y?:number;buttons?:Record<string,boolean>})=>window.dispatchEvent(new CustomEvent('tryamm:remote-controller-input',{detail:input})),
    capabilities:{keyboard:true,touch:true,gamepad:typeof navigator.getGamepads==='function',remoteEventBridge:true,crossDeviceTransport:false,webxr:false},
    note:'Bluetooth/USB controllers supported through the browser Gamepad API when the browser exposes them. Cross-device QR pairing still requires realtime signaling transport.'
  }
}
