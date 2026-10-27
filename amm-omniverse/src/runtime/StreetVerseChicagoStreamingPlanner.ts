/** StreetVerse Chicago district streaming planner — pure staging; no asset fetches or world mutations. */
import {createDistrictPack,type CityDistrict,type DistrictPack} from './StreetVerseChicagoDistrictGenerator'
export type DistrictNode={id:CityDistrict;neighbors:CityDistrict[]}
export const CHICAGO_DISTRICT_GRAPH:DistrictNode[]=[
{id:'circle-park',neighbors:['taylor']},
{id:'taylor',neighbors:['circle-park','roosevelt','pilsen']},
{id:'roosevelt',neighbors:['taylor','west-side','downtown']},
{id:'pilsen',neighbors:['taylor','downtown']},
{id:'west-side',neighbors:['roosevelt','downtown']},
{id:'downtown',neighbors:['roosevelt','pilsen','west-side']}]
const GRAPH=new Map(CHICAGO_DISTRICT_GRAPH.map(n=>[n.id,n.neighbors]))
export type StreamBudget={maxResidentDistricts:number;maxBuildings:number;quality:'low'|'medium'|'high'}
export type StreamPlan={resident:DistrictPack[];deferred:CityDistrict[];rejected:boolean;reason:string;totalBuildings:number}
const ALL=CHICAGO_DISTRICT_GRAPH.map(n=>n.id)
export function planChicagoStream(current:CityDistrict,seed:number,budget:StreamBudget):StreamPlan{
 if(!GRAPH.has(current)||!Number.isSafeInteger(seed)||!Number.isInteger(budget.maxResidentDistricts)||budget.maxResidentDistricts<1||budget.maxResidentDistricts>3||
 !Number.isInteger(budget.maxBuildings)||budget.maxBuildings<1||budget.maxBuildings>500||!['low','medium','high'].includes(budget.quality))
  return{resident:[],deferred:[...ALL],rejected:true,reason:'invalid_stream_budget',totalBuildings:0}
 const candidates=[current,...GRAPH.get(current)!]
 const resident:DistrictPack[]=[]
 let totalBuildings=0
 for(const id of candidates){
  if(resident.length>=budget.maxResidentDistricts)break
  const pack=createDistrictPack(id,{seed:seed+ALL.indexOf(id)*17,size:id==='circle-park'?2:6,quality:budget.quality})
  const count=pack.blocks.reduce((sum,b)=>sum+b.buildingCount,0)
  if(totalBuildings+count>budget.maxBuildings)continue
  resident.push(pack);totalBuildings+=count
 }
 return{resident,deferred:ALL.filter(id=>!resident.some(p=>p.district===id)),rejected:!resident.some(p=>p.district===current),
 reason:resident.some(p=>p.district===current)?'staging_plan_ready':'current_district_exceeds_budget',totalBuildings}
}
export const DEFAULT_MOBILE_BUDGET:StreamBudget=Object.freeze({maxResidentDistricts:1,maxBuildings:120,quality:'low'})
export const DEFAULT_DESKTOP_BUDGET:StreamBudget=Object.freeze({maxResidentDistricts:2,maxBuildings:450,quality:'medium'})
