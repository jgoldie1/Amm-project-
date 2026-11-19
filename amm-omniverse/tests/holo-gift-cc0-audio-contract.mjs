import assert from 'node:assert/strict'
import fs from 'node:fs'
const root=new URL('../src/',import.meta.url)
const catalog=fs.readFileSync(new URL('components/HoloGiftEngine.tsx',root),'utf8')
const audio=fs.readFileSync(new URL('game/gifts/HoloGiftAudio.ts',root),'utf8')
const overlay=fs.readFileSync(new URL('components/HoloLivePkLottieOverlay.tsx',root),'utf8')
const ids=[...catalog.matchAll(/\bG\('([^']+)'/g)].map(x=>x[1])
assert.equal(ids.length,47,'Expected 47 previously authored holo gifts')
const map=audio.split('const BY_GIFT:')[1]?.split('};')[0]||''
for(const id of ids)assert.match(map,new RegExp('(?:^|[,\\s])[\\\'"]?'+id+'[\\\'"]?\\s*:'),'Missing audio mapping for '+id)
for(const expected of ['CC0','raw.githubusercontent.com/Mcamento8/open-game-sfx-index','enabled=true','audio.play().catch','authenticWhale:false','authenticLion:false','authenticShofar:false'])assert.ok(audio.includes(expected),expected)
assert.ok(audio.includes('audio.canPlayType'), 'Older Safari must be protected from unsupported OGG playback')
assert.ok(audio.includes('playFallbackTone'), 'Browser-native fallback must exist')
assert.ok(overlay.includes('playHoloGiftSound'),'LIVE gift overlay must play mapped sounds')
assert.ok(catalog.includes('setHoloGiftSoundEnabled'),'User-accessible mute control is required')
assert.ok(catalog.includes('Authentic whale, lion, shofar and licensed songs are pending.'),'Do not misrepresent generic sound effects as authentic')
console.log('47 Holo Gifts CC0 audio source integration: PASS (static; device playback requires acceptance)')
