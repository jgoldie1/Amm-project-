import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const campus=readFileSync(new URL('../src/runtime/StreetVerseGreenvilleCampusBirthdayRuntime.ts',import.meta.url),'utf8')
const html=readFileSync(new URL('../public/greenville-university.html',import.meta.url),'utf8')
const birthday=readFileSync(new URL('../src/components/StreetVerseGreenvilleBirthdayHUD.tsx',import.meta.url),'utf8')
assert.match(campus,/x:-30,z:17,kind:'party'/,'party marker is outside mansion footprint')
assert.match(campus,/pavilion\.position\.set\(-30,0,17\)/,'pavilion is moved to the external courtyard')
assert.match(campus,/greenville-arrival-fountain/,'landmark fountain exists')
assert.match(campus,/greenville-entrance-pillar-left/,'recognizable campus entrance exists')
assert.match(campus,/jacobie-mansion-roof/,'mansion has distinct roof')
assert.match(campus,/greenville-field-yard-line/,'sports field markings exist')
assert.match(campus,/greenville-sorority-entry-canopy/,'sorority entry recognizable')
assert.match(campus,/greenville-landscape-tree-canopy/,'landscape detail exists')
assert.match(birthday,/distance<=10/,'birthday chapter requires real player arrival')
assert.match(html,/<title>Greenville University \| Jacobie CampusVerse<\/title>/,'website title')
assert.match(html,/href="\/streetverse\?core=1&amp;character=jacobie&amp;world=greenville&amp;graphics=character"/,'website opens real 3D route')
assert.match(html,/prefers-reduced-motion/,'reduced-motion treatment')
assert.match(html,/aria-label="Main navigation"/,'accessible navigation')
const entries=[...html.matchAll(/href="([^"]+)"[^>]*>([^<]*)<\/a>/g)]
 .map(([,href,label])=>({url:new URL(href.replaceAll('&amp;','&'),'https://game.test'),label}))
 .filter(({url})=>url.pathname==='/streetverse')
assert.ok(entries.some(({label})=>label.includes('SAFE PLAY')),'lightweight entry is available')
for(const {url,label} of entries){
 assert.deepEqual(url.searchParams.getAll('graphics'),[label.includes('SAFE PLAY')?'lite':'character'],label)
 assert.equal(url.searchParams.get('character'),'jacobie',label)
 assert.equal(url.searchParams.get('world'),'greenville',label)
}
console.log('Greenville visual-and-website source contract PASS')
