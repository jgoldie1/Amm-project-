import {TranslationModality,planTranslation} from './UniversalLanguageSignBridge'
export type AccessNeed='mobility'|'vision'|'hearing'|'speech'|'cognitive'|'neurodivergent'|'temporary'|'situational'
export type AdaptiveAccessProfile={languageTag:string;needs:AccessNeed[];oneHand?:'left'|'right';voiceControl?:boolean;switchControl?:boolean;screenReader?:boolean;largeTargets?:boolean;reducedMotion?:boolean;highContrast?:boolean;captions?:boolean;textToSpeech?:boolean;speechToText?:boolean;simpleLanguage?:boolean;signLanguageTag?:string}
export function buildAdaptiveExperience(p:AdaptiveAccessProfile){
 const features=new Set<string>(['keyboard-navigation','touch-navigation','language-selector'])
 if(p.oneHand)features.add('one-hand-controls:'+p.oneHand)
 if(p.voiceControl)features.add('voice-control')
 if(p.switchControl)features.add('switch-control')
 if(p.screenReader)features.add('semantic-screen-reader')
 if(p.largeTargets||p.needs.includes('mobility'))features.add('large-targets')
 if(p.reducedMotion)features.add('reduced-motion')
 if(p.highContrast||p.needs.includes('vision'))features.add('high-contrast')
 if(p.captions||p.needs.includes('hearing'))features.add('captions')
 if(p.textToSpeech||p.needs.includes('vision'))features.add('text-to-speech')
 if(p.speechToText||p.needs.includes('speech'))features.add('speech-to-text')
 if(p.simpleLanguage||p.needs.includes('cognitive'))features.add('plain-language')
 if(p.signLanguageTag)features.add('sign-language:'+p.signLanguageTag)
 const preferred:TranslationModality[]=p.signLanguageTag?['sign-avatar','captions','text']:p.captions?['captions','text','speech']:['text','speech','captions']
 return {features:[...features],translation:planTranslation({sourceTag:'en-US',targetTag:p.languageTag,preferred,contentType:'universal-ui'}),continuousLocationRequired:false}
}
export function installUniversalAccessOrchestrator(){
 if(typeof window==='undefined')return()=>{}
 const handler=(e:Event)=>{const p=(e as CustomEvent<AdaptiveAccessProfile>).detail;if(!p)return;window.dispatchEvent(new CustomEvent('tryamm:adaptive-experience',{detail:buildAdaptiveExperience(p)}))}
 window.addEventListener('tryamm:access-profile',handler)
 window.dispatchEvent(new CustomEvent('tryamm:universal-access-ready',{detail:{combinableProfiles:true,translationForAll:true}}))
 return()=>window.removeEventListener('tryamm:access-profile',handler)
}
