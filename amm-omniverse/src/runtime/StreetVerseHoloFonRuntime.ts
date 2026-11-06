/** Offline-first fictional NPC phone. No real telephone dialing or microphone access. */
export type HoloFonContact='marcus'|'isaiah'|'kevon'|'teaasia'|'dispatch'
export type HoloFonStatus='idle'|'ringing'|'connected'
export type HoloFonState={status:HoloFonStatus;contact:HoloFonContact|null;muted:boolean;history:HoloFonContact[]}
export const HOLOFON_CONTACTS:Record<HoloFonContact,{name:string;line:string}>={
 marcus:{name:'Marcus',line:'BJ, meet me at Circle Park. Bring the car.'},
 isaiah:{name:'Isaiah',line:'Isaiah AI TV is ready. Meet me at the studio.'},
 kevon:{name:'Kevon',line:'The next StreetVerse job is waiting. Check the mission marker.'},
 teaasia:{name:'TeaAsia',line:'Stop by the beauty house after your delivery.'},
 dispatch:{name:'Chicago Dispatch',line:'Your UIC delivery is assigned. Follow the destination marker.'}
}
export const initialHoloFonState=():HoloFonState=>({status:'idle',contact:null,muted:false,history:[]})
export type HoloFonAction='dial'|'answer'|'reject'|'end'|'toggle-mute'
export function advanceHoloFon(state:HoloFonState,action:HoloFonAction,contact?:HoloFonContact):HoloFonState{
 if(action==='dial'&&state.status==='idle'&&contact&&HOLOFON_CONTACTS[contact])return {...state,status:'ringing',contact,muted:false}
 if(action==='answer'&&state.status==='ringing')return {...state,status:'connected'}
 if((action==='reject'||action==='end')&&state.status!=='idle')return {...state,status:'idle',contact:null,muted:false,history:state.contact?[state.contact,...state.history].slice(0,12):state.history}
 if(action==='toggle-mute'&&state.status==='connected')return {...state,muted:!state.muted}
 return state
}
