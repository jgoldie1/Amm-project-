import fs from 'node:fs'
import assert from 'node:assert/strict'

const dock=fs.readFileSync(new URL('../src/components/StreetVerseCoreGameplayDock.tsx',import.meta.url),'utf8')
const panels=fs.readFileSync(new URL('../src/components/StreetVerseInGamePanels.tsx',import.meta.url),'utf8')
const bridge=fs.readFileSync(new URL('../src/components/StreetVerseGeoSpawnBridge.tsx',import.meta.url),'utf8')
const mobile=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')

for(const k of ['tryamm:mini-panel-open','tryamm:user-search-open','tryamm:stream-ticket-center-open','SOCIAL','PEOPLE','TICKETS',"'people','live','families','agencies','games'"])assert.ok(dock.includes(k),k)
assert.ok(dock.includes("StreetVerseInGamePanels"),'visible panel host is not mounted by gameplay dock')
assert.ok(dock.includes("repeat(5,minmax(0,1fr))"),'gameplay dock must fit phone width in two compact rows')

for(const k of [
  'StreetVerse social panel',
  'StreetVerse people search panel',
  'StreetVerse stream ticket center',
  'tryamm:user-search-query',
  'tryamm:stream-ticket-list-request',
  'tryamm:social-quick-action',
  'tryamm:stream-ticket-request',
  'No authoritative ticket records loaded',
  'No server search results loaded yet'
])assert.ok(panels.includes(k),'visible panel missing '+k)

assert.ok(bridge.includes("{mobile?<StreetVerseReelEventBridge/>:"),'capable mobile route must stay free of the desktop gameplay overlay stack')
for(const k of ['StreetVerseInGamePanels','StreetVerse mobile social shortcuts','Open StreetVerse social panel','Open StreetVerse people search','Open StreetVerse stream tickets'])assert.ok(mobile.includes(k),'mobile visible shortcut missing '+k)
assert.ok(panels.includes("maxHeight:'min(46dvh,390px)'"),'panel must stay bounded inside phone viewport')
assert.ok(panels.includes("overflowY:'auto'"),'panel must scroll internally instead of covering the game')
assert.ok(!panels.includes('viewerCount:'),'panel must not fabricate viewer counts')
assert.ok(!panels.includes('approved:true'),'panel must not fabricate ticket approval')

console.log('Visible social ticket game dock contract: PASS — mobile dock + social/search/ticket panels are mounted and viewport-bounded')
