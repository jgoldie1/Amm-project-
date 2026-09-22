import fs from 'node:fs'
import assert from 'node:assert/strict'

const src=fs.readFileSync(new URL('../src/game/runtime/creatorLiveSettlement.ts',import.meta.url),'utf8')
for(const event of ['live-gift','live-ticket','live-subscription','pk-gift','pk-prize','debate-gift','debate-ticket','debate-sponsor','debate-prize','family-creator-earning','agency-creator-earning'])assert.match(src,new RegExp(event))
assert.match(src,/providerVerificationRequired:true/)
assert.match(src,/validateCreatorAgencyMembership/)
assert.match(src,/split-exceeds-100-percent/)
assert.match(src,/debateWageringSupported:false/)
assert.match(src,/reversalsMustReverseOriginalAllocations:true/)
assert.match(src,/clientMayMintBalance:false/)
assert.match(src,/familyWalletPoolingDefault:false/)
console.log('Creator LIVE settlement convergence contract: PASS')
