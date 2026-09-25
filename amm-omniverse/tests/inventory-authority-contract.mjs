import assert from 'node:assert/strict'
import fs from 'node:fs'
const source=fs.readFileSync(new URL('../src/commerce/inventoryAuthority.ts',import.meta.url),'utf8')
for(const token of ['AVAILABLE','RESERVED','IN_TRANSIT','HOLD','SOLD','RETURNED','LOW_STOCK','REPLENISHMENT_RECOMMENDED','availableToPromise','reserveInventory','releaseReservation','fulfillReservation','replenishmentSuggestion','requiresHumanApproval: true','coldChainCanSell','Cold-chain evidence required','Expired inventory cannot be sold']) assert.ok(source.includes(token),'Inventory authority missing: '+token)
assert.match(source,/if \(item\.state === 'HOLD'\) throw new Error\('Inventory on HOLD cannot be reserved'\)/,'HOLD inventory reservation gate missing')
assert.doesNotMatch(source,/requiresHumanApproval:\s*false/,'replenishment must not silently order inventory')
console.log('Virtual inventory authority contract: PASS')
