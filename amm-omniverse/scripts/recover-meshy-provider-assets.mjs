import fs from 'node:fs/promises';
import path from 'node:path';

const API='https://api.meshy.ai/openapi/v1';
const OUT=path.resolve(process.argv[2]||'public/tryamm-assets/meshy/recovered');
const key=String(process.env.MESHY_API_KEY||'').trim();
const types=['image-to-3d','multi-image-to-3d','text-to-3d'];
const PAGE_SIZE=Math.max(1,Math.min(100,Number(process.env.MESHY_RECOVERY_PAGE_SIZE)||50));
const DOWNLOAD_LIMIT=Math.max(1,Math.min(50,Number(process.env.MESHY_RECOVERY_DOWNLOAD_LIMIT)||12));

const clean=v=>String(v||'').replace(/[^A-Za-z0-9_-]/g,'_').slice(0,120);
const success=s=>['SUCCEEDED','SUCCESS','COMPLETED'].includes(String(s||'').toUpperCase());

async function provider(endpoint){
  const res=await fetch(API+endpoint,{
    headers:{Authorization:`Bearer ${key}`},
    cache:'no-store'
  });
  const text=await res.text();
  let data={};
  try{data=text?JSON.parse(text):{}}catch{data={raw:text.slice(0,500)}}
  if(!res.ok)throw new Error(`Meshy ${endpoint} failed (${res.status}): ${data?.message||data?.detail||'provider_error'}`);
  return data;
}

function rows(data){
  if(Array.isArray(data))return data;
  if(Array.isArray(data?.result))return data.result;
  if(Array.isArray(data?.tasks))return data.tasks;
  return [];
}

function glbUrl(task){
  return task?.model_urls?.glb||task?.modelUrls?.glb||task?.result?.model_urls?.glb||task?.result?.modelUrls?.glb||null;
}

await fs.mkdir(OUT,{recursive:true});

const manifest={
  schema:'tryamm.meshy.provider-recovery.v1',
  generatedAt:new Date().toISOString(),
  configured:Boolean(key),
  provider:'meshy.ai',
  source:'existing-provider-tasks',
  creditsUsed:0,
  tasks:[],
  downloaded:[],
  errors:[]
};

if(!key){
  manifest.errors.push('MESHY_API_KEY missing; provider recovery skipped.');
}else{
  for(const type of types){
    try{
      const data=await provider(`/${type}?page_num=1&page_size=${PAGE_SIZE}&sort_by=-created_at`);
      for(const task of rows(data)){
        const id=String(task?.id||task?.task_id||'');
        const url=glbUrl(task);
        manifest.tasks.push({
          id,
          type,
          status:String(task?.status||'UNKNOWN'),
          progress:Number(task?.progress||0),
          createdAt:task?.created_at||task?.createdAt||null,
          finishedAt:task?.finished_at||task?.finishedAt||null,
          consumedCredits:Number(task?.consumed_credits||task?.consumedCredits||0),
          thumbnailUrl:task?.thumbnail_url||task?.thumbnailUrl||null,
          hasGlb:Boolean(url)
        });
      }
    }catch(error){
      manifest.errors.push(String(error?.message||error));
    }
  }

  const candidates=manifest.tasks.filter(t=>success(t.status)&&t.hasGlb).slice(0,DOWNLOAD_LIMIT);
  for(const item of candidates){
    try{
      const raw=await provider(`/${item.type}/${encodeURIComponent(item.id)}`);
      const url=glbUrl(raw);
      if(!url)continue;
      const res=await fetch(url,{cache:'no-store'});
      if(!res.ok)throw new Error(`GLB download failed (${res.status})`);
      const bytes=Buffer.from(await res.arrayBuffer());
      if(bytes.length<64)throw new Error('Downloaded GLB was unexpectedly small');
      const filename=`${clean(item.type)}-${clean(item.id)}.glb`;
      await fs.writeFile(path.join(OUT,filename),bytes);
      manifest.downloaded.push({
        id:item.id,
        type:item.type,
        file:filename,
        publicUrl:`/tryamm-assets/meshy/recovered/${filename}`,
        bytes:bytes.length
      });
    }catch(error){
      manifest.errors.push(`${item.type}/${item.id}: ${String(error?.message||error)}`);
    }
  }
}

manifest.taskCount=manifest.tasks.length;
manifest.downloadedCount=manifest.downloaded.length;
await fs.writeFile(path.join(OUT,'provider-manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({
  meshyProviderRecovery:true,
  configured:manifest.configured,
  taskCount:manifest.taskCount,
  downloadedCount:manifest.downloadedCount,
  errorCount:manifest.errors.length,
  creditsUsed:0,
  output:OUT
},null,2));
