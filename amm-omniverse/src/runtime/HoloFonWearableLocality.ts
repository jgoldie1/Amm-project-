export type HoloFonForm='handheld'|'wrist-watch'|'floating-hologram'
export type Locality={country:string;stateOrProvince?:string;countyOrParish?:string;city?:string;source:'user-selected'|'permissioned-location'|'game-profile'}
export const HOLOFON_WEARABLE={forms:['handheld','wrist-watch','floating-hologram'] as HoloFonForm[],holdToEar:true,speakerphone:true,voiceCall:true,videoCall:true,holoCall:true,wristRaiseToWake:true,wristTapToAnswer:true,oneHandControls:true,controllerIsolation:true} as const
export function streetVerseLocalityName(l:Locality){return ['StreetVerse',l.city,l.countyOrParish,l.stateOrProvince,l.country].filter(Boolean).join(' · ')}
export function localityRequiresPermission(l:Locality){return l.source==='permissioned-location'}
