import fs from 'node:fs'
const shield=fs.readFileSync(new URL('../api/_lib/payout-protection.js',import.meta.url),'utf8')
const endpoint=fs.readFileSync(new URL('../api/payouts/eligibility.js',import.meta.url),'utf8')
const refunds=fs.readFileSync(new URL('../api/commerce/refunds.js',import.meta.url),'utf8')
for(const x of ['first_payout_hold','young_account_payout_hold','large_payout_step_up','very_large_payout_manual_review','open_seller_dispute','payout_completed','evaluateFraudRisk'])if(!shield.includes(x))throw new Error('Payout protection missing '+x)
for(const x of ['requireUser','evaluatePayoutProtection'])if(!endpoint.includes(x))throw new Error('Payout eligibility endpoint missing '+x)
for(const x of ['commerce_seller_allocations','transfer_status','blocked','refund_review_payout_freeze'])if(!refunds.includes(x))throw new Error('Refund payout freeze missing '+x)
console.log('Payout protection contract: PASS')
