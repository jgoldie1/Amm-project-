import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const home=readFileSync(new URL('../src/components/TryAMMHome.tsx',import.meta.url),'utf8')
const carousel=readFileSync(new URL('../src/components/HomeVerseCarousel.tsx',import.meta.url),'utf8')
const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8')
assert.match(app,/screen === 'intro' && <TryAMMHome\s*\/>/)
assert.match(home,/import HomeVerseCarousel from/)
assert.match(home,/<HomeVerseCarousel\s*\/>/)
for(const name of ['StreetVerse Chicago','All American Marketplace','TRYAMM LIVE','Creator Studio','Stubbs Mobility 360'])assert.ok(carousel.includes(name),'Missing destination: '+name)
for(const label of ['Previous destination','Next destination','Choose destination','aria-pressed','aria-live'])assert.ok(carousel.includes(label),'Missing accessible control: '+label)
assert.match(carousel,/\/streetverse\?safe=1&place=circle-park/)
console.log('TRYAMM homepage carousel source contract: PASS')
