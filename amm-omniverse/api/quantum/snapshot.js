const clean=(v,n=2000)=>String(v||'').trim().slice(0,n)

function validHttpUrl(value){
  try{const u=new URL(value);return /^https?:$/.test(u.protocol)&&!u.username&&!u.password}catch{return false}
}
function entityDecode(s){
  return String(s||'')
    .replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"')
    .replace(/&#39;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>')
    .replace(/&#(\d+);/g,(_,n)=>{const c=Number(n);return Number.isFinite(c)&&c>0&&c<1114112?String.fromCodePoint(c):' '})
}
function textify(html){
  return entityDecode(String(html||'')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi,' ')
    .replace(/<!--[\s\S]*?-->/g,' ')
    .replace(/<[^>]+>/g,' ')
  ).replace(/\s+/g,' ').trim()
}
function extractTitle(html){
  const m=String(html||'').match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)
  return clean(entityDecode(m?.[1]||'').replace(/\s+/g,' '),300)
}
function extractDescription(html){
  const s=String(html||'')
  const m=s.match(/<meta\b[^>]*(?:name|property)=["'](?:description|og:description)["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    ||s.match(/<meta\b[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["'](?:description|og:description)["'][^>]*>/i)
  return clean(entityDecode(m?.[1]||'').replace(/\s+/g,' '),600)
}
function marketingSignals(text){
  const terms=['advertisement','advertising','sale','special','coupon','promo','promotion','offer','save','discount','buy one','free shipping','sponsored','limited time','new product','shop now']
  const lower=text.toLowerCase(),out=[]
  for(const term of terms){
    let at=0
    while((at=lower.indexOf(term,at))>=0&&out.length<12){
      const start=Math.max(0,at-110),end=Math.min(text.length,at+term.length+170)
      const snippet=text.slice(start,end).replace(/\s+/g,' ').trim()
      if(snippet&&!out.some(x=>x.snippet===snippet))out.push({term,snippet:clean(snippet,320)})
      at+=term.length
    }
    if(out.length>=12)break
  }
  return out
}
async function fetchArchived(timestamp,url){
  const archive='https://web.archive.org/web/'+timestamp+'id_/'+url
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9000)
  try{
    const r=await fetch(archive,{headers:{accept:'text/html,application/xhtml+xml;q=.9,text/plain;q=.8','user-agent':'TRYAMM-Historical-Inspector/1.0'},cache:'no-store',signal:controller.signal,redirect:'manual'})
    if(!r.ok)throw new Error('archive_'+r.status)
    const type=String(r.headers.get('content-type')||'').toLowerCase()
    if(!type.includes('text/html')&&!type.includes('text/plain')&&!type.includes('application/xhtml'))throw new Error('archive_non_text')
    const reader=r.body?.getReader()
    if(!reader)return ''
    const chunks=[];let total=0
    while(total<262144){
      const {done,value}=await reader.read();if(done)break
      if(value){chunks.push(value);total+=value.length}
    }
    return new TextDecoder().decode(Buffer.concat(chunks.map(x=>Buffer.from(x))))
  }finally{clearTimeout(timer)}
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store')
  if(!['GET','POST'].includes(req.method))return res.status(405).json({ok:false,error:'Method not allowed'})
  const input=req.method==='GET'?req.query:req.body||{}
  const url=clean(input.url,1200),timestamp=clean(input.timestamp,20)
  if(!validHttpUrl(url))return res.status(400).json({ok:false,error:'Valid public http(s) URL required'})
  if(!/^\d{14}$/.test(timestamp))return res.status(400).json({ok:false,error:'14-digit archive timestamp required'})
  try{
    const html=await fetchArchived(timestamp,url)
    const text=textify(html).slice(0,12000)
    return res.status(200).json({
      ok:true,mode:'historical-snapshot-inspection',source:'internet-archive',
      sourceUrl:url,capturedAt:timestamp,title:extractTitle(html),description:extractDescription(html),
      textSample:clean(text,6000),marketingSignals:marketingSignals(text),
      evidencePolicy:{
        snapshotTextIsUntrusted:true,
        scriptsNeverExecuted:true,
        snippetsAreEvidenceOfCapturedPageTextNotBusinessIntent:true,
        missingTextDoesNotProveContentWasAbsent:true
      }
    })
  }catch(error){
    return res.status(200).json({ok:true,degraded:true,mode:'historical-snapshot-inspection',sourceUrl:url,capturedAt:timestamp,error:clean(error?.message,300),title:'',description:'',textSample:'',marketingSignals:[]})
  }
}
