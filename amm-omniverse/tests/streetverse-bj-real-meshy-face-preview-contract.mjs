import fs from 'node:fs'
import assert from 'node:assert/strict'
const source=fs.readFileSync(new URL('../src/components/BJStubbsV7Viewer.tsx',import.meta.url),'utf8')
assert.ok(source.includes("data-bj-actual-meshy-preview"),'Viewer needs actual Meshy GLB option')
assert.ok(source.includes("data-bj-owned-glb-preview"),'Native V15 must remain recoverable')
assert.ok(source.includes("resolvePublishedMeshyAsset('sv-bj-stubbs-v6','global')"),'Real Meshy must come from a verified published registry, without paid requests')
assert.ok(source.includes('candidates.push(...BJ_REVIEW_ASSETS)'), 'Real Meshy preview must fall back to V15 if unavailable')
assert.ok(source.includes("loadedModel==='PUBLISHED MESHY'?null:installBJPhotoMatchedHead(model)"),'Do not glue a low-res flat portrait over textured Meshy geometry')
assert.ok(source.includes("normalizeStreetVerseHumanHeight(model,1.82)"),'Meshy scale must be normalized before comparing face to approved portrait')
assert.ok(source.includes('},[bjReviewSource])'),'Changing model choice must re-create WebGL resources and render proof')
assert.ok(source.includes('data-bj-model-provenance'),'Viewer must visibly distinguish genuine provider GLB from home-built asset')
assert.ok(source.includes('data-bj-render-comparison'),'Actual render proof capture must remain available')
console.log('BJ ACTUAL MESHY FACE REVIEW PASS: published GLB or transparent V15 fallback, no paid generation, four-angle comparison')
