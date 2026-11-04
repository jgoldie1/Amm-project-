import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8')
const radio=read('src/runtime/VerseRadioRuntime.ts')
const lab=read('src/components/StreetVerseTransportScreenLab.tsx')
const dock=read('src/components/VerseRadioDock.tsx')
const app=read('src/main.tsx')
const checks=[
 ['StreetVerse station exists',radio.includes("id:'streetverse-radio'")],
 ['radio player uses rights check',radio.includes('track?.publicAuthorized')&&radio.includes('safeUrl(track.url)')],
 ['radio API already mounted',app.includes('<VerseRadioDock />')],
 ['station selection bridged',lab.includes("tryamm:verse-radio-station")&&lab.includes("openStation('streetverse-radio')")],
 ['existing state subscription',lab.includes("addEventListener('tryamm:verse-radio-state'")],
 ['source displays track and playing state',lab.includes("radio?.playing")&&lab.includes("radio?.track?.title")],
 ['play and pause original runtime events',lab.includes("tryamm:verse-radio-resume")&&lab.includes("tryamm:verse-radio-pause")],
 ['volume original runtime event',lab.includes('tryamm:verse-radio-volume')],
 ['station picker uses actual catalog',lab.includes('VERSE_RADIO_STATIONS.map')],
 ['no duplicate audio engine in dashboard',!lab.includes('new Audio(')&&!lab.includes('new Howl(')],
 ['station selection cannot claim verified broadcast',lab.includes('does not fabricate a live stream')],
 ['radio dock original controls preserved',dock.includes('installVerseRadioRuntime()')]
]
for(const [name,ok] of checks)assert.ok(ok,name)
console.log('StreetVerse Radio transport integration source contract PASS: '+checks.length+' checks; end-to-end internet streaming still requires playback QA')
