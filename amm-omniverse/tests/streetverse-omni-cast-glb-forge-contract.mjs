import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {spawnSync} from 'node:child_process'
const project=path.resolve(new URL('..',import.meta.url).pathname)
const script=path.join(project,'scripts','forge-streetverse-ensemble.mjs')
const result=spawnSync(process.execPath,[script],{encoding:'utf8',timeout:20000,maxBuffer:2*1024*1024,cwd:project})
assert.equal(result.status,0,(result.stderr||'')+'\n'+(result.stdout||''))
const report=JSON.parse(result.stdout.trim())
assert.equal(report.generated,73,'28 non-BJ family + 10 creators + 23 global + 12 original performers')
assert.ok(report.genreLanes>=40)
assert.equal(report.artistLikenessModels,0)
const folder=path.resolve(project,'..','artifacts','streetverse-omni-cast')
const manifest=JSON.parse(fs.readFileSync(path.join(folder,'ensemble-manifest.json'),'utf8'))
assert.equal(manifest.entries.length,73)
assert.equal(manifest.artistHistoryModelsGenerated,0)
assert.equal(manifest.musicRecordingsGenerated,0)
for(const row of manifest.entries){
 const buffer=fs.readFileSync(path.join(folder,row.file))
 assert.equal(buffer.readUInt32LE(0),0x46546c67)
 assert.equal(buffer.readUInt32LE(4),2)
 assert.equal(buffer.readUInt32LE(8),buffer.length)
 assert.equal(buffer.readUInt32LE(16),0x4e4f534a)
 const length=buffer.readUInt32LE(12)
 const json=JSON.parse(buffer.subarray(20,20+length).toString())
 assert.equal(json.meshes.length,6)
 assert.equal(json.animations.length,3)
 assert.ok(json.nodes.some(node=>node.name==='Head'))
 assert.ok(json.extras.prototype)
 assert.equal(json.extras.likenessCertified,false)
 assert.ok(!row.file.toLowerCase().includes('king-von')&&!row.file.toLowerCase().includes('twista')&&!row.file.toLowerCase().includes('michael-jackson'))
}
console.log('PASS: generated '+manifest.entries.length+' neutral GLB models, 3 animations each, '+manifest.musicGenreLanes.length+' genre lanes and no real-artist likenesses or recordings')
