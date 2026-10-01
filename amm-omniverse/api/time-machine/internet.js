import {internetArchiveTimeline,commonCrawlTimeline,fetchInternetArchiveCapture,persistHistoricalCapture,readPersistedHistoricalCaptures,nearestCapture,evidenceDifference,normalizeHistoricalUrl} from '../_lib/quantum-time-internet.js'

const clean=(v,n=1000)=>String(v??'').trim().slice(0,n)
const yearOf=v=>{const m=String(v||'').match(/\b(18|19|20|21)\d{2}\b/);return m?Number(m[0]):undefined}

async function timeline(url,body={}){
  const fromYear=yearOf(body.from||body.fromYear),toYear=yearOf(body.to||body.toYear)
  const [wayback,commonCrawl]=await Promise.all([
    internetArchiveTimeline(url,{fromYear,toYear,limit:body.limit||50}).catch(()=>[]),
    commonCrawlTimeline(url,{fromYear,toYear,limit:body.commonCrawlLimit||12}).catch(()=>[]),
  ])
  return {
    url:normalizeHistoricalUrl(url),
    completeness:'partial-observed-captures-only',
    warning:'Archives only show captures that actually exist. Missing captures are not evidence that a page or advertisement did not exist.',
    providers:{internetArchive:wayback.length,commonCrawl:commonCrawl.length},
    captures:[...wayback,...commonCrawl].sort((a,b)=>String(a.capturedAt).localeCompare(String(b.capturedAt))),
  }
}

async function detailedCapture(url,date,businessName=''){
  const y=yearOf(date)
  let internetArchive=[],commonCrawl=[],providerErrors=[]
  try{internetArchive=await internetArchiveTimeline(url,{fromYear:y,toYear:y,limit:60})}catch(error){providerErrors.push(String(error?.message||'internet_archive_unavailable'))}
  if(!internetArchive.length){
    try{commonCrawl=await commonCrawlTimeline(url,{fromYear:y,toYear:y,limit:20})}catch(error){providerErrors.push(String(error?.message||'common_crawl_unavailable'))}
  }
  let chosen=nearestCapture(internetArchive,date)||nearestCapture(commonCrawl,date)
  let source='provider'
  if(!chosen){
    const persisted=await readPersistedHistoricalCaptures(url,{year:y,limit:40})
    chosen=nearestCapture(persisted,date)
    if(chosen)source='durable-index'
  }
  if(!chosen)return {
    found:false,
    date,
    url:normalizeHistoricalUrl(url),
    reason:providerErrors.length?'archive_provider_temporarily_unavailable':'no_verified_snapshot_found',
    degraded:providerErrors.length>0,
    providerErrors,
  }
  let detail
  if(chosen.provider==='internet-archive')detail=await fetchInternetArchiveCapture(chosen)
  else detail={...chosen,contentUnavailable:Boolean(chosen.contentUnavailable??true),contentStatus:chosen.contentStatus||'metadata-only',contentHash:chosen.contentHash||chosen.digest||''}
  const persistence=source==='durable-index'?{stored:true,existing:true,source:'durable-index'}:await persistHistoricalCapture(url,detail,businessName)
  return {
    found:true,
    dateRequested:date,
    capture:detail,
    persistence,
    degraded:Boolean(detail.contentUnavailable||providerErrors.length),
    source,
    providerErrors,
  }
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store')
  if(!['GET','POST'].includes(req.method))return res.status(405).json({ok:false,error:'Method not allowed'})
  try{
    const body=req.method==='POST'?(req.body||{}):(req.query||{})
    const action=clean(body.action||'timeline',40).toLowerCase()
    const url=clean(body.url||body.domain,1800)
    if(!url)return res.status(400).json({ok:false,error:'url or domain is required'})
    if(action==='timeline'){
      const data=await timeline(url,body)
      return res.status(200).json({ok:true,mode:'HISTORICAL INTERNET',...data})
    }
    if(action==='capture'){
      const date=clean(body.date||body.year,40)
      if(!date)return res.status(400).json({ok:false,error:'date or year is required for capture'})
      const data=await detailedCapture(url,date,clean(body.businessName,240))
      return res.status(200).json({ok:true,mode:'HISTORICAL INTERNET',...data})
    }
    if(action==='compare'){
      const from=clean(body.from||body.fromYear,40),to=clean(body.to||body.toYear,40)
      if(!from||!to)return res.status(400).json({ok:false,error:'from and to dates/years are required for compare'})
      const [before,after]=await Promise.all([
        detailedCapture(url,from,clean(body.businessName,240)),
        detailedCapture(url,to,clean(body.businessName,240)),
      ])
      const difference=before.found&&after.found?evidenceDifference(before.capture,after.capture):null
      return res.status(200).json({
        ok:true,mode:'HISTORICAL INTERNET',url:normalizeHistoricalUrl(url),before,after,difference,
        evidenceRule:'Archived webpage changes are evidence of observed webpage versions, not proof of a Mandela effect or a change to offline reality.',
      })
    }
    return res.status(400).json({ok:false,error:'unsupported action'})
  }catch(error){
    const status=Number(error?.status)||502
    return res.status(status).json({ok:false,error:clean(error?.message||'historical_internet_failed',300)})
  }
}
