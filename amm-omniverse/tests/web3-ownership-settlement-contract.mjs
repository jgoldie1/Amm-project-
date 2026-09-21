import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/commerce/web3OwnershipSettlement.ts',import.meta.url),'utf8')
for(const x of ['DigitalItemPassport',"'NFT_1369'",'maxSupply !== 1369','authorizeSettlement','Verified provider payment required','Refund/chargeback gate not satisfied','Fraud review required','Settlement allocations must reconcile exactly to funded amount','reconcileChainProof','wallet-recovery-and-key-security','rights-and-ip-registry','idempotency-and-double-pay-protection','chain-accounting-reconciliation','privacy-data-minimization','emergency-pause-controls','Blockchain records ownership/proof events','XP and Holo Credits remain non-cash']) {
 if(!s.includes(x)) throw new Error('Web3 ownership/settlement contract missing: '+x)
}
if(/HOLO_CREDITS[^\n]{0,120}(PAYABLE|amountMinor)/.test(s)) throw new Error('Holo Credits must not become payable money')
console.log('Web3 ownership / NFT 1369 settlement contract: PASS')
