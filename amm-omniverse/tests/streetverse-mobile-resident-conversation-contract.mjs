import fs from 'node:fs'
import assert from 'node:assert/strict'

const conversation=fs.readFileSync(new URL('../public/streetverse-npc-conversation.js',import.meta.url),'utf8')
const life=fs.readFileSync(new URL('../public/streetverse-mobile-life.js',import.meta.url),'utf8')
const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8')

assert.match(life,/id='tryamm-mobile-life'|id="tryamm-mobile-life"|layer\.id='tryamm-mobile-life'/,'HTML safe city must mount the resident life layer')
assert.match(life,/pedestrians:7/,'HTML safe city resident population contract changed unexpectedly')
assert.match(conversation,/#tryamm-mobile-life \.sv-person/,'Resident conversation must bind the visible mobile residents')
assert.match(conversation,/min-width:44px;min-height:44px/,'Resident touch targets must be at least 44x44')
assert.match(conversation,/tryamm-npc-talk-launcher/,'Mobile safe city must expose a visible TALK TO RESIDENT launcher')
assert.match(conversation,/TALK TO RESIDENT/,'Resident launcher must have a clear user-facing label')
assert.match(conversation,/role=\"status\" aria-live=\"polite\"/,'Conversation response must be announced accessibly')
assert.match(conversation,/e\.key==='Enter'\|\|e\.key===' '/,'Resident interaction must support keyboard activation')
for(const event of ['tryamm:streetverse-npc-conversation-open','tryamm:streetverse-npc-conversation','tryamm:streetverse-npc-mission-hint','tryamm:streetverse-npc-talk-ready']){
  assert.ok(conversation.includes(event),`Resident conversation contract missing ${event}`)
}
assert.match(conversation,/scriptedDialogue:true/,'Scripted resident dialogue must be explicitly identified instead of being presented as generative AI')
assert.match(conversation,/mobileSafeMode:true,htmlCity:true/,'Resident interaction events must identify the HTML safe-city path')
assert.match(index,/streetverse-npc-conversation\.js\?v=20260904-streetverse-v29/,'Production shell must request the fresh resident conversation release')

console.log('StreetVerse mobile resident conversation contract: PASS (7 tappable residents + visible TALK launcher + accessible bilingual scripted dialogue)')
