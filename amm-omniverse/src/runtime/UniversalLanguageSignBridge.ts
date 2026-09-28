export type TranslationModality='text'|'speech'|'captions'|'sign-avatar'|'sign-video'
export type LanguageCapability={tag:string;name:string;modalities:TranslationModality[];certified:boolean;signLanguage?:boolean;region?:string}
const capabilities=new Map<string,LanguageCapability>()
export function registerLanguageCapability(c:LanguageCapability){capabilities.set(c.tag.toLowerCase(),{...c,modalities:[...new Set(c.modalities)]});return c}
export function getLanguageCapability(tag:string){return capabilities.get(tag.toLowerCase())}
export function planTranslation(input:{sourceTag:string;targetTag:string;preferred:TranslationModality[];contentType?:string}){
 const target=getLanguageCapability(input.targetTag)
 if(!target||!target.certified)return {status:'fallback' as const,targetTag:input.targetTag,modality:'captions' as const,reason:'target-language-model-not-certified'}
 const modality=input.preferred.find(m=>target.modalities.includes(m))??(target.modalities.includes('text')?'text':target.modalities[0])
 if(!modality)return {status:'fallback' as const,targetTag:input.targetTag,modality:'captions' as const,reason:'no-certified-output-modality'}
 return {status:'ready' as const,targetTag:target.tag,modality,signLanguage:Boolean(target.signLanguage)}
}
export function installUniversalLanguageBridge(){
 if(typeof window==='undefined')return()=>{}
 const handler=(e:Event)=>{const d=(e as CustomEvent<{sourceTag:string;targetTag:string;preferred:TranslationModality[];contentType?:string}>).detail;if(!d)return
  window.dispatchEvent(new CustomEvent('tryamm:translation-plan',{detail:{...planTranslation(d),sourceTag:d.sourceTag,contentType:d.contentType}}))
 }
 window.addEventListener('tryamm:translation-request',handler)
 window.dispatchEvent(new CustomEvent('tryamm:universal-language-ready',{detail:{signLanguagesAreDistinct:true,certificationRequired:true}}))
 return()=>window.removeEventListener('tryamm:translation-request',handler)
}
// Initial capability declarations; providers/models must still be connected and certified.
registerLanguageCapability({tag:'en-US',name:'English (US)',modalities:['text','speech','captions'],certified:true,region:'US'})
registerLanguageCapability({tag:'ase',name:'American Sign Language',modalities:['sign-avatar','sign-video','captions'],certified:false,signLanguage:true,region:'US'})
registerLanguageCapability({tag:'bfi',name:'British Sign Language',modalities:['sign-avatar','sign-video','captions'],certified:false,signLanguage:true,region:'GB'})
registerLanguageCapability({tag:'nsi',name:'Nigerian Sign Language',modalities:['sign-avatar','sign-video','captions'],certified:false,signLanguage:true,region:'NG'})
