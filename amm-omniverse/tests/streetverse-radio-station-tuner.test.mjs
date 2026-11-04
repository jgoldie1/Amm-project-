import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {stepVerseRadioStation,VERSE_RADIO_STATIONS} from '../src/runtime/VerseRadioRuntime.ts'

assert.equal(VERSE_RADIO_STATIONS.length,6,'existing six radio presets retained')
const ids=VERSE_RADIO_STATIONS.map(st=>st.id)
for(let index=0;index<ids.length;index++){
 assert.equal(stepVerseRadioStation(ids[index],1).id,ids[(index+1)%ids.length],'next station wraps around')
 assert.equal(stepVerseRadioStation(ids[index],-1).id,ids[(index-1+ids.length)%ids.length],'previous station wraps around')
}
assert.equal(stepVerseRadioStation('unknown-station',-1).id,ids.at(-1))
const radio=readFileSync(new URL('../src/runtime/VerseRadioRuntime.ts',import.meta.url),'utf8')
const dock=readFileSync(new URL('../src/components/VerseRadioDock.tsx',import.meta.url),'utf8')
const cabin=readFileSync(new URL('../src/components/StreetVerseTransportScreenLab.tsx',import.meta.url),'utf8')
assert.ok(radio.includes("addEventListener('tryamm:verse-radio-step-station',onStepStation)"))
assert.ok(radio.includes("removeEventListener('tryamm:verse-radio-step-station',onStepStation)"),'station listener cleans up')
assert.ok(radio.includes("audio.pause()\n     audio.removeAttribute('src')"),'switching station stops stale program audio')
assert.ok(radio.includes("state.track=null"),'station switch clears previous station track')
assert.ok(radio.includes("VERSE_RADIO_STATIONS.find(x=>x.id===station)"),'stations must come from approved preset catalog')
assert.ok(dock.includes('aria-label="Previous radio station"'))
assert.ok(dock.includes('aria-label="Next radio station"'))
assert.ok(cabin.includes('aria-label="Next radio channel"'))
assert.ok(cabin.includes('aria-label="Previous radio channel"'))
assert.ok(!dock.includes('new Audio(')&&!cabin.includes('new Audio('),'single existing player, no duplicate playback')
console.log('StreetVerse radio channel tuning contract PASS (six stations, cycling, audio-source reset)')
