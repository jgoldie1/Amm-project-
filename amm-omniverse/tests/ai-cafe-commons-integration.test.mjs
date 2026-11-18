import {test} from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {build} from 'esbuild'
const out=await build({entryPoints:[new URL('../src/runtime/AICafeCommonsRuntime.ts',import.meta.url).pathname],bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent'})
const commons=await import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'))
const cafe=fs.readFileSync(new URL('../src/components/AICafeRestaurant.tsx',import.meta.url),'utf8')
const game=fs.readFileSync(new URL('../src/components/StreetVerseAICafePlaygroundHUD.tsx',import.meta.url),'utf8')
const screen=fs.readFileSync(new URL('../src/components/AICafeCommons.tsx',import.meta.url),'utf8')
const jarvis=fs.readFileSync(new URL('../src/components/HoloGPTAssistant.tsx',import.meta.url),'utf8')
test('Commons is a central hub connected to existing Café, StreetVerse and JARVIS',()=>{
 assert.match(cafe,/<AICafeCommons\/>/)
 assert.match(game,/<AICafeCommons\/>/)
 assert.match(screen,/tryamm:hologpt-study-context/)
 assert.match(screen,/ONE-PUSH 4-AGENT DEMO/)
 assert.match(jarvis,/JARVIS DELUXE/)
})
test('Opt-in agent demo labels all turns and includes moderated religion discussion',()=>{
 assert.ok(commons.AI_COMMONS_TOPICS.some(x=>x.id==='religion-and-belief'))
 const discussion=commons.runCommonsDemo('religion-and-belief')
 assert.equal(discussion.events.length,4)
 assert.ok(discussion.events.every(x=>x.origin==='scripted-demo'&&x.consent===true&&x.sessionId===discussion.id))
 assert.match(discussion.events.at(-1).text,/no personal surveillance/)
})
test('No unauthorized turn or recording after stop, no personal-home capture',()=>{
 const initial=commons.beginCommonsSession('ai-ethics','2026-11-18T09:00:00.000Z')
 assert.equal(commons.appendCommonsTurn(initial,{role:'researcher',text:'spy on private chats',origin:'authorized-agent',authorized:false}).events.length,0)
 const paused={...initial,enabled:false}
 assert.equal(commons.appendCommonsTurn(paused,{role:'guide',text:'a message',origin:'scripted-demo',authorized:true}).events.length,0)
 assert.equal(commons.AI_COMMONS_MONITOR_POLICY.homeSensorCapture,false)
 assert.equal(commons.AI_COMMONS_MONITOR_POLICY.privateHumanCapture,false)
 assert.equal(commons.AI_COMMONS_MONITOR_POLICY.defaultRecording,false)
 assert.match(screen,/NOT CONNECTED \/ NO DEVICE DATA/)
})
test('Saved records reject malformed privacy flags or events without consent',()=>{
 const good=commons.runCommonsDemo('accessibility')
 const saved=commons.parseCommonsSaved(JSON.stringify(good))
 assert.equal(saved.events.length,4)
 assert.equal(commons.parseCommonsSaved(JSON.stringify({...good,homeMonitoring:true})),null)
 const bad={...good,events:[{...good.events[0],consent:false}]}
 assert.equal(commons.parseCommonsSaved(JSON.stringify(bad)).events.length,0)
 assert.equal(commons.parseCommonsSaved('{bad'),null)
})
