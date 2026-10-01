import {normalizeHistoricalUrl,validHistoricalUrl} from '../_lib/historicalInternetSafety.js'
import {persistQuantumTimeDocuments,readQuantumTimeVersions} from '../_lib/quantumTimeStore.js'
const clean=(v,n=1200)=>String(v||'').trim().slice(0,n)
const ARCHIVE='https://web.archive.org/cdx/search/cdx'
const CC_COLLECTIONS='https://index.commoncrawl.org/collinfo.json'

}
function stampToIso(stamp){
  const s=String(stamp||'')
  if(!/^\d{14}$/.test(s))return null
  return s.slice(0,4)+'-'+s.slice(4,6)+'-'+s.slice(6,8)+'T'+s.slice(8,10)+':'+s.slice(10,12)+':'+s.slice(12,14)+'Z'
}
function yearFrom(v){
  const s=String(v||'').match(/\b(19|20)\d{2}\b/)?.[0]
  return s||''
}
async function fetchText(url,timeout=8000){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout)
  try{
    const r=await fetch(url,{headers:{accept:'application/json,text/plain;q=.8,*/*;q=.2','user-agent':'TRYAMM-Historical-Internet/1.0'},cache:'no-store',signal:controller.signal,redirect:'manual'})
    const text=await r.text()
    if(!r.ok)throw new Error('provider_'+r.status)
    return text
  }finally{clearTimeout(timer)}
}
async function archiveSnapshots(url,{from='',to='',limit=24}={}){
  const q=new URLSearchParams({
    url,output:'json',fl:'timestamp,original,statuscode,digest,mimetype',
    filter:'statuscode:200',collapse:'digest',limit:String(Math.min(Math.max(limit,1),50))
  })
  if(from)q.set('from',from)
  if(to)q.set('to',to)
  try{
    const rows=JSON.parse(await fetchText(ARCHIVE+'?'+q))
    if(!Array.isArray(rows)||rows.length<2)return []
    return rows.slice(1).map(([timestamp,original,statuscode,digest,mimetype])=>({
      provider:'internet-archive',
      sourceLabel:'ARCHIVED',
      sourceUrl:original,
      capturedAt:stampToIso(timestamp),
      archiveTimestamp:timestamp,
      archiveUrl:'https://web.archive.org/web/'+timestamp+'/'+original,
      status:Number(statuscode||0),
      digest:digest||null,
      mime:mimetype||null,
      provenance:{provider:'internet-archive',timestamp,digest}
    }))
  }catch{return []}
}
async function commonCrawlCollections(){
  try{
    const data=JSON.parse(await fetchText(CC_COLLECTIONS))
    return Array.isArray(data)?data:[]
  }catch{return []}
}
async function commonCrawlSnapshots(url,{year='',limit=8}={}){
  const collections=await commonCrawlCollections()
  const y=yearFrom(year)
  const selected=(y?collections.filter(c=>String(c.id||'').includes(y)):collections).slice(0,y?4:2)
  const out=[]
  for(const col of selected){
    const api=col['cdx-api']||col.cdxApi
    if(!api)continue
    const q=new URLSearchParams({url,output:'json',filter:'status:200',limit:String(Math.min(Math.max(limit,1),20))})
    try{
      const text=await fetchText(api+'?'+q)
      for(const line of text.trim().split('\n').filter(Boolean)){
        let row;try{row=JSON.parse(line)}catch{continue}
        out.push({
          provider:'common-crawl',
          sourceLabel:'COMMON CRAWL',
          sourceUrl:row.url,
          capturedAt:stampToIso(row.timestamp),
          archiveTimestamp:row.timestamp||null,
          archiveUrl:null,
          status:Number(row.status||0),
          digest:row.digest||null,
          mime:row.mime||null,
          provenance:{
            provider:'common-crawl',collection:col.id,digest:row.digest||null,
            filename:row.filename||null,offset:row.offset||null,length:row.length||null
          }
        })
      }
    }catch{}
  }
  return out
}
function dedupe(rows){
  const seen=new Set(),out=[]
  for(const r of rows.sort((a,b)=>String(a.capturedAt||'').localeCompare(String(b.capturedAt||'')))){
    const key=[r.provider,r.sourceUrl,r.capturedAt,r.digest].join('|')
    if(seen.has(key))continue
    seen.add(key);out.push(r)
  }
  return out
}
function temporalSummary(rows){
  const dated=rows.filter(r=>r.capturedAt)
  const digests=new Set(rows.map(r=>r.digest).filter(Boolean))
  return {
    captures:rows.length,
    uniqueDigests:digests.size,
    firstSeen:dated[0]?.capturedAt||null,
    lastSeen:dated[dated.length-1]?.capturedAt||null,
    providers:[...new Set(rows.map(r=>r.provider))]
  }
}
function nearest(rows,year){
  const y=Number(year)
  if(!y)return null
  return [...rows].filter(r=>r.capturedAt).sort((a,b)=>Math.abs(Number(String(a.capturedAt).slice(0,4))-y)-Math.abs(Number(String(b.capturedAt).slice(0,4))-y))[0]||null
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store')
  if(!['GET','POST'].includes(req.method))return res.status(405).json({ok:false,error:'Method not allowed'})
  const input=req.method==='GET'?req.query:req.body||{}
  const rawUrl=clean(input.url,1200)
  const url=validHistoricalUrl(rawUrl)?normalizeHistoricalUrl(rawUrl):rawUrl
  const year=yearFrom(input.year)
  const from=yearFrom(input.from)||(year?year:'')
  const to=yearFrom(input.to)||(year?year:'')
  const limit=Math.min(Math.max(Number(input.limit)||24,1),50)
  if(!validHistoricalUrl(url))return res.status(400).json({ok:false,error:'Valid public http(s) URL required'})

  const [archive,commonCrawl]=await Promise.all([
    archiveSnapshots(url,{from,to,limit}),
    commonCrawlSnapshots(url,{year,limit:8})
  ])
  const externalSnapshots=dedupe([...archive,...commonCrawl])
  const persistence=await persistQuantumTimeDocuments(externalSnapshots.map(x=>({
    sourceUrl:x.sourceUrl,
    sourceType:x.provider,
    capturedAt:x.capturedAt,
    archiveTimestamp:x.archiveTimestamp,
    digest:x.digest,
    provenance:x.provenance,
    verificationStatus:'source-capture'
  }))).catch(error=>({configured:true,saved:0,error:clean(error?.message,300)}))
  const durable=await readQuantumTimeVersions(url,50).catch(()=>({configured:false,rows:[]}))
  const durableSnapshots=(Array.isArray(durable?.rows)?durable.rows:[]).map(row=>({
    provider:row.source_type,
    sourceLabel:'DURABLE TIME INDEX',
    sourceUrl:row.source_url,
    capturedAt:row.captured_at,
    archiveTimestamp:row.archive_timestamp||null,
    archiveUrl:row.source_type==='internet-archive'&&row.archive_timestamp?'https://web.archive.org/web/'+row.archive_timestamp+'/'+row.source_url:null,
    status:200,
    digest:row?.provenance?.providerDigest||row.content_hash||null,
    mime:null,
    title:row.title||null,
    description:row.description||null,
    marketingSignals:Array.isArray(row.ad_signals)?row.ad_signals:[],
    provenance:{...(row.provenance||{}),durableId:row.id,contentHash:row.content_hash,verificationStatus:row.verification_status}
  }))
  const snapshots=dedupe([...externalSnapshots,...durableSnapshots])
  const summary=temporalSummary(snapshots)
  return res.status(200).json({
    ok:true,
    mode:'historical-internet',
    url,year:year||null,from:from||null,to:to||null,
    summary,
    nearest:year?nearest(snapshots,year):null,
    snapshots:snapshots.slice(0,50),
    persistence,
    durableVersions:Array.isArray(durable?.rows)?durable.rows:[],
    externalProvidersAvailable:{internetArchive:archive.length>0,commonCrawl:commonCrawl.length>0},
    evidencePolicy:{
      archiveCaptureIsEvidenceOfCapture:true,
      absenceIsNotProofOfNonexistence:true,
      retrievedContentIsUntrusted:true,
      historicalClaimsRequireDates:true,
      collectiveMemoryClaims:'compare evidence; do not diagnose or declare a Mandela effect'
    }
  })
}
