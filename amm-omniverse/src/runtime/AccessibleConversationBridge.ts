import {planTranslation,planSignedVocabulary,TranslationModality} from './UniversalLanguageSignBridge'
export type ConversationInputMode='text'|'speech'|'sign-camera'|'aac'|'gesture'
export type ConversationProfile={languageTag:string;signLanguageTag?:string;region?:string;inputModes:ConversationInputMode[];outputModes:TranslationModality[];captionsAlways:boolean;speechOptional:boolean}
export type AccessibleTurn={id:string;inputMode:ConversationInputMode;text?:string;signGloss?:string;confidence?:number}
export function routeAccessibleTurn(profile:ConversationProfile,turn:AccessibleTurn){
 if(turn.inputMode==='sign-camera'&&(!profile.signLanguageTag||typeof turn.confidence!=='number'||turn.confidence<.85))
  return {status:'clarify' as const,reason:'sign-recognition-not-certified-or-low-confidence',offer:['type','aac','repeat-sign','human-interpreter']}
 const sourceTag=turn.inputMode==='sign-camera'?(profile.signLanguageTag??profile.languageTag):profile.languageTag
 const plan=planTranslation({sourceTag,targetTag:profile.languageTag,preferred:profile.outputModes,contentType:'conversation'})
 const sign=profile.signLanguageTag&&turn.signGloss?planSignedVocabulary({signLanguageTag:profile.signLanguageTag,term:turn.signGloss,region:profile.region}):undefined
 return {status:'ready' as const,sourceTag,translation:plan,sign,captions:profile.captionsAlways,speech:profile.speechOptional}
}
export function installAccessibleConversationBridge(){
 if(typeof window==='undefined')return()=>{}
 const handler=(e:Event)=>{const d=(e as CustomEvent<{profile:ConversationProfile;turn:AccessibleTurn}>).detail;if(!d)return
  window.dispatchEvent(new CustomEvent('tryamm:accessible-conversation-route',{detail:routeAccessibleTurn(d.profile,d.turn)}))
 }
 window.addEventListener('tryamm:accessible-conversation-turn',handler)
 window.dispatchEvent(new CustomEvent('tryamm:accessible-conversation-ready',{detail:{twoWay:true,speechRequired:false,captionsAvailable:true}}))
 return()=>window.removeEventListener('tryamm:accessible-conversation-turn',handler)
}
