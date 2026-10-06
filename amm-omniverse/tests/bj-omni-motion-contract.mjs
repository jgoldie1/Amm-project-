import fs from 'node:fs'

const bj=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyBJHeroRuntime.ts',import.meta.url),'utf8')
const bjData=fs.readFileSync(new URL('../src/data/streetVerseBJStubbsCharacter.ts',import.meta.url),'utf8')
const lottie=fs.readFileSync(new URL('../src/game/lottie/LottieAnimations.ts',import.meta.url),'utf8')
const omnibar=fs.readFileSync(new URL('../src/components/StreetVerseRPOmnibar.tsx',import.meta.url),'utf8')
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
const care=fs.readFileSync(new URL('../src/components/OmniCareCashSuite.tsx',import.meta.url),'utf8')
const cash=fs.readFileSync(new URL('../src/components/OmniCashLauncher.tsx',import.meta.url),'utf8')
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))

const must=(ok,msg)=>{if(!ok)throw new Error('BJ OMNI MOTION CONTRACT FAIL: '+msg)}

for(const token of [
  "id:'bj-stubbs'",
  "status:'REFERENCE_LOCKED'",
  "photoMatchedHeadRequiredForCertifiedLikeness:true",
  "liveMicLipSync:true",
  "facialMorphReady:true",
]) must(bjData.includes(token),'BJ identity continuity missing '+token)

for(const token of [
  "filename:'SV_HERO_BJ_STUBBS_V6.glb'",
  "url:'/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V6.glb'",
  "certifiedLikeness:false",
  "resolvePublishedMeshyAsset('sv-bj-stubbs-v6'",
  "applyFacePose",
  "jawOpen",
  "blinkLeft",
  "walk",
  "run",
]) must(bj.includes(token),'BJ V6 runtime missing '+token)

for(const token of ["'genii_orb'","'wish_cast'","'omnicare_pulse'","'omnicash_flow'"]) must(lottie.includes(token),'Lottie motion missing '+token)
must(omnibar.includes("playLottie(host,'genii_orb'"),'RP Omnibar does not mount Genii orb')
must(omnibar.includes("playLottie(burstRef.current,'wish_cast'"),'RP Omnibar does not animate wish cast')
must(omnibar.includes("window.location.href='/omnicare-360'"),'RP Omnibar missing OmniCare route')
must(omnibar.includes("window.location.href='/omni-cash'"),'RP Omnibar missing OmniCash route')

must(main.includes("const OmniCareCashSuite=lazy"),'OmniCare/Cash suite is not routed')
must(main.includes("'/omnicare-360'"),'OmniCare route missing')
must(main.includes("'/omni-cash'"),'OmniCash route missing')
must(main.includes("import OmniCashLauncher"),'OmniCash launcher import missing')
must(main.includes("<OmniCashLauncher />"),'OmniCash launcher not mounted')
must(care.includes("name:'OmniCare 360'"),'OmniCare 360 product missing')
must(care.includes("name:'Omni Cash'"),'Omni Cash product missing')
must(cash.includes('No Silent Money Movement'),'OmniCash provider guard missing')
must(cash.includes('KYC, AML, sanctions screening'),'OmniCash compliance guard missing')
must(String(pkg.scripts?.build||'').includes('bj-omni-motion-contract.mjs'),'production build does not run BJ/Omni motion contract')

console.log('BJ + OMNI CARE/CASH + OMNIBAR MOTION CONTRACT PASS')
