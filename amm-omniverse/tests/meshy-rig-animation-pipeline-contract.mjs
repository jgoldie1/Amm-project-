import fs from 'node:fs'
import assert from 'node:assert/strict'

const lib=fs.readFileSync(new URL('../api/_lib/meshy.js',import.meta.url),'utf8')
const rig=fs.readFileSync(new URL('../api/meshy/rig.js',import.meta.url),'utf8')
const rigTask=fs.readFileSync(new URL('../api/meshy/rig-task.js',import.meta.url),'utf8')
const animation=fs.readFileSync(new URL('../api/meshy/animation.js',import.meta.url),'utf8')
const animationTask=fs.readFileSync(new URL('../api/meshy/animation-task.js',import.meta.url),'utf8')
const factory=fs.readFileSync(new URL('../src/runtime/MeshyRigFactory.ts',import.meta.url),'utf8')

for(const token of ['/rigging','/animations','createMeshyRiggingTask','getMeshyRiggingTask','rigged_character_glb_url','walking_glb_url','running_glb_url'])assert.ok(lib.includes(token),'Meshy provider helper missing '+token)
for(const src of [rig,rigTask,animation,animationTask])assert.ok(src.includes('requireUser'),'Meshy rig/animation route must require authenticated user')
assert.ok(rig.includes('keyExposed:false'),'rigging route must not expose provider key')
assert.ok(animation.includes('keyExposed:false'),'animation route must not expose provider key')
for(const token of ['/api/meshy/rig','/api/meshy/rig-task','/api/meshy/animation','/api/meshy/animation-task','SV_HERO_BJ_STUBBS_V6.glb','STREETVERSE_MESHY_CHARACTER_SLOTS','publishOnlyAfterSucceeded:true','neverInventProviderTaskIds:true'])assert.ok(factory.includes(token),'rig factory missing '+token)
assert.ok(factory.includes('rigAfterTextOrImageGeneration:true'),'base mesh must be rigged after generation')
console.log('MESHY RIG + ANIMATION PIPELINE CONTRACT PASS')
