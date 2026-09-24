import assert from 'node:assert/strict'
import path from 'node:path'
import { createRequire } from 'node:module'
import fs from 'node:fs'

const require=createRequire(import.meta.url)
const crawlerModule=require(path.resolve('../lib/quantum-crawler.js'))
const {createQuantumCrawler,safeUrl,isBlockedHost,isPrivateAddress,extractMetadata}=crawlerModule

assert.equal(isBlockedHost('localhost'),true)
assert.equal(isBlockedHost('127.0.0.1'),true)
assert.equal(isBlockedHost('10.1.2.3'),true)
assert.equal(isBlockedHost('192.168.1.9'),true)
assert.equal(isPrivateAddress('100.64.1.1'),true)
assert.equal(isPrivateAddress('fd00::1'),true)
assert.equal(isPrivateAddress('93.184.216.34'),false)
assert.throws(()=>safeUrl('file:///etc/passwd'),/CRAWL_PROTOCOL_NOT_ALLOWED/)
assert.throws(()=>safeUrl('http://169.254.169.254/latest/meta-data'),/CRAWL_PRIVATE_HOST_PROHIBITED/)
assert.throws(()=>safeUrl('https://user:pass@example.com/news'),/CRAWL_CREDENTIAL_URL_PROHIBITED/)

const html='<html><head><title>Chicago Story</title><meta name="description" content="A local public-interest update"><meta property="article:published_time" content="2026-09-24T15:00:00Z"><link rel="canonical" href="/news/story"></head><body><p>Article body is intentionally not retained.</p></body></html>'
const meta=extractMetadata(html,new URL('https://news.example.com/news/story?ref=home'))
assert.equal(meta.title,'Chicago Story')
assert.equal(meta.description,'A local public-interest update')
assert.equal(meta.canonicalUrl,'https://news.example.com/news/story')
assert.equal(meta.publishedAt,'2026-09-24T15:00:00Z')

const source={
  id:'src_local',
  name:'Approved Local News',
  enabled:true,
  ingestionMode:'html_scrape',
  scraperProfile:'local_headlines',
  baseUrl:'https://news.example.com',
  publicSafety:false,
  lanes:['local_chicago'],
  desks:['local_news'],
  purposes:['newsroom','sparrow_map'],
  license:{scrapingAllowed:true,fullContentAllowed:false},
  scrapePolicy:{robotsRequired:true,robotsApprovedAt:'2026-09-24T00:00:00Z',allowedPaths:['/news'],maxPagesPerRun:10,minIntervalSeconds:300}
}

let fetchCount=0
const publicResolver=async()=>[{address:'93.184.216.34',family:4}]
const crawler=createQuantumCrawler({resolveHost:publicResolver,fetchImpl:async url=>{
  fetchCount+=1
  assert.equal(String(url),'https://news.example.com/news/story')
  return new Response(html,{status:200,headers:{'content-type':'text/html; charset=utf-8'}})
}})

const plan=crawler.plan(source,{urls:['https://news.example.com/news/story','https://news.example.com/news/story']})
assert.equal(plan.targetCount,1)
assert.equal(plan.profile,'local_headlines')
assert.equal(plan.extraction,'metadata-first')
assert.equal(plan.robotsRequired,true)
assert.throws(()=>crawler.plan(source,{urls:['https://evil.example.net/news/story']}),/CRAWL_HOST_NOT_APPROVED/)
assert.throws(()=>crawler.plan(source,{urls:['https://news.example.com/private/story']}),/CRAWL_PATH_NOT_APPROVED/)
assert.throws(()=>crawler.plan(source,{urls:['https://news.example.com/newsletter/story']}),/CRAWL_PATH_NOT_APPROVED/)
assert.throws(()=>crawler.plan(source,{urls:['https://news.example.com/news-private/story']}),/CRAWL_PATH_NOT_APPROVED/)

const crawled=await crawler.crawlOne(source,'https://news.example.com/news/story')
assert.equal(fetchCount,1)
assert.equal(crawled.title,'Chicago Story')
assert.equal(crawled.rawHtmlStored,false)
assert.equal(crawled.fullArticleStored,false)
assert.ok(crawled.fingerprint)

await assert.rejects(
  ()=>crawler.crawlOne({...source,scrapePolicy:{...source.scrapePolicy,robotsApprovedAt:null}},'https://news.example.com/news/story'),
  /ROBOTS_APPROVAL_REQUIRED/
)
await assert.rejects(
  ()=>crawler.crawlOne({...source,publicSafety:true},'https://news.example.com/news/story'),
  /PUBLIC_SAFETY_SCRAPING_PROHIBITED/
)

const dnsBlocked=createQuantumCrawler({
  resolveHost:async()=>[{address:'10.0.0.5',family:4}],
  fetchImpl:async()=>{throw new Error('fetch_must_not_run_for_private_dns')}
})
await assert.rejects(
  ()=>dnsBlocked.crawlOne(source,'https://news.example.com/news/story'),
  /CRAWL_DNS_PRIVATE_ADDRESS_PROHIBITED/
)

const routeSource=fs.readFileSync(path.resolve('../lib/quantum-crawler-routes.js'),'utf8')
assert.match(routeSource,/QUANTUM_CRAWLER_ENABLED/)
assert.match(routeSource,/crawler -> Oracle ingest -> verification\/editorial queue -> approved product routing/)
assert.match(routeSource,/registerQuantumCrawlerRoutes\(\{ app, manager, auth, admin \}\)/)
assert.match(routeSource,/const adminOnly = \[auth, admin\]\.filter\(Boolean\)/)
assert.match(routeSource,/verificationStatus: 'ingested'/)
assert.match(routeSource,/rawHtmlStored: false/)
assert.match(routeSource,/fullArticleStored: false/)

const managerSource=fs.readFileSync(path.resolve('../lib/omni-news-oracle-manager.js'),'utf8')
assert.match(managerSource,/HTML_SCRAPING_GLOBALLY_DISABLED/)
assert.match(managerSource,/SCRAPING_PERMISSION_REQUIRED/)
assert.match(managerSource,/ROBOTS_REVIEW_REQUIRED/)
assert.match(managerSource,/PUBLIC_SAFETY_PURPOSE_LIMIT_REQUIRED/)
assert.match(managerSource,/SOURCE_DESK_NOT_APPROVED/)
assert.match(managerSource,/SOURCE_GEOGRAPHY_NOT_APPROVED/)
assert.match(managerSource,/geographyApproved\(source,region\)/)

console.log('Quantum Crawler approved-source, SSRF guard, robots review, metadata-only retention, Oracle handoff and admin-gated control-plane contract passed')
