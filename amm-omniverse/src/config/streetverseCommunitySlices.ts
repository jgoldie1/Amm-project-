export type StreetVerseMissionAnchor={id:string;label:string;x:number;y:number;kind:'transit'|'business-district'|'landmark'|'creator';reference:string}
export type StreetVerseCommunitySlice={communityAreaNumber:string;name:string;status:'BUILDING'|'CERTIFIED';missions:StreetVerseMissionAnchor[]}

export const HYDE_PARK_SLICE:StreetVerseCommunitySlice={
 communityAreaNumber:'41',
 name:'Hyde Park',
 status:'BUILDING',
 missions:[
  {id:'studio',label:'53rd Street Creator District',x:32,y:38,kind:'creator',reference:'E 53rd St • Hyde Park'},
  {id:'market',label:'53rd Street Business District',x:70,y:42,kind:'business-district',reference:'E 53rd St • Hyde Park'},
  {id:'river',label:'Lake Park & 53rd Transit Stop',x:52,y:22,kind:'transit',reference:'CTA corridor • Lake Park & 53rd'},
  {id:'stage',label:'Hyde Park Lakefront Creator Stage',x:68,y:72,kind:'landmark',reference:'Hyde Park lakefront'},
 ],
}

export function readSelectedCommunityArea(){
 try{
  const destination=JSON.parse(localStorage.getItem('tryamm.streetverse.chicago-destination.v2')||'null')
  return String(destination?.communityAreaNumber??destination?.id?.replace(/^ca-/,'')??'')
 }catch{return''}
}

export function getStreetVerseMissionSlice(){return readSelectedCommunityArea()==='41'?HYDE_PARK_SLICE:undefined}
