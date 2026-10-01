import fs from 'node:fs'
import assert from 'node:assert/strict'
const dock=fs.readFileSync(new URL('../src/components/StreetVerseCoreGameplayDock.tsx',import.meta.url),'utf8')
const product=fs.readFileSync(new URL('../src/runtime/OmniLiveProductRuntime.ts',import.meta.url),'utf8')
const board=fs.readFileSync(new URL('../src/runtime/OmniLiveEventBoard.ts',import.meta.url),'utf8')
const terms=fs.readFileSync(new URL('../../docs/omni-live-terms-foundation-v0.1.md',import.meta.url),'utf8')
for(const k of ['LIVE/CAST','tryamm:live-center-open','tryamm:volcano-holocast-open'])assert.ok(dock.includes(k),k)
for(const k of ['TRYAMM Omni LIVE','Omni Board','Omni PK','OmniCast','Omni Translate','externalMoneyStaysExternalUntilSettled:true','pkPointsAreNotCash:true','noFakeViewers:true','noAutoSpend:true'])assert.ok(product.includes(k),k)
for(const k of ['userAvatarUrl','platformIconKey','translatedText','verifiedGiftTipBadge','financialDisplayOnly','contributesToPk'])assert.ok(board.includes(k),k)
for(const k of ['External streaming services remain independent','Omni PK points are engagement scores','legal review before public real-money launch'])assert.ok(terms.includes(k),k)
console.log('Omni LIVE alpha foundation contract: PASS')
