import fs from 'node:fs/promises';
import path from 'node:path';
import {getMeshyBalance,listMeshyTasks,summarizeMeshyTask} from '../api/_lib/meshy.js';

const outputDir=path.resolve(process.cwd(),process.argv[2]||'public/tryamm-assets/meshy/recovered-existing');
const manifestPath=path.join(outputDir,'manifest.json');
const TYPES=['image-to-3d','multi-image-to-3d','text-to-3d'];
const MAX_PER_TYPE=4;
const MAX_TOTAL=8;
const MAX_BYTES=40*1024*1024;

const safeId=value=>String(value||'unknown').replace(/[^A-Za-z0-9_-]+/g,'_').slice(0,120);
const success=status=>['SUCCEEDED','SUCCESS','COMPLETED'].includes(String(status||'').toUpperCase());

async function writeManifest(payload){
  await fs.mkdir(outputDir,{recursive:true});
  await fs.writeFile(manifestPath,JSON.stringify(payload,null,2)+'\n','utf8');
}

async function downloadGlb(url,target){
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok)throw new Error(`GLB download failed (${response.status})`);
  const declared=Number(response.headers.get('content-length')||0);
  if(declared&&declared>MAX_BYTES)throw new Error(`GLB exceeds ${MAX_BYTES} byte recovery cap`);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.length>MAX_BYTES)throw new Error(`GLB exceeds ${MAX_BYTES} byte recovery cap`);
  await fs.writeFile(target,bytes);
  return bytes.length;
}

async function main(){
  const configured=Boolean(String(process.env.MESHY_API_KEY||'').trim());
  if(!configured){
    await writeManifest({
      schema:'tryamm.meshy-existing-recovery.v1',
      generatedAt:new Date().toISOString(),
      configured:false,
      recovered:[],
      errors:['MESHY_API_KEY missing in this build']
    });
    console.log('Meshy existing asset recovery: SKIPPED (MESHY_API_KEY missing)');
    return;
  }

  await fs.mkdir(outputDir,{recursive:true});
  const recovered=[];
  const discovered=[];
  const errors=[];
  try{
    const balance=await getMeshyBalance();
    console.log(`Meshy credit balance: ${balance}`);
  }catch(error){
    errors.push({type:'balance',message:String(error?.message||error)});
    console.warn(`Meshy balance check failed: ${error?.message||error}`);
  }

  for(const type of TYPES){
    try{
      const rawTasks=await listMeshyTasks(type,50);
      const tasks=rawTasks.map(task=>summarizeMeshyTask(task,type));
      discovered.push(...tasks.map(task=>({
        providerTaskId:task.id,
        type,
        status:task.status,
        progress:task.progress,
        createdAt:task.createdAt,
        finishedAt:task.finishedAt,
        consumedCredits:task.consumedCredits,
        thumbnailUrl:task.thumbnailUrl,
        hasGlb:Boolean(task.glb)
      })));

      const candidates=tasks.filter(task=>success(task.status)&&task.glb).slice(0,MAX_PER_TYPE);
      for(const task of candidates){
        if(recovered.length>=MAX_TOTAL)break;
        const filename=`${type}-${safeId(task.id)}.glb`;
        const absolute=path.join(outputDir,filename);
        try{
          const bytes=await downloadGlb(task.glb,absolute);
          recovered.push({
            providerTaskId:task.id,
            type,
            status:task.status,
            createdAt:task.createdAt,
            finishedAt:task.finishedAt,
            consumedCredits:task.consumedCredits,
            thumbnailUrl:task.thumbnailUrl,
            bytes,
            publicPath:`/tryamm-assets/meshy/recovered-existing/${filename}`
          });
          console.log(`Meshy recovered ${type} task ${task.id} -> ${filename} (${bytes} bytes)`);
        }catch(error){
          errors.push({providerTaskId:task.id,type,message:String(error?.message||error)});
          console.warn(`Meshy recovery failed for ${type} task ${task.id}: ${error?.message||error}`);
        }
      }
    }catch(error){
      errors.push({type,message:String(error?.message||error)});
      console.warn(`Meshy inventory failed for ${type}: ${error?.message||error}`);
    }
  }

  const latestImage=recovered.find(asset=>asset.type==='image-to-3d')||null;
  const latestMulti=recovered.find(asset=>asset.type==='multi-image-to-3d')||null;

  await writeManifest({
    schema:'tryamm.meshy-existing-recovery.v1',
    generatedAt:new Date().toISOString(),
    configured:true,
    discoveredCount:discovered.length,
    recoveredCount:recovered.length,
    candidateHero:latestImage||latestMulti,
    recovered,
    discovered,
    errors
  });

  console.log(`Meshy existing asset recovery: ${recovered.length} GLB(s) recovered from ${discovered.length} task(s)`);
}

main().catch(async error=>{
  const message=String(error?.message||error);
  console.error('Meshy existing asset recovery fatal:',message);
  try{
    await writeManifest({
      schema:'tryamm.meshy-existing-recovery.v1',
      generatedAt:new Date().toISOString(),
      configured:Boolean(String(process.env.MESHY_API_KEY||'').trim()),
      recovered:[],
      errors:[message]
    });
  }catch{}
  // Recovery is additive; never break the main production build.
  process.exitCode=0;
});
