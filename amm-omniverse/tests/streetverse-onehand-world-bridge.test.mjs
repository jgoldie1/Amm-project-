import assert from 'node:assert/strict'
import fs from 'node:fs'
import {test} from 'node:test'

// Static guard: prove the rendered world still listens for the input contract.
// This is NOT a browser / touch-device end-to-end test.
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx', import.meta.url),'utf8')
const controller=fs.readFileSync(new URL('../src/runtime/StreetVerseOneHandController.ts', import.meta.url),'utf8')
test('rendered world listens for world input and routes interaction',()=>{
  assert.match(world,/addEventListener\('tryamm:streetverse-world-input',onWorldInput\)/)
  assert.match(world,/if\(d\.interact\)activateCurrentInteraction\(\)/)
})
test('rendered world retains vehicle enter and exit actions',()=>{
  assert.match(world,/if\(prompt\.id==='vehicle-enter'\)/)
  assert.match(world,/if\(prompt\.id==='vehicle-exit'\)/)
  assert.match(world,/detail:\{entered:false\}/)
})
test('one-hand controller keeps explicit integration warning until wired',()=>{
  assert.match(controller,/ADAPTER_READY_CONTROLLER_PORT_REQUIRED/)
})
