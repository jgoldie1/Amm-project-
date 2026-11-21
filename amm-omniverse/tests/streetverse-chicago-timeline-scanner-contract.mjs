import fs from 'node:fs'
import assert from 'node:assert/strict'
const runtime=fs.readFileSync(new URL('../src/runtime/StreetVerseChicagoTimeSwitchRuntime.ts',import.meta.url),'utf8')
const scanner=fs.readFileSync(new URL('../src/components/StreetVerseChicagoTimelineScanner.tsx',import.meta.url),'utf8')
for(const era of ['past','present','future'])assert.match(runtime,new RegExp(era+':\\{era:'),'Missing era '+era)
for(const method of ['switchTo:','scan:','remember:','recall:','record:','history:'])assert.ok(runtime.includes(method),'Missing mechanic '+method)
assert.match(runtime,/memories\.get\(timeline\.active\(\)\)/,'NPC memories must be branch scoped')
assert.match(runtime,/createMyceliumTimeline/,'Must use shared Mycelium timeline')
assert.match(scanner,/tryamm:crossverse-chicago-era-switch/,'Scanner must emit renderer transition')
assert.match(scanner,/requiresSceneLoad:true/,'Scene switch must not falsely claim loaded')
console.log('Chicago timeline scanner contract PASS')
