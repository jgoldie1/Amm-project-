export type WorldBroadcastCandidate={
 id:string;kind:'streetverse-live'|'mission'|'business'|'creator'|'sports'|'community';title:string;formatId:string;scene:string;createdAt:string;source:string;detail:Record<string,unknown>
}
const KEY='tryamm.world-to-broadcast.queue.v1'
const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
const save=(rows:WorldBroadcastCandidate[])=>{try{localStorage.setItem(KEY,JSON.stringify(rows.slice(-50)))}catch{}}
const make=(kind:WorldBroadcastCandidate['kind'],title:string,formatId:string,scene:string,source:string,detail:Record<string,unknown>):WorldBroadcastCandidate=>({id:'w2b-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),kind,title,formatId,scene,createdAt:new Date().toISOString(),source,detail})

export function installStreetVerseBroadcastConvergenceRuntime(){
 if(typeof window==='undefined')return()=>{}
 let queue=read() as WorldBroadcastCandidate[]
 const emit=(reason:string)=>window.dispatchEvent(new CustomEvent('tryamm:world-to-broadcast-state',{detail:{reason,queue:[...queue].reverse(),count:queue.length}}))
 const push=(row:WorldBroadcastCandidate)=>{queue=[...queue,row].slice(-50);save(queue);emit('candidate')}
 const onLive=(event:Event)=>{const d=(event as CustomEvent<Record<string,unknown>>).detail||{};if(d.live===false||d.ended===true)return;push(make('streetverse-live',String(d.title||'StreetVerse LIVE From The World'),'streetverse-live','gaming','tryamm:live-session',d))}
 const onMission=(event:Event)=>{const d=(event as CustomEvent<Record<string,unknown>>).detail||{};push(make('mission','Mission Story • '+String(d.title||d.missionId||'StreetVerse'),'streetverse-live','gaming','tryamm:streetverse-mission-complete',d))}
 const onBusiness=(event:Event)=>{const d=(event as CustomEvent<Record<string,unknown>>).detail||{};push(make('business','Business Spotlight • '+String(d.name||d.businessName||'Local Business'),'business-showcase','shopping','tryamm:business-passport-created',d))}
 const onReel=(event:Event)=>{const d=(event as CustomEvent<Record<string,unknown>>).detail||{};push(make('creator','Creator Spotlight • '+String(d.title||'New Reel'),'creator-spotlight','interview','tryamm:reel-published',d))}
 const onSports=(event:Event)=>{const d=(event as CustomEvent<Record<string,unknown>>).detail||{};push(make('sports','SportsVerse • '+String(d.title||d.eventName||'Game Event'),'sports-desk','sports','tryamm:sportverse-event-complete',d))}
 const onRequest=()=>emit('request')
 const onLoad=(event:Event)=>{const id=String((event as CustomEvent<{id?:string}>).detail?.id||'');const row=queue.find(x=>x.id===id);if(!row)return;window.dispatchEvent(new CustomEvent('tryamm:broadcast-studio-update',{detail:{scene:row.scene,programTitle:row.title,formatId:row.formatId}}));window.dispatchEvent(new CustomEvent('tryamm:world-to-broadcast-loaded',{detail:row}))}
 addEventListener('tryamm:live-session',onLive)
 addEventListener('tryamm:streetverse-mission-complete',onMission)
 addEventListener('tryamm:business-passport-created',onBusiness)
 addEventListener('tryamm:reel-published',onReel)
 addEventListener('tryamm:sportverse-event-complete',onSports)
 addEventListener('tryamm:world-to-broadcast-request',onRequest)
 addEventListener('tryamm:world-to-broadcast-load',onLoad)
 emit('startup')
 return()=>{removeEventListener('tryamm:live-session',onLive);removeEventListener('tryamm:streetverse-mission-complete',onMission);removeEventListener('tryamm:business-passport-created',onBusiness);removeEventListener('tryamm:reel-published',onReel);removeEventListener('tryamm:sportverse-event-complete',onSports);removeEventListener('tryamm:world-to-broadcast-request',onRequest);removeEventListener('tryamm:world-to-broadcast-load',onLoad)}
}