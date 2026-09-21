import fs from 'node:fs'
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const adapter=fs.readFileSync(new URL('../src/runtime/OneHandInputAdapter.ts',import.meta.url),'utf8')
const bridge=fs.readFileSync(new URL('../src/runtime/StreetVerseOneHandController.ts',import.meta.url),'utf8')
for(const x of ["tryamm:streetverse-vehicle-input","tryamm:streetverse-vehicle-interact","input.current.up","input.current.down","input.current.left","input.current.right","camera.position.lerp"])if(!world.includes(x))throw new Error('real StreetVerse mobile input path missing: '+x)
for(const x of ['adaptOneHandInput','WorldInputFrame','simultaneousPressRequired:false'])if(!adapter.includes(x))throw new Error('one-hand adapter missing: '+x)
for(const x of ['StreetVerseControllerPort','StreetVerseOneHandController','applyInput'])if(!bridge.includes(x))throw new Error('one-hand controller bridge missing: '+x)
console.log('StreetVerse real mobile controller discovery + one-hand bridge contract: PASS')
