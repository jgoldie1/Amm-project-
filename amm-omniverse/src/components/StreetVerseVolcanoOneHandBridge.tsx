import {useEffect,useRef,useState} from 'react'

const MODE_KEY='tryamm:streetverse-control-mode'
const HAND_KEY='tryamm:streetverse-one-hand-side'
const MOVE_EVENT='tryamm:streetverse-world-input'
type Hand='left'|'right'
type RemoteCommand={mode?:string;command?:string}
const move=(x:number,y:number,interact=false)=>
  window.dispatchEvent(new CustomEvent(MOVE_EVENT,{detail:{move:{x,y},interact,source:'volcano-one-hand'}}))
const cruiseEvent=(active:boolean)=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-cruise',{detail:{active,source:'volcano-one-hand'}}))

/** Accessible companion controls mounted on the canonical /streetverse route. */
export default function StreetVerseVolcanoOneHandBridge(){
  const [hand,setHand]=useState<Hand>(()=>{try{return localStorage.getItem(HAND_KEY)==='right'?'right':'left'}catch{return 'left'}})
  const [enabled,setEnabled]=useState(()=>{try{return localStorage.getItem(MODE_KEY)==='one-hand'}catch{return false}})
  const [driving,setDriving]=useState(false)
  const [autoWalk,setAutoWalk]=useState(false)
  const [cruise,setCruise]=useState(false)
  const [controller,setController]=useState(false)
  const [turn,setTurn]=useState<-1|0|1>(0)
  const releaseRef=useRef<number|undefined>(undefined)
  const turnReleaseRef=useRef<number|undefined>(undefined)
  const suppressPadRef=useRef(false)
  const autoWalkRef=useRef(autoWalk)
  const drivingRef=useRef(driving)
  const turnRef=useRef(turn)
  autoWalkRef.current=autoWalk
  drivingRef.current=driving
  turnRef.current=turn

  const stop=()=>{
    suppressPadRef.current=true // require a connected physical stick to return to neutral
    window.clearTimeout(releaseRef.current)
    window.clearTimeout(turnReleaseRef.current)
    autoWalkRef.current=false
    turnRef.current=0
    setAutoWalk(false)
    setTurn(0)
    setCruise(false)
    cruiseEvent(false)
    move(0,0)
    window.dispatchEvent(new Event('tryamm:streetverse-emergency-stop'))
  }

  const changeMode=()=>{
    const next=!enabled
    if(!next)stop()
    setEnabled(next)
    try{localStorage.setItem(MODE_KEY,next?'one-hand':'two-hand');localStorage.setItem(HAND_KEY,hand)}catch{}
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-control-mode',{detail:{mode:next?'one-hand':'two-hand',hand,source:'volcano-one-hand'}}))
    window.dispatchEvent(new CustomEvent('tryamm:passport-access-save',{detail:{oneHandedMode:next,oneHand:hand}}))
  }

  const changeHand=()=>{
    const next:Hand=hand==='left'?'right':'left'
    setHand(next)
    try{localStorage.setItem(HAND_KEY,next)}catch{}
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-one-hand-side',{detail:{hand:next,source:'volcano-one-hand'}}))
    if(enabled){
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-control-mode',{detail:{mode:'one-hand',hand:next,source:'volcano-one-hand'}}))
      window.dispatchEvent(new CustomEvent('tryamm:passport-access-save',{detail:{oneHandedMode:true,oneHand:next}}))
    }
  }

  const tapTurn=(direction:-1|1)=>{
    window.clearTimeout(turnReleaseRef.current)
    setTurn(direction)
    turnRef.current=direction
    move(direction*.7,autoWalkRef.current&&!drivingRef.current?-.55:0)
    turnReleaseRef.current=window.setTimeout(()=>{
      turnRef.current=0
      setTurn(0)
      move(0,autoWalkRef.current&&!drivingRef.current?-.55:0)
    },650)
  }

  useEffect(()=>{
    // Shell or Passport changes must update this overlay too, without feedback loops.
    const onMode=(event:Event)=>{
      const d=(event as CustomEvent<{mode?:string;hand?:string;source?:string}>).detail||{}
      if(d.mode==='one-hand'){
        setEnabled(true)
        if(d.hand==='left'||d.hand==='right')setHand(d.hand)
      }else if(d.mode==='two-hand'){
        setEnabled(false)
        setAutoWalk(false)
        setTurn(0)
      }
    }
    const onSide=(event:Event)=>{
      const d=(event as CustomEvent<{hand?:string}>).detail||{}
      if(d.hand==='left'||d.hand==='right')setHand(d.hand)
    }
    window.addEventListener('tryamm:streetverse-control-mode',onMode)
    window.addEventListener('tryamm:streetverse-one-hand-side',onSide)
    return()=>{
      window.removeEventListener('tryamm:streetverse-control-mode',onMode)
      window.removeEventListener('tryamm:streetverse-one-hand-side',onSide)
    }
  },[])

  useEffect(()=>{
    const onVehicle=(event:Event)=>{
      const occupied=Boolean((event as CustomEvent<{entered?:boolean}>).detail?.entered)
      setDriving(occupied);setAutoWalk(false);autoWalkRef.current=false
      if(!occupied){setCruise(false);cruiseEvent(false)}
      else if(enabled)setCruise(true) // MobileGameShell auto-enables one-hand cruise upon entry
    }
    const onCruiseState=(event:Event)=>setCruise(Boolean((event as CustomEvent<{active?:boolean}>).detail?.active))
    window.addEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)
    window.addEventListener('tryamm:streetverse-cruise-state',onCruiseState)
    return()=>{
      window.removeEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)
      window.removeEventListener('tryamm:streetverse-cruise-state',onCruiseState)
    }
  },[enabled])

  useEffect(()=>{
    if(!enabled||!autoWalk||driving||controller)return
    const steer=()=>turnRef.current*.7
    move(steer(),-.55)
    const timer=window.setInterval(()=>move(steer(),-.55),100)
    return()=>{window.clearInterval(timer);move(0,0)}
  },[enabled,autoWalk,driving,controller])

  useEffect(()=>{
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
  },[driving])

  useEffect(()=>{
    // Only active gamepad input is emitted; an idle pad never blocks the onscreen joystick.
    let previousActive=false,previousButton=false,lastFound=false
    const id=window.setInterval(()=>{
      let pad:Gamepad|null|undefined
      try{pad=navigator.getGamepads?.()?.find(Boolean)}catch{return}
      const hasPad=Boolean(pad)
      if(hasPad!==lastFound){setController(hasPad);lastFound=hasPad}
      if(!pad){if(previousActive)move(0,0);previousActive=false;previousButton=false;return}
      const axis=(i:number)=>{const n=Number(pad?.axes[i]||0);return Number.isFinite(n)&&Math.abs(n)>.18?Math.max(-1,Math.min(1,n)):0}
      const x=axis(0),y=axis(1)
      const pressed=Boolean(pad.buttons[0]?.pressed)
      const active=x!==0||y!==0
      if(suppressPadRef.current){
        if(active||pressed){if(previousActive)move(0,0);previousActive=false;previousButton=pressed;return}
        suppressPadRef.current=false
      }
      const forward=autoWalkRef.current&&!drivingRef.current&&y===0?-.55:y
      const steering=x!==0?x:turnRef.current*.7
      if(active||previousActive||pressed&&!previousButton||forward!==0||steering!==0)move(steering,forward,pressed&&!previousButton)
      previousActive=active||forward!==0||steering!==0;previousButton=pressed
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

  useEffect(()=>()=>{window.clearTimeout(releaseRef.current);window.clearTimeout(turnReleaseRef.current);move(0,0);cruiseEvent(false)},[])

  const button:React.CSSProperties={minHeight:48,border:'1px solid #5fc9f0',borderRadius:12,padding:'8px 10px',background:'#092333f2',color:'#f0feff',fontSize:12,fontWeight:850,touchAction:'manipulation'}
  return <div aria-label="One-hand StreetVerse controls" style={{position:'fixed',bottom:'calc(env(safe-area-inset-bottom, 0px) + 185px)',[hand==='left'?'left':'right']:10,zIndex:17020,display:'grid',gap:6,width:'min(254px, 65vw)',fontFamily:'system-ui,sans-serif'}}>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
      <button style={button} aria-pressed={enabled} onClick={changeMode}>{enabled?'♿ ONE HAND ON':'♿ ONE HAND'}</button>
      <button style={button} onClick={changeHand} aria-label="Switch one-hand controls to the other side">{hand==='left'?'✋ LEFT SIDE':'✋ RIGHT SIDE'}</button>
    </div>
    {enabled&&<>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
        <button aria-label={driving?'Toggle cruise control':'Toggle automatic walking'} aria-pressed={driving?cruise:autoWalk} onClick={()=>{if(driving){setCruise(v=>{cruiseEvent(!v);return !v})}else setAutoWalk(v=>!v)}} style={{...button,background:driving&&cruise||!driving&&autoWalk?'#0b6654ed':'#092333f2'}}>{driving?(cruise?'🚗 CRUISE ON':'🚗 CRUISE'):autoWalk?'🚶 WALKING':'🚶 AUTO WALK'}</button>
        <button aria-label="Stop player movement and cruise" onClick={stop} style={{...button,background:'#742929f2',borderColor:'#ff9b96'}}>■ STOP</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
        <button aria-label="Tap to steer left" onClick={()=>tapTurn(-1)} style={{...button,background:turn===-1?'#155c74':'#092333f2'}}>◀ TURN</button>
        <button aria-label="Tap to steer right" onClick={()=>tapTurn(1)} style={{...button,background:turn===1?'#155c74':'#092333f2'}}>TURN ▶</button>
      </div>
      <span role="status" aria-live="polite" style={{fontSize:10,color:'#b7f2ff',textAlign:'center'}}>Tap TURN while moving • {controller?'🎮 gamepad connected':'phone touch ready'}</span>
    </>}
  </div>
}
