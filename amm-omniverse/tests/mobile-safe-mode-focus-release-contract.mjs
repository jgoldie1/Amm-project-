import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const source=readFileSync(new URL('../src/components/StreetVerseMobilePlayableWorld.tsx',import.meta.url),'utf8')
test('mobile controls release held input when app loses focus',()=>{
 for(const token of ["const releaseControls=()=>{held.current={up:false,down:false,left:false,right:false}}","window.addEventListener('blur',releaseControls)","document.addEventListener('visibilitychange',onVisibility)","window.removeEventListener('blur',releaseControls)","document.removeEventListener('visibilitychange',onVisibility)"])assert.ok(source.includes(token),token)
})
