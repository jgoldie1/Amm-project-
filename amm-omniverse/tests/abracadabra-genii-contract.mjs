import fs from 'node:fs'

const runtime=fs.readFileSync(new URL('../src/runtime/AbracadabraGeniiRuntime.ts',import.meta.url),'utf8')
const ui=fs.readFileSync(new URL('../src/components/AbracadabraGeniiOmnibar.tsx',import.meta.url),'utf8')
const mobile=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))

const must=(ok,msg)=>{if(!ok)throw new Error('ABRACADABRA GENII CONTRACT FAIL: '+msg)}

for(const token of [
  "schema:'tryamm.abracadabra-genii.v2'",
  'compileAbracadabraSpell',
  'lanePolicy',
  'policyBlocks',
  'free-assets-first',
  'preview-first',
  'productionMutation:false',
  'tryamm:holoforge-request',
  'tryamm:time-machine-world-foundry-request',
  'tryamm:city-investment',
  'tryamm:city-incident',
  'tryamm:streetverse-mission-start',
  'tryamm:holo-city-open',
  'tryamm:omnifabric-job-request',
  'tryamm:mod-pass-ar-place',
  'tryamm:crossverse-mod-export',
  'tryamm:open-reel-creator',
  'tryamm:omnibox-save-request',
  'tryamm:abracadabra-blocked',
  'tryamm:abracadabra-executed',
]) must(runtime.includes(token),'runtime missing '+token)

for(const token of [
  'Abracadabra GENII',
  'VOICE',
  'ABRACADABRA',
  'tryamm:abracadabra-cast',
  'tryamm:abracadabra-plan',
  'BLOCKED BY WORLD POLICY',
]) must(ui.includes(token),'omnibar missing '+token)

must(mobile.includes("installAbracadabraGeniiRuntime"),'StreetVerse mobile does not install Abracadabra')
must(mobile.includes("<AbracadabraGeniiOmnibar/>"),'StreetVerse mobile does not render Abracadabra omnibar')
must(mobile.includes("['abracadabra','✨ ABRACADABRA']"),'quick menu lacks Abracadabra')
must(mobile.includes('abracadabraDispose()'),'StreetVerse cleanup lacks Abracadabra disposal')
must(main.includes("import('./runtime/AbracadabraGeniiRuntime')"),'global boot does not install Abracadabra')
must(String(pkg.scripts?.build||'').includes('abracadabra-genii-contract.mjs'),'production build does not run Abracadabra contract')

console.log('ABRACADABRA GENII 2.0 CONTRACT PASS')
