import fs from 'node:fs'
const runtime=fs.readFileSync(new URL('../src/runtime/CreatorMoneyCenterRuntime.ts',import.meta.url),'utf8')
const ui=fs.readFileSync(new URL('../src/components/CreatorMoneyCenter.tsx',import.meta.url),'utf8')
const app=fs.readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8')
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')

for(const x of ['PENDING','VERIFIED','PAYABLE','PAID','REVERSED','serverAuthoritative','tryamm:commerce-ledger-authoritative','tryamm:creator-ledger-authoritative','tryamm:live-gift-verified','cashOnlyFromServerAuthority'])if(!runtime.includes(x))throw new Error('Creator Money Center runtime missing '+x)
for(const x of ['YOUR MONEY • ONE VIEW','XP and Holo Credits stay separate','provider or server verifies','Reversals and refunds remain visible'])if(!ui.includes(x))throw new Error('Creator Money Center UI missing '+x)
if(!app.includes('CreatorMoneyCenter'))throw new Error('Creator Money Center not mounted in app shell')
if(!main.includes('installCreatorMoneyCenterRuntime'))throw new Error('Creator Money Center runtime not installed')
console.log('Creator Money Center contract: PASS')
