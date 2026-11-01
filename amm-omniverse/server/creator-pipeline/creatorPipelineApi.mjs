import {createServer} from 'node:http';
import {randomUUID} from 'node:crypto';
const MAX_BODY=16_384;
const jobs=new Map();
function respond(res,status,payload){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(payload))}
export function createCreatorPipelineServer({authorize=()=>false}={}){
 return createServer((req,res)=>{
  if(req.url==='/health'&&req.method==='GET')return respond(res,200,{ok:true,service:'creator-pipeline'});
  if(req.url!=='/api/creator/jobs'||req.method!=='POST')return respond(res,404,{error:'Not found'});
  // The host must inject a verified authentication/authorization function.
  if(!authorize(req))return respond(res,401,{error:'Authentication required'});
  let body='';req.on('data',chunk=>{body+=chunk;if(body.length>MAX_BODY)req.destroy()});
  req.on('end',()=>{let input;try{input=JSON.parse(body)}catch{return respond(res,400,{error:'Invalid JSON'})}
   if(!input||!['character-reference','motion-video','motion-glb','outfit-fbx','outfit-glb'].includes(input.kind)||typeof input.name!=='string'||input.name.length>120||input.name.length<1)return respond(res,400,{error:'Invalid asset metadata'});
   if(input.license!=='owned'&&input.license!=='commercial-permission')return respond(res,422,{error:'Commercial rights confirmation required'});
   const job={id:randomUUID(),kind:input.kind,name:input.name,stage:'rig-inspection',createdAt:new Date().toISOString(),status:'pending-human-review'};
   jobs.set(job.id,job);return respond(res,202,{job});
  });
 });
}
if(process.env.RUN_CREATOR_PIPELINE==='1'){const server=createCreatorPipelineServer();server.listen(Number(process.env.PORT||4317),'127.0.0.1')}
