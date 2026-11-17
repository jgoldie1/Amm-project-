#!/usr/bin/env node
// Two-stage TRYAMM audit. Static CI is not a substitute for live provider/device evidence.
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
const root=resolve(process.cwd());
const checks=[
  ['root-entry','server.js'],
  ['root-package','package.json'],
  ['application-entry','amm-omniverse/src/App.tsx'],
  ['application-package','amm-omniverse/package.json'],
  ['github-ci','.github/workflows/ci.yml'],
  ['production-certification','.github/workflows/deploy-tryamm-production.yml']
];
const staticChecks=checks.map(([id,path])=>({id,path,status:existsSync(join(root,path))?'PASS':'FAIL',scope:'source-presence-only'}));
const requiredLive=[
  'production-exact-commit','chromebook-three-glb-render-and-motion','iphone-physical-device',
  'streetverse-mission-and-save-restore','livekit-two-device-audio-video',
  'hologpt-authorized-tool-handoff','middleverse-lead-to-customer',
  'stripe-sandbox-webhook-replay','tenant-isolation','cloud-backup-restore'
];
const liveChecks=requiredLive.map(id=>({id,status:'UNVERIFIED',scope:'live-or-device',reason:'Requires independent provider, browser, or physical-device evidence'}));
const staticPassed=staticChecks.every(x=>x.status==='PASS');
const output={
 schema:'tryamm.two-stage-release-evidence.v1',
 generatedAt:new Date().toISOString(),
 ref:process.env.GITHUB_SHA||'local',
 codeInventoryPassed:staticPassed,
 releaseCertified:false,
 staticChecks,liveChecks,
 note:'A PASS means the named source exists, not that the feature works. This script never certifies production.'
};
const directory=join(root,'release-evidence');mkdirSync(directory,{recursive:true});
writeFileSync(join(directory,'two-stage-release-audit.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({codeInventoryPassed:staticPassed,releaseCertified:false,liveUnverified:liveChecks.length,report:'release-evidence/two-stage-release-audit.json'},null,2));
if(!staticPassed)process.exitCode=1;
