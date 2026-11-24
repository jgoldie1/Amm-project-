import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const component=read('../src/components/SoulAscensionChicagoCasting.tsx')
const main=read('../src/main.tsx')
const home=read('../src/components/TryAMMHome.tsx')
test('casting route and top-level homepage entry exist',()=>{
 assert.match(main,/isSoulAscensionCasting/)
 assert.match(main,/SoulAscensionChicagoCasting/)
 assert.match(home,/SOUL ASCENSION CASTING/)
 assert.match(home,/\/soul-ascension-chicago/)
})
test('casting is invitation-only, never implied sign-up or identity license',()=>{
 assert.match(component,/This is an interest inquiry/)
 assert.match(component,/not affiliated with or licensed by Soul Train/)
 assert.match(component,/does not grant likeness, voice, music/)
 assert.match(component,/18 or older/)
 assert.match(component,/guardian-supervised/)
 assert.match(component,/not submitted or saved/)
})
test('communication requires deliberate human email action, no uncontrolled data upload',()=>{
 assert.match(component,/mailto:/)
 assert.match(component,/OPEN EMAIL APP/)
 assert.match(component,/COPY INQUIRY/)
 assert.match(component,/navigator\.clipboard\.writeText/)
 assert.doesNotMatch(component,/fetch\(/)
 assert.doesNotMatch(component,/localStorage/)
})
test('large controls and truthful warnings are present',()=>{
 assert.match(component,/minHeight:60/)
 assert.match(component,/role="status"/)
 assert.match(component,/No artist is represented as an official participant/)
})
