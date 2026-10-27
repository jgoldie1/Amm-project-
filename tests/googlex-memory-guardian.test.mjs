import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {spawnSync} from 'node:child_process'
const worker=new URL('../scripts/googlex-memory-guardian.mjs',import.meta.url)
test('guardian reads an allowlisted checkpoint and never needs cloud access',()=>{
 const root=mkdtempSync(join(tmpdir(),'googlex-'))
 try{
  const files=['README.md','AGENTS.md','.agents/skills/googlex-quantum-memory/SKILL.md','docs/architecture/GOOGLEX_MEMORY_GITHUB_CONTINUITY_BRIDGE.md','docs/gameplay/STREETVERSE_LEGACY_MECHANICS_PRESERVATION_AUDIT_2026-10.md']
  for(const name of files){mkdirSync(join(root,name,'..'),{recursive:true});writeFileSync(join(root,name),'demo source')}
  const out=join(root,'checkpoint.json')
  const run=spawnSync(process.execPath,[worker.pathname,root,out],{encoding:'utf8',env:{...process.env,GOOGLEX_WORKER_AUTHORIZED:'true',GOOGLEX_PROJECT_APPROVED:'true'}})
  assert.equal(run.status,0,run.stderr)
  const result=JSON.parse(readFileSync(out,'utf8'))
  assert.equal(result.authorized,true)
  assert.equal(result.publicSources.length,5)
  assert.ok(result.checkpointId.length===64)
  assert.equal(result.privacy.noModelCalls,true)
  assert.equal(result.privacy.noDeploy,true)
  assert.equal(result.existingModules.googleX.status,'missing')
 }finally{rmSync(root,{recursive:true,force:true})}
})
