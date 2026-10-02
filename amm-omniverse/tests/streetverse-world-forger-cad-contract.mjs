import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const forger=read('../src/game/forger/StreetVerseWorldForger.ts')
const panel=read('../src/components/WorldForgerControlPanel.tsx')
const main=read('../src/main.tsx')
const holo=read('../src/components/HoloGPTAssistant.tsx')
const cursor=read('../src/runtime/BennyCursorConstructBridge.ts')
const factory=read('../api/_lib/meshy-factory.js')
const factoryApi=read('../api/meshy/factory.js')
const factoryPanel=read('../src/components/MeshyFactoryControlPanel.tsx')

for(const cell of [
  'Circle Park / ABLA Legacy District',
  'Near West Side',
  'North Lawndale',
  'East Garfield Park',
  'West Garfield Park',
  'Austin',
  'Humboldt Park',
  'Lower West Side / Pilsen',
  'South Lawndale / Little Village',
]) assert.ok(forger.includes(cell),`World Forger missing Chicago cell: ${cell}`)

for(const token of [
  "schema:'tryamm.world-forger.cad.v1'",
  "kind:'stairs'",
  "kind:'elevator'",
  "plumbing:",
  "electrical:",
  "hvac:",
  "accessibleRoutes",
  "mobileTriangleBudget",
  "textureWrap",
  "collision:true",
  "lodLevels:3",
]) assert.ok(forger.includes(token),`World Forger CAD/runtime contract missing ${token}`)

assert.ok(forger.includes("googleStreetView:'reference-only; do not scrape imagery into owned textures or geometry'"),'Street View must remain reference-only')
assert.ok(forger.includes("source.kind!=='street-view-reference'"),'Street View reference must not drive owned texture wrapping')
assert.ok(panel.includes('BUILD CAD / FORGE PLAN'),'World Forger UI must create a CAD/forge plan')
assert.ok(panel.includes('SEND TO MESHY FACTORY'),'World Forger UI must hand the plan to Meshy')
assert.ok(panel.includes('OPEN DISTRICT IN GAME'),'World Forger UI must bridge back to StreetVerse')
assert.ok(panel.includes('Street-view imagery stays reference-only.'),'World Forger UI must explain Street View boundary')

assert.ok(main.includes("const WorldForgerControlPanel=lazy(()=>import('./components/WorldForgerControlPanel'))"),'World Forger must stay lazy-loaded')
assert.ok(main.includes("'/world-forger'")&&main.includes("'/cad'"),'World Forger/CAD routes missing')
assert.ok(holo.includes('__showWorldForger'),'HoloGPT must route build/CAD commands into World Forger')
assert.ok(cursor.includes('tryamm:world-forge-context-ready'),'Cursor/Construct bridge must send build context to World Forger')
assert.ok(cursor.includes("productionMutation:false"),'Cursor/Construct proposals must remain non-mutating without approval')

assert.ok(factory.includes('startWorldForgerFactoryJob'),'Meshy Factory must accept durable World Forger jobs')
assert.ok(factory.includes("START_MESHY_WORLD_FORGE"),'World Forger Meshy generation must require explicit credit confirmation')
assert.ok(factory.includes("street_view_reference_cannot_drive_image_to_3d"),'Street View reference must not drive Meshy image-to-3D')
assert.ok(factory.includes('specNeedsRig(spec)'),'factory must distinguish humanoid rigging from buildings/vehicles/props')
assert.ok(factory.includes("rigSkipReason:'world-forger-non-humanoid-asset'"),'non-humanoid assets should skip humanoid rigging')
assert.ok(factory.includes("publishFolderForSpec(spec)"),'World Forger assets must publish to kind-specific folders')
assert.ok(factoryApi.includes("action==='start-world-forger'"),'factory API must expose explicit World Forger action')
assert.ok(factoryPanel.includes('WORLD FORGER HANDOFF'),'Meshy Factory UI must show the incoming World Forger plan')
assert.ok(factoryPanel.includes('I understand this may consume Meshy credits.'),'credit-consuming generation must require visible confirmation')

console.log('StreetVerse World Forger + CAD + Meshy handoff contract: PASS')
