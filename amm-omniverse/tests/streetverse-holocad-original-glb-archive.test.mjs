import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {
 STREETVERSE_ORIGINAL_GLB_ARCHIVE,STREETVERSE_ORIGINAL_GLB_TOTAL_BYTES,
 lookupArchivedStreetVerseGLB,hashStreetVerseGLBLocally
} from '../src/game/holocad/streetVerseOriginalGLBArchive.ts'

test('12 original archived GLB identities and sizes are preserved without Drive credentials',()=>{
 const rows=STREETVERSE_ORIGINAL_GLB_ARCHIVE
 assert.equal(rows.length,12)
 assert.equal(STREETVERSE_ORIGINAL_GLB_TOTAL_BYTES,150635616)
 assert.equal(rows.filter(x=>x.name.endsWith('.walk.glb')).length,4)
 assert.equal(rows.filter(x=>x.name.endsWith('.run.glb')).length,4)
 assert.equal(rows.filter(x=>/\.glb$/.test(x.name)).length,12)
 assert.equal(new Set(rows.map(x=>x.name)).size,12)
 assert.equal(new Set(rows.map(x=>x.sha256)).size,12)
 for(const row of rows){
  assert.ok(row.bytes>10_000_000&&row.bytes<24*1024*1024)
  assert.match(row.sha256,/^[a-f0-9]{64}$/)
  assert.deepEqual(lookupArchivedStreetVerseGLB(row.bytes,row.sha256),row)
  assert.equal(lookupArchivedStreetVerseGLB(row.bytes+1,row.sha256),null)
  assert.equal(lookupArchivedStreetVerseGLB(row.bytes,'0'.repeat(64)),null)
 }
 assert.equal(lookupArchivedStreetVerseGLB(0,'0'.repeat(64)),null)
 assert.equal(lookupArchivedStreetVerseGLB(100,'../../secret'),null)
})
test('browser-local SHA256 digest matches standard test vector without a network call',async()=>{
 const raw=new TextEncoder().encode('abc')
 const digest=await hashStreetVerseGLBLocally(raw.buffer)
 assert.equal(digest,'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
 await assert.rejects(hashStreetVerseGLBLocally(new ArrayBuffer(24*1024*1024+1)),/size_limit/)
})
test('HoloCAD UI shows archive match status only after local hashing, never imports models',()=>{
 const view=fs.readFileSync(new URL('../src/components/HoloCADGLBAssetInspector.tsx',import.meta.url),'utf8')
 const archive=fs.readFileSync(new URL('../src/game/holocad/streetVerseOriginalGLBArchive.ts',import.meta.url),'utf8')
 for(const x of [
  'hashStreetVerseGLBLocally(buffer)',
  'lookupArchivedStreetVerseGLB(buffer.byteLength,sha256)',
  'setArchivedOriginal(matching)',
  'SHA-256 MATCH',
  'No SHA-256 match among 12 archived NPC GLBs',
  'Original asset identity not checked'
 ])assert.ok(view.includes(x),'Missing local archive lock check '+x)
 assert.equal(view.includes('fetch('),false)
 assert.equal(view.includes('GLTFLoader'),false)
 assert.equal(archive.includes('drive.google.com'),false,'Do not leak private Drive file ids in public client bundle')
 assert.equal(archive.includes('sourceUrl'),false)
})
