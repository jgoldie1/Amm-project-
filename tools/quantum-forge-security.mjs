import crypto from 'node:crypto';
export const MAX_UPLOAD_BYTES=25*1024*1024;
export function validateUpload({name,size,bytes,ownerId,authenticatedUserId,licenseAccepted}){
 if(!ownerId||!authenticatedUserId||ownerId!==authenticatedUserId)throw Error('Owner authentication required');
 if(licenseAccepted!==true)throw Error('Asset rights declaration required');
 if(!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}\.glb$/.test(name))throw Error('Only safe GLB filenames accepted');
 if(!Number.isInteger(size)||size<20||size>MAX_UPLOAD_BYTES)throw Error('Invalid upload size');
 if(!Buffer.isBuffer(bytes)||bytes.length!==size)throw Error('Missing or incomplete file');
 if(bytes.toString('ascii',0,4)!=='glTF'||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==size)throw Error('Invalid GLB v2');
 return {sha256:crypto.createHash('sha256').update(bytes).digest('hex'),ownerId,size,private:true,scanRequired:true,publishAllowed:false};
}
export function issueAssetLicense({assetId,ownerId,licenseType,attribution='',consent=false}){
 if(!assetId||!ownerId||!['private','commercial','cc-by'].includes(licenseType)||consent!==true)throw Error('Explicit owner licensing required');
 return {assetId,ownerId,licenseType,attribution,consent,moderationStatus:'pending',published:false,createdAt:new Date().toISOString()};
}
export function canPublish(asset,license){return !!(asset&&license&&asset.ownerId===license.ownerId&&asset.scanPassed===true&&license.moderationStatus==='approved'&&license.consent===true&&license.licenseType!=='private');}
