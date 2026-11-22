import test from 'node:test'
import assert from 'node:assert/strict'
import ts from 'typescript'
import {readFileSync} from 'node:fs'
import {createRequire} from 'node:module'
const require=createRequire(import.meta.url)
function load(path, deps={}){
 const source=readFileSync(new URL('../src/'+path,import.meta.url),'utf8')
 const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
 const module={exports:{}}
 new Function('require','module','exports',output)(id=>Object.hasOwn(deps,id)?deps[id]:require(id),module,module.exports)
 return module.exports
}
const reuse=load('agents/reuseRegistry.ts')
const {executeBuildUnits,parallelWaves}=load('agents/quantumSpeedEngine.ts',{'./reuseRegistry':reuse})
const forge=load('game/forger/StreetVerseWorldForger.ts')
const asset=load('data/TryammAssetForge.ts')
const unit=(id,dependencies=[],risk='low')=>({id,dependencies,risk,goal:id,lane:'world',evidence:['runtime']})
test('parallel execution respects dependencies and concurrency',async()=>{
 let active=0,peak=0
 const result=await executeBuildUnits([unit('a'),unit('b'),unit('c',['a','b'])],async(u,deps)=>{
  active++;peak=Math.max(peak,active)
  if(u.id==='c')assert.equal(deps.size,2)
  await new Promise(r=>setTimeout(r,5));active--
  return {verified:true,artifact:u.id}
 },{concurrency:2})
 assert.equal(peak,2);assert.ok(result.every(r=>r.state==='verified'))
})
test('failed evidence blocks descendants in reverse order',async()=>{
 const result=await executeBuildUnits([unit('c',['b']),unit('b',['a']),unit('a')],async()=>({verified:false,artifact:''}))
 assert.deepEqual(result.map(r=>r.state),['blocked','blocked','failed'])
})
test('invalid graphs and unauthorized risky work fail closed',async()=>{
 assert.throws(()=>parallelWaves([unit('a'),unit('a')]))
 assert.throws(()=>parallelWaves([unit('a',['b'])]))
 const r=await executeBuildUnits([unit('a',[],'high')],async()=>{assert.fail('must not execute')})
 assert.equal(r[0].state,'failed')
})
test('native world CAD and asset budgets agree',()=>{
 const source={id:'original',kind:'conceptual',rightsCleared:true}
 for(const floors of [1,2,4]){
  const cad=forge.createBuildingCadPlan({id:'campus',label:'Campus',widthM:24,depthM:18,floors,sourceIds:[source.id],conceptualOnly:true})
  const recipe=forge.makeWorldForgeRecipe({id:'campus',label:'Campus',kind:'building',districtId:'greenville',sourceIds:[source.id],cadPlanId:cad.id,prompt:'original',target:'none',textureWrap:'procedural'})
  const job=asset.createAssetFactoryJob('campus','building','mobile')
  recipe.runtime.mobileTriangleBudget=Math.min(recipe.runtime.mobileTriangleBudget,job.maxTriangles)
  assert.equal(recipe.meshy.required,false)
  assert.deepEqual(forge.validateForgeRecipe(recipe,[source],cad),[])
 }
})

test('independent jobs survive another lane failing',async()=>{
 const result=await executeBuildUnits([unit('bad'),unit('good'),unit('dependent',['bad']),unit('next',['good'])],async u=>{
  if(u.id==='bad')throw new Error('adapter failure')
  return {verified:true,artifact:u.id}
 },{concurrency:2})
 assert.deepEqual(result.map(r=>r.state),['failed','verified','blocked','verified'])
})
test('empty artifact and cyclic graphs never certify',async()=>{
 const r=await executeBuildUnits([unit('a')],async()=>({verified:true,artifact:'   '}))
 assert.equal(r[0].state,'failed')
 await assert.rejects(executeBuildUnits([unit('a',['b']),unit('b',['a'])],async()=>({verified:true,artifact:'x'})))
})
test('empty queue is safe and invalid concurrency falls back',async()=>{
 assert.deepEqual(await executeBuildUnits([],async()=>{assert.fail('unexpected execution')}),[])
 const r=await executeBuildUnits([unit('a')],async()=>({verified:true,artifact:'a'}),{concurrency:NaN})
 assert.equal(r[0].state,'verified')
})
