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

const TRIGGER='streetverse-wave2-20261005';
const enabled=String(process.env.MESHY_ONE_TIME_FORGE||'').trim()===TRIGGER;
const persistToken=String(process.env.MESHY_ASSET_PERSIST_TOKEN||'').trim();
const supabaseUrl=String(process.env.VITE_SUPABASE_URL||process.env.SUPABASE_URL||'').trim().replace(/\/$/,'');
const persistUrl=supabaseUrl?supabaseUrl+'/functions/v1/preserve-streetverse-wave2':'';
const outDir=path.resolve(process.cwd(),'public/tryamm-assets/meshy/characters');
const POLL_MS=8000;
const TIMEOUT_MS=14*60*1000;

const SPECS=[
  {
    id:'sv-black-man-youngadult-01',
    filename:'SV_NPC_BLACK_MAN_YOUNGADULT_01.glb',
    height:1.80,
    prompt:'game-ready realistic young adult Black man from Chicago West Side, age 20s, resident creator athlete driver, natural contemporary streetwear without logos, friendly neutral non-identifying face, realistic human proportions, full body, A-pose for humanoid rigging, clean mobile-web topology, PBR-ready materials, readable hands shoes hair and face, no celebrity likeness, StreetVerse Circle Park resident'
  },
  {
    id:'sv-black-woman-youngadult-01',
    filename:'SV_NPC_BLACK_WOMAN_YOUNGADULT_01.glb',
    height:1.68,
    prompt:'game-ready realistic young adult Black woman from Chicago West Side, age 20s, resident creator merchant medical worker, natural contemporary everyday fashion without logos, friendly neutral non-identifying face, realistic human proportions, full body, A-pose for humanoid rigging, clean mobile-web topology, PBR-ready materials, readable hands shoes hair and face, no celebrity likeness, StreetVerse Circle Park resident'
  }
];

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const success=status=>['SUCCEEDED','SUCCESS','COMPLETED'].includes(String(status||'').toUpperCase());
const failure=status=>['FAILED','FAILURE','ERROR','CANCELED','CANCELLED','EXPIRED'].includes(String(status||'').toUpperCase());

async function waitGeneration(type,id,label){
  const started=Date.now();
  while(Date.now()-started<TIMEOUT_MS){
    const snapshot=summarizeMeshyTask(await getMeshyTask(type,id),type);
    console.log(`[Meshy Wave2] ${label}: ${snapshot.status} ${snapshot.progress}% task=${id}`);
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
    console.log(`[Meshy Wave2] ${label}: ${snapshot.status} ${snapshot.progress}% task=${id}`);
    if(success(snapshot.status)&&snapshot.riggedGlb)return snapshot;
    if(failure(snapshot.status))throw new Error(`${label} failed: ${snapshot.error||snapshot.status}`);
    await sleep(POLL_MS);
  }
  throw new Error(`${label} timed out after ${Math.round(TIMEOUT_MS/60000)} minutes`);
}

async function persistRemote(sourceUrl,assetPath){
  if(!persistUrl||!persistToken)throw new Error('Wave2 durable persistence is not configured');
  if(!sourceUrl)throw new Error(`Missing Meshy source URL for ${assetPath}`);
  const response=await fetch(persistUrl,{
    method:'POST',
    headers:{
      'content-type':'application/json',
      'x-tryamm-token':persistToken
    },
    body:JSON.stringify({sourceUrl,path:assetPath}),
    cache:'no-store'
  });
  const text=await response.text();
  let data={};
  try{data=text?JSON.parse(text):{}}catch{data={raw:text.slice(0,500)}}
  if(!response.ok||!data?.ok)throw new Error(`Persist failed for ${assetPath}: ${response.status} ${data?.error||data?.raw||'unknown'}`);
  console.log(`[Meshy Wave2] persisted ${assetPath} bytes=${data.bytes}`);
  return data;
}

async function forge(spec){
  console.log(`[Meshy Wave2] START ${spec.id}`);
  const preview=await createMeshyTask('text-to-3d',{
    prompt:spec.prompt,
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
  const prefix='characters/static-wave2/';
  const [main,walk,run]=await Promise.all([
    persistRemote(rigSnapshot.riggedGlb,prefix+spec.filename),
    persistRemote(rigSnapshot.walkingGlb,prefix+stem+'.walk.glb'),
    persistRemote(rigSnapshot.runningGlb,prefix+stem+'.run.glb'),
  ]);

  const manifest={
    schema:'tryamm.meshy.one-time-forge.v2',
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
    durable:{main,walk,run}
  };
  await fs.mkdir(outDir,{recursive:true});
  await fs.writeFile(path.join(outDir,`${stem}.wave2-forge.json`),JSON.stringify(manifest,null,2)+'\n','utf8');
  console.log(`[Meshy Wave2] READY ${spec.id} credits=${manifest.credits.total}`);
  return manifest;
}

async function main(){
  if(!enabled){
    console.log('[Meshy Wave2] SKIPPED: one-time trigger is not enabled');
    return;
  }
  if(!persistUrl||!persistToken)throw new Error('Wave2 persistence endpoint/token missing');
  await fs.mkdir(outDir,{recursive:true});
  const before=await getMeshyBalance();
  console.log(`[Meshy Wave2] balance before=${before}`);
  const results=await Promise.all(SPECS.map(forge));
  const after=await getMeshyBalance();
  const summary={
    schema:'tryamm.meshy.one-time-forge-wave.v2',
    trigger:TRIGGER,
    generatedAt:new Date().toISOString(),
    balanceBefore:before,
    balanceAfter:after,
    creditsUsed:before-after,
    assets:results
  };
  await fs.writeFile(path.join(outDir,'streetverse-wave2-forge.json'),JSON.stringify(summary,null,2)+'\n','utf8');
  console.log(`[Meshy Wave2] WAVE READY assets=${results.length} creditsUsed=${before-after} balanceAfter=${after}`);
}

main().catch(error=>{
  console.error('[Meshy Wave2] FATAL',error?.stack||error?.message||String(error));
  process.exitCode=1;
});
