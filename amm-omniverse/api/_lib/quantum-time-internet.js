import crypto from 'node:crypto'
import net from 'node:net'
import {adminReady,adminRest} from './supabase-admin.js'

const IA_CDX='https://web.archive.org/cdx/search/cdx'
const CC_COLLECTIONS='https://index.commoncrawl.org/collinfo.json'
const MAX_ARCHIVE_BYTES=750000

const clean=(v,n=2000)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,n)
const sha256=v=>crypto.createHash('sha256').update(String(v??'')).digest('hex')

function blockedHost(host){
  const h=String(host||'').toLowerCase().replace(/^\[|\]$/g,'')
  if(!h||h==='localhost'||h.endsWith('.localhost')||h.endsWith('.local'))return true
  const kind=net.isIP(h)
  if(!kind)return false
  if(kind===4){
    const p=h.split('.').map(Number)
    return p[0]===10||p[0]===127||p[0]===0||p[0]===169&&p[1]===254||p[0]===192&&p[1]===168||p[0]===172&&p[1]>=16&&p[1]<=31
  }
  return h==='::1'||h.startsWith('fc')||h.startsWith('fd')||h.startsWith('fe8')||h.startsWith('fe9')||h.startsWith('fea')||h.startsWith('feb')
}

export function normalizeHistoricalUrl(raw){
  let value=clean(raw,1800)
  if(!value)throw Object.assign(new Error('historical_url_required'),{status:400})
  if(!/^https?:\/\//i.test(value))value='https://'+value
  let u
  try{u=new URL(value)}catch{throw Object.assign(new Error('invalid_historical_url'),{status:400})}
  if(!['http:','https:'].includes(u.protocol)||u.username||u.password||blockedHost(u.hostname))throw Object.assign(new Error('unsupported_historical_url'),{status:400})
  u.hash=''
  for(const key of ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'])u.searchParams.delete(key)
  return u.toString()
}

export function archiveTimestampToIso(value){
  const s=String(value||'').replace(/\D/g,'').slice(0,14)
  if(s.length<8)return null
  const y=s.slice(0,4),m=s.slice(4,6),d=s.slice(6,8)
  const hh=s.slice(8,10)||'00',mm=s.slice(10,12)||'00',ss=s.slice(12,14)||'00'
  const iso=`${y}-${m}-${d}T${hh}:${mm}:${ss}Z`
  return Number.isFinite(Date.parse(iso))?iso:null
}

async function fetchJson(url,timeout=9000){
  const controller=new AbortController()
  const timer=setTimeout(()=>controller.abort(),timeout)
  try{
    const r=await fetch(url,{headers:{accept:'application/json','user-agent':'TRYAMM-Quantum-Time/1.0'},signal:controller.signal,cache:'no-store'})
    if(!r.ok)throw new Error(`archive_provider_${r.status}`)
    return await r.json()
  }finally{clearTimeout(timer)}
}

export async function internetArchiveTimeline(rawUrl,{fromYear,toYear,limit=40}={}){
  const url=normalizeHistoricalUrl(rawUrl)
  const params=new URLSearchParams({
    url,
    output:'json',
    fl:'timestamp,original,statuscode,mimetype,digest,length',
    filter:'statuscode:200',
    collapse:'digest',
    limit:String(Math.min(Math.max(Number(limit)||40,1),100)),
  })
  if(fromYear)params.set('from',String(fromYear).slice(0,4))
  if(toYear)params.set('to',String(toYear).slice(0,4))
  const rows=await fetchJson(`${IA_CDX}?${params}`)
  if(!Array.isArray(rows)||rows.length<2)return []
  return rows.slice(1).map(row=>{
    const [timestamp,original,statuscode,mimetype,digest,length]=row
    return {
      provider:'internet-archive',
      sourceType:'archive',
      sourceLabel:'ARCHIVED',
      timestamp:String(timestamp||''),
      capturedAt:archiveTimestampToIso(timestamp),
      original:String(original||url),
      status:Number(statuscode||200),
      mime:String(mimetype||''),
      digest:String(digest||''),
      length:Number(length||0),
      archiveUrl:`https://web.archive.org/web/${timestamp}/${original}`,
      provenance:{provider:'internet-archive',cdx:true,digest:String(digest||'')},
    }
  }).filter(x=>x.capturedAt)
}

function collectionYear(id){
  const m=String(id||'').match(/CC-MAIN-(\d{4})-/)
  return m?Number(m[1]):0
}

export async function commonCrawlTimeline(rawUrl,{fromYear,toYear,limit=12}={}){
  const url=normalizeHistoricalUrl(rawUrl)
  let collections=[]
  try{collections=await fetchJson(CC_COLLECTIONS,8000)}catch{return []}
  if(!Array.isArray(collections))return []
  const from=Number(fromYear)||0,to=Number(toYear)||9999
  const chosen=collections.filter(c=>{const y=collectionYear(c.id);return y>=from&&y<=to}).slice(0,4)
  const per=Math.max(1,Math.min(5,Math.ceil((Number(limit)||12)/Math.max(1,chosen.length))))
  const batches=await Promise.all(chosen.map(async c=>{
    const api=c['cdx-api']||c.cdxApi||`https://index.commoncrawl.org/${c.id}-index`
    const params=new URLSearchParams({url,output:'json',filter:'status:200',limit:String(per)})
    try{
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6500)
      const r=await fetch(`${api}?${params}`,{headers:{accept:'application/json','user-agent':'TRYAMM-Quantum-Time/1.0'},signal:controller.signal,cache:'no-store'})
      clearTimeout(timer)
      if(!r.ok)return []
      const text=await r.text()
      return text.split('\n').filter(Boolean).slice(0,per).map(line=>{
        const row=JSON.parse(line),capturedAt=archiveTimestampToIso(row.timestamp)
        return {
          provider:'common-crawl',sourceType:'archive',sourceLabel:'COMMON CRAWL',
          timestamp:String(row.timestamp||''),capturedAt,original:String(row.url||url),
          status:Number(row.status||200),mime:String(row.mime||''),digest:String(row.digest||''),
          length:Number(row.length||0),archiveUrl:null,
          provenance:{provider:'common-crawl',collection:c.id,digest:row.digest,filename:row.filename,offset:row.offset,length:row.length},
        }
      }).filter(x=>x.capturedAt)
    }catch{return []}
  }))
  return batches.flat().sort((a,b)=>String(a.capturedAt).localeCompare(String(b.capturedAt))).slice(0,Math.min(Number(limit)||12,30))
}

async function readLimitedText(response,maxBytes=MAX_ARCHIVE_BYTES){
  if(!response.body)return ''
  const reader=response.body.getReader(),decoder=new TextDecoder()
  let total=0,out=''
  try{
    while(true){
      const {done,value}=await reader.read()
      if(done)break
      total+=value.byteLength
      out+=decoder.decode(value,{stream:true})
      if(total>=maxBytes){await reader.cancel();break}
    }
    out+=decoder.decode()
  }catch{}
  return out
}

const decodeEntities=s=>String(s||'')
  .replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"')
  .replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>')

function stripHtml(html){
  return decodeEntities(String(html||'')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi,' ')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi,' ')
    .replace(/<!--([\s\S]*?)-->/g,' ')
    .replace(/<[^>]+>/g,' '))
}

function tagText(html,tag){
  const out=[]
  const re=new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`,'gi')
  let m
  while((m=re.exec(html))&&out.length<12)out.push(clean(stripHtml(m[1]),240))
  return out.filter(Boolean)
}

function extractAdSignals(text){
  const chunks=String(text||'').split(/(?<=[.!?])\s+|\s{2,}/).map(x=>clean(x,260)).filter(Boolean)
  const re=/(\$\s?\d|\d+%\s*off|sale\b|special\b|offer\b|limited\s*time|buy\b|shop\b|free\b|save\b|coupon\b|deal\b|subscribe\b|order\b|new\b)/i
  return [...new Set(chunks.filter(x=>re.test(x)).slice(0,12))]
}

export function extractHistoricalPageSignals(html){
  const source=String(html||'')
  const title=clean((source.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)||[])[1],300)
  const desc=clean((source.match(/<meta\b[^>]*(?:name|property)=["'](?:description|og:description)["'][^>]*content=["']([^"']*)["'][^>]*>/i)||[])[1],500)
  const headings=[...tagText(source,'h1'),...tagText(source,'h2'),...tagText(source,'h3')].slice(0,16)
  const visible=clean(stripHtml(source),12000)
  return {
    title,
    description:desc,
    headings,
    contentExcerpt:visible.slice(0,2200),
    adSignals:extractAdSignals([title,desc,...headings,visible.slice(0,6000)].join(' ')),
    contentHash:sha256(visible),
  }
}

export async function fetchInternetArchiveCapture(capture){
  if(!capture?.timestamp||!capture?.original)throw Object.assign(new Error('archive_capture_required'),{status:400})
  const raw=`https://web.archive.org/web/${capture.timestamp}id_/${capture.original}`
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000)
  try{
    const r=await fetch(raw,{headers:{accept:'text/html,application/xhtml+xml','user-agent':'TRYAMM-Quantum-Time/1.0'},signal:controller.signal,redirect:'follow',cache:'no-store'})
    if(!r.ok)throw new Error(`archive_capture_${r.status}`)
    const type=String(r.headers.get('content-type')||'')
    if(!type.includes('html')&&!type.includes('text'))return {...capture,title:'',description:'',headings:[],contentExcerpt:'',adSignals:[],contentHash:sha256(capture.digest||capture.timestamp)}
    const html=await readLimitedText(r)
    return {...capture,...extractHistoricalPageSignals(html)}
  }finally{clearTimeout(timer)}
}

export async function persistHistoricalCapture(rawUrl,capture,businessName=''){
  if(!adminReady()||!capture?.capturedAt)return {stored:false,reason:'supabase_admin_not_configured'}
  const canonical=normalizeHistoricalUrl(rawUrl)
  try{
    const existing=await adminRest('quantum_time_documents',{query:{
      select:'id,canonical_url,captured_at,content_hash',
      canonical_url:`eq.${canonical}`,
      source_type:`eq.${capture.provider==='common-crawl'?'common-crawl':'internet-archive'}`,
      captured_at:`eq.${capture.capturedAt}`,
      limit:'1',
    }})
    if(Array.isArray(existing)&&existing.length)return {stored:true,existing:true,id:existing[0].id}
    const previous=await adminRest('quantum_time_documents',{query:{
      select:'id,captured_at',
      canonical_url:`eq.${canonical}`,
      captured_at:`lt.${capture.capturedAt}`,
      order:'captured_at.desc',
      limit:'1',
    }}).catch(()=>[])
    const row={
      canonical_url:canonical,
      source_url:capture.archiveUrl||capture.original||canonical,
      source_type:capture.provider==='common-crawl'?'common-crawl':'internet-archive',
      captured_at:capture.capturedAt,
      archive_timestamp:capture.timestamp||null,
      title:clean(capture.title,500)||null,
      description:clean(capture.description,1200)||null,
      content_excerpt:clean(capture.contentExcerpt,4000),
      content_hash:String(capture.contentHash||sha256(capture.digest||JSON.stringify(capture.provenance||{}))),
      business_name:clean(businessName,240)||null,
      ad_signals:Array.isArray(capture.adSignals)?capture.adSignals.slice(0,20):[],
      provenance:{...(capture.provenance||{}),observedAt:new Date().toISOString(),completeHistory:false},
      verification_status:'source-capture',
      supersedes:Array.isArray(previous)&&previous[0]?.id?previous[0].id:null,
    }
    const inserted=await adminRest('quantum_time_documents',{method:'POST',body:row})
    return {stored:true,id:Array.isArray(inserted)?inserted[0]?.id:null}
  }catch(error){return {stored:false,reason:clean(error?.message,260)}}
}

export function nearestCapture(captures,dateInput){
  if(!captures?.length)return null
  const target=Date.parse(/^\d{4}$/.test(String(dateInput||''))?`${dateInput}-07-01T00:00:00Z`:String(dateInput||''))
  if(!Number.isFinite(target))return captures[0]
  return [...captures].sort((a,b)=>Math.abs(Date.parse(a.capturedAt)-target)-Math.abs(Date.parse(b.capturedAt)-target))[0]
}

export function evidenceDifference(before,after){
  const a=new Set(clean([before?.title,before?.description,...(before?.adSignals||[])].join(' '),12000).toLowerCase().split(/[^a-z0-9$%]+/).filter(x=>x.length>2))
  const b=new Set(clean([after?.title,after?.description,...(after?.adSignals||[])].join(' '),12000).toLowerCase().split(/[^a-z0-9$%]+/).filter(x=>x.length>2))
  return {
    added:[...b].filter(x=>!a.has(x)).slice(0,80),
    removed:[...a].filter(x=>!b.has(x)).slice(0,80),
    sameHash:Boolean(before?.contentHash&&after?.contentHash&&before.contentHash===after.contentHash),
    interpretation:'Observed archived webpage differences only. This does not establish that human memory, offline materials, or reality changed.',
  }
}
