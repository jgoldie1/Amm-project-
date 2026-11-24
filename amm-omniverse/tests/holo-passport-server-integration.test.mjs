import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const ui=fs.readFileSync(new URL('../src/components/HoloServicePassportCenter.tsx',import.meta.url),'utf8')
const api=fs.readFileSync(new URL('../api/holo/authorization-preflight.js',import.meta.url),'utf8')
test('Passport review uses authenticated server check and never calls real mutations',()=>{
 for(const token of ["getAccessToken()","/api/holo/authorization-preflight","Check server authorization","authorization:'Bearer '+token","disabled={!passportId.trim()||preflightBusy}"])
  assert.ok(ui.includes(token),token)
 assert.match(ui,/BLOCKED —/)
 assert.doesNotMatch(ui,/setPreflightStatus\('APPROVED/)
})
test('preflight queries owner-scoped registry and returns no mutation authorization',()=>{
 assert.ok(api.includes("owner_user_id:'eq.'+userId"))
 assert.ok(api.includes("status==='approved'"))
 assert.ok(api.includes("authorization_expires_at"))
 assert.ok(api.includes("dispatchAuthorized:false,paymentAuthorized:false"))
 assert.doesNotMatch(api,/ready:\s*true/)
})
