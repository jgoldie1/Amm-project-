import fs from 'node:fs'

const bridge=fs.readFileSync(new URL('../src/runtime/CrossVerseCampusVerseBridge.ts',import.meta.url),'utf8')
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
const campus=fs.readFileSync(new URL('../src/components/StreetVerseNearWest3D.tsx',import.meta.url),'utf8')
const network=fs.readFileSync(new URL('../src/data/campusVerseIllinoisUniversityNetwork.ts',import.meta.url),'utf8')

for(const x of [
  "tryamm:crossverse-campusverse-bridge-ready",
  "tryamm:crossverse-travel-request",
  "tryamm:crossverse-travel",
  "tryamm:verse-state-transfer",
  "tryamm:campusverse-travel",
  "tryamm:reel-published",
  "tryamm:omnibox-published",
  "tryamm:creator-commerce-published",
  "playerId",
  "creatorId",
  "passportId",
  "server-ledger"
])if(!bridge.includes(x))throw new Error('CrossVerse bridge missing '+x)

if(!main.includes("installCrossVerseCampusVerseBridge"))throw new Error('CrossVerse bridge is not installed from main.tsx')
if(!campus.includes("tryamm:campusverse-travel"))throw new Error('CampusVerse travel event missing from StreetVerse world')
for(const x of ['University of Illinois Chicago','Greenville University'])if(!network.includes(x))throw new Error('CampusVerse network missing '+x)

console.log('CrossVerse + CampusVerse shared player/creator state bridge contract: PASS')
