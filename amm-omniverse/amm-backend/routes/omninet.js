const express = require('express')

function createOmniNetRouter({ supabase }) {
  const router = express.Router()
  const buckets = new Map()

  async function requireUser(req,res,next){
    const auth=req.headers.authorization||''
    const token=auth.startsWith('Bearer ')?auth.slice(7):''
    if(!token) return res.status(401).json({error:'Authentication required'})
    const {data,error}=await supabase.auth.getUser(token)
    if(error||!data?.user) return res.status(401).json({error:'Invalid session'})
    req.user=data.user; next()
  }

  function rateLimit(req,res,next){
    const key=`${req.user.id}:${req.ip||'unknown'}`; const now=Date.now(); const b=buckets.get(key)||{start:now,count:0}
    if(now-b.start>60000){b.start=now;b.count=0}
    b.count++; buckets.set(key,b)
    if(b.count>Number(process.env.OMNINET_RATE_LIMIT_PER_MINUTE||60)) return res.status(429).json({error:'Search rate limit reached'})
    next()
  }

  async function searchOwnIndex(q,count){
    const {data,error}=await supabase.rpc('omninet_search',{q,max_results:count})
    if(error) throw error
    return (data||[]).map(x=>({id:x.id,title:x.title,url:x.url,description:x.summary||'',source:'omninet',sourceType:x.source_type||'omninet',language:x.language||'und',publishedAt:x.published_at||null,score:x.rank||0}))
  }

  async function searchBrave(q,count,kind='web',country='US',lang='en'){
    const key=process.env.BRAVE_SEARCH_API_KEY
    if(!key) return {configured:false,results:[]}
    const allowed=new Set(['web','news','videos','images'])
    const type=allowed.has(kind)?kind:'web'
    const endpoint=type==='web'?'web/search':`${type}/search`
    const params=new URLSearchParams({q,count:String(Math.max(1,Math.min(count,20))),country:String(country||'US').toUpperCase(),search_lang:String(lang||'en').toLowerCase()})
    const response=await fetch(`https://api.search.brave.com/res/v1/${endpoint}?${params}`,{headers:{Accept:'application/json','X-Subscription-Token':key}})
    if(!response.ok) throw new Error(`Public web provider returned ${response.status}`)
    const body=await response.json()
    const bucket=type==='web'?body.web?.results:body[type]?.results
    const results=(bucket||[]).map((x,i)=>({id:`brave:${type}:${i}:${x.url||x.title}`,title:x.title||'Untitled',url:x.url||x.page_url||null,description:x.description||x.snippet||'',source:'public-web',provider:'brave',sourceType:type,thumbnail:x.thumbnail?.src||x.thumbnail||null,age:x.age||null,publishedAt:x.page_age||x.published_time||null}))
    return {configured:true,results}
  }

  function uniqueResults(items){
    const seen=new Set(); const out=[]
    for(const item of items){const k=(item.url||`${item.source}:${item.title}`).toLowerCase(); if(seen.has(k)) continue; seen.add(k); out.push(item)}
    return out
  }

  router.get('/status',requireUser,(_req,res)=>res.json({
    ownIndex:true,
    publicWebProvider:Boolean(process.env.BRAVE_SEARCH_API_KEY),
    publicWebProviderName:process.env.BRAVE_SEARCH_API_KEY?'brave':null,
    modes:['omninet','web','hybrid','news','videos','images'],
    principles:['show-original-sources','AI-is-optional','own-index-first','no-client-search-secrets']
  }))

  router.get('/search',requireUser,rateLimit,async(req,res)=>{
    try{
      const q=String(req.query.q||'').trim(); if(!q) return res.status(400).json({error:'q required'}); if(q.length>400) return res.status(400).json({error:'query too long'})
      const mode=String(req.query.mode||'hybrid'); const count=Math.max(1,Math.min(Number(req.query.count)||10,20)); const lang=String(req.query.lang||'en'); const country=String(req.query.country||'US')
      let own=[]; let external=[]; let providerConfigured=false
      if(['omninet','hybrid'].includes(mode)) own=await searchOwnIndex(q,count)
      if(mode!=='omninet'){
        const kind=mode==='news'?'news':mode==='videos'?'videos':mode==='images'?'images':'web'
        const web=await searchBrave(q,count,kind,country,lang); providerConfigured=web.configured; external=web.results
      }
      const results=uniqueResults(mode==='hybrid'?[...own,...external]:mode==='omninet'?own:external).slice(0,count*2)
      try{await supabase.from('omninet_queries').insert({user_id:req.user.id,query_text:q,mode,result_count:results.length,providers:[...(own.length?['omninet']:[]),...(providerConfigured?['brave']:[])]})}catch(_){ }
      res.json({query:q,mode,results,ownIndexCount:own.length,publicWebCount:external.length,publicWebConfigured:providerConfigured,sourceChoice:true})
    }catch(error){console.error('OmniNet search error',error);res.status(502).json({error:'Search unavailable',detail:process.env.NODE_ENV==='development'?error.message:undefined})}
  })

  router.post('/documents',requireUser,async(req,res)=>{
    try{
      const {title,url=null,summary='',bodyText='',language='und',tags=[],visibility='private',sourceType='user'}=req.body||{}
      if(!title||typeof title!=='string') return res.status(400).json({error:'title required'})
      const safeVisibility=['private','unlisted','public'].includes(visibility)?visibility:'private'
      const {data,error}=await supabase.from('omninet_documents').insert({owner_user_id:req.user.id,title:String(title).slice(0,300),url:url?String(url).slice(0,2000):null,summary:String(summary).slice(0,4000),body_text:String(bodyText).slice(0,100000),language:String(language).slice(0,20),tags:Array.isArray(tags)?tags.slice(0,50).map(x=>String(x).slice(0,80)):[],visibility:safeVisibility,source_type:String(sourceType).slice(0,80)}).select('*').single()
      if(error) throw error
      res.status(201).json({document:data})
    }catch(error){res.status(500).json({error:'Failed to index document'})}
  })

  return router
}

module.exports={createOmniNetRouter}
