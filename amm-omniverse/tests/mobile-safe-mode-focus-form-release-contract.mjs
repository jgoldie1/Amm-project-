import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const s=readFileSync(new URL('../src/components/StreetVerseMobilePlayableWorld.tsx',import.meta.url),'utf8')
test('entering a form releases stuck movement and cleans up its handler',()=>{
 for(const token of ["const onFocusIn=(event:FocusEvent)",'releaseControls()}','document.addEventListener(\'focusin\',onFocusIn)','document.removeEventListener(\'focusin\',onFocusIn)'])assert.ok(s.includes(token),token)
})
