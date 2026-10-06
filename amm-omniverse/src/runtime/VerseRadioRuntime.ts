import type {CrossVersePlatform} from './CrossVerseConsentRuntime'

export type VerseRadioTrack={id:string;title:string;artist:string;url:string;genre?:string;publicAuthorized:true;artworkUrl?:string}
export type VerseRadioState={open:boolean;playing:boolean;needsTap:boolean;track:VerseRadioTrack|null;position:number;duration:number;verseRoute:string;platform:CrossVersePlatform;station:string;volume:number}

const KEY='tryamm.verse-radio.v1'
const cleanRoute=()=>typeof location==='undefined'?'/':(location.pathname||'/').replace(/\/+$/,'')||'/'
const platformForRoute=(route:string):CrossVersePlatform=>{
 if(route.startsWith('/streetverse'))return'streetverse'
 if(route.includes('faith')||route.includes('kingdom')||route.includes('bible'))return'faithverse'
 if(route.includes('music'))return'musicverse'
 if(route.includes('star'))return'starverse'
 if(route.includes('sport'))return'sportverse'
 if(route==='/live')return'tryamm-live'
 if(route.startsWith('/reels'))return'tryamm-reels'
 return'holoverse'
}
const safeUrl=(raw:string)=>{try{const u=new URL(raw,location.origin);return u.protocol==='https:'||u.origin===location.origin}catch{return false}}

function readSaved(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}
function save(state:VerseRadioState){try{localStorage.setItem(KEY,JSON.stringify({track:state.track,position:state.position,station:state.station,volume:state.volume}))}catch{}}
function emit(state:VerseRadioState,reason:string){window.dispatchEvent(new CustomEvent('tryamm:verse-radio-state',{detail:{...state,reason,rightsAware:true,serverSettlementRequired:true}}))}

export function installVerseRadioRuntime(){
 if(typeof window==='undefined')return()=>{}
 const w=window as typeof window&{__TRYAMM_VERSE_RADIO__?:{getState:()=>VerseRadioState;open:()=>void;play:(track:VerseRadioTrack)=>Promise<boolean>;pause:()=>void;resume:()=>Promise<boolean>}}
 if(w.__TRYAMM_VERSE_RADIO__)return()=>{}
 const audio=new Audio()
 audio.preload='metadata'
 audio.crossOrigin='anonymous'
 const saved=readSaved()
 const route=cleanRoute()
 let state:VerseRadioState={open:false,playing:false,needsTap:Boolean(saved?.track),track:saved?.track||null,position:Number(saved?.position)||0,duration:0,verseRoute:route,platform:platformForRoute(route),station:String(saved?.station||'musicverse-radio'),volume:Math.max(0,Math.min(1,Number(saved?.volume??.82)))}
 audio.volume=state.volume
 if(state.track&&safeUrl(state.track.url))audio.src=state.track.url

 const publish=(reason:string)=>{state.verseRoute=cleanRoute();state.platform=platformForRoute(state.verseRoute);state.position=Number.isFinite(audio.currentTime)?audio.currentTime:state.position;state.duration=Number.isFinite(audio.duration)?audio.duration:0;save(state);emit(state,reason)}
 const play=async(track:VerseRadioTrack)=>{
   if(!track?.publicAuthorized||!safeUrl(track.url))return false
   state.track={...track}
   state.needsTap=false
   if(audio.src!==new URL(track.url,location.origin).href){audio.src=track.url;audio.currentTime=0}
   try{await audio.play();state.playing=true;state.needsTap=false;publish('play')}
   catch{state.playing=false;state.needsTap=true;state.open=true;publish('tap-required');return false}
   window.dispatchEvent(new CustomEvent('tryamm:music-sync-play-event',{detail:{trackId:track.id,title:track.title,artist:track.artist,platform:state.platform,use:'verse-radio',contextId:state.verseRoute,qualified:false,rightsAware:true,serverVerificationRequired:true}}))
   return true
 }
 const pause=()=>{audio.pause();state.playing=false;publish('pause')}
 const resume=async()=>{if(!state.track)return false;try{if(audio.src==='')audio.src=state.track.url;if(state.position>0&&audio.currentTime===0)audio.currentTime=state.position;await audio.play();state.playing=true;state.needsTap=false;publish('resume');return true}catch{state.needsTap=true;state.open=true;publish('tap-required');return false}}
 const open=()=>{state.open=true;publish('open')}
 const close=()=>{state.open=false;publish('close')}
 const setStation=(station:string)=>{state.station=String(station||'musicverse-radio');state.open=true;publish('station')}
 const setVolume=(volume:number)=>{state.volume=Math.max(0,Math.min(1,Number(volume)||0));audio.volume=state.volume;publish('volume')}

 const onPlay=(event:Event)=>{const track=(event as CustomEvent<{track?:VerseRadioTrack}>).detail?.track;if(track)void play(track)}
 const onOpen=()=>open()
 const onPause=()=>pause()
 const onResume=()=>{void resume()}
 const onClose=()=>close()
 const onStation=(event:Event)=>setStation(String((event as CustomEvent<{station?:string}>).detail?.station||''))
 const onVolume=(event:Event)=>setVolume(Number((event as CustomEvent<{volume?:number}>).detail?.volume??state.volume))
 const onTime=()=>{state.position=audio.currentTime||0;if(Math.floor(state.position)%5===0)save(state)}
 const onLoaded=()=>{if(state.position>0&&audio.duration>state.position)try{audio.currentTime=state.position}catch{};publish('metadata')}
 const onEnded=()=>{state.playing=false;state.position=0;publish('ended')}
 const onVisibility=()=>{if(!document.hidden)publish('verse-resume')}

 addEventListener('tryamm:verse-radio-play',onPlay)
 addEventListener('tryamm:verse-radio-open',onOpen)
 addEventListener('tryamm:verse-radio-pause',onPause)
 addEventListener('tryamm:verse-radio-resume',onResume)
 addEventListener('tryamm:verse-radio-close',onClose)
 addEventListener('tryamm:verse-radio-station',onStation)
 addEventListener('tryamm:verse-radio-volume',onVolume)
 document.addEventListener('visibilitychange',onVisibility)
 audio.addEventListener('timeupdate',onTime)
 audio.addEventListener('loadedmetadata',onLoaded)
 audio.addEventListener('ended',onEnded)

 w.__TRYAMM_VERSE_RADIO__={getState:()=>({...state}),open,play,pause,resume}
 publish(saved?.track?'restored-needs-tap':'startup')
 return()=>{pause();audio.src='';removeEventListener('tryamm:verse-radio-play',onPlay);removeEventListener('tryamm:verse-radio-open',onOpen);removeEventListener('tryamm:verse-radio-pause',onPause);removeEventListener('tryamm:verse-radio-resume',onResume);removeEventListener('tryamm:verse-radio-close',onClose);removeEventListener('tryamm:verse-radio-station',onStation);removeEventListener('tryamm:verse-radio-volume',onVolume);document.removeEventListener('visibilitychange',onVisibility);audio.removeEventListener('timeupdate',onTime);audio.removeEventListener('loadedmetadata',onLoaded);audio.removeEventListener('ended',onEnded);delete w.__TRYAMM_VERSE_RADIO__}
}

export const VERSE_RADIO_STATIONS=[
 {id:'musicverse-radio',label:'MusicVerse Radio',genres:[]},
 {id:'streetverse-radio',label:'StreetVerse Radio',genres:['hip-hop','rap','r&b','rnb','afrobeats','amapiano','house']},
 {id:'faithverse-praise',label:'FaithVerse Praise',genres:['gospel','worship','christian','praise']},
 {id:'starverse-radio',label:'StarVerse Showcase',genres:['pop','r&b','rnb','hip-hop','dance']},
 {id:'sportverse-energy',label:'SportVerse Energy',genres:['hip-hop','rap','rock','edm','dance']},
 {id:'holoverse-radio',label:'HoloVerse Festival',genres:[]},
] as const