import fs from 'node:fs'
import assert from 'node:assert/strict'

const hud=fs.readFileSync(new URL('../src/components/StreetVerseNextLevelHUD.tsx',import.meta.url),'utf8')

assert.match(hud,/STREETVERSE • CONTROL DECK/,'StreetVerse must expose the upgraded control deck')
assert.match(hud,/PLAY/,'Control deck must keep a Play lane')
assert.match(hud,/CREATE/,'Control deck must expose creator controls')
assert.match(hud,/SYSTEM/,'Control deck must expose system controls')
assert.match(hud,/Start Reel/,'Reel recording/creation must be visible from StreetVerse')
assert.match(hud,/Broadcast/,'LIVE/broadcast access must be visible')
assert.match(hud,/Omni Box/,'Omni Box must remain directly accessible')
assert.match(hud,/Aniyah Pay/,'Aniyah Pay must remain directly accessible')
assert.match(hud,/Command Nexus/,'Command Nexus must be exposed')
assert.match(hud,/Omni Wallet/,'Wallet/ledger access must be exposed')
assert.match(hud,/aria-live="polite"/,'Launcher failures must be announced accessibly')
assert.match(hud,/minHeight:44/,'Primary mobile controls must use large touch targets')
assert.match(hud,/runtime launcher is not connected/,'Buttons must explain disconnected runtime launchers instead of failing silently')
assert.match(hud,/Real-money submission remains server-side and compliance-gated/,'Payment safety boundary must remain visible')

console.log('StreetVerse control deck contract: PASS')
