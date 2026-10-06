import {CHICAGO_77_SLICES} from '../config/streetverseCommunitySlices'

export type Chicago77Era='past'|'present'|'future'|'alternate'
export type Chicago77MemoryNode={
 areaNumber:string;name:string;visits:number;missionsCompleted:number;businessEvents:number;creatorMoments:number;
 faithMoments:number;educationMoments:number;lastEra:Chicago77Era;lastVisitedAt:string|null;memoryScore:number;livingScore:number;
}

const KEY='tryamm.chicago77.memory-mesh.v1'
const emptyNode=(areaNumber:string,name:string):Chicago77MemoryNode=>({areaNumber,name,visits:0,missionsCompleted:0,businessEvents:0,creatorMoments:0,faithMoments:0,educationMoments:0,lastEra:'present',lastVisitedAt:null,memoryScore:0,livingScore:0})
const score=(n:Chicago77MemoryNode)=>{
 n.memoryScore=Math.min(100,n.visits*2+n.missionsCompleted*7+n.businessEvents*5+n.creatorMoments*4+n.faithMoments*3+n.educationMoments*3)
 n.livingScore=Math.min(100,20+n.missionsCompleted*5+n.businessEvents*6+n.creatorMoments*4+n.educationMoments*4+n.faithMoments*3)
 return n
}
function initial(){return Object.fromEntries(CHICAGO_77_SLICES.map(s=>[s.communityAreaNumber,emptyNode(s.communityAreaNumber,s.name)])) as Record<string,Chicago77MemoryNode>}
function read(){try{const base=initial();const raw=JSON.parse(localStorage.getItem(KEY)||'{}');for(const [k,v] of Object.entries(raw||{})){if(base[k])base[k]=score({...base[k],...(v as Partial<Chicago77MemoryNode>)})}return base}catch{return initial()}}
function save(nodes:Record<string,Chicago77MemoryNode>){try{localStorage.setItem(KEY,JSON.stringify(nodes))}catch{}}
function emit(nodes:Record<string,Chicago77MemoryNode>,reason:string){window.dispatchEvent(new CustomEvent('tryamm:chicago77-memory-mesh-state',{detail:{reason,nodes,totalAreas:77,connectedAreas:Object.values(nodes).filter(n=>n.visits>0||n.memoryScore>0).length}}))}
function areaFromDetail(detail:Record<string,unknown>){const raw=String(detail.communityAreaNumber||detail.areaNumber||detail.community||'');return /^\d{1,2}$/.test(raw)?raw:''}

export function installChicago77LivingMemoryMeshRuntime(){
 if(typeof window==='undefined')return()=>{}
 let nodes=read()
 const mutate=(area:string,fn:(node:Chicago77MemoryNode)=>void,reason:string)=>{const n=nodes[area];if(!n)return;fn(n);score(n);save(nodes);emit(nodes,reason)}
 const onVisit=(event:Event)=>{const d=(event as CustomEvent<Record<string,unknown>>).detail||{};const area=areaFromDetail(d);if(area)mutate(area,n=>{n.visits+=1;n.lastVisitedAt=new Date().toISOString()},'visit')}
 const onMission=(event:Event)=>{const d=(event as CustomEvent<Record<string,unknown>>).detail||{};const area=areaFromDetail(d);if(area)mutate(area,n=>{n.missionsCompleted+=1},'mission')}
 const onBusiness=(event:Event)=>{const d=(event as CustomEvent<Record<string,unknown>>).detail||{};const area=areaFromDetail(d);if(area)mutate(area,n=>{n.businessEvents+=1},'business')}
 const onCreator=(event:Event)=>{const d=(event as CustomEvent<Record<string,unknown>>).detail||{};const area=areaFromDetail(d);if(area)mutate(area,n=>{n.creatorMoments+=1},'creator')}
 const onFaith=(event:Event)=>{const d=(event as CustomEvent<Record<string,unknown>>).detail||{};const area=areaFromDetail(d);if(area)mutate(area,n=>{n.faithMoments+=1},'faith')}
 const onEducation=(event:Event)=>{const d=(event as CustomEvent<Record<string,unknown>>).detail||{};const area=areaFromDetail(d);if(area)mutate(area,n=>{n.educationMoments+=1},'education')}
 const onEra=(event:Event)=>{const d=(event as CustomEvent<Record<string,unknown>>).detail||{};const area=areaFromDetail(d);const era=String(d.era||'present') as Chicago77Era;if(area&&['past','present','future','alternate'].includes(era))mutate(area,n=>{n.lastEra=era},'era')}
 addEventListener('tryamm:streetverse-community-slice-ready',onVisit)
 addEventListener('tryamm:streetverse-mission-complete',onMission)
 addEventListener('tryamm:business-passport-created',onBusiness)
 addEventListener('tryamm:open-reel-creator',onCreator)
 addEventListener('tryamm:faithverse-community-moment',onFaith)
 addEventListener('tryamm:education-community-moment',onEducation)
 addEventListener('tryamm:time-machine-community-era',onEra)
 const onRequest=()=>emit(nodes,'request')
 addEventListener('tryamm:chicago77-memory-mesh-request',onRequest)
 emit(nodes,'startup')
 return()=>{removeEventListener('tryamm:streetverse-community-slice-ready',onVisit);removeEventListener('tryamm:streetverse-mission-complete',onMission);removeEventListener('tryamm:business-passport-created',onBusiness);removeEventListener('tryamm:open-reel-creator',onCreator);removeEventListener('tryamm:faithverse-community-moment',onFaith);removeEventListener('tryamm:education-community-moment',onEducation);removeEventListener('tryamm:time-machine-community-era',onEra);removeEventListener('tryamm:chicago77-memory-mesh-request',onRequest)}
}