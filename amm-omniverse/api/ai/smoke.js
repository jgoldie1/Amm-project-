export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'});
  const host=String(req.headers['x-forwarded-host']||req.headers.host||'tryamm.online');
  const proto=String(req.headers['x-forwarded-proto']||'https');
  const url=`${proto}://${host}/api/ai/answer`;
  const started=Date.now();
  try{
    const response=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question:'In two or three sentences, explain what HoloGPT does inside TRYAMM and identify yourself as HoloGPT.',history:[]})});
    const data=await response.json();
    const answer=String(data?.answer||'').trim();
    const ok=response.ok&&data?.ok===true&&data?.degraded!==true&&answer.length>=40;
    return res.status(ok?200:503).json({
      ok,
      service:'HoloGPT full-response smoke',
      provider:data?.provider||null,
      model:data?.model||null,
      degraded:data?.degraded===true,
      answerLength:answer.length,
      latencyMs:Date.now()-started,
      authenticated:data?.authenticated===true,
      providerErrors:Array.isArray(data?.providerErrors)?data.providerErrors.slice(0,10):[],
      time:new Date().toISOString(),
      failure:ok?null:(data?.providerError||data?.error||'No verified generative response')
    });
  }catch(error){
    return res.status(503).json({ok:false,service:'HoloGPT full-response smoke',provider:null,degraded:true,answerLength:0,latencyMs:Date.now()-started,providerErrors:[],failure:String(error?.message||error).slice(0,500),time:new Date().toISOString()});
  }
}
