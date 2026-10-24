/** Original TRYAMM local-only neighborhood discovery; no payout or server privileges. */
export const ABLA_TOUR_KEY='tryamm.streetverse.abla-neighborhood-tour.v1'
export const ABLA_TOUR_STOPS=[
 {id:'circle-park-1111-laflin',title:'1111 S Laflin / Circle Park',x:-38,z:30,radius:9,chapter:'Arrive at the Circle Park entrance and discover its community courtyard.'},
 {id:'circle-park-activities',title:'Circle Park Basketball + Commons',x:-48,z:61,radius:11,chapter:'Explore the court, playground, and community gathering spaces.'},
 {id:'taylor-laflin',title:'Taylor Street + Laflin',x:-24,z:-8,radius:11,chapter:'Connect the ABLA neighborhood to Taylor Street and Little Italy.'},
 {id:'abla-village',title:'ABLA Village',x:54,z:56,radius:12,chapter:'Visit the game-reconstructed village and learn its neighborhood history.'},
 {id:'abla-new-homes',title:'ABLA New Homes',x:74,z:60,radius:12,chapter:'Walk to the new-home streetscape to complete the neighborhood trail.'},
] as const
export type ABLATourStopId=(typeof ABLA_TOUR_STOPS)[number]['id']
export type ABLATourState={schema:'tryamm.streetverse.abla-neighborhood-tour.v1';mode:'LOCAL_EXPLORATION';status:'idle'|'active'|'complete';nextIndex:number;visited:ABLATourStopId[];updatedAt:string}
const SCHEMA='tryamm.streetverse.abla-neighborhood-tour.v1'
export function createABLATour():ABLATourState{return {schema:SCHEMA,mode:'LOCAL_EXPLORATION',status:'idle',nextIndex:0,visited:[],updatedAt:new Date().toISOString()}}
export function startABLATour():ABLATourState{return {...createABLATour(),status:'active'}}
export function nextABLATourStop(tour:ABLATourState){return tour.status==='active'?ABLA_TOUR_STOPS[tour.nextIndex]??null:null}
export function advanceABLATour(tour:ABLATourState,x:number,z:number):ABLATourState{
 const next=nextABLATourStop(tour)
 if(!next||!Number.isFinite(x)||!Number.isFinite(z))return tour
 if(Math.hypot(x-next.x,z-next.z)>next.radius)return tour
 const nextIndex=tour.nextIndex+1
 return {...tour,nextIndex,visited:[...tour.visited,next.id],status:nextIndex===ABLA_TOUR_STOPS.length?'complete':'active',updatedAt:new Date().toISOString()}
}
export function normalizeABLATour(value:unknown):ABLATourState{
 const initial=createABLATour()
 if(!value||typeof value!=='object')return initial
 const raw=value as Partial<ABLATourState>
 if(raw.schema!==SCHEMA||raw.mode!=='LOCAL_EXPLORATION'||!Array.isArray(raw.visited))return initial
 const seen:ABLATourStopId[]=[]
 for(let i=0;i<Math.min(ABLA_TOUR_STOPS.length,raw.visited.length);i++){
  if(raw.visited[i]!==ABLA_TOUR_STOPS[i].id)break
  seen.push(ABLA_TOUR_STOPS[i].id)
 }
 const nextIndex=seen.length
 const status=nextIndex===ABLA_TOUR_STOPS.length?'complete':raw.status==='active'?'active':'idle'
 return {schema:SCHEMA,mode:'LOCAL_EXPLORATION',status,nextIndex,visited:seen,updatedAt:typeof raw.updatedAt==='string'?raw.updatedAt.slice(0,64):initial.updatedAt}
}
export function loadABLATour():ABLATourState{
 if(typeof window==='undefined')return createABLATour()
 try{const raw=localStorage.getItem(ABLA_TOUR_KEY);return raw&&raw.length<4000?normalizeABLATour(JSON.parse(raw)):createABLATour()}catch{return createABLATour()}
}
export function saveABLATour(tour:ABLATourState):ABLATourState{
 if(typeof window!=='undefined')try{localStorage.setItem(ABLA_TOUR_KEY,JSON.stringify(tour))}catch{}
 return tour
}
