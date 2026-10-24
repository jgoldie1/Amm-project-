import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const runtime=readFileSync(new URL('../src/runtime/StreetVerseCareerMissionPrototype.ts',import.meta.url),'utf8')
const ui=readFileSync(new URL('../src/components/StreetVerseActionCarousel.tsx',import.meta.url),'utf8')
for(const career of ['agent-007','mib','law-enforcement','government','cia','fbi']){
 assert.ok(runtime.includes("'"+career+"':"),'Missing career '+career)
}
for(const contract of ['getCaseJournal','getCareerEvidence','getCareerScene','advanceCareerMissionForEvent','loadInvestigationChoice']){
 assert.ok(runtime.includes('function '+contract),'Missing runtime '+contract)
 assert.ok(ui.includes(contract),'Missing UI wiring '+contract)
}
assert.ok(ui.includes('CASE JOURNAL ('),'Missing case journal UI')
assert.ok(ui.includes('REVIEW CASE EVIDENCE'),'Missing evidence review action')
assert.ok(ui.includes('START LOCAL CAREER DEMO'),'Missing career start')
assert.ok(ui.includes('no 3D NPC, XP or server save'),'Missing prototype disclaimer')
console.log('StreetVerse career mission source contracts passed')
