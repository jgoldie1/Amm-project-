const crypto=require('crypto');
const net=require('node:net');
const http=require('node:http');
const https=require('node:https');
const dns=require('node:dns').promises;

const PROFILE_RULES={
  local_headlines:{maxPages:30,defaultDesk:'local_news',allowedLanes:['local_chicago']},
  national_headlines:{maxPages:30,defaultDesk:'national_news',allowedLanes:['us_national','business_funding','sports_culture']},
  international_headlines:{maxPages:30,defaultDesk:'international_news',allowedLanes:['africa_nigeria','brics_emerging_markets','global_international']},
  entertainment_events:{maxPages:25,defaultDesk:'entertainment',allowedLanes:['creator_economy','sports_culture','local_chicago','global_international']},
  business_funding:{maxPages:25,defaultDesk:'business',allowedLanes:['business_funding','us_national','africa_nigeria','brics_emerging_markets','global_international']},
  creator_culture:{maxPages:25,defaultDesk:'creator_culture',allowedLanes:['creator_economy','local_chicago','global_international']},
  metadata_only:{maxPages:15,defaultDesk:'international_news',allowedLanes:['local_chicago','us_national','africa_nigeria','brics_emerging_markets','global_international','business_funding','creator_economy','sports_culture']}
};

const BLOCKED_HOSTS=new Set(['localhost','localhost.localdomain','metadata.google.internal','169.254.169.254']);
const PRIVATE_V4=[/^127\./,/^10\./,/^192\.168\./,/^169\.254\./,/^172\.(1[6-9]|2\d|3[0-1])\./,/^0\./];

function normalizeHost(host=''){return String(host).trim().toLowerCase().replace(/\.$/,'')}
function isIpv4(host){return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)}
function isBlockedHost(host){
  const h=normalizeHost(host);
  if(!h||BLOCKED_HOSTS.has(h)||h.endsWith('.local')||h.endsWith('.internal'))return true;
  if(h==='::1'||h==='[::1]')return true;
  if(isIpv4(h)&&PRIVATE_V4.some(re=>re.test(h)))return true;
  return false;
}
function mappedIpv4(address=''){
  const value=String(address).toLowerCase().replace(/^\[|\]$/g,'');
  const dotted=value.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if(dotted&&net.isIP(dotted[1])===4)return dotted[1];
  const hex=value.match(/^(?:::ffff:|(?:0{1,4}:){5}ffff:)([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if(!hex)return null;
  const high=parseInt(hex[1],16),low=parseInt(hex[2],16);
  if(!Number.isInteger(high)||!Number.isInteger(low)||high<0||high>0xffff||low<0||low>0xffff)return null;
  return [(high>>8)&255,high&255,(low>>8)&255,low&255].join('.');
}
function isPrivateAddress(address=''){
  let value=String(address).toLowerCase().replace(/^\[|\]$/g,'');
  const mapped=mappedIpv4(value);
  if(mapped)value=mapped;
  const family=net.isIP(value);
  if(family===4){
    if(PRIVATE_V4.some(re=>re.test(value)))return true;
    if(/^100\.(6[4-9]|[78]\d|9\d|1[01]\d|12[0-7])\./.test(value))return true;
    if(/^192\.0\.0\./.test(value)||/^198\.(18|19)\./.test(value))return true;
    const first=Number(value.split('.')[0]);
    return first>=224||first===0;
  }
  if(family===6){
    return value==='::'||value==='::1'||/^f[cd]/.test(value)||/^fe[89ab]/.test(value)||/^ff/.test(value);
  }
  return false;
}
async function defaultResolveHost(host){return dns.lookup(host,{all:true,verbatim:true})}
async function assertPublicResolution(host,resolveHost=defaultResolveHost){
  const answers=await resolveHost(host);
  const rows=Array.isArray(answers)?answers:[answers];
  if(!rows.length)throw new Error('CRAWL_DNS_NO_PUBLIC_ADDRESS');
  if(rows.some(row=>isPrivateAddress(row?.address)))throw new Error('CRAWL_DNS_PRIVATE_ADDRESS_PROHIBITED');
  return rows;
}
async function pinnedRequest(url,resolution,maxBytes=512000){
  const address=String(resolution?.address||'');
  const family=Number(resolution?.family)||net.isIP(address);
  if(!address||!family||isPrivateAddress(address))throw new Error('CRAWL_PINNED_ADDRESS_INVALID');
  const client=url.protocol==='https:'?https:http;
  return await new Promise((resolve,reject)=>{
    let settled=false;
    const finishError=error=>{if(settled)return;settled=true;reject(error)}
    const request=client.request({
      protocol:url.protocol,
      hostname:url.hostname,
      port:url.port||undefined,
      path:url.pathname+url.search,
      method:'GET',
      headers:{
        accept:'text/html,application/xhtml+xml;q=0.9',
        'user-agent':'TRYAMM-Quantum-Crawler/1.0 (+https://tryamm.online)'
      },
      servername:url.protocol==='https:'?url.hostname:undefined,
      lookup:(_hostname,options,callback)=>{
        if(options&&options.all)return callback(null,[{address,family}]);
        return callback(null,address,family);
      },
      timeout:15000
    },response=>{
      const declared=Number(response.headers['content-length']||0);
      if(declared>maxBytes){response.destroy();return finishError(new Error('CRAWL_RESPONSE_TOO_LARGE'))}
      const chunks=[];let total=0;
      response.on('data',chunk=>{
        const buf=Buffer.from(chunk);
        total+=buf.length;
        if(total>maxBytes){request.destroy();response.destroy();return finishError(new Error('CRAWL_RESPONSE_TOO_LARGE'))}
        chunks.push(buf);
      });
      response.on('end',()=>{
        if(settled)return;
        settled=true;
        const body=Buffer.concat(chunks,total).toString('utf8');
        const headers={
          get(name){
            const value=response.headers[String(name||'').toLowerCase()];
            return Array.isArray(value)?value.join(', '):(value===undefined?null:String(value));
          }
        };
        resolve({
          ok:Number(response.statusCode)>=200&&Number(response.statusCode)<300,
          status:Number(response.statusCode)||0,
          headers,
          body:null,
          text:async()=>body
        });
      });
      response.on('error',finishError);
    });
    request.on('timeout',()=>request.destroy(new Error('CRAWL_REQUEST_TIMEOUT')));
    request.on('error',finishError);
    request.end();
  });
}

async function readLimitedText(response,maxBytes=512000){
  const declared=Number(response.headers.get('content-length')||0);
  if(declared>maxBytes)throw new Error('CRAWL_RESPONSE_TOO_LARGE');
  if(!response.body||typeof response.body.getReader!=='function'){
    const fallback=await response.text();
    if(Buffer.byteLength(fallback,'utf8')>maxBytes)throw new Error('CRAWL_RESPONSE_TOO_LARGE');
    return fallback;
  }
  const reader=response.body.getReader();
  const chunks=[];let total=0;
  while(true){
    const {done,value}=await reader.read();
    if(done)break;
    const chunk=Buffer.from(value);
    total+=chunk.length;
    if(total>maxBytes){try{await reader.cancel()}catch{};throw new Error('CRAWL_RESPONSE_TOO_LARGE')}
    chunks.push(chunk);
  }
  return Buffer.concat(chunks,total).toString('utf8');
}
function safeUrl(value){
  let url;try{url=new URL(String(value||''))}catch{throw new Error('CRAWL_URL_INVALID')}
  if(!['http:','https:'].includes(url.protocol))throw new Error('CRAWL_PROTOCOL_NOT_ALLOWED');
  if(url.username||url.password)throw new Error('CRAWL_CREDENTIAL_URL_PROHIBITED');
  if(isBlockedHost(url.hostname))throw new Error('CRAWL_PRIVATE_HOST_PROHIBITED');
  url.hash='';
  return url;
}
function sameApprovedOrigin(source,target){
  if(!source?.baseUrl)throw new Error('CRAWL_SOURCE_BASE_URL_REQUIRED');
  const base=safeUrl(source.baseUrl);
  const effectivePort=url=>String(url.port||((url.protocol==='https:')?'443':'80'));
  return base.protocol===target.protocol
    &&normalizeHost(base.hostname)===normalizeHost(target.hostname)
    &&effectivePort(base)===effectivePort(target);
}
function normalizedAllowedPathname(target){
  const raw=String(target?.pathname||'/');
  if(/%(?:2f|5c|2e)/i.test(raw))throw new Error('CRAWL_ENCODED_PATH_SEPARATOR_PROHIBITED');
  let decoded;
  try{decoded=decodeURIComponent(raw)}catch{throw new Error('CRAWL_PATH_ENCODING_INVALID')}
  if(decoded.includes('\\'))throw new Error('CRAWL_BACKSLASH_PATH_PROHIBITED');
  const segments=[];
  for(const segment of decoded.split('/')){
    if(!segment||segment==='.')continue;
    if(segment==='..'){if(!segments.length)throw new Error('CRAWL_PATH_TRAVERSAL_PROHIBITED');segments.pop();continue}
    segments.push(segment);
  }
  return '/'+segments.join('/');
}
function allowedPath(source,target){
  const paths=source?.scrapePolicy?.allowedPaths||[];
  const pathname=normalizedAllowedPathname(target);
  if(!paths.length)return true;
  return paths.some(rawPrefix=>{
    let prefix=String(rawPrefix||'/').trim()||'/';
    if(!prefix.startsWith('/'))prefix='/'+prefix;
    if(prefix.length>1)prefix=prefix.replace(/\/+$/,'');
    return prefix==='/'||pathname===prefix||pathname.startsWith(prefix+'/');
  });
}
function stripHtml(value=''){
  return String(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
    .replace(/<[^>]+>/g,' ')
    .replace(/&nbsp;/gi,' ')
    .replace(/&amp;/gi,'&')
    .replace(/&quot;/gi,'"')
    .replace(/&#39;/gi,"'")
    .replace(/\s+/g,' ')
    .trim();
}
function capture(html,patterns){
  for(const pattern of patterns){
    const match=html.match(pattern);
    if(match?.[1])return match[1];
  }
  return '';
}
function extractMetadata(html,url){
  const title=stripHtml(capture(html,[
    /<title[^>]*>([\s\S]*?)<\/title>/i,
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:title["'][^>]*>/i
  ])).slice(0,240);
  const description=stripHtml(capture(html,[
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:description["'][^>]*>/i
  ])).slice(0,1200);
  const publishedAt=capture(html,[
    /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']*)["'][^>]*>/i,
    /<meta[^>]+name=["']date["'][^>]+content=["']([^"']*)["'][^>]*>/i
  ])||null;
  const canonicalHref=capture(html,[
    /<link[^>]+rel=["'][^"']*canonical[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*canonical[^"']*["'][^>]*>/i
  ]);
  let canonicalUrl=url.toString();
  if(canonicalHref){try{canonicalUrl=new URL(canonicalHref,url).toString()}catch{}}
  return {title,description,canonicalUrl,publishedAt};
}
function fingerprint(value){return crypto.createHash('sha256').update(String(value||'').toLowerCase()).digest('hex')}

function createQuantumCrawler({fetchImpl=null,resolveHost=defaultResolveHost}={}){
  if(fetchImpl!==null&&typeof fetchImpl!=='function')throw new Error('CRAWLER_FETCH_UNAVAILABLE');
  if(typeof resolveHost!=='function')throw new Error('CRAWLER_DNS_RESOLVER_UNAVAILABLE');

  function plan(source,{urls=[]}={}){
    if(!source?.enabled)throw new Error('APPROVED_SOURCE_REQUIRED');
    if(source.ingestionMode!=='html_scrape')throw new Error('SOURCE_NOT_HTML_CRAWL');
    if(!source.license?.scrapingAllowed)throw new Error('SCRAPING_PERMISSION_REQUIRED');
    if(source.publicSafety)throw new Error('PUBLIC_SAFETY_SCRAPING_PROHIBITED');
    const profile=PROFILE_RULES[source.scraperProfile]||PROFILE_RULES.metadata_only;
    const configuredMax=Math.max(1,Number(source.scrapePolicy?.maxPagesPerRun)||profile.maxPages);
    const limit=Math.min(profile.maxPages,configuredMax,100);
    const targets=[...new Set(urls.map(x=>safeUrl(x).toString()))].slice(0,limit).map(value=>{
      const target=safeUrl(value);
      if(!sameApprovedOrigin(source,target))throw new Error('CRAWL_ORIGIN_NOT_APPROVED');
      if(!allowedPath(source,target))throw new Error('CRAWL_PATH_NOT_APPROVED');
      return target.toString();
    });
    return {
      id:'qc_'+crypto.randomBytes(10).toString('hex'),
      sourceId:source.id,
      sourceName:source.name,
      profile:source.scraperProfile||'metadata_only',
      targetCount:targets.length,
      targets,
      minIntervalSeconds:Math.max(30,Number(source.scrapePolicy?.minIntervalSeconds)||300),
      robotsRequired:source.scrapePolicy?.robotsRequired!==false,
      extraction:'metadata-first',
      fullContentAllowed:Boolean(source.license?.fullContentAllowed),
      generatedAt:new Date().toISOString()
    };
  }

  async function crawlOne(source,value){
    if(!source?.enabled)throw new Error('APPROVED_SOURCE_REQUIRED');
    if(source.ingestionMode!=='html_scrape')throw new Error('SOURCE_NOT_HTML_CRAWL');
    if(!source.license?.scrapingAllowed)throw new Error('SCRAPING_PERMISSION_REQUIRED');
    if(source.publicSafety)throw new Error('PUBLIC_SAFETY_SCRAPING_PROHIBITED');
    if(source.scrapePolicy?.robotsRequired!==false&&!source.scrapePolicy?.robotsApprovedAt)throw new Error('ROBOTS_APPROVAL_REQUIRED');

    const url=safeUrl(value);
    if(!sameApprovedOrigin(source,url))throw new Error('CRAWL_ORIGIN_NOT_APPROVED');
    if(!allowedPath(source,url))throw new Error('CRAWL_PATH_NOT_APPROVED');
    const resolutions=await assertPublicResolution(url.hostname,resolveHost);
    const pinned=resolutions[0];

    const response=fetchImpl
      ? await fetchImpl(url,{method:'GET',redirect:'error',headers:{
          accept:'text/html,application/xhtml+xml;q=0.9',
          'user-agent':'TRYAMM-Quantum-Crawler/1.0 (+https://tryamm.online)'
        }},pinned)
      : await pinnedRequest(url,pinned,512000);
    if(!response.ok)throw new Error('CRAWL_HTTP_'+response.status);
    const contentType=String(response.headers.get('content-type')||'').toLowerCase();
    if(!contentType.includes('text/html')&&!contentType.includes('application/xhtml+xml'))throw new Error('CRAWL_CONTENT_TYPE_NOT_ALLOWED');
    const text=await readLimitedText(response,512000);
    const metadata=extractMetadata(text,url);
    if(!metadata.title)throw new Error('CRAWL_TITLE_REQUIRED');
    return {
      ...metadata,
      sourceUrl:url.toString(),
      fingerprint:fingerprint(metadata.canonicalUrl||url.toString()),
      fetchedAt:new Date().toISOString(),
      fullArticleStored:false,
      rawHtmlStored:false
    };
  }

  return {plan,crawlOne,profiles:PROFILE_RULES};
}

module.exports={createQuantumCrawler,PROFILE_RULES,safeUrl,isBlockedHost,isPrivateAddress,mappedIpv4,assertPublicResolution,pinnedRequest,readLimitedText,extractMetadata,sameApprovedOrigin,normalizedAllowedPathname};
