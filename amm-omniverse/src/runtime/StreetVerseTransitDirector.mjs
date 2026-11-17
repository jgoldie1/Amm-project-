/** StreetVerse transport QA — proposed movement, NOT automatic player teleport or live CTA data. */
export const STREETVERSE_TRANSIT_STOPS=Object.freeze([
 {id:'circle-park',label:'Circle Park • Chicago',city:'chicago',mode:'walk',worldStatus:'existing-code'},
 {id:'west-side-el',label:'West Side L • fictional platform',city:'chicago',mode:'rail',worldStatus:'visual-preview'},
 {id:'roosevelt',label:'Roosevelt • Chicago',city:'chicago',mode:'rail',worldStatus:'visual-preview'},
 {id:'taylor-uic',label:'Taylor / UIC • Chicago',city:'chicago',mode:'rail',worldStatus:'existing-code'},
 {id:'detroit',label:'Detroit • arrival preview',city:'detroit',mode:'intercity',worldStatus:'preview-only'},
 {id:'tampa',label:'Tampa • arrival preview',city:'tampa',mode:'intercity',worldStatus:'preview-only'},
 {id:'memphis',label:'Memphis • arrival preview',city:'memphis',mode:'intercity',worldStatus:'preview-only'},
 {id:'atlanta',label:'Atlanta • arrival preview',city:'atlanta',mode:'intercity',worldStatus:'preview-only'},
 {id:'lagos',label:'Lagos • international preview',city:'lagos',mode:'international',worldStatus:'preview-only'},
 {id:'addis-ababa',label:'Addis Ababa • international preview',city:'addis-ababa',mode:'international',worldStatus:'preview-only'}
]);
export const STREETVERSE_TRANSIT_RECOMMENDED_ROUTE=Object.freeze(['circle-park','west-side-el','roosevelt','taylor-uic','detroit','tampa','memphis','atlanta'])
export const STREETVERSE_TRANSIT_CONTRACT=Object.freeze({cashFare:false,paidTickets:false,actualBoarding:false,authoritativeWorldTransfer:false,liveGTFS:false,liveCTA:false,externalLocationTracking:false,simulatedReceiptsOnly:true})
export function planStreetVerseTransit(from,to){
 const a=STREETVERSE_TRANSIT_STOPS.find(s=>s.id===from),b=STREETVERSE_TRANSIT_STOPS.find(s=>s.id===to)
 if(!a||!b||a.id===b.id)return {ok:false,status:'INVALID_STOPS',simulated:true}
 const local=a.city==='chicago'&&b.city==='chicago'
 return {ok:true,from:a,to:b,routeType:local?'chicago-el-preview':'global-transport-preview',
    playableTransfer:false,authoritativeSave:false,boardingVerified:false,weatherVerified:false,
    riderPositionUnchanged:true,priceMinor:0,simulated:true,requires:['verified arrival scene','validated player spawn','seated character animation','save/load acceptance','authorized transport occupancy']}
}
export function smokeTestTransit(){
 const results=STREETVERSE_TRANSIT_RECOMMENDED_ROUTE.slice(1).map((id,i)=>planStreetVerseTransit(STREETVERSE_TRANSIT_RECOMMENDED_ROUTE[i],id))
 return {schema:'tryamm.streetverse.transit-smoke.v1',allPlansValid:results.every(x=>x.ok),legs:results,simulationOnly:true,actualBoardingVerified:false,actualStreamingVerified:false,saveRestoreVerified:false}
}
export function installStreetVerseTransitDirector(){
 if(typeof window==='undefined')return ()=>{}
 const handler=e=>{const detail=e?.detail||{},result=planStreetVerseTransit(detail.from,detail.to);window.dispatchEvent(new CustomEvent('tryamm:streetverse-transit-result',{detail:result}))}
 window.addEventListener('tryamm:streetverse-transit-plan',handler)
 return ()=>window.removeEventListener('tryamm:streetverse-transit-plan',handler)
}
