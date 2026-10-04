import fs from 'node:fs'
const shield=fs.readFileSync(new URL('../api/_lib/fraud-shield.js',import.meta.url),'utf8')
const endpoint=fs.readFileSync(new URL('../api/security/risk-check.js',import.meta.url),'utf8')
const payment=fs.readFileSync(new URL('../api/payments/route.js',import.meta.url),'utf8')
for(const x of ['ALLOW','STEP_UP','REVIEW','BLOCK','high_recent_attempt_velocity','new_account_under_24h','money_out_action','creator_scout_identity_overlap','recentlyAuthenticated','security_audit_events'])if(!shield.includes(x))throw new Error('Fraud Shield missing '+x)
for(const x of ['requireUser','evaluateFraudRisk'])if(!endpoint.includes(x))throw new Error('Risk endpoint missing '+x)
for(const x of ['evaluateFraudRisk','fraudDecisionAllowsMoney','FRAUD_REVIEW_REQUIRED'])if(!payment.includes(x))throw new Error('Payment router fraud gate missing '+x)
console.log('TRYAMM Fraud Shield contract: PASS')
