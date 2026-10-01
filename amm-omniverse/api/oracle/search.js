const clean=(v,n=400)=>String(v||'').trim().slice(0,n)
const backend=()=>String(process.env.AMM_BACKEND_URL||process.env.VITE_API_URL||'').trim().replace(/\/$/,'')

async function readJson(url){
  const controller=new AbortController()
  const timer=setTimeout(()=>controller.abort(),8000)
  try{
    const r=await fetch(url,{headers:{accept:'application/json'},cache:'no-store',signal:controller.signal})
    const text=await r.text();let data
    try{data=text?JSON.parse(text):{}}catch{data={}}
    if(!r.ok)throw new Error(data?.error||`oracle_${r.status}`)
    return data
  }finally{clearTimeout(timer)}
}

function tokens(q){return clean(q,300).toLowerCase().split(/[^a-z0-9]+/).filter(x=>x.length>2).slice(0,12)}
function score(item,words){
  const hay=[item.headline,item.summary,item.region,item.sourceName,item.lane,item.desk].map(x=>String(x||'').toLowerCase()).join(' ')
  return words.reduce((n,w)=>n+(hay.includes(w)?1:0),0)+(item.live?1:0)+((item.verificationStatus==='official'||item.verification==='official')?2:0)
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store')
  if(!['GET','POST'].includes(req.method))return res.status(405).json({ok:false,error:'Method not allowed'})
  const q=clean(req.method==='GET'?req.query?.q:req.body?.q,300)
  if(!q)return res.status(400).json({ok:false,error:'q is required'})
  const base=backend()
  if(!base||!/^https?:\/\//.test(base)||base.includes('your-amm-backend.example.com'))return res.status(200).json({
    ok:true,configured:false,source:'oracle-index',query:q,results:[],crawler:{configured:false,status:'BACKEND_NOT_CONFIGURED'}
  })

  try{
    const [items,crawler]=await Promise.all([
      readJson(`${base}/api/omni-news/items`).catch(()=>[]),
      readJson(`${base}/api/quantum-crawler/status`).catch(()=>({status:'UNAVAILABLE'}))
    ])
    const rows=Array.isArray(items)?items:Array.isArray(items?.items)?items.items:[]
    const words=tokens(q)
    const results=rows.map(item=>({item,score:score(item,words)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,12).map(({item,score})=>({
      id:item.id,headline:item.headline,summary:item.summary,region:item.region,sourceName:item.sourceName,
      sourceUrl:item.sourceUrl||item.canonicalUrl||null,publishedAt:item.publishedAt||null,
      verification:item.verificationStatus||item.verification||'unverified',live:Boolean(item.live),score
    }))
    return res.status(200).json({
      ok:true,configured:true,source:'oracle-index',query:q,results,
      crawler:{configured:true,status:crawler?.status||'UNKNOWN',mode:crawler?.mode||null,publishAuthority:Boolean(crawler?.publishAuthority)}
    })
  }catch(error){
    return res.status(200).json({ok:true,configured:true,degraded:true,source:'oracle-index',query:q,results:[],error:clean(error?.message,300)})
  }
}
