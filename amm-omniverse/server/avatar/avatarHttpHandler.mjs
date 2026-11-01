import {createAvatarJobService} from './avatarJobApi.mjs';
// Framework-neutral HTTP handler; mount only behind HTTPS and a real bearer-token verifier.
// Does not accept files or photos. Requests and responses are JSON.
export function createAvatarHttpHandler({authorize,store}){
 const service=createAvatarJobService({authorize,store});
 return async function handle(req,res){
  const path=new URL(req.url,'http://internal').pathname;
  const match=/^\/api\/streetverse\/avatars(?:\/([a-f0-9-]{36}))?$/.exec(path);
  if(!match){res.writeHead(404).end();return}
  try{
   let result;
   if(req.method==='POST'&&!match[1]){
    const parts=[];let length=0;
    for await(const part of req){length+=part.length;if(length>8192)throw new Error('Payload too large');parts.push(part)}
    const body=JSON.parse(Buffer.concat(parts).toString('utf8'));
    result=await service.create(req,body);res.writeHead(201,{'content-type':'application/json','cache-control':'no-store'});
   }else if(req.method==='GET'&&match[1]){
    result=await service.status(req,match[1]);res.writeHead(200,{'content-type':'application/json','cache-control':'no-store'});
   }else if(req.method==='DELETE'&&match[1]){
    result=await service.delete(req,match[1]);res.writeHead(200,{'content-type':'application/json','cache-control':'no-store'});
   }else{res.writeHead(405,{'allow':'POST, GET, DELETE'}).end();return}
   res.end(JSON.stringify(result));
  }catch(e){
   const message=String(e?.message||'Request failed');
   const code=/Unauthorized|Authenticated/.test(message)?401:/Not found/.test(message)?404:/Payload too large/.test(message)?413:400;
   res.writeHead(code,{'content-type':'application/json','cache-control':'no-store'}).end(JSON.stringify({error:code===401?'Unauthorized':code===404?'Not found':'Invalid request'}));
  }
 };
}
