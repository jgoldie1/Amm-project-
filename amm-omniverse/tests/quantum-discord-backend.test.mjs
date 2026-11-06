import assert from 'node:assert/strict'
import {generateKeyPairSync,sign} from 'node:crypto'
import {verifyDiscordSignature,chooseCommunity} from '../api/discord/interactions.mjs'
const {privateKey,publicKey}=generateKeyPairSync('ed25519')
const der=publicKey.export({type:'spki',format:'der'})
const key=der.subarray(-32).toString('hex')
const now=Date.now(),timestamp=String(Math.floor(now/1000))
const raw=Buffer.from(JSON.stringify({type:1}))
const signature=sign(null,Buffer.concat([Buffer.from(timestamp),raw]),privateKey).toString('hex')
assert.equal(verifyDiscordSignature(raw,timestamp,signature,key,now),true)
assert.equal(verifyDiscordSignature(Buffer.from('tampered'),timestamp,signature,key,now),false)
assert.equal(verifyDiscordSignature(raw,String(Math.floor(now/1000)-600),signature,key,now),false)
assert.equal(verifyDiscordSignature(raw,timestamp,'0'.repeat(128),key,now),false)
assert.equal(chooseCommunity('123','123,456'),'authorized')
assert.equal(chooseCommunity('789','123,456'),null)
assert.equal(chooseCommunity('123',''),null)
console.log('Discord Ed25519 signature, replay window and guild isolation tests: PASS')
