import fs from 'node:fs'
const paths=[
 '../src/data/KingdomYahisraelRecoveryRegistry.ts',
 '../src/components/KingdomYahisraelCenter.tsx',
 '../src/components/JudahSplash.tsx',
 '../src/components/LionOfJudahHolo.tsx',
 '../src/components/EthiopianBibleMetaverse.tsx',
 '../src/components/FaithHoloBook.tsx',
 '../src/components/FaithScriptureReader.tsx',
 '../src/components/KingdomsPressHub.tsx',
 '../src/components/KingdomDistrictRoute.tsx',
 '../src/data/FaithVerseStudyLibrary.ts',
 '../src/data/SevenLightsCanonRegistry.ts',
 '../src/runtime/KingdomStreetVerseBridge.ts',
 '../public/streetverse-kingdom/index.html',
]
for(const p of paths)if(!fs.existsSync(new URL(p,import.meta.url)))throw new Error('Kingdom of Yahisrael recovery missing '+p)
const registry=fs.readFileSync(new URL('../src/data/KingdomYahisraelRecoveryRegistry.ts',import.meta.url),'utf8')
const center=fs.readFileSync(new URL('../src/components/KingdomYahisraelCenter.tsx',import.meta.url),'utf8')
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
const app=fs.readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8')
const faith=fs.readFileSync(new URL('../src/data/FaithVerseStudyLibrary.ts',import.meta.url),'utf8')
const chain=fs.readFileSync(new URL('../../supabase/migrations/20260904195500_set_apart_kingdom_chain_layer.sql',import.meta.url),'utf8')
const bridge=fs.readFileSync(new URL('../src/runtime/KingdomStreetVerseBridge.ts',import.meta.url),'utf8')
for(const x of ['Kingdom of Yahisrael • Judah','Where Heaven Meets Earth','Judah Command Gate','FaithVerse','Scripture + Hebrew School','Kingdom District','Servants of Christ','Kingdoms Press','Set Apart Kingdom Chain','Seven Lights of YAHAVAH','Living Worlds / CrossVerse','Kingdom Media + Broadcast'])if(!registry.includes(x))throw new Error('Kingdom registry missing '+x)
for(const x of ['KINGDOM OF','YAHISRAEL','WHERE HEAVEN MEETS EARTH','ENTER PLAYABLE KINGDOM','OPEN FAITHVERSE'])if(!center.includes(x))throw new Error('Kingdom front door missing '+x)
for(const route of ['/kingdom-of-yahisrael','/yahisrael','/judah','/where-heaven-meets-earth'])if(!main.includes(route))throw new Error('Kingdom route missing '+route)
if(!main.includes('KingdomYahisraelCenter')||!main.includes('isKingdomYahisrael'))throw new Error('Kingdom front door not mounted at entry')
if(!app.includes('KINGDOM OF YAHISRAEL')||!app.includes("window.location.href='/kingdom-of-yahisrael'"))throw new Error('Command Nexus Kingdom entry missing')
for(const x of ['ETHIOPIAN_ORTHODOX_CANON_81','TRYAMM_88_BOOK_CURRICULUM','PALEO_HEBREW_ALPHABET','STRONGS_STUDY'])if(!faith.includes(x))throw new Error('FaithVerse study foundation missing '+x)
for(const x of ['SABBATH','NEW_MOON','COVENANT','MINISTRY_SERVICE','EDUCATION','LEGACY','CHARITY_SERVICE'])if(!chain.includes(x))throw new Error('Set Apart chain missing '+x)
if(!chain.includes('Not a payment ledger')||!chain.includes('not a claim of governmental'))throw new Error('Set Apart legal/payment boundary disappeared')
if(!bridge.includes('event.origin!==window.location.origin'))throw new Error('Kingdom bridge same-origin validation disappeared')
console.log('Kingdom of Yahisrael / Judah convergence contract: PASS')