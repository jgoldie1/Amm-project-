import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const arcade=read('../src/components/StreetVerseMissionArcade.tsx')
const main=read('../src/main.tsx')
const home=read('../src/components/TryAMMHome.tsx')
test('all seventeen mission modes and fifty-one unique mission identifiers are registered',()=>{
 for(const id of ["'after-dark'","'mystery'","'districts'","'shadow'","'fire'","'undercover'","'er'","'dispatch'","'homicide'","'sports'","'grocery'","'trucking'","'housing'","'health'","'parkour'","'rescue'","'action'"])assert.ok(arcade.includes(id))
 const ids=[...arcade.matchAll(/\{id:'(ad\d|ms\d|dt\d|sd\d|fr\d|uc\d|er\d|dp\d|hm\d|sp\d|gr\d|tr\d|ho\d|hc\d|pk\d|rs\d|ac\d)',title:/g)].map(x=>x[1])
 assert.equal(ids.length,51);assert.equal(new Set(ids).size,51)
})
test('accessible route and home navigation entry',()=>{
 assert.match(main,/isStreetVerseMissionArcade/)
 assert.match(main,/StreetVerseMissionArcade/)
 assert.match(home,/STREETVERSE MISSION ARCADE/)
 assert.match(home,/\/streetverse-missions/)
})
test('progress is local and rewards cannot be farmed by replaying completed missions',()=>{
 assert.match(arcade,/localStorage\.setItem/)
 assert.match(arcade,/p\.completed\.includes\(id\)/)
 assert.match(arcade,/previous\.xp\+75/)
 assert.match(arcade,/previous\.credits\+50/)
 assert.match(arcade,/role="status"/)
 assert.match(arcade,/minHeight:62/)
})
test('original intellectual property and no monetary gambling or automatic real-world transfers',()=>{
 assert.match(arcade,/This is a non-monetized neighborhood simulator/)
 assert.match(arcade,/no real gambling/)
 assert.match(arcade,/no artist or third-party brand affiliation/)
 assert.doesNotMatch(arcade,/fetch\(/)
 assert.doesNotMatch(arcade,/Math\.random\(\).*payment/)
})

test('emergency and investigation content has safety and affiliation boundaries',()=>{
 assert.match(arcade,/not real emergency instructions/)
 assert.match(arcade,/UIC, Chicago Fire/)
 assert.match(arcade,/qualified triage staff/)
 assert.match(arcade,/exculpatory evidence/)
})
