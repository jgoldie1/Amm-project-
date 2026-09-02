import fs from 'node:fs'
import assert from 'node:assert/strict'

const service=fs.readFileSync(new URL('../src/services/aniyahPay.ts',import.meta.url),'utf8')
const rails=fs.readFileSync(new URL('../src/services/paymentRails.ts',import.meta.url),'utf8')
const hud=fs.readFileSync(new URL('../src/components/StreetVerseNextLevelHUD.tsx',import.meta.url),'utf8')
const center=fs.readFileSync(new URL('../src/components/AniyahPayCenter.tsx',import.meta.url),'utf8')

assert.match(service,/Math\.min\(5, Math\.max\(\.5, Number\(\(amount \* \.01\)\.toFixed\(2\)\)\)\)/,'Aniyah fee must be 1% with $0.50 minimum and $5 maximum')
assert.match(service,/\['flutterwave','paystack','fincra','kora','monnify','squad'\]/,'USD to NGN must retain a prioritized multi-provider corridor')
assert.match(service,/Real-money submission is disabled in the game client/,'Live money movement must stay server-side and gated')
for(const provider of ['stripe','flutterwave','paystack','monnify','moniepoint','remita','squad','opay','paga','tingg','fincra','kora','seerbit','mpesa']){
  assert.match(rails,new RegExp(`id:'${provider}'`),`${provider} adapter must be registered`)
}
assert.match(rails,/Adapter-ready does not mean live/,'Adapter registry must distinguish code readiness from live money movement')
assert.match(center,/OMNI PAYMENT ROUTER/,'Aniyah Pay must expose the global routing layer')
assert.match(center,/ADAPTER NETWORK/,'Aniyah Pay must expose adapter status')
assert.match(center,/No real money moved/,'Sandbox confirmation must never claim a live transfer')
assert.match(hud,/Aniyah Pay/,'StreetVerse HUD must launch Aniyah Pay')
assert.match(hud,/Holo Fon/,'StreetVerse HUD must retain Holo Fon access')

console.log('Aniyah Pay contract: PASS')
