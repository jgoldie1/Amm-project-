export type BroadcastScene='news-desk'|'interview'|'podcast'|'sports'|'faith'|'shopping'|'gaming'|'virtual-set'
export type BroadcastDestination='tryamm-live'|'omnibox'|'all-american-network'|'servants-of-christ-network'|'recording'
export type BroadcastState={scene:BroadcastScene;programLive:boolean;recording:boolean;chromaKey:boolean;teleprompter:boolean;lowerThirds:boolean;captions:boolean;guestInputs:number;destinations:BroadcastDestination[];rightsCleared:boolean;operatorRole:string}

const KEY='tryamm_broadcast_studio_v1'
let installed=false
const DEFAULT:BroadcastState={scene:'news-desk',programLive:false,recording:false,chromaKey:true,teleprompter:true,lowerThirds:true,captions:true,guestInputs:0,destinations:['recording'],rightsCleared:false,operatorRole:'producer'}
const SCENES:BroadcastScene[]=['news-desk','interview','podcast','sports','faith','shopping','gaming','virtual-set']
const DESTINATIONS:BroadcastDestination[]=['tryamm-live','omnibox','all-american-network','servants-of-christ-network','recording']

function read():BroadcastState{try{return {...DEFAULT,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return DEFAULT}}
function write(state:BroadcastState){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
function publish(state:BroadcastState){write(state);window.dispatchEvent(new CustomEvent('tryamm:broadcast-studio-state',{detail:{schema:'tryamm.broadcast.v1',state,scenes:SCENES,destinations:DESTINATIONS,features:['camera-mic-ingest','screen-share','green-screen','background-replacement','program-preview','scene-switching','lower-thirds','logos','scorebugs','teleprompter','captions','remote-guests','recording','multistream-routing','rundown','rights-gate','middleverse-remote-production'],at:Date.now()}}))}

export function installBroadcastStudioRuntime(){
 if(installed||typeof window==='undefined')return;installed=true
 let state=read();queueMicrotask(()=>publish(state))
 window.addEventListener('tryamm:broadcast-studio-request',()=>publish(state))
 window.addEventListener('tryamm:broadcast-studio-update',(e:Event)=>{const d=(e as CustomEvent<Partial<BroadcastState>>).detail||{};state={...state,...d};publish(state)})
 window.addEventListener('tryamm:broadcast-scene-select',(e:Event)=>{const scene=(e as CustomEvent<any>).detail?.scene;if(SCENES.includes(scene)){state={...state,scene};publish(state)}})
 window.addEventListener('tryamm:broadcast-go-live',()=>{if(!state.rightsCleared){window.dispatchEvent(new CustomEvent('tryamm:broadcast-blocked',{detail:{reason:'rights-clearance-required'}}));return}state={...state,programLive:true};publish(state)})
 window.addEventListener('tryamm:broadcast-stop',()=>{state={...state,programLive:false,recording:false};publish(state)})
 window.addEventListener('tryamm:broadcast-record',(e:Event)=>{state={...state,recording:Boolean((e as CustomEvent<any>).detail?.enabled)};publish(state)})
 window.addEventListener('tryamm:middleverse-shift-started',(e:Event)=>{const lane=(e as CustomEvent<any>).detail?.lane;if(lane==='streamer'||lane==='creator'||lane==='moderator')window.dispatchEvent(new CustomEvent('tryamm:broadcast-workforce-ready',{detail:{lane}}))})
}
