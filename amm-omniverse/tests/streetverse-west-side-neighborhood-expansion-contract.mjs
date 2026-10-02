import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const registry=read('../src/data/StreetVerseWestSideNeighborhoodRegistry.ts')
const worldBuilder=read('../src/game/simulation/worldBuilderPipeline.ts')
const district=read('../src/runtime/StreetVerseChicagoDistrictWorld3D.ts')
const grid=read('../src/data/StreetVerseChicagoBuildGrid.ts')
const policy=JSON.parse(read('../../config/streetverse-geography-source-policy.json'))

const officialWestSide=[
  [23,'Humboldt Park'],[24,'West Town'],[25,'Austin'],[26,'West Garfield Park'],[27,'East Garfield Park'],
  [28,'Near West Side'],[29,'North Lawndale'],[30,'South Lawndale'],[31,'Lower West Side'],
]
for(const [id,name] of officialWestSide){
  assert.ok(registry.includes(`id:${id}`),`West Side registry missing community area ${id}`)
  assert.ok(registry.includes(`name:'${name}'`),`West Side registry missing ${name}`)
  assert.ok(worldBuilder.includes(`'${name}'`),`Chicago world seed missing ${name}`)
}
assert.ok(registry.includes("Circle Park / ABLA"),'Circle Park / ABLA anchor must remain in Near West Side')
assert.ok(registry.includes("Pilsen"),'Pilsen anchor must remain in Lower West Side')
assert.ok(registry.includes("Little Village"),'Little Village anchor must remain in South Lawndale')
assert.ok(registry.includes("streetViewRule:"),'West Side registry must carry the Street View boundary')
assert.ok(registry.includes('Do not scrape, download, trace into distributable textures'),'Street View must stay reference-only by default')

assert.equal(policy.chicago.visualReferenceSources.find(x=>x.name==='Google Street View')?.mode,'reference-only')
assert.ok(policy.chicago.visualReferenceSources.find(x=>x.name==='Google Street View')?.notFor.includes('texture extraction'))
assert.ok(policy.chicago.geometrySources.some(x=>x.name==='City of Chicago Data Portal'),'Chicago open-data geometry source missing')
assert.ok(policy.chicago.geometrySources.some(x=>x.name==='OpenStreetMap'),'OpenStreetMap source lane missing')

assert.ok(district.includes("WEST_SIDE_COMMUNITY_AREAS.forEach"),'3D district world must visibly render all West Side community-area preview anchors')
assert.ok(district.includes("tryamm:west-side-neighborhoods-visible"),'3D district world must emit West Side visibility evidence')
assert.ok(district.includes("geometryMode:'synthetic-streaming-preview'"),'preview geometry must not pretend to be source-certified reality')
assert.ok(district.includes("sourceCertification:false"),'preview geometry must remain uncertified until source QA passes')
assert.ok(grid.includes("west-community-"),'Chicago build grid must include West Side streaming districts')
assert.ok(grid.includes("grid:`WS-${area.id}`"),'West Side build-grid cells must carry community-area IDs')

console.log('StreetVerse West Side neighborhood expansion contract: PASS')
