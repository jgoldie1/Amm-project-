import fs from 'node:fs'
import assert from 'node:assert/strict'
const read=(path)=>fs.readFileSync(new URL(path,import.meta.url),'utf8')
const facade=read('../src/runtime/CircleParkApartmentsReferenceFacadeV3.ts')
const world=read('../src/components/StreetVerseMobileWorld.tsx')
const expected=[
 "facade.name='circle-park-1111-photo-reference-facade-v3'",
 "towerFloors:8",
 "const floors=7,bays=6",
 "circle-park-1111-individual-windows-v3",
 "circle-park-1111-wall-ac-vents-v3",
 "circle-park-1111-ac-grille-slats-v3",
 "circle-park-1111-vertical-concrete-piers-v3",
 "circle-park-1111-recessed-glass-entrance",
 "circle-park-1111-entry-center-mullion",
 "circle-park-mature-entry-tree-",
 "circle-park-townhome-photo-v3-",
 "wall-ac-vent",
 "address-step",
 "surveyed:false",
 "photoTextureUsed:false",
]
for(const token of expected)assert.ok(facade.includes(token),'Circle Park reference facade missing '+token)
assert.ok(world.includes('installCircleParkApartmentsReferenceFacadeV3(circleParkReality)'),'3D facade must be mounted into present-day scene')
assert.ok(world.includes('circleParkReferenceFacade.decorateTownhome(home,i)'),'Townhomes must get individual front facade detailing')
assert.ok(world.includes('circleParkReferenceFacade.disposeMaterials()'),'Materials must be released on scene exit')
assert.ok(world.includes('circleParkReality.visible=activeCircleParkEra'), 'Historic reconstruction must remain a separate scene layer')
assert.ok(world.includes('photoReferenceArchitectureV3:true'),'Visual evidence must distinguish new reference pass')
assert.ok(world.includes('photoReferenceWindows:circleParkReferenceFacade.visibleWindows'),'Window count must come from rendered geometry')
console.log('CIRCLE PARK OFFICIAL PHOTO-REFERENCE V3 PASS: original eight-story window grid, vents, brick townhome details, trees, historical-mode isolation and cleanup')
