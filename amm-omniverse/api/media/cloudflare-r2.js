import crypto from 'node:crypto';
import {requireUser} from '../_lib/security.js';
// LiveKit carries WebRTC. R2 is only a private opt-in recording archive.
const MAX_PILOT_BYTES=50*1024*1024;
const ENV=()=>({
 enabled:process.env.CLOUDFLARE_R2_ENABLED==='true',
 pilot:process.env.CLOUDFLARE_R2_PILOT_UPLOADS==='true',
 operator:String(process.env.CLOUDFLARE_R2_OPERATOR_USER_ID||''),
 accountId:String(process.env.CLOUDFLARE_R2_ACCOUNT_ID||''),
 bucket:String(process.env.CLOUDFLARE_R2_BUCKET||''),
 accessKey:String(process.env.CLOUDFLARE_R2_ACCESS_KEY_ID||''),
 secret:String(process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY||'')
});
const ready=c=>Boolean(c.enabled&&/^[a-f0-9]{32}$/i.test(c.accountId)&&/^[a-z0-9][a-z0-9-]{2,62}$/.test(c.bucket)&&c.accessKey&&c.secret);
const esc=v=>encodeURIComponent(String(v)).replace(/[!'()*]/g,x=>'%'+x.charCodeAt(0).toString(16).toUpperCase());
const mac=(key,value)=>crypto.createHmac('sha256',key).update(value).digest();
function signPut(c,key,mime){
 const date=new Date().toISOString().replace(/[-:]|\.\d{3}/g,''),day=date.slice(0,8),scope=day+'/auto/s3/aws4_request';
 const host=c.accountId+'.r2.cloudflarestorage.com';
 const path='/'+[c.bucket,...key.split('/')].map(esc).join('/');
 const params={'X-Amz-Algorithm':'AWS4-HMAC-SHA256','X-Amz-Credential':c.accessKey+'/'+scope,'X-Amz-Date':date,'X-Amz-Expires':'60','X-Amz-SignedHeaders':'content-type;host'};
 const query=Object.keys(params).sort().map(k=>esc(k)+'='+esc(params[k])).join('&');
 const canonical=['PUT',path,query,'content-type:'+mime+'\nhost:'+host+'\n','content-type;host','UNSIGNED-PAYLOAD'].join('\n');
 const sum=crypto.createHash('sha256').update(canonical).digest('hex');
 const toSign=['AWS4-HMAC-SHA256',date,scope,sum].join('\n');
 const kDate=mac('AWS4'+c.secret,day),kRegion=mac(kDate,'auto'),kService=mac(kRegion,'s3'),kSigning=mac(kService,'aws4_request');
 const signature=crypto.createHmac('sha256',kSigning).update(toSign).digest('hex');
 return 'https://'+host+path+'?'+query+'&X-Amz-Signature='+signature;
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method==='GET'){
  const c=ENV();
  return res.status(200).json({provider:'cloudflare-r2',configured:ready(c),pilotUploadsEnabled:ready(c)&&c.pilot&&Boolean(c.operator),mode:'private-replay-storage',liveWebRTCProvider:'livekit',
   freeAllowance:{standardStorageGBMonth:10,classAWrites:1000000,classBReads:10000000,egress:'no R2 egress charge'},billing:'No account or subscription is activated by this endpoint.'});
 }
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const c=ENV();
 if(!ready(c)||!c.pilot||!c.operator)return res.status(503).json({error:'Cloudflare R2 pilot is disabled'});
 const user=await requireUser(req,res);if(!user)return;
 if(user.id!==c.operator)return res.status(403).json({error:'Private R2 pilot only'});
 let body;
 try{body=typeof req.body==='string'?JSON.parse(req.body||'{}'):req.body||{};}catch{return res.status(400).json({error:'Invalid JSON'});}
 if(body.action!=='sign-replay-upload')return res.status(400).json({error:'Unsupported upload request'});
 const contentType=String(body.contentType||'');
 if(!['video/mp4','video/webm'].includes(contentType))return res.status(415).json({error:'Unsupported replay type'});
 const declaredBytes=Number(body.sizeBytes);
 if(!Number.isSafeInteger(declaredBytes)||declaredBytes<=0||declaredBytes>MAX_PILOT_BYTES)return res.status(413).json({error:'Replay exceeds pilot declared size'});
 const ext=contentType==='video/mp4'?'mp4':'webm';
 const key='tryamm-live-replays/'+user.id+'/'+crypto.randomUUID()+'.'+ext;
 return res.status(200).json({uploadUrl:signPut(c,key,contentType),method:'PUT',headers:{'Content-Type':contentType},objectKey:key,expiresInSeconds:60,publiclyAccessible:false,complete:false,
  next:'Verify actual file metadata, uploaded bytes, media rights and creator ownership before publishing.',
  warning:'Presigned PUT does not enforce declared upload size; require Worker body-size, quota and budget guards before allowing wider creator uploads.'});
}
