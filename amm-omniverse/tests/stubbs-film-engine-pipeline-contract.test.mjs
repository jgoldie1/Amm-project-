import {test} from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const pipeline=fs.readFileSync(new URL('../src/runtime/StubbsFilmEnginePipeline.ts',import.meta.url),'utf8')
const blender=fs.readFileSync(new URL('../tools/blender/stubbs_film_scene.py',import.meta.url),'utf8')
test('film pipeline requires verification, rights and human approval',()=>{
 for(const k of ['job_not_verified','missing_verified_output','rights_review_required','human_approval_required'])assert.ok(pipeline.includes(k),k)
 assert.match(pipeline,/device-test/)
 assert.doesNotMatch(pipeline,/\bfetch\s*\(|\bexec\s*\(/)
})
test('blender scene builder is bounded and offline',()=>{
 for(const k of ['Unsupported scene schema','1-32 camera shots','Camera vectors out of bounds','save_as_mainfile'])assert.ok(blender.includes(k),k)
 assert.doesNotMatch(blender,/subprocess|urllib|requests|os\.system|eval\s*\(/)
})
