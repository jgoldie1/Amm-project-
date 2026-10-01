import fs from 'node:fs'
import assert from 'node:assert/strict'

const gamepad=fs.readFileSync(new URL('../src/components/StreetVerseGamepadBridge.tsx',import.meta.url),'utf8')
const presence=fs.readFileSync(new URL('../src/components/StreetVerseRealtimePresence.tsx',import.meta.url),'utf8')
const afterDark=fs.readFileSync(new URL('../src/components/StreetVerseAfterDarkAlpha.tsx',import.meta.url),'utf8')
const shopping=fs.readFileSync(new URL('../src/components/StreetVerseShoppingCore.tsx',import.meta.url),'utf8')
const deck=fs.readFileSync(new URL('../src/components/StreetVerseNextLevelHUD.tsx',import.meta.url),'utf8')
const living=fs.readFileSync(new URL('../src/components/StreetVerseLivingLayer.tsx',import.meta.url),'utf8')
const badge=fs.readFileSync(new URL('../src/components/StreetVerseLiveBuildBadge.tsx',import.meta.url),'utf8')

assert.ok(gamepad.includes("if(!connected)return null"),'phone must not show CONTROLLER DISCONNECTED over missions')
assert.ok(presence.includes("if(phone&&state!=='LIVE')return null"),'phone must not show signed-out multiplayer badge over mission UI')
assert.ok(afterDark.includes("!phone&&<button"),'After Dark must not permanently occupy the phone HUD')
assert.ok(shopping.includes("!phone&&<button"),'Shopping launcher must not permanently occupy the phone HUD')
assert.ok(deck.includes("Math.min(window.innerWidth,window.innerHeight)>720"),'large control deck must start collapsed on phones')
assert.ok(living.includes("if(phone)return null"),'duplicate LivingLayer phone HUD must be suppressed when mobile shell owns controls')
assert.ok(badge.includes("Math.min(window.innerWidth,window.innerHeight)<=720)return null"),'desktop live-build badge must stay off phone gameplay')

console.log('LATEST STREETVERSE IPHONE SCREENSHOT DECLUTTER CONTRACT PASS')
