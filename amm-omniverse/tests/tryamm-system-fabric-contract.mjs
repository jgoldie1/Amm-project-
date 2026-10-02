import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const fabric=read('../src/runtime/TRYAMMSystemFabricRuntime.ts')
const main=read('../src/main.tsx')
const printPipeline=read('../src/runtime/Meshy3DPrintPipeline.ts')

for(const system of [
 'core','streetverse-world','characters','missions','vehicles','creator-media','live',
 'global','meshy-assets','commerce','delivery','print-network','hologpt','omniverse','accessibility'
]) assert.ok(fabric.includes(`'${system}'`),`system fabric missing ${system}`)

for(const event of [
 'tryamm:streetverse-native-mobile-ready',
 'tryamm:streetverse-hero-visual-authority',
 'tryamm:universal-mission-start',
 'tryamm:streetverse-vehicle-controlled',
 'tryamm:media-studio-output-ready',
 'tryamm:streetverse-global-character-select',
 'tryamm:omniverse-fabric-state',
 'tryamm:system-fabric-signal',
 'tryamm:system-fabric-query',
 'tryamm:system-fabric-state',
]) assert.ok(fabric.includes(event),`system fabric adapter missing ${event}`)

assert.ok(fabric.includes("global:['streetverse-world','characters','missions']"),'global system must depend on world + characters + missions')
assert.ok(fabric.includes("print-network:['commerce','meshy-assets']"),'print network must depend on commerce + Meshy assets')
assert.ok(fabric.includes("overall:'READY'|'DEGRADED'|'BLOCKED'|'STARTING'"),'fabric must expose one overall readiness state')
assert.ok(main.includes("import('./runtime/TRYAMMSystemFabricRuntime').then(m => m.installTryammSystemFabricRuntime())"),'main bootstrap must install unified system fabric after core mount')

assert.ok(printPipeline.includes("import type {Object3D} from 'three'"),'print pipeline must keep Three import type-only at module evaluation')
assert.ok(!printPipeline.includes("import * as THREE from 'three'"),'print pipeline must not statically pull Three into StreetVerse boot graph')
assert.ok(printPipeline.includes("const THREE=await import('three')"),'print Three runtime must load only when print analysis/export is actually used')

console.log('TRYAMM unified system fabric + isolated print runtime contract: PASS')
