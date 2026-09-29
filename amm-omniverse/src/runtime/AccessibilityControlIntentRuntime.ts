import type {IntentRequest} from './UniversalIntentRouter'

function announce(text:string){
 if(typeof window==='undefined')return
 window.dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text}}))
}

export function installAccessibilityControlIntentRuntime(){
 if(typeof window==='undefined')return()=>{}
 let captions=false
 const onProfile=(event:Event)=>{
  const d=(event as CustomEvent<{captions?:boolean}>).detail
  if(typeof d?.captions==='boolean')captions=d.captions
 }
 const onIntent=(event:Event)=>{
  const r=(event as CustomEvent<IntentRequest>).detail
  if(!r)return
  if(r.intent==='set-left-hand'||r.intent==='set-right-hand'){
   const hand=r.intent==='set-left-hand'?'left':'right'
   window.dispatchEvent(new CustomEvent('tryamm:passport-access-save',{detail:{oneHandedMode:true,oneHand:hand}}))
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-control-mode',{detail:{mode:'one-hand',hand,source:r.source}}))
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-one-hand-side',{detail:{hand,source:r.source}}))
   announce(`One-hand controls set to the ${hand} hand.`)
   return
  }
  if(r.intent==='set-two-hand'){
   window.dispatchEvent(new CustomEvent('tryamm:passport-access-save',{detail:{oneHandedMode:false}}))
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-control-mode',{detail:{mode:'two-hand',source:r.source}}))
   announce('Two-hand controls enabled.')
   return
  }
  if(r.intent==='toggle-captions'){
   captions=!captions
   window.dispatchEvent(new CustomEvent('tryamm:passport-access-save',{detail:{captions}}))
   announce(captions?'Captions enabled.':'Captions disabled.')
   return
  }
  if(r.intent==='reduce-motion'){
   window.dispatchEvent(new CustomEvent('tryamm:passport-access-save',{detail:{reducedMotion:true}}))
   announce('Reduced motion enabled.')
   return
  }
  if(r.intent==='open-accessibility'){
   window.dispatchEvent(new CustomEvent('tryamm:open-accessibility-passport'))
   announce('Accessibility Passport opened.')
  }
 }
 window.addEventListener('tryamm:accessibility-apply',onProfile)
 window.addEventListener('tryamm:universal-intent-action',onIntent)
 window.dispatchEvent(new CustomEvent('tryamm:accessibility-control-intents-ready',{detail:{hands:['left','right','two-hand'],captions:true,reducedMotion:true,menu:true}}))
 return()=>{window.removeEventListener('tryamm:accessibility-apply',onProfile);window.removeEventListener('tryamm:universal-intent-action',onIntent)}
}
