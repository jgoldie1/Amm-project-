import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const s=readFileSync(new URL('../src/components/StreetVerseMobilePlayableWorld.tsx',import.meta.url),'utf8')
test('mobile diagnostics are user-requested, bounded and not auto-uploaded',()=>{
 for(const token of ['tryamm:googlex-request-mobile-diagnostic','tryamm:googlex-mobile-diagnostic-ready','visitedCount:visitedRef.current.length','window.removeEventListener(\'tryamm:googlex-request-mobile-diagnostic\''])assert.ok(s.includes(token),token)
 const start=s.indexOf('const snapshot=()=>')
 const end=s.indexOf("window.addEventListener('tryamm:googlex-request-mobile-diagnostic'",start)
 const body=s.slice(start,end)
 assert.doesNotMatch(body,/\bfetch\(|navigator\.sendBeacon|playerId|email|visited:/)
})
