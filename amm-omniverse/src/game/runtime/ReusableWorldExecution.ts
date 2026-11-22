import {executeBuildUnits,type BuildUnit,type BuildExecutor} from '../../agents/quantumSpeedEngine'
import {compileGlobalWorld,type WorldCompilerStage,type GlobalWorldModule} from '../../data/GlobalWorldCompiler'

export type WorldStageAdapter=(context:{worldId:string;module:GlobalWorldModule;dependencies:ReadonlyMap<string,string>})=>Promise<{artifact:string;verified:boolean}>
export type WorldAdapters=Partial<Record<WorldCompilerStage,WorldStageAdapter>>
const dependencies:Record<WorldCompilerStage,WorldCompilerStage[]>={
 registry:[],geospatial:['registry'],environment:['registry','geospatial'],mobility:['geospatial'],
 population:['geospatial','environment'],business:['registry','geospatial'],missions:['mobility','population','business'],
 media:['registry'],economy:['business'],accessibility:['mobility','missions'],certification:['environment','mobility','population','business','missions','media','economy','accessibility']
}
/** Planning is not certification. Adapters must verify actual artifacts; missing adapters fail closed.
 * Commerce and certification require separate authorization from the trusted caller.
 */
export async function executeReusableWorld(worldId:string,adapters:WorldAdapters,options:{concurrency?:number;allowHighRisk?:boolean}={}){
 const plan=compileGlobalWorld(worldId)
 const modules=new Map(plan.modules.map(m=>[m.stage,m]))
 const units:BuildUnit[]=plan.modules.map(m=>({id:m.stage,goal:m.outputs.join(', '),lane:m.stage==='certification'?'guardian':m.stage==='economy'?'commerce':'world',risk:m.stage==='economy'||m.stage==='certification'?'high':'low',dependencies:[...dependencies[m.stage]],evidence:['runtime','test']}))
 const executor:BuildExecutor=async(unit,results)=>{
  const stage=unit.id as WorldCompilerStage
  const adapter=adapters[stage]
  if(!adapter)throw new Error('Missing verified world adapter: '+stage)
  return adapter({worldId:plan.cityId,module:modules.get(stage)!,dependencies:new Map([...results].map(([id,r])=>[id,r.artifact!]))})
 }
 const results=await executeBuildUnits(units,executor,options)
 return {worldId:plan.cityId,results,certified:results.every(r=>r.state==='verified')&&results.some(r=>r.id==='certification')}
}
