import type {HoloFonContact} from './StreetVerseHoloFonRuntime'
/** Original, fictional NPC mission calls. No third-party voice cloning or real telephone service. */
export type HoloFonMission={id:string;caller:HoloFonContact;title:string;destination:string;line:string}
export const HOLOFON_MISSIONS:readonly HoloFonMission[]=[
 {id:'uic-delivery',caller:'dispatch',title:'UIC package delivery',destination:'UIC delivery checkpoint',line:'BJ, pick up your package and follow the UIC destination marker.'},
 {id:'circle-park-meet',caller:'marcus',title:'Meet Marcus',destination:'Circle Park',line:'BJ, come meet me at Circle Park. We need to talk.'},
 {id:'studio-show',caller:'isaiah',title:'Isaiah AI TV',destination:'StreetVerse studio',line:'BJ, come to the studio. We are preparing the next show.'},
 {id:'kevon-job',caller:'kevon',title:'Kevon job',destination:'Chicago job marker',line:'BJ, the next assignment is ready. Follow your map marker.'},
 {id:'teaasia-beauty',caller:'teaasia',title:'Beauty House visit',destination:'Beauty House',line:'BJ, stop by the beauty house when you are finished.'}
]
export function getHoloFonMission(id:string){return HOLOFON_MISSIONS.find(m=>m.id===id)||null}
export function speakHoloFonLine(text:string,onEnd?:()=>void):boolean{
 if(typeof window==='undefined'||!('speechSynthesis'in window)||!('SpeechSynthesisUtterance'in window))return false
 try{window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.rate=.95;utterance.pitch=1;utterance.volume=.85;utterance.onend=()=>onEnd?.();window.speechSynthesis.speak(utterance);return true}catch{return false}
}
export function stopHoloFonSpeech(){if(typeof window!=='undefined'&&'speechSynthesis'in window)window.speechSynthesis.cancel()}

/** Pilot positions in the existing bounded Chicago mobile scene, not real-world GPS. */
export const HOLOFON_SCENE_DESTINATIONS:Record<string,{x:number;z:number}>={
 'uic-delivery':{x:24,z:-8},
 'circle-park-meet':{x:0,z:49},
 'studio-show':{x:-28,z:18},
 'kevon-job':{x:-24,z:-36},
 'teaasia-beauty':{x:24,z:-8}
}
