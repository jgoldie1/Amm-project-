import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const runtime=read('../src/runtime/StreetVerseMeshyBJHeroRuntime.ts')
const world=read('../src/components/StreetVerseMobileWorld.tsx')
const vite=read('../vite.config.ts')
const proxy=read('../api/streetverse/bj-v15-model.js')
const check=(condition,description)=>assert.ok(condition,'BJ V15 MODEL ORIGIN: '+description)

check(runtime.includes("BJ_V15_SAME_ORIGIN_URL='/api/streetverse/bj-v15-model'"),'first-party model path missing')
check(runtime.includes("return new URLSearchParams(window.location.search).get('bj')==='legacy' ? null : BJ_V15_SAME_ORIGIN_URL"),'real BJ must try first-party before off-origin fetch')
check(runtime.includes("v15PreviewUrl?BJ_V15_PREVIEW.url:null"),'direct original URL must remain as last-resort alternative')
check(runtime.includes("candidate===v15PreviewUrl||candidate===BJ_V15_PREVIEW.url"),'either V15 source must be recognized as a real model')
check(runtime.includes("tryamm:bj-v15-load-error"),'silent asset failure must emit diagnostic')
check(runtime.includes("standInOnly:!usingV15Preview"),'generic asset cannot claim real BJ identity')
check(world.includes("standInOnly:!isV15"),'scene must distinguish stand-in from V15')
check(world.includes("DEMO RIG ONLY. This stand-in is NOT your BJ Stubbs likeness."),'player must see clear stand-in warning')
check(vite.includes("'/api/streetverse/bj-v15-model'"),'local Chromebook proxy must exist')
check(proxy.includes("const BJ_V15_URL='https://d2ol7oe51mr4n9.cloudfront.net/"),'upstream must be fixed allowlisted source')
check(!proxy.includes("req.query.url")&&!proxy.includes("req.body.url"),'endpoint must never be arbitrary URL proxy')
check(proxy.includes("first.value[0]!==0x67")&&proxy.includes("first.value[3]!==0x46"),'reject HTML and other non-GLB upstream responses')
console.log('BJ V15 SAME-ORIGIN / STAND-IN TRUTH CONTRACT PASS (source checks, not a visual identity certificate)')
