import assert from 'node:assert/strict'
import fs from 'node:fs'
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const hud=fs.readFileSync(new URL('../src/components/StreetVerseHoloDeliveryMissionHUD.tsx',import.meta.url),'utf8')
for(const token of ["STREETVERSE","parcelLogoTexture","attachParcel(avatar","attachParcel(holoDeliveryVan","attachParcel(vendorParcelAnchor","parcelStage==='complete'","syncParcel();deliveryParcel.rotation","parcelLogoTexture.dispose()","vendorParcelAnchor.removeFromParent()"])assert.ok(world.includes(token),token)
assert.match(hud,/tryamm:streetverse-package-stage/)
assert.match(hud,/stage:result\.mission\.stage/)
console.log('Branded parcel attachment and stage regression contract PASS')
