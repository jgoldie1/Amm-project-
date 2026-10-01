import fs from 'node:fs'
const data=fs.readFileSync(new URL('../src/data/streetVersePocketDimension.ts',import.meta.url),'utf8')
const ui=fs.readFileSync(new URL('../src/components/StreetVersePocketDimension.tsx',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const authority=fs.readFileSync(new URL('../src/commerce/inventoryAuthority.ts',import.meta.url),'utf8')

for(const x of [
 "ownershipTruth:'Pocket Dimension never grants ownership locally.",
 "localStorageUse:'Local storage may remember view preferences, favorites and quick slots only.'",
 "serverValidatedActions:['give','drop','transfer','sell','consume']",
 "maxQuickSlots:4",
])if(!data.includes(x))throw new Error('Pocket Dimension rule missing: '+x)

for(const x of [
 'POCKET DIMENSION',
 'SUGGESTED QUICK ACCESS',
 'OWNED / ACCESSIBLE ASSETS',
 'tryamm:pocket-dimension-sync-request',
 'tryamm:pocket-dimension-action-request',
 "serverValidate:['give','drop'].includes(action)",
 'QTY •',
 'MAX',
 'ADD QUICK',
])if(!ui.includes(x))throw new Error('Pocket Dimension UI missing: '+x)

if(ui.includes('ownedVehicles:')||ui.includes('setPlayer(')||ui.includes('buyVehicle('))throw new Error('Pocket Dimension must not mutate ownership directly')
for(const x of ['AVAILABLE','RESERVED','HOLD','reserveInventory','fulfillReservation'])if(!authority.includes(x))throw new Error('merchant inventory authority damaged: '+x)
for(const x of ['StreetVersePocketDimension','♾️ POCKET DIMENSION','pocketDimensionOpen','pocketDimensionQuickSlots:4','pocketDimensionServerValidatedActions:true'])if(!world.includes(x))throw new Error('Pocket Dimension mobile mount missing: '+x)

console.log('StreetVerse Pocket Dimension contract: PASS — one mobile asset locker, four quick slots, server-authoritative give/drop')
