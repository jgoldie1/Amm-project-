// BJ V15 first-party model bridge. The upstream URL is fixed and owner-authorized;
// never expose a general-purpose proxy or accept an arbitrary user-supplied URL.
const BJ_V15_URL='https://d2ol7oe51mr4n9.cloudfront.net/user_3HqgexuZuGoTDUJ2Hxg2e6x5Hzm/daa5234c-5fbf-4b52-9c45-e82e36156153.glb';
const MAX_BYTES=64*1024*1024;
const TIMEOUT_MS=14000;

export default async function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET');
    return res.status(405).json({error:'method_not_allowed'});
  }
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),TIMEOUT_MS);
  try{
    const upstream=await fetch(BJ_V15_URL,{
      method:'GET',
      redirect:'follow',
      cache:'no-store',
      signal:controller.signal,
      headers:{'Accept':'model/gltf-binary,application/octet-stream;q=0.9'},
    });
    if(!upstream.ok||!upstream.body){
      return res.status(502).json({error:'bj_v15_upstream_unavailable',httpStatus:upstream.status});
    }
    const length=Number(upstream.headers.get('content-length')||0);
    if(length>MAX_BYTES)return res.status(502).json({error:'bj_v15_exceeds_safe_limit'});
    const reader=upstream.body.getReader();
    const first=await reader.read();
    if(first.done||!first.value||first.value.length<4||
       first.value[0]!==0x67||first.value[1]!==0x6c||first.value[2]!==0x54||first.value[3]!==0x46){
      await reader.cancel();
      return res.status(502).json({error:'bj_v15_not_valid_glb'});
    }
    res.status(200);
    res.setHeader('Content-Type','model/gltf-binary');
    res.setHeader('Cache-Control','public, max-age=0, s-maxage=3600, stale-while-revalidate=3600');
    res.setHeader('X-Content-Type-Options','nosniff');
    let received=first.value.length;
    res.write(Buffer.from(first.value));
    while(true){
      const {done,value}=await reader.read();
      if(done)break;
      received+=value.length;
      if(received>MAX_BYTES){await reader.cancel();res.destroy();return}
      if(!res.write(Buffer.from(value))){
        await new Promise(resolve=>res.once('drain',resolve));
      }
    }
    res.end();
  }catch(error){
    if(res.headersSent){res.destroy();return}
    res.status(502).json({error:'bj_v15_fetch_failed',reason:error?.name==='AbortError'?'timeout':'upstream_unreachable'});
  }finally{clearTimeout(timeout)}
}
