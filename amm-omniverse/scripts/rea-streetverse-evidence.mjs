#!/usr/bin/env node
/**
 * REA-style source-to-runtime evidence inventory for code owned by TRYAMM.
 * Read-only, Node built-ins only. Does not download or execute GTA binaries,
 * third-party code, REA itself, or private production credentials.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const scan=[
 {id:'frontend',name:'StreetVerse mobile 3D entry',file:'src/components/StreetVerseMobileWorld.tsx',required:['installStreetVerseVisibleForgeBridge','deliveryParcel','storeInteriorCollision']},
 {id:'overlays',name:'StreetVerse main game overlays mount the world builder',file:'src/components/StreetVerseFullWorldOverlays.tsx',required:['StreetVerseWestSideWorldBuilder']},
 {id:'builder',name:'Visible West Side world builder',file:'src/components/StreetVerseWestSideWorldBuilder.tsx',required:['forge-placement-request','OPEN','BUILD']},
 {id:'generator',name:'Living City Generator',file:'src/data/StreetVerseLivingCityGenerator.ts',required:['generateStarterDistrict','validateStarterDistrict']},
 {id:'characters',name:'Character GLB loader',file:'src/runtime/StreetVerseMeshyBJHeroRuntime.ts',required:['loadStreetVerseMeshyBJHero']},
 {id:'vehicle',name:'StreetVerse vehicle controls',file:'src/components/StreetVerseMobileWorld.tsx',required:['activeCar']},
 {id:'mission',name:'Delivery runtime',file:'src/runtime/StreetVerseHoloDeliveryMissionRuntime.ts',required:['mission']},
 {id:'cafe',name:'AI Café agent runtime',file:'src/runtime/AICafeMultiAgentRuntime.ts',required:['installAICafeMultiAgentRuntime']},
 {id:'backend',name:'Authenticated backend jobs',file:'api/agents/jobs.js',required:['requireUser','city-build-plan']},
 {id:'hologpt',name:'HoloGPT runtime and launcher',file:'src/components/HoloGPTAssistant.tsx',required:['tryamm:open-hologpt']},
 {id:'middleverse',name:'MiddleVerse workstation',file:'src/components/MiddleverseAIHub.tsx',required:['Middleverse AI']},
 {id:'websites',name:'Website business builder',file:'src/components/AIWebsiteBusinessBuilder.tsx',required:['AIWebsiteBusinessBuilder']},
 {id:'open-world-kernel',name:'StreetVerse original 60Hz fixed-step world kernel',file:'src/runtime/StreetVerseOriginalOpenWorldKernel.ts',required:['createStreetVerseWorldKernel','STREETVERSE_KERNEL_DT']},
 {id:'kernel-ui',name:'Visible RAGE-style engine self-test button',file:'src/components/StreetVerseMyceliumSubmissionPanel.tsx',required:['RETEST OPEN WORLD DRIVING SIMULATION','createStreetVerseWorldKernel']},
 {id:'mycelium',name:'Mycelium simulation integration',file:'src/runtime/StreetVerseMyceliumNetwork.ts',required:['createStreetVerseMyceliumNetwork']},
 {id:'submission',name:'One-button integration',file:'src/runtime/StreetVerseOneButtonSubmissionTest.ts',required:['runStreetVerseSubmissionTest']},
 {id:'rig-evidence',name:'Loaded BJ GLB skeletal evidence',file:'src/runtime/StreetVerseMeshyBJHeroRuntime.ts',required:['tryamm:streetverse-bj-rig-audit','renderableSkinnedMeshes','rigReady']},
 {id:'district-mesh',name:'Generated native 3D district geometry',file:'src/runtime/StreetVerseOriginalDistrictPreview.ts',required:['buildStreetVerseDistrictPreview','visualOnly']}
];
const systems=scan.map(s=>{
 const full=path.join(root,s.file);
 if(!fs.existsSync(full))return {...s,status:s.optional?'pending-merge':'missing-file',missing:[s.file]};
 const data=fs.readFileSync(full,'utf8');
 const missing=s.required.filter(q=>!data.includes(q));
 return {...s,status:missing.length?'contract-mismatch':'source-found',missing};
});
const report={
 schema:'tryamm.rea.evidence.v1',
 scope:'owned TRYAMM source only',
 observation:'Source evidence does not prove functioning renderer, physics, GLB asset, production backend, or phone gameplay.',
 prohibited:'No Rockstar/GTA game binary or proprietary assets analyzed or copied.',
 tool:'Node.js read-only inventory, not the external REA executable',
 systems,
 release:{sourceContractPassed:systems.every(s=>s.optional||s.status==='source-found'),deviceGameplayVerified:false,productionBackendVerified:false,certified:false},
};
const failures=systems.filter(s=>!s.optional&&s.status!=='source-found');
if(process.argv.includes('--json'))console.log(JSON.stringify(report,null,2));
else{
 for(const x of systems)console.log(`${x.status.padEnd(18)} ${x.name}${x.missing.length?' — '+x.missing.join(', '):''}`);
 console.log(`Source inventory: ${scan.length-failures.length}/${scan.length} mandatory checks; production not certified`);
}
if(failures.length)process.exitCode=1;
