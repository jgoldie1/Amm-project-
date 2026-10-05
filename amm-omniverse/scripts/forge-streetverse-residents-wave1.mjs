import fs from 'node:fs/promises';
import path from 'node:path';
import {
  createMeshyTask,
  createMeshyTextRefineTask,
  createMeshyRiggingTask,
  getMeshyTask,
  getMeshyRiggingTask,
  summarizeMeshyTask,
  summarizeMeshyRiggingTask,
  getMeshyBalance,
} from '../api/_lib/meshy.js';

const TRIGGER='streetverse-wave1-20261005';
const enabled=String(process.env.MESHY_ONE_TIME_FORGE||'').trim()===TRIGGER;
const outDir=path.resolve(process.cwd(),'public/tryamm-assets/meshy/characters');
const POLL_MS=8000;
const TIMEOUT_MS=14*60*1000;

const SPECS=[
  {
    id:'sv-black-man-adult-01',
    filename:'SV_NPC_BLACK_MAN_ADULT_01.glb',
    height:1.82,
    prompt:'game-ready realistic Black adult male Chicago neighborhood resident, natural contemporary everyday clothing, friendly neutral non-identifying face, realistic human proportions, full body, A-pose for humanoid rigging, clean mobile-web topology, PBR-ready materials, separate readable hands and shoes, no logos, no celebrity likeness, StreetVerse resident merchant security worker parent'
  },
  {
    id:'sv-black-woman-adult-01',
    filename:'SV_NPC_BLACK_WOMAN_ADULT_01.glb',
    height:1.69,
    prompt:'game-ready realistic Black adult woman Chicago neighborhood resident, natural contemporary everyday clothing, friendly neutral non-identifying face, realistic human proportions, full body, A-pose for humanoid rigging, clean mobile-web topology, PBR-ready materials, separate readable hands and shoes, no logos, no celebrity likeness, StreetVerse resident merchant worker parent community leader'
  }
];

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const success=status=>['SUCCEEDED','SUCCESS','COMPLETED'].includes(String(status||'').toUpperCase());
const failure=status=>['FAILED','FAILURE','ERROR','CANCELED','CANCELLED','EXPIRED'].includes(String(status||'').toUpperCase());

async function waitGeneration(type,id,label){
  const started=Date.now();
  while(Date.now()-started<TIMEOUT_MS){
    const snapshot=summarizeMeshyTask(await getMeshyTask(type,id),type);
    console.log(`[Meshy Forge] ${label}: ${snapshot.status} ${snapshot.progress}% task=${id}`);
    if(success(snapshot.status)&&snapshot.glb)return snapshot;
    if(failure(snapshot.status))throw new Error(`${label} failed: ${snapshot.status}`);
    await sleep(POLL_MS);
  }
  throw new Error(`${label} timed out after ${Math.round(TIMEOUT_MS/60000)} minutes`);
}

async function waitRig(id,label){
  const started=Date.now();
  while(Date.now()-started<TIMEOUT_MS){
    const snapshot=summarizeMeshyRiggingTask(await getMeshyRiggingTask(id));
    console.log(`[Meshy Forge] ${label}: ${snapshot.status} ${snapshot.progress}% task=${id}`);
    if(success(snapshot.status)&&snapshot.riggedGlb)return snapshot;
    if(failure(snapshot.status))throw new Error(`${label} failed: ${snapshot.error||snapshot.status}`);
    await sleep(POLL_MS);
  }
  throw new Error(`${label} timed out after ${Math.round(TIMEOUT_MS/60000)} minutes`);
}

async function download(url,target){
  if(!url)return null;
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok)throw new Error(`download failed ${response.status} for ${target}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.length<1024)throw new Error(`downloaded GLB is unexpectedly small: ${bytes.length} bytes`);
  await fs.writeFile(target,bytes);
  return bytes.length;
}

async function forge(spec){
  console.log(`[Meshy Forge] START ${spec.id}`);
  const preview=await createMeshyTask('text-to-3d',{
    prompt:spec.prompt,
    ai_model:'meshy-7.1',
    geometry_resolution:'2k',
    should_remesh:true,
    target_polycount:45000,
    pose_mode:'a-pose',
    target_formats:['glb'],
  });
  const previewSnapshot=await waitGeneration('text-to-3d',preview.id,`${spec.id} preview`);

  const refine=await createMeshyTextRefineTask(preview.id,{
    enablePbr:true,
    textureResolution:'2k',
  });
  const refineSnapshot=await waitGeneration('text-to-3d',refine.id,`${spec.id} refine`);

  const rig=await createMeshyRiggingTask({modelUrl:refineSnapshot.glb,heightMeters:spec.height});
  const rigSnapshot=await waitRig(rig.id,`${spec.id} rig`);

  const stem=spec.filename.replace(/\.glb$/i,'');
  const mainPath=path.join(outDir,spec.filename);
  const walkPath=path.join(outDir,`${stem}.walk.glb`);
  const runPath=path.join(outDir,`${stem}.run.glb`);
  const [mainBytes,walkBytes,runBytes]=await Promise.all([
    download(rigSnapshot.riggedGlb,mainPath),
    download(rigSnapshot.walkingGlb,walkPath),
    download(rigSnapshot.runningGlb,runPath),
  ]);

  const manifest={
    schema:'tryamm.meshy.one-time-forge.v1',
    assetId:spec.id,
    filename:spec.filename,
    generatedAt:new Date().toISOString(),
    previewTaskId:preview.id,
    refineTaskId:refine.id,
    rigTaskId:rig.id,
    credits:{
      preview:Number(previewSnapshot.consumedCredits||0),
      refine:Number(refineSnapshot.consumedCredits||0),
      rig:Number(rigSnapshot.consumedCredits||0),
      total:Number(previewSnapshot.consumedCredits||0)+Number(refineSnapshot.consumedCredits||0)+Number(rigSnapshot.consumedCredits||0)
    },
    files:{
      main:{path:`/tryamm-assets/meshy/characters/${spec.filename}`,bytes:mainBytes},
      walk:walkBytes?{path:`/tryamm-assets/meshy/characters/${stem}.walk.glb`,bytes:walkBytes}:null,
      run:runBytes?{path:`/tryamm-assets/meshy/characters/${stem}.run.glb`,bytes:runBytes}:null
    }
  };
  await fs.writeFile(path.join(outDir,`${stem}.forge.json`),JSON.stringify(manifest,null,2)+'\n','utf8');
  console.log(`[Meshy Forge] READY ${spec.id} credits=${manifest.credits.total} mainBytes=${mainBytes}`);
  return manifest;
}

async function main(){
  if(!enabled){
    console.log('[Meshy Forge] SKIPPED: one-time trigger is not enabled');
    return;
  }
  await fs.mkdir(outDir,{recursive:true});
  const before=await getMeshyBalance();
  console.log(`[Meshy Forge] balance before=${before}`);
  const results=await Promise.all(SPECS.map(forge));
  const after=await getMeshyBalance();
  const summary={
    schema:'tryamm.meshy.one-time-forge-wave.v1',
    trigger:TRIGGER,
    generatedAt:new Date().toISOString(),
    balanceBefore:before,
    balanceAfter:after,
    creditsUsed:before-after,
    assets:results
  };
  await fs.writeFile(path.join(outDir,'streetverse-wave1-forge.json'),JSON.stringify(summary,null,2)+'\n','utf8');
  console.log(`[Meshy Forge] WAVE READY assets=${results.length} creditsUsed=${before-after} balanceAfter=${after}`);
}

main().catch(error=>{
  console.error('[Meshy Forge] FATAL',error?.stack||error?.message||String(error));
  process.exitCode=1;
});
