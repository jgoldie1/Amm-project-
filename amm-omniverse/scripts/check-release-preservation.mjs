import fs from 'node:fs'
import path from 'node:path'

const root=process.cwd()
const indexPath=path.join(root,'index.html')
const index=fs.readFileSync(indexPath,'utf8')

const requiredPublicFiles=[
  'public/streetverse-reel.js',
  'public/streetverse-safe-mode.js',
  'public/streetverse-mobile-life.js',
  'public/streetverse-art-billboard.js',
  'public/streetverse-npc-conversation.js',
  'public/streetverse-mpc.js',
  'public/streetverse-ecology.js',
  'public/streetverse-ecology-lifecycle.js',
  'public/streetverse-marine-life.js',
  'public/streetverse-marine-lifecycle.js',
  'public/streetverse-apex-wildlife.js',
  'public/streetverse-savanna-wildlife.js',
  'public/streetverse-ecology-audio.js',
  'public/streetverse-outdoors.js',
  'public/streetverse-global-world.js',
  'public/streetverse-gps-world.js',
  'public/tryamm-global-supply-chain.js',
  'public/tryamm-supply-chain-revenue.js',
  'public/global-supply-chain.html',
  'public/supply-chain-growth.html'
]

const requiredIndexScripts=[
  '/streetverse-reel.js',
  '/streetverse-safe-mode.js',
  '/streetverse-mobile-life.js',
  '/streetverse-art-billboard.js',
  '/streetverse-npc-conversation.js',
  '/streetverse-mpc.js',
  '/streetverse-ecology.js',
  '/streetverse-ecology-lifecycle.js',
  '/streetverse-marine-life.js',
  '/streetverse-marine-lifecycle.js',
  '/streetverse-apex-wildlife.js',
  '/streetverse-savanna-wildlife.js',
  '/streetverse-ecology-audio.js',
  '/streetverse-outdoors.js',
  '/streetverse-global-world.js',
  '/streetverse-gps-world.js',
  '/tryamm-global-supply-chain.js'
]

// Protect critical StreetVerse routes, gameplay, character and asset generation
// alongside the legacy public loaders. These checks never modify the originals.
const requiredStreetVerseModules=[
  'src/components/StreetVerseGeoSpawnBridge.tsx',
  'src/components/StreetVersePlayableWorld.tsx',
  'src/components/StreetVerseNearWest3D.tsx',
  'src/components/StreetVerseSafeWorld.tsx',
  'scripts/mind-over-matter-clean-room-foundry.mjs',
  'scripts/genie-mind-over-matter-safe-publish.mjs',
  'tests/e2e/streetverse-visual-evidence.spec.ts'
]
const missingStreetVerseModules=requiredStreetVerseModules.filter(file=>!fs.existsSync(path.join(root,file)))
const geoBridge=missingStreetVerseModules.includes('src/components/StreetVerseGeoSpawnBridge.tsx')?'':fs.readFileSync(path.join(root,'src/components/StreetVerseGeoSpawnBridge.tsx'),'utf8')
const requiredStreetVerseContracts=[
  ['playable world', 'StreetVersePlayableWorld'],
  ['safe world', 'StreetVerseSafeWorld'],
  ['Taylor Street neighborhood', 'StreetVerseNearWest3D'],
  ['Taylor Street travel control', 'data-streetverse-travel'],
  ['Chicago return control', 'Return to StreetVerse Chicago']
]
const missingStreetVerseContracts=requiredStreetVerseContracts.filter(([,needle])=>!geoBridge.includes(needle)).map(([label])=>label)

const missingFiles=requiredPublicFiles.filter(file=>!fs.existsSync(path.join(root,file)))
const missingLoaders=requiredIndexScripts.filter(src=>!index.includes(src))

if(missingFiles.length||missingLoaders.length||missingStreetVerseModules.length||missingStreetVerseContracts.length){
  console.error('TRYAMM release-preservation guard failed.')
  if(missingFiles.length)console.error('Missing files:',missingFiles.join(', '))
  if(missingLoaders.length)console.error('Missing index loaders:',missingLoaders.join(', '))
  if(missingStreetVerseModules.length)console.error('Missing StreetVerse modules:',missingStreetVerseModules.join(', '))
  if(missingStreetVerseContracts.length)console.error('Missing StreetVerse contracts:',missingStreetVerseContracts.join(', '))
  process.exit(1)
}

console.log(`TRYAMM release-preservation guard passed: ${requiredPublicFiles.length} files, ${requiredIndexScripts.length} loaders, ${requiredStreetVerseModules.length} StreetVerse modules and ${requiredStreetVerseContracts.length} route contracts preserved.`)
