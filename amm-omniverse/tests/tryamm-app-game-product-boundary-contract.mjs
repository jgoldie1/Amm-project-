import fs from 'node:fs'
import assert from 'node:assert/strict'

const boundary=fs.readFileSync(new URL('../src/data/TryammProductBoundary.ts',import.meta.url),'utf8')
const directory=fs.readFileSync(new URL('../src/components/TryammProductDirectory.tsx',import.meta.url),'utf8')
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
const launch=fs.readFileSync(new URL('../src/components/GlobalLaunchBar.tsx',import.meta.url),'utf8')

for(const token of [
  'TRYAMM_APP_FEATURES',
  'TRYAMM_GAME_FEATURES',
  'TRYAMM_SHARED_SERVICES',
  "appRoute:'/'",
  "gameRoute:'/streetverse'",
  "Game code must never directly approve payouts",
  "App code must never own authoritative player physics"
])assert.ok(boundary.includes(token),'boundary missing '+token)

for(const token of [
  'Creator + Social',
  'Marketplace + Business',
  'Middleverse Work',
  'Communications',
  'TV + Media Network',
  'Faith + Study',
  'Money + Care',
  'Education + AI + Labs',
  'Travel + Property + Services',
  'Accessibility + Safety + Account',
  'StreetVerse World',
  'Player + Characters',
  'Missions + Story',
  'Vehicles + Living City',
  'Simulation + Action',
  'Game Progression',
  'In-Game Social + Media',
  'Identity + Safety Services',
  'Commerce + Ledger Authority'
])assert.ok(boundary.includes(token),'feature catalog missing '+token)

assert.ok(directory.includes('TRYAMM app and game feature directory'),'visible product directory missing')
assert.ok(directory.includes('App and Game are separate products'),'product separation statement missing')
assert.ok(main.includes("'/features'")&&main.includes('<TryammProductDirectory />'),'feature directory route missing')
assert.ok(launch.includes("['APP / GAME MAP','/features']"),'quick launch feature map missing')

// Existing bootstrap separation: game route receives its own light runtime path,
// while app/global UI is installed only outside /streetverse.
assert.ok(main.includes("if (window.location.pathname.startsWith('/streetverse'))"),'StreetVerse runtime boundary missing')
assert.ok(main.includes('installOptionalRuntimes()'),'app runtime installer missing')
assert.ok(main.includes('<HoloExperienceLauncher />'),'app global Holo launcher missing')
assert.ok(main.includes('return\n  }\n  installOptionalRuntimes()')||main.includes('return\r\n  }\r\n  installOptionalRuntimes()'),'game branch must return before app runtime install')

console.log('TRYAMM APP/GAME PRODUCT BOUNDARY CONTRACT PASS')
