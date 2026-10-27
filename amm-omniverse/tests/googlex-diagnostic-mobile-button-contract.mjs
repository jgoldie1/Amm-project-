import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const s=readFileSync(new URL('../src/components/StreetVerseMobilePlayableWorld.tsx',import.meta.url),'utf8')
test('one-handed diagnostic is on-demand, visible and not uploaded',()=>{
 for(const token of ['aria-label="Diagnose StreetVerse locally"','minHeight:48',"onClick={requestDiagnostic}","tryamm:googlex-request-mobile-diagnostic","LOCAL DIAGNOSTIC • NOT UPLOADED","setDiagnostic(null)"])assert.ok(s.includes(token),token)
 assert.ok(s.includes("window.removeEventListener('tryamm:googlex-mobile-diagnostic-ready',onReport)"))
})
