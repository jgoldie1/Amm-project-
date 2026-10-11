import {useEffect,useRef,useState} from 'react'

const MODE_KEY='tryamm:streetverse-control-mode'
const MOVE_EVENT='tryamm:streetverse-world-input'
type RemoteCommand={mode?:string;command?:string}
const move=(x:number,y:number,interact=false)=>
  window.dispatchEvent(new CustomEvent(MOVE_EVENT,{detail:{move:{x,y},interact,source:'volcano-one-hand'}}))
const cruiseEvent=(active:boolean)=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-cruise',{detail:{active,source:'volcano-one-hand'}}))

/** Runs on the canonical /streetverse route, even when Volcano's full-screen console is closed. */
export default function StreetVerseVolcanoOneHandBridge(){
  const [enabled,setEnabled]=useState(()=>{try{return localStorage.getItem(MODE_KEY)==='one-hand'}catch{return false}})
  const [driving,setDriving]=useState(false)
  const [autoWalk,setAutoWalk]=useState(false)
  const [cruise,setCruise]=useState(false)
  const [controller,setController]=useState(false)
  const releaseRef=useRef<number|undefined>(undefined)

  const stop=()=>{
    window.clearTimeout(releaseRef.current)
    setAutoWalk(false)
    setCruise(false)
    cruiseEvent(false)
    move(0,0)
    window.dispatchEvent(new Event('tryamm:streetverse-emergency-stop'))
  }
  const changeMode=()=>{
    if(enabled){stop();setEnabled(false)}
    else setEnabled(true)
    try{localStorage.setItem(MODE_KEY,enabled?'two-hand':'one-hand')}catch{}
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-control-mode',{detail:{mode:enabled?'two-hand':'one-hand',source:'volcano-one-hand'}}))
  }
  useEffect(()=>{
    if(enabled)window.dispatchEvent(new CustomEvent('tryamm:streetverse-control-mode',{detail:{mode:'one-hand',source:'volcano-one-hand'}}))
  },[]) // hydrate a previously saved accessibility choice

  useEffect(()=>{
    const onVehicle=(event:Event)=>{
      const occupied=Boolean((event as CustomEvent<{entered?:boolean}>).detail?.entered)
      setDriving(occupied);setAutoWalk(false)
      if(!occupied){setCruise(false);cruiseEvent(false)}
    }
    const onCruiseState=(event:Event)=>setCruise(Boolean((event as CustomEvent<{active?:boolean}>).detail?.active))
    window.addEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)
    window.addEventListener('tryamm:streetverse-cruise-state',onCruiseState)
    return()=>{
      window.removeEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)
      window.removeEventListener('tryamm:streetverse-cruise-state',onCruiseState)
    }
  },[])

  useEffect(()=>{
    if(!enabled||!autoWalk||driving)return
    move(0,-.55)
    const timer=window.setInterval(()=>move(0,-.55),100)
    return()=>{window.clearInterval(timer);move(0,0)}
  },[enabled,autoWalk,driving])

  useEffect(()=>{
    if(!enabled)return
    const onRemote=(event:Event)=>{
      const d=(event as CustomEvent<RemoteCommand>).detail
      if(d?.mode!=='game')return
      const command=d.command
      if(command==='BRAKE'||command==='BACK'){stop();return}
      if(command==='AUTO_WALK'){if(!driving)setAutoWalk(current=>!current);return}
      if(command==='CRUISE'){
        if(driving)setCruise(current=>{const next=!current;cruiseEvent(next);return next})
        return
      }
      if(command==='SELECT'){move(0,0,true);return}
      const direction:Record<string,[number,number]>={UP:[0,-.75],DOWN:[0,.75],LEFT:[-.75,0],RIGHT:[.75,0]}
      const vector=direction[command||'']
      if(vector){
        setAutoWalk(false)
        window.clearTimeout(releaseRef.current)
        move(...vector)
        releaseRef.current=window.setTimeout(()=>move(0,0),180)
      }
    }
    window.addEventListener('tryamm:holo-fon-remote',onRemote)
    return()=>{window.clearTimeout(releaseRef.current);window.removeEventListener('tryamm:holo-fon-remote',onRemote)}
  },[enabled,driving])

  useEffect(()=>{
    // Browsers require the player to pair/activate a controller. Do not send neutral
    // polling frames that would overwrite an on-screen joystick.
    let previousActive=false,previousButton=false
    const id=window.setInterval(()=>{
      let pad:Gamepad|null|undefined
      try{pad=navigator.getGamepads?.()?.find(Boolean)}catch{return}
      const hasPad=Boolean(pad)
      setController(current=>current===hasPad?current:hasPad)
      if(!pad){if(previousActive)move(0,0);previousActive=false;previousButton=false;return}
      const axis=(i:number)=>{const n=Number(pad?.axes[i]||0);return Number.isFinite(n)&&Math.abs(n)>.18?Math.max(-1,Math.min(1,n)):0}
      const x=axis(0),y=axis(1)
      const pressed=Boolean(pad.buttons[0]?.pressed)
      const active=x!==0||y!==0
      if(active||previousActive||pressed&&!previousButton)move(x,y,pressed&&!previousButton)
      previousActive=active;previousButton=pressed
    },50)
    return()=>{window.clearInterval(id);if(previousActive)move(0,0)}
  },[])

  useEffect(()=>{
    const onVisibility=()=>{if(document.hidden)stop()}
    const onBlur=()=>stop()
    document.addEventListener('visibilitychange',onVisibility)
    window.addEventListener('blur',onBlur)
    return()=>{document.removeEventListener('visibilitychange',onVisibility);window.removeEventListener('blur',onBlur)}
  },[])

  const button:React.CSSProperties={minHeight:48,border:'1px solid #5fc9f0',borderRadius:12,padding:'10px 12px',background:'#092333f2',color:'#f0feff',fontSize:12,fontWeight:850,touchAction:'manipulation'}
  return <div aria-label="One-hand StreetVerse controls" style={{position:'fixed',bottom:'calc(env(safe-area-inset-bottom, 0px) + 234px)',right:10,zIndex:17020,display:'grid',gap:7,width:'min(156px, 38vw)',fontFamily:'system-ui,sans-serif'}}>
    <button style={button} aria-pressed={enabled} onClick={changeMode}>{enabled?'♿ ONE HAND ON':'♿ ONE HAND'}</button>
    {enabled&&<>
      <button aria-label={driving?'Toggle cruise control':'Toggle automatic walking'} aria-pressed={driving?cruise:autoWalk} onClick={()=>{if(driving){setCruise(v=>{cruiseEvent(!v);return !v})}else setAutoWalk(v=>!v)}} style={{...button,background:driving&&cruise||!driving&&autoWalk?'#0b6654ed':'#092333f2'}}>{driving?(cruise?'🚗 CRUISE ON':'🚗 CRUISE'):autoWalk?'🚶 WALKING':'🚶 AUTO WALK'}</button>
      <button aria-label="Stop player movement and cruise" onClick={stop} style={{...button,background:'#742929f2',borderColor:'#ff9b96'}}>■ STOP</button>
    </>}
    {enabled&&controller&&<span role="status" style={{fontSize:10,color:'#b7f2ff',textAlign:'center'}}>🎮 GAMEPAD ACTIVE</span>}
  </div>
}
