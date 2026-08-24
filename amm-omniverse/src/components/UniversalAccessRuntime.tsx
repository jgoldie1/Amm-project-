import {useEffect,useState} from 'react'
import {applyAccessibilityPreferences,loadAccessibilityPassport,type AccessibilityPreferences} from '../accessibility/accessibilityPassport'

type RuntimeState={prefs:AccessibilityPreferences;preferredLanguage:string;captions:boolean;announce:string}

export default function UniversalAccessRuntime(){
  const [state,setState]=useState<RuntimeState>(()=>{
    const passport=loadAccessibilityPassport()
    const language=localStorage.getItem('tryamm.preferredLanguage')||navigator.language||'en'
    return {prefs:passport.preferences,preferredLanguage:language,captions:Boolean(passport.preferences.captions),announce:''}
  })

  useEffect(()=>{
    applyAccessibilityPreferences(state.prefs)
    const root=document.documentElement
    root.lang=(state.preferredLanguage||'en').split('-')[0]
    root.dataset.tryammLanguage=state.preferredLanguage||'en'
    root.dataset.tryammCaptions=state.captions?'true':'false'
    root.dataset.tryammOneHand=state.prefs.oneHandedMode?'true':'false'
    root.dataset.tryammScreenReader=state.prefs.screenReader?'true':'false'
    root.dataset.tryammSwitchAccess=state.prefs.switchAccess?'true':'false'
    root.dataset.tryammReducedMotion=state.prefs.reducedMotion?'true':'false'
    root.dataset.tryammSimplified=state.prefs.simplifiedUI?'true':'false'
  },[state])

  useEffect(()=>{
    const onPassport=(event:Event)=>{
      const detail=(event as CustomEvent<any>).detail
      if(detail?.preferences)setState(s=>({...s,prefs:detail.preferences,captions:Boolean(detail.preferences.captions)}))
    }
    const onLanguage=(event:Event)=>{
      const detail=(event as CustomEvent<any>).detail
      const next=String(detail?.language||detail?.code||'').trim()
      if(!next)return
      localStorage.setItem('tryamm.preferredLanguage',next)
      setState(s=>({...s,preferredLanguage:next}))
    }
    const announce=(event:Event)=>{
      const detail=(event as CustomEvent<any>).detail
      const text=String(detail?.text||detail?.label||detail?.message||'').trim()
      if(text)setState(s=>({...s,announce:text}))
    }
    const gift=(event:Event)=>{
      const d=(event as CustomEvent<any>).detail||{}
      const label=String(d.label||d.giftType||'gift').replace(/[-_]/g,' ')
      setState(s=>({...s,announce:`${label} gift received`}))
    }
    window.addEventListener('tryamm:accessibility-passport-updated',onPassport)
    window.addEventListener('tryamm:language-changed',onLanguage)
    window.addEventListener('tryamm:accessibility-announce',announce)
    window.addEventListener('tryamm:holo-gift',gift)
    return()=>{
      window.removeEventListener('tryamm:accessibility-passport-updated',onPassport)
      window.removeEventListener('tryamm:language-changed',onLanguage)
      window.removeEventListener('tryamm:accessibility-announce',announce)
      window.removeEventListener('tryamm:holo-gift',gift)
    }
  },[])

  useEffect(()=>{
    ;(window as any).__tryammAccess={
      getState:()=>state,
      announce:(text:string)=>window.dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text}})),
      setLanguage:(language:string)=>window.dispatchEvent(new CustomEvent('tryamm:language-changed',{detail:{language}})),
      openPassport:()=>window.dispatchEvent(new CustomEvent('tryamm:open-accessibility-passport')),
      openRemote:()=>((window as any).__showOmniAccess?.()),
      openSign:()=>((window as any).__showSignLanguage?.()),
      openWearable:()=>((window as any).__showOmniWear?.()),
    }
  },[state])

  return <>
    <div aria-live="polite" aria-atomic="true" style={srOnly}>{state.announce}</div>
    {state.captions&&state.announce&&<div role="status" style={{position:'fixed',left:'50%',bottom:18,transform:'translateX(-50%)',zIndex:13000,maxWidth:'min(92vw,760px)',padding:'9px 14px',borderRadius:12,background:'rgba(0,0,0,.88)',border:'1px solid rgba(79,227,255,.45)',color:'#fff',fontSize:14,textAlign:'center',pointerEvents:'none'}}>{state.announce}</div>}
  </>
}

const srOnly:React.CSSProperties={position:'absolute',width:1,height:1,padding:0,margin:-1,overflow:'hidden',clip:'rect(0,0,0,0)',whiteSpace:'nowrap',border:0}
