import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const read=p=>readFileSync(resolve(root,p),'utf8')
const bridge=read('src/runtime/UniversalCreatorStreamBridge.ts')
const gateway=read('src/runtime/StreetVerseLiveAudienceGateway.ts')
for(const platform of ['tiktok','twitch','kick','youtube','facebook','instagram','snapchat','steam','douyin','kuaishou','bilibili','line','wechat','niconico']){
  assert.match(bridge,new RegExp("platform:'"+platform+"'"),platform+' missing from distribution registry')
}
assert.match(gateway,/providerVerified/, 'provider verification required')
assert.match(gateway,/moderatorApproved/, 'moderator approval required')
assert.match(gateway,/opts\.seenIds\.has/, 'duplicate events rejected')
assert.match(gateway,/AUDIENCE_INTERACTION_DISABLED/, 'default off switch provided')
assert.match(gateway,/FINANCIAL|financialReward:false/, 'audience events cannot be financial rewards')
assert.match(gateway,/autoExecute:false/, 'viewer event cannot directly execute gameplay')
assert.match(gateway,/SESSION_MISMATCH/, 'game session binding required')
assert.match(gateway,/PLATFORM_NOT_APPROVED/, 'provider allowlist required')
console.log('StreetVerse LIVE gateway source contract PASS (static only; no provider connectivity proven)')
