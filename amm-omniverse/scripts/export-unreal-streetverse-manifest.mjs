import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const here=path.dirname(fileURLToPath(import.meta.url))
const appRoot=path.resolve(here,'..')
const outDir=path.resolve(appRoot,'../unreal/StreetVerseUnreal/Import')
const outFile=path.join(outDir,'tryamm-streetverse-manifest.json')

const manifest={
  schema:'tryamm.unreal.interop.v1',
  generatedAt:new Date().toISOString(),
  authority:{
    identity:'TRYAMM backend',
    money:'server-ledger',
    purchases:'server-verified',
    unrealEditorMayMintSpendableValue:false,
  },
  clients:{
    web:{engine:'Three.js + React Three Fiber',physics:'Rapier 3D'},
    unreal:{engine:'Unreal Engine 5.8',mcp:'ModelContextProtocol',endpoint:'http://127.0.0.1:8000/mcp'},
  },
  verses:['streetverse','kingdom','campusverse','crossverse'],
  sharedState:[
    'playerId','creatorId','passportId','missionId','vehicleId','district',
    'inventory','omnibox','ledgerRef','waypoint','contentId'
  ],
  events:[
    'KINGDOM_READY','PLAYER_MOVED','VEHICLE_ENTERED','VEHICLE_EXITED',
    'WAYPOINT_SET','WAYPOINT_REACHED','MISSION_STARTED','MISSION_COMPLETED',
    'REEL_CAPTURE_REQUEST','OMNIBOX_SAVE_REQUEST',
    'CAMPUSVERSE_TRAVEL_REQUEST','CROSSVERSE_TRAVEL_REQUEST',
    'tryamm:verse-state-transfer','tryamm:reel-capture-request',
    'tryamm:omnibox-save-request','tryamm:mission-completion-request'
  ],
  assetInterchange:{
    preferred:['glb','gltf','fbx','usd'],
    optimization:['lod','collision','texture-compression','mobile-fallback'],
  },
  productionRules:[
    'Unreal editor MCP is a development tool, not a production dependency.',
    'Keep MCP bound to localhost.',
    'Do not trust client-side mission completion for payouts.',
    'Preserve TRYAMM ids when importing/exporting assets and world records.'
  ]
}

fs.mkdirSync(outDir,{recursive:true})
fs.writeFileSync(outFile,JSON.stringify(manifest,null,2)+'\n')
console.log(outFile)
