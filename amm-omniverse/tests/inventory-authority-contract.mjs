import fs from 'node:fs'
const source=fs.readFileSync(new URL('../src/commerce/inventoryAuthority.ts',import.meta.url),'utf8')
for(const token of ['AVAILABLE','RESERVED','IN_TRANSIT','HOLD','SOLD','RETURNED','LOW_STOCK','REPLENISHMENT_RECOMMENDED','availableToPromise','reserveInventory','releaseReservation','fulfillReservation','replenishmentSuggestion','requiresHumanApproval: true','coldChainCanSell','Cold-chain evidence required','Expired inventory cannot be sold']){
 if(!source.includes(token)) throw new Error('Inventory authority missing: '+token)
}
if(!source.includes("if (item.state === 'HOLD') throw new Error('Inventory on HOLD cannot be reserved')")) throw new Error('HOLD inventory reservation gate missing')
console.log('Virtual inventory authority contract: PASS')
