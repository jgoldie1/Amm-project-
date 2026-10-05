import fs from 'node:fs/promises';
import path from 'node:path';

const SOURCE_REPO='Hidencod/tge-assets';
const SOURCE_COMMIT='1f7dee9076ee848773f08fd632ab4e4e73357777';
const RAW_BASE=`https://raw.githubusercontent.com/${SOURCE_REPO}/${SOURCE_COMMIT}`;
const OUT=path.resolve(process.cwd(),'public/free-assets/kenney');

const ASSETS=[
  ['vehicles/police.glb','packs/car-kit/police.glb','Kenney Car Kit'],
  ['vehicles/firetruck.glb','packs/car-kit/firetruck.glb','Kenney Car Kit'],
  ['vehicles/sedan.glb','packs/car-kit/sedan.glb','Kenney Car Kit'],
  ['vehicles/suv.glb','packs/car-kit/suv.glb','Kenney Car Kit'],
  ['vehicles/taxi.glb','packs/car-kit/taxi.glb','Kenney Car Kit'],
  ['vehicles/van.glb','packs/car-kit/van.glb','Kenney Car Kit'],
  ['vehicles/truck.glb','packs/car-kit/truck.glb','Kenney Car Kit'],
  ['buildings/commercial-a.glb','packs/city-kit-commercial/building-a.glb','Kenney City Kit Commercial'],
  ['buildings/commercial-b.glb','packs/city-kit-commercial/building-b.glb','Kenney City Kit Commercial'],
  ['buildings/commercial-c.glb','packs/city-kit-commercial/building-c.glb','Kenney City Kit Commercial'],
  ['buildings/commercial-h.glb','packs/city-kit-commercial/building-h.glb','Kenney City Kit Commercial'],
  ['buildings/suburban-a.glb','packs/city-kit-suburban/building-type-a.glb','Kenney City Kit Suburban'],
  ['buildings/suburban-b.glb','packs/city-kit-suburban/building-type-b.glb','Kenney City Kit Suburban'],
  ['roads/straight.glb','packs/city-kit-roads/road-straight.glb','Kenney City Kit Roads'],
  ['roads/crossroad.glb','packs/city-kit-roads/road-crossroad.glb','Kenney City Kit Roads'],
  ['roads/intersection.glb','packs/city-kit-roads/road-intersection.glb','Kenney City Kit Roads'],
  ['roads/crossing.glb','packs/city-kit-roads/road-crossing.glb','Kenney City Kit Roads'],
  ['props/traffic-light.glb','packs/city-kit-roads/traffic-light.glb','Kenney City Kit Roads'],
  ['props/street-light.glb','packs/city-kit-roads/light-curved.glb','Kenney City Kit Roads'],
  ['props/dumpster.glb','packs/city-kit-roads/dumpster.glb','Kenney City Kit Roads'],
  ['props/construction-barrier.glb','packs/city-kit-roads/construction-barrier.glb','Kenney City Kit Roads'],
  ['props/stop-sign.glb','packs/city-kit-roads/road-sign-stop.glb','Kenney City Kit Roads'],
  ['nature/tree-oak.glb','packs/nature-kit/tree-oak.glb','Kenney Nature Kit'],
  ['nature/tree-detailed.glb','packs/nature-kit/tree-detailed.glb','Kenney Nature Kit'],
  ['nature/bush.glb','packs/nature-kit/plant-bushdetailed.glb','Kenney Nature Kit'],
  ['interiors/bench.glb','packs/furniture-kit/bench.glb','Kenney Furniture Kit'],
  ['interiors/chair.glb','packs/furniture-kit/chair.glb','Kenney Furniture Kit'],
  ['interiors/table.glb','packs/furniture-kit/table.glb','Kenney Furniture Kit'],
  ['interiors/trashcan.glb','packs/furniture-kit/trashcan.glb','Kenney Furniture Kit'],
];

await fs.mkdir(OUT,{recursive:true});
const manifest={
  schema:'tryamm.cc0.free-assets.v1',
  generatedAt:new Date().toISOString(),
  sourceRepo:SOURCE_REPO,
  sourceCommit:SOURCE_COMMIT,
  sourceUrl:`https://github.com/${SOURCE_REPO}`,
  upstream:'Kenney',
  license:'CC0-1.0',
  attributionRequired:false,
  commercialUse:true,
  creditsUsed:0,
  assets:[],
  failed:[]
};

async function download([dest,source,pack]){
  const url=`${RAW_BASE}/${source}`;
  const response=await fetch(url,{headers:{'user-agent':'TRYAMM-CC0-Asset-Sync/1.0'}});
  if(!response.ok)throw new Error(`${response.status} ${response.statusText}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.length<20||bytes.subarray(0,4).toString('utf8')!=='glTF')throw new Error('invalid GLB payload');
  const full=path.join(OUT,dest);
  await fs.mkdir(path.dirname(full),{recursive:true});
  await fs.writeFile(full,bytes);
  manifest.assets.push({
    id:dest.replace(/\.glb$/,''),
    url:`/free-assets/kenney/${dest}`,
    source,
    sourceUrl:url,
    pack,
    license:'CC0-1.0',
    bytes:bytes.length
  });
  console.log(`[CC0] ${dest} (${bytes.length} bytes)`);
}

const queue=[...ASSETS];
const workers=Array.from({length:6},async()=>{
  while(queue.length){
    const entry=queue.shift();
    if(!entry)break;
    try{await download(entry)}
    catch(error){
      manifest.failed.push({dest:entry[0],source:entry[1],error:String(error?.message||error)});
      console.warn(`[CC0] FAILED ${entry[0]}: ${String(error?.message||error)}`);
    }
  }
});
await Promise.all(workers);
manifest.assets.sort((a,b)=>a.id.localeCompare(b.id));
await fs.writeFile(path.join(OUT,'manifest.json'),JSON.stringify(manifest,null,2)+'\n','utf8');
if(manifest.failed.length)throw new Error(`CC0 sync failed for ${manifest.failed.length} asset(s)`);
console.log(JSON.stringify({cc0FreeAssetSync:true,count:manifest.assets.length,creditsUsed:0,sourceCommit:SOURCE_COMMIT},null,2));
