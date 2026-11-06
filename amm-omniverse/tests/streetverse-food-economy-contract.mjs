import assert from 'node:assert/strict'
import fs from 'node:fs'
const food=fs.readFileSync(new URL('../src/runtime/StreetVerseFoodEconomyRuntime.ts',import.meta.url),'utf8')
for(const id of ['burger','ribs','pop','beer','water','salad'])assert.match(food,new RegExp('\\b'+id+':\\{label:'),'Missing menu item '+id)
assert.match(food,/item\.adultOnly&&!player\.ageVerifiedAdult/,'Alcohol requires verified adulthood')
assert.match(food,/player\.wallet<item\.price/,'Cannot overspend wallet')
assert.match(food,/wallet:player\.wallet-item\.price/,'Must debit fictional currency')
assert.match(food,/n\.severeInjury\?0:item\.minorHealth/,'Food cannot treat severe injuries')
assert.match(food,/n\.impaired\|\|id==='beer'/,'Beer must mark impairment')
assert.match(food,/!player\.needs\.impaired/,'Driving must be disallowed while impaired')
assert.match(food,/Math\.max\(0,Math\.min\(100,value\)\)/,'Needs must be clamped')
console.log('StreetVerse food economy source contract PASS')
