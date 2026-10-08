import fs from 'node:fs'

const campaign=fs.readFileSync(new URL('../src/data/StubbsAIBusinessOSLaunchCampaign.ts',import.meta.url),'utf8')
const business=fs.readFileSync(new URL('../src/components/StubbsAIHolographicBusinessOS.tsx',import.meta.url),'utf8')
const workflow=fs.readFileSync(new URL('../../.github/workflows/tryamm-remote-catchup.yml',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('TRYAMM REMOTE CATCHUP CONTRACT FAIL: '+msg)}

for(const token of [
  'BUSINESS_OS_FIRST_10_DEMO_SLOTS',
  'targetDemoInvitations:40',
  'targetBookedDemos:10',
  'targetQualifiedProposals:5',
  'targetPaidSetupStarts:2',
  'noGuaranteedRevenue:true',
  'liveCheckoutRequiresVerifiedLiveStripe:true',
])must(campaign.includes(token),'launch campaign missing '+token)

for(const token of [
  "type View='command'|'sell'|'plans'|'launch'",
  'FIRST 10 CUSTOMER LAUNCH',
  'Founder demo campaign',
  'BUSINESS_OS_FIRST_10_DEMO_SLOTS',
  'BUSINESS_OS_LAUNCH_CONTENT',
  'BUSINESS_OS_OUTREACH',
])must(business.includes(token),'Business OS launch UI missing '+token)

for(const token of [
  'TRYAMM Remote Catchup',
  'npm run asset:audit',
  'npm run reconstruction:evidence',
  'npm run reconstruction:compile',
  'streetverse-asset-audit',
  'chicago-reconstruction-evidence',
  'retention-days: 14',
])must(workflow.includes(token),'remote workflow missing '+token)

console.log('TRYAMM REMOTE CATCHUP CONTRACT PASS: first-10 sales campaign + cloud asset audit + Chicago GIS evidence package')
