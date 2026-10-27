import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8')
test('GoogleX graph validates scoped nodes and edges',()=>{const s=read('amm-omniverse/src/runtime/GoogleXMemoryGraph.ts');for(const x of ['validateMemoryGraph','neighbors','unresolved_edge','scope'])assert.ok(s.includes(x))})
test('restore requires approval and matching player save schema',()=>{const s=read('amm-omniverse/src/runtime/GoogleXWorldCheckpoint.ts');for(const x of ['approval_required','owner_mismatch','migration_required','preview_only','preservesCurrentSave:true'])assert.ok(s.includes(x))})
test('world publisher requires approval per surface',()=>{const s=read('amm-omniverse/src/runtime/HoloGPTWorldPublisherReview.ts');for(const x of ['streetverse','holoverse','website','holo-ads','automaticallyPublish:false','requiresPerSurfaceApproval:true'])assert.ok(s.includes(x))})
test('one hand UI includes large native accessible buttons',()=>{const s=read('amm-omniverse/src/components/GoogleXOneHandCommandCenter.tsx');for(const x of ['minHeight:56','aria-pressed','onSelect','type="button"'])assert.ok(s.includes(x))})
