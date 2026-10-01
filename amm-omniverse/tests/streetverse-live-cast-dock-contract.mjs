import fs from 'node:fs'
import assert from 'node:assert/strict'
const s=fs.readFileSync(new URL('../src/components/StreetVerseCoreGameplayDock.tsx',import.meta.url),'utf8')
for(const k of ['LIVE/CAST','tryamm:streetverse-live-cast-open','tryamm:live-center-open','tryamm:volcano-holocast-open','keepGameplayActive:true',"format:'gamecast'",'StreetVerse gameplay stays active'])assert.ok(s.includes(k),k)
console.log('StreetVerse LIVE CAST dock contract: PASS')
