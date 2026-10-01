const clean=(v,n=1000)=>String(v||'').trim().slice(0,n)
const backend=()=>String(process.env.AMM_BACKEND_URL||process.env.VITE_API_URL||'').trim().replace(/\/$/,'')

async function getJson(url){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9000)
  try{
    const r=await fetch(url,{headers:{accept:'application/json'},cache:'no-store',signal:controller.signal})
    const text=await r.text();let data
    try{data=text?JSON.parse(text):{}}catch{data={}}
    if(!r.ok)throw new Error(data?.error||'quantum_search_'+r.status)
    return data
  }finally{clearTimeout(timer)}
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store')
  if(!['GET','POST'].includes(req.method))return res.status(405).json({ok:false,error:'Method not allowed'})
  const input=req.method==='GET'?req.query:req.body||{}
  const q=clean(input.q,300),mode=clean(input.mode||'search',30)
  if(!q)return res.status(400).json({ok:false,error:'q is required'})
  const base=backend()
  if(!base||!/^https?:\/\//.test(base)||base.includes('your-amm-backend.example.com'))return res.status(200).json({
    ok:true,configured:false,query:q,mode,results:[],providers:{},source:'quantum-internet',status:'BACKEND_NOT_CONFIGURED'
  })
  const route=mode==='research'?'research':mode==='academic'?'academic':'search'
  try{
    const data=await getJson(base+'/api/quantum-internet/'+route+'?q='+encodeURIComponent(q))
    const rows=Array.isArray(data.results)?data.results:Array.isArray(data?.evidence?.ranked)?data.evidence.ranked:[]
    return res.status(200).json({
      ok:true,configured:true,query:q,mode:route,source:'quantum-internet',
      results:rows.slice(0,24),providers:data.providers||{},diversity:data.diversity||null,
      evaluation:data.evaluation||null,contradictions:data.contradictions||null,synthesisPlan:data.synthesisPlan||null
    })
  }catch(error){
    return res.status(200).json({ok:true,configured:true,degraded:true,query:q,mode:route,source:'quantum-internet',results:[],error:clean(error?.message,300)})
  }
}
