import {test} from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {build} from 'esbuild'
const out=await build({entryPoints:[new URL('../src/runtime/AICafePlaygroundRuntime.ts',import.meta.url).pathname],bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent'})
const playground=await import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'))
const cafe=fs.readFileSync(new URL('../src/components/AICafeRestaurant.tsx',import.meta.url),'utf8')
const ui=fs.readFileSync(new URL('../src/components/AICafePlayground.tsx',import.meta.url),'utf8')
test('AI Cafe playground uses original JARVIS instead of duplicate model',()=>{
 assert.match(cafe,/AICafePlayground/)
 assert.match(cafe,/HoloGPTAssistant showLauncher=\{false\}/)
 assert.match(ui,/tryamm:hologpt-study-context/)
 assert.match(ui,/ASK JARVIS/)
})
test('Five supported exercises cover cafe, gameplay, characters and accessibility',()=>{
 assert.equal(playground.AI_CAFE_EXERCISES.length,5)
 for(const exercise of playground.AI_CAFE_EXERCISES){
  assert.ok(exercise.starterPrompt.length>20)
  assert.ok(exercise.checklist.length>=3)
  assert.equal(playground.findPlaygroundExercise(exercise.id).id,exercise.id)
 }
})
test('Practice reports cannot award work or fabricate verification',()=>{
 const x=playground.AI_CAFE_EXERCISES[0]
 const attempt={exerciseId:x.id,prompt:'test prompt',completedChecks:[...x.checklist,'invalid'],evidenceNote:'Draft notes',submittedAt:'2026-11-18',status:'verified'}
 const safe=playground.validatePlaygroundAttempt(attempt)
 assert.equal(safe.status,'self-reported')
 assert.equal(safe.completedChecks.length,x.checklist.length)
 assert.equal(playground.playgroundAttemptComplete(safe),true)
 assert.equal(playground.AI_CAFE_PLAYGROUND_POLICY.realMoney,false)
 assert.equal(playground.AI_CAFE_PLAYGROUND_POLICY.officialCredential,false)
 assert.equal(playground.AI_CAFE_PLAYGROUND_POLICY.automaticWorkerExecution,false)
})
test('Wrong exercise IDs and corrupted saves cannot fabricate completion',()=>{
 assert.equal(playground.validatePlaygroundAttempt({exerciseId:'unknown',prompt:'test',completedChecks:[],evidenceNote:''}),null)
 assert.deepEqual(playground.loadPlaygroundAttempts('{broken'),[])
 assert.equal(playground.playgroundAttemptComplete({exerciseId:'prompt-101',prompt:'test',completedChecks:[],submittedAt:'',status:'self-reported',evidenceNote:''}),false)
})
