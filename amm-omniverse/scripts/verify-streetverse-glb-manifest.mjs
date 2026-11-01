import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {basename} from 'node:path';
const manifest=JSON.parse(readFileSync(process.argv[2]??'verified-sha256-manifest.json','utf8'));
if(manifest.assetCount!==12||manifest.assets?.length!==12)throw new Error('Expected 12 original GLBs');
let bytes=0;const seen=new Set();
for(const asset of manifest.assets){
 if(!/^characters\/static-wave[12]\/SV_NPC_[A-Z0-9_]+(?:\.(?:walk|run))?\.glb$/.test(asset.path))throw new Error('Unexpected path: '+asset.path);
 if(seen.has(asset.path))throw new Error('Duplicate: '+asset.path);
 seen.add(asset.path);
 if(!Number.isSafeInteger(asset.bytes)||asset.bytes<20||!/^[a-f0-9]{64}$/.test(asset.sha256))throw new Error('Invalid metadata: '+asset.path);
 bytes+=asset.bytes;
}
if(bytes!==manifest.totalBytes)throw new Error('Manifest byte total mismatch');
for(const asset of manifest.assets){
 const name=basename(asset.path);
 const local=process.argv.slice(3).find(p=>basename(p)===name);
 if(!local)continue;
 const data=readFileSync(local);
 if(data.length!==asset.bytes||data.toString('ascii',0,4)!=='glTF'||data.readUInt32LE(4)!==2||data.readUInt32LE(8)!==data.length||createHash('sha256').update(data).digest('hex')!==asset.sha256)throw new Error('GLB verification failed: '+name);
 console.log('Verified binary: '+name);
}
console.log('Manifest verified: '+manifest.assetCount+' GLBs, '+bytes+' bytes. Binary checks require local GLB paths.');
