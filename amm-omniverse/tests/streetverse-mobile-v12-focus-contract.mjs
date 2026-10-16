import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const world=read('../src/components/StreetVerseMobileWorld.tsx')
const css=read('../src/components/streetverse-mobile-layout.css')
const playable=read('../src/components/StreetVersePlayableWorld.tsx')

const check=(ok,label)=>assert.ok(ok,'V12 CLEAR VIEW: '+label)
check(world.includes("data-hud-focus={focusView?'true':'false'}"),'HUD focus state must mark world root')
check(world.includes('const [focusView,setFocusView]=useState(true)'),'default to clear iPhone play view')
check(world.includes("if(target==='hud'){setFocusView(v=>!v);return}"),'menu restores the full HUD')
check(world.includes("focusView?'◉ SHOW FULL HUD':'◌ CLEAR VIEW'"),'accessible restore label')
for(const target of ['hud','first-ride','drive','camera','reel','mic','missions','repair','create','retail','store','travel']){
  check(world.includes("'"+target+"'"),'menu keeps '+target+' available')
}
check(world.includes("vehicleOccupied?'tryamm:streetverse-cycle-vehicle-camera':'tryamm:streetverse-toggle-player-camera'"),'camera action respects driving')
check(world.includes('tryamm:streetverse-first-journey-start'),'first ride stays playable')
check(world.includes('tryamm:streetverse-vehicle-interact'),'vehicle entry remains functional')

const start=css.indexOf('SV iPhone focus mode V12')
check(start>=0,'scoped portrait focus CSS exists')
const scoped=css.slice(start)
for(const selector of [
 '#sv-store-open','#sv-retail-open','[data-streetverse-create-earn]',
 '[aria-label="Open Universal Mission Director"]','[aria-label="Open repair actions"]',
 '[data-streetverse-travel]','[aria-label="Start StreetVerse Reel recording"]',
 '[aria-label="Start live BJ microphone"]']){
  check(scoped.includes(selector),'secondary overlay controlled: '+selector)
}
for(const selector of ['[data-streetverse-mission]','[data-streetverse-context]','[aria-label="StreetVerse analog joystick"]']){
  check(scoped.includes(selector),'primary play HUD retained '+selector)
}
for(const stop of ['Stop StreetVerse Reel recording','Stop live BJ microphone']){
  check(scoped.includes('[aria-label="'+stop+'"]'),'active stream can always be stopped')
}
const activeMobile=playable.slice(playable.indexOf('if(mobile)return'),playable.indexOf('return <><StreetVerseWeatherSync/><StreetVerseWorldBoundary',playable.indexOf('if(mobile)return')+20)+400)
check(!activeMobile.includes('StreetVerseMobileGameShell'),'do not duplicate controller on live 3D path')
console.log('StreetVerse V12 screenshot-driven iPhone clear-view HUD PASS (static guard; real-device QA still pending)')
