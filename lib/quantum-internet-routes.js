'use strict';

const ARCHIVE_CDX='https://web.archive.org/cdx/search/cdx';
const CROSSREF='https://api.crossref.org/works';
const SMALL_WEB=['marginalia','independent','personal_site','rss','forum'];
const SOURCE_LABELS={tryamm:'TRYAMM VERIFIED',archive:'ARCHIVED',reddit:'COMMUNITY SOURCE',smallweb:'SMALL WEB',academic:'ACADEMIC',external:'LIVE WEB',creator:'CREATOR SOURCE',business:'BUSINESS SOURCE',ai:'AI INFERENCE'};

function norm(v,max=500){return String(v??'').trim().slice(0,max);}
function score(item){
  let s=Number(item.score||0);
  if(item.sourceType==='tryamm')s+=30;
  if(item.sourceType==='academic')s+=26;
  if(item.sourceType==='smallweb')s+=22;
  if(item.sourceType==='archive')s+=14;
  if(item.sourceType==='reddit')s+=10;
  if(item.verified)s+=20;
  if(item.independent)s+=10;
  if(item.trackerFree)s+=5;
  return s;
}
function diversify(items,limit=20){
  const seenDomains=new Map(),out=[];
  const pools={mainstream:0,academic:0,smallweb:0,community:0,archive:0,tryamm:0};
  for(const item of items.map(x=>({...x,rank:score(x)})).sort((a,b)=>b.rank-a.rank)){
    const host=norm(item.host||'',120).toLowerCase();
    if(host&&(seenDomains.get(host)||0)>=2)continue;
    const lane=item.sourceType==='tryamm'?'tryamm':item.sourceType==='academic'?'academic':item.sourceType==='smallweb'?'smallweb':item.sourceType==='reddit'?'community':item.sourceType==='archive'?'archive':'mainstream';
    if(pools[lane]>=Math.ceil(limit*.45))continue;
    out.push(item);pools[lane]++;if(host)seenDomains.set(host,(seenDomains.get(host)||0)+1);
    if(out.length>=limit)break;
  }
  return {results:out,diversity:pools};
}
async function archiveSnapshots(url){
  if(!url)return[];
  const q=new URLSearchParams({url,output:'json',fl:'timestamp,original,statuscode,digest',filter:'statuscode:200',collapse:'digest',limit:'12'});
  const r=await fetch(`${ARCHIVE_CDX}?${q}`,{headers:{'user-agent':'TRYAMM-HoloSearch/1.0'}});if(!r.ok)return[];
  const rows=await r.json().catch(()=>[]);if(!Array.isArray(rows)||rows.length<2)return[];
  return rows.slice(1).map(([timestamp,original,statuscode,digest])=>({title:`Archived snapshot ${timestamp}`,url:`https://web.archive.org/web/${timestamp}/${original}`,host:new URL(original).host,sourceType:'archive',sourceLabel:SOURCE_LABELS.archive,timestamp,statuscode,digest,score:20}));
}
async function academicSearch(query,rows=12){
  const p=new URLSearchParams({'query.bibliographic':query,rows:String(Math.min(Math.max(rows,1),25)),select:'DOI,title,author,published,container-title,type,is-referenced-by-count,URL,publisher'});
  if(process.env.CROSSREF_CONTACT_EMAIL)p.set('mailto',process.env.CROSSREF_CONTACT_EMAIL);
  const r=await fetch(`${CROSSREF}?${p}`,{headers:{'user-agent':`TRYAMM-HoloAcademic/1.0${process.env.CROSSREF_CONTACT_EMAIL?` (mailto:${process.env.CROSSREF_CONTACT_EMAIL})`:''}`}});if(!r.ok)return[];
  const body=await r.json().catch(()=>({}));const items=body?.message?.items||[];
  return items.map(item=>{const title=Array.isArray(item.title)?item.title[0]:item.title||'Untitled research';const authors=(item.author||[]).slice(0,5).map(a=>[a.given,a.family].filter(Boolean).join(' ')).filter(Boolean);const dateParts=item.published?.['date-parts']?.[0]||[];const year=dateParts[0]||null;const journal=Array.isArray(item['container-title'])?item['container-title'][0]:item['container-title']||'';const doi=item.DOI||'';return{title,summary:[authors.join(', '),journal,year?String(year):'',item.publisher||''].filter(Boolean).join(' • '),url:item.URL|| (doi?`https://doi.org/${doi}`:''),host:'doi.org',sourceType:'academic',sourceLabel:SOURCE_LABELS.academic,verified:true,score:48,doi,year,journal,citations:Number(item['is-referenced-by-count']||0),workType:item.type||null};});
}

module.exports=function registerQuantumInternet({app,auth,getStore}){
  app.get('/api/quantum-internet/about',(_req,res)=>res.json({name:'TRYAMM Quantum Internet',assistant:'HoloGPT',principles:['source provenance','filter-bubble resistance','academic evidence','small-web discovery','historical comparison','community context','user control','privacy by default'],sourceLabels:SOURCE_LABELS,smallWebSignals:SMALL_WEB,mailPublicName:'TRYAMM Mail',mailInternalCodename:'Quantum Mail'}));
  app.get('/api/quantum-internet/search',async(req,res)=>{
    const q=norm(req.query.q,300);if(!q)return res.status(400).json({error:'Search query required'});
    const limit=Math.min(Math.max(Number(req.query.limit)||20,5),50),store=getStore(),items=[];
    const text=q.toLowerCase();
    for(const [collection,type] of [['publications','tryamm'],['networkPosts','creator'],['teamMembers','tryamm']]){
      for(const item of store[collection]||[]){const hay=JSON.stringify(item).toLowerCase();if(hay.includes(text))items.push({id:item.id,title:item.title||item.name||item.body?.slice(0,90)||collection,summary:item.abstract||item.bio||item.body||'',url:item.documentUrl||'/tryamm-hub.html',host:'tryamm.online',sourceType:type,sourceLabel:SOURCE_LABELS[type],verified:type==='tryamm',score:65});}
    }
    const discovery=[
      {title:`Search the independent web for “${q}”`,url:`https://marginalia-search.com/search?query=${encodeURIComponent(q)}`,host:'marginalia-search.com',sourceType:'smallweb',sourceLabel:SOURCE_LABELS.smallweb,independent:true,trackerFree:true,summary:'Marginalia prioritizes non-commercial and independent websites.',score:45},
      {title:`Search Reddit communities for “${q}”`,url:`https://www.reddit.com/search/?q=${encodeURIComponent(q)}`,host:'reddit.com',sourceType:'reddit',sourceLabel:SOURCE_LABELS.reddit,summary:'Community discussion lane. Treat anecdotes as community evidence, not verified fact.',score:32},
      {title:`Search arXiv for “${q}”`,url:`https://arxiv.org/search/?query=${encodeURIComponent(q)}&searchtype=all`,host:'arxiv.org',sourceType:'academic',sourceLabel:SOURCE_LABELS.academic,summary:'Preprints and research manuscripts. Preprint status should be shown clearly.',score:36},
      {title:`Search PubMed for “${q}”`,url:`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(q)}`,host:'pubmed.ncbi.nlm.nih.gov',sourceType:'academic',sourceLabel:SOURCE_LABELS.academic,summary:'Biomedical literature discovery gateway.',score:38}
    ];
    items.push(...discovery,...await academicSearch(q,8));
    const mixed=diversify(items,limit);
    res.json({query:q,...mixed,filterBubbleBreaker:{enabled:true,personalizationDefault:'low',domainCap:2,lanes:['TRYAMM','academic','small web','community','archive','live web'],note:'Ranking intentionally reserves room for independent, academic, community and dissenting sources rather than optimizing only for engagement.'}});
  });
  app.get('/api/quantum-internet/academic',async(req,res)=>{try{const q=norm(req.query.q,300);if(!q)return res.status(400).json({error:'Academic search query required'});const results=await academicSearch(q,Math.min(Number(req.query.limit)||20,25));res.json({query:q,results,source:'Crossref metadata',sourceLabel:SOURCE_LABELS.academic,note:'Crossref returns scholarly metadata. HoloGPT should distinguish peer-reviewed articles, proceedings, books and preprints when metadata permits, and should not treat citation count as proof of correctness.'});}catch(e){res.status(502).json({error:'Academic search failed'});}});
  app.get('/api/quantum-internet/archive',async(req,res)=>{try{const url=norm(req.query.url,1000);if(!/^https?:\/\//i.test(url))return res.status(400).json({error:'Valid http(s) URL required'});res.json({url,snapshots:await archiveSnapshots(url)});}catch(e){res.status(502).json({error:'Archive lookup failed'});}});
  app.get('/api/quantum-internet/compare',async(req,res)=>{try{const url=norm(req.query.url,1000);if(!/^https?:\/\//i.test(url))return res.status(400).json({error:'Valid http(s) URL required'});const snapshots=await archiveSnapshots(url);res.json({url,snapshots,mode:'timeline',note:'HoloGPT can compare archived snapshots with a separately fetched current page and must label dates clearly.'});}catch(e){res.status(502).json({error:'Timeline lookup failed'});}});
};
