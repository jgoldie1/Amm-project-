import {STREETVERSE_RESOURCE_EVENTS,type StreetVerseResourceCategory} from '../data/streetVerseResourceNetwork'
const KEY='tryamm.resource-passport.v1'
const read=():StreetVerseResourceCategory[]=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
const save=(used:Set<StreetVerseResourceCategory>)=>{const value=[...used];try{localStorage.setItem(KEY,JSON.stringify(value))}catch{};window.dispatchEvent(new CustomEvent('tryamm:resource-passport-updated',{detail:{used:value,count:value.length}}))}
export function installStreetVerseResourcePassportRuntime(){
 const used=new Set<StreetVerseResourceCategory>(read())
 const handlers:Array<[string,(e:Event)=>void]>=[]
 const add=(event:string,category:StreetVerseResourceCategory)=>{const fn=(e:Event)=>{let c=category;const d=(e as CustomEvent<Record<string,unknown>>).detail||{};if(event==='tryamm:circle-park-activity-progress'){const a=String(d.activity||'');if(a==='barbecue')c='food';else if(a==='social')c='community';else if(a==='swimming')c='wellness'}if(event==='tryamm:senior-commons-activity'&&String(d.activityId||'')==='movement')c='wellness';used.add(c);save(used)};window.addEventListener(event,fn);handlers.push([event,fn])}
 Object.entries(STREETVERSE_RESOURCE_EVENTS).forEach(([event,category])=>add(event,category))
 save(used)
 return{getUsed:()=>[...used],dispose:()=>handlers.forEach(([event,fn])=>window.removeEventListener(event,fn))}
}
export const STREETVERSE_RESOURCE_PASSPORT_KEY=KEY
