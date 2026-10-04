import fs from 'node:fs'

const bridge=fs.readFileSync(new URL('../src/runtime/KingdomStreetVerseBridge.ts',import.meta.url),'utf8')
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')

for(const x of [
  'KINGDOM_READY',
  'PLAYER_MOVED',
  'VEHICLE_ENTERED',
  'VEHICLE_EXITED',
  'WAYPOINT_SET',
  'WAYPOINT_REACHED',
  'MISSION_STARTED',
  'MISSION_COMPLETED',
  'REEL_CAPTURE_REQUEST',
  'OMNIBOX_SAVE_REQUEST',
  'CAMPUSVERSE_TRAVEL_REQUEST',
  'CROSSVERSE_TRAVEL_REQUEST',
  'tryamm:mission-completion-request',
  'tryamm:reel-capture-request',
  'tryamm:omnibox-save-request',
  'tryamm:campusverse-travel',
  'tryamm:crossverse-travel-request',
  'tryamm:verse-state-transfer',
  'server-ledger'
])if(!bridge.includes(x))throw new Error('Kingdom bridge missing '+x)

if(!main.includes('installKingdomStreetVerseBridge'))throw new Error('Kingdom bridge is not installed from main.tsx')
console.log('Kingdom -> StreetVerse/CrossVerse/CampusVerse bridge contract: PASS')
