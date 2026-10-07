import fs from 'node:fs'

const component=fs.readFileSync(new URL('../src/components/StubbsAIHolographicBusinessOS.tsx',import.meta.url),'utf8')
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
const nexus=fs.readFileSync(new URL('../src/components/CommandNexusControlPlane.tsx',import.meta.url),'utf8')
const priceBook=fs.readFileSync(new URL('../src/data/ElSaturnLaunchPriceBook.ts',import.meta.url),'utf8')
const catalog=fs.readFileSync(new URL('../src/data/ElSaturnBusinessRevenueCatalog.ts',import.meta.url),'utf8')
const goToMarket=fs.readFileSync(new URL('../src/data/StubbsAIBusinessOSGoToMarket.ts',import.meta.url),'utf8')
const founder=fs.readFileSync(new URL('../src/runtime/HoloGPTFounderCommandCenter.ts',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('STUBBS AI HOLOGRAPHIC BUSINESS OS CONTRACT FAIL: '+msg)}

for(const token of [
  'aria-label="Stubbs AI Holographic Business OS"',
  'data-spatial-mode="holographic-command-room-v1"',
  'FOUNDER COMMAND','MONEY CENTER','SALES + MARKETING','CUSTOMER SUPPORT','OPERATIONS','DEVOPS','HOLO SHOWROOM','QUANT LAB',
  "status:'LIVE LOCKED'",
  "metric:'PAPER ONLY'",
  'tryamm:business-os-lead-intent',
  'tryamm:business-os-xr-request',
  'minHeight:44',
  'No guaranteed revenue',
])must(component.includes(token),'component missing '+token)

for(const route of ["'/business-os'","'/stubbs-ai-business-os'","'/founder-command'"])must(main.includes(route),'main route missing '+route)
must(main.includes('<StubbsAIHolographicBusinessOS />'),'standalone Business OS route render missing')
must(nexus.includes("['◇','Stubbs AI Business OS','/business-os']"),'Command Nexus launcher missing')

for(const token of [
  "id:'ai-business-os'",
  "monthlyLeaseUsd:49",
  "setupUsd:199",
  "managedServiceUsd:299",
  "id:'holo-services'",
  "monthlyLeaseUsd:39",
])must(priceBook.includes(token),'price book missing '+token)

must(catalog.includes('Holographic Founder Command'),'AI Business OS catalog must include holographic founder command positioning')
for(const token of [
  "primaryPitch:'Run more of your business from one AI command center.'",
  'noGuaranteedRevenue:true',
  'providerGatedClaimsMustStayGated:true',
  'quantResearchStartsPaperOnly:true',
  'founder-led local demonstrations',
  'short-form demo reels showing before/after workflow',
  'business association and chamber partnerships',
  'DEMO','AUDIT','SETUP','SUBSCRIBE','EXPAND',
])must(goToMarket.includes(token),'go-to-market playbook missing '+token)

for(const token of ['NEEDS_APPROVAL','APPROVE_HIGH_IMPACT_ACTION','one-hand-primary-actions','voice-command-ready'])must(founder.includes(token),'Founder command safety/accessibility missing '+token)

console.log('STUBBS AI HOLOGRAPHIC BUSINESS OS CONTRACT PASS: command room + sellable pricing + GTM playbook + human authority + paper-only quant boundary')
