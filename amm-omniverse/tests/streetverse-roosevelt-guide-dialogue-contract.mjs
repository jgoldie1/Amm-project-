import fs from 'node:fs'
import assert from 'node:assert/strict'

const source=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const check=(part,description)=>assert.ok(source.includes(part),description)

check("const [rooseveltDialogueOpen,setRooseveltDialogueOpen]=useState(false)",'dialogue state missing')
check("setRooseveltDialogueOpen(true)",'NPC interaction must open visible conversation')
check('role="dialog" aria-modal="true" aria-label="Roosevelt guide conversation"','accessible conversation missing')
check('Ask about the route','route dialogue option missing')
check('Complete guide check-in','check-in choice missing')
check('Close conversation','player must be able to cancel conversation')
check("dialogueCompleted:true",'mission completion event must report accepted conversation choice')
check("setRooseveltDialogueOpen(false);setRooseveltDialoguePage('greeting');firstJourneyActive=true",'restart must reset dialogue')
check("setRooseveltDialogueOpen(false);firstJourneyActive=false",'mission completion must dismiss dialogue')

const guideStart=source.indexOf("if(prompt.id==='first-journey-guide')")
const guideEnd=source.indexOf("if(prompt.id==='vehicle-repair')",guideStart)
assert.ok(guideStart>=0&&guideEnd>guideStart,'guide interaction missing')
const guideHandler=source.slice(guideStart,guideEnd)
assert.ok(guideHandler.includes("setRooseveltDialogueOpen(true)"),'guide should open dialogue')
assert.ok(!guideHandler.includes("setFirstJourneyReady(true)"),'opening dialogue must not grant mission credit automatically')
console.log('STREETVERSE ROOSEVELT DIALOGUE CONTRACT PASS: visible choice -> explicit check-in -> mission ready')
