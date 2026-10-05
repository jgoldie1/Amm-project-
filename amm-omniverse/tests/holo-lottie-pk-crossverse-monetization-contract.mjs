import fs from 'node:fs'
const econ=fs.readFileSync(new URL('../src/data/TryammHoloPlayCreditEconomy.ts',import.meta.url),'utf8')
const spend=fs.readFileSync(new URL('../api/credits/spend.js',import.meta.url),'utf8')
const bridge=fs.readFileSync(new URL('../src/runtime/CrossVerseCampusVerseBridge.ts',import.meta.url),'utf8')
const gifts=fs.readFileSync(new URL('../src/components/HoloGiftEngine.tsx',import.meta.url),'utf8')
const kit=fs.readFileSync(new URL('../src/game/gifts/HolographicGiftKit.ts',import.meta.url),'utf8')
const stream=fs.readFileSync(new URL('../src/runtime/UniversalCreatorStreamBridge.ts',import.meta.url),'utf8')
for(const id of ['crossverse-portal-skin','crossverse-showcase-projection','crossverse-creator-stage','crossverse-cinematic-replay','crossverse-holo-fx-pack']){if(!econ.includes(id)||!spend.includes(id))throw new Error('CrossVerse credit item missing '+id)}
for(const x of ['tryamm:crossverse-holo-gift','tryamm:crossverse-credit-state','connectsHoloGifts:true','connectsCreditEntitlements:true'])if(!bridge.includes(x))throw new Error('CrossVerse value bridge missing '+x)
for(const x of ['OWNED LOTTIE KIT','PK ARENA','OPTIONAL TIP','SPARK • 10 CR','HOLO SUPPORT • 25 CR'])if(!gifts.includes(x))throw new Error('Holo gift monetization missing '+x)
for(const x of ['externalAnimationDependency:false','moneyMovedOnlyAfterVerifiedProviderEvent:true','visualEffectNeverCreatesWithdrawableBalance:true'])if(!kit.includes(x))throw new Error('Lottie gift safety missing '+x)
for(const x of ['platform-native-plus-tryamm','keepPlatformNativeMonetizationNative:true','neverConvertExternalGiftsToWithdrawableTryammBalanceWithoutVerifiedSettlement:true'])if(!stream.includes(x))throw new Error('Universal stream money boundary missing '+x)
console.log('Holo Lottie + PK LIVE + CrossVerse monetization contract: PASS')