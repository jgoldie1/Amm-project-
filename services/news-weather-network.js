const crypto=require('crypto');

const SECTIONS=['local','state','national','international','business','technology','creator','music','entertainment','gaming','sports','faith','education','weather','emergency'];
const SOURCE_TYPES=['licensed-api','rss','public-agency','partner-feed','creator-submission','oracle-record'];

function article(input={}){
  if(!input.title||!input.sourceName||!input.sourceUrl)throw new Error('Title, source name and source URL are required.');
  const section=SECTIONS.includes(input.section)?input.section:'local';
  return {
    id:input.id||crypto.randomUUID(),title:String(input.title).slice(0,240),summary:String(input.summary||'').slice(0,2000),section,
    sourceName:String(input.sourceName).slice(0,160),sourceUrl:String(input.sourceUrl),sourceType:SOURCE_TYPES.includes(input.sourceType)?input.sourceType:'partner-feed',
    author:String(input.author||'').slice(0,160),publishedAt:input.publishedAt||new Date().toISOString(),observedAt:new Date().toISOString(),
    country:String(input.country||'US').toUpperCase(),region:String(input.region||''),city:String(input.city||''),language:String(input.language||'en'),
    imageUrl:input.imageUrl?String(input.imageUrl):null,license:String(input.license||'link-and-summary-only'),attributionRequired:input.attributionRequired!==false,
    confidence:Math.max(0,Math.min(1,Number(input.confidence??0.75))),reviewStatus:['pending','approved','rejected','expired'].includes(input.reviewStatus)?input.reviewStatus:'pending',
    breaking:Boolean(input.breaking),emergency:Boolean(input.emergency),sponsored:Boolean(input.sponsored),topics:Array.isArray(input.topics)?input.topics.slice(0,20):[],
    contentHash:crypto.createHash('sha256').update(`${input.title}|${input.sourceUrl}|${input.publishedAt||''}`).digest('hex'),metadata:input.metadata||{}
  };
}
function weatherCard(input={}){
  if(!input.location)throw new Error('Weather location is required.');
  return {id:input.id||crypto.randomUUID(),location:String(input.location),latitude:Number(input.latitude)||null,longitude:Number(input.longitude)||null,
    provider:String(input.provider||'unconfigured'),observedAt:input.observedAt||new Date().toISOString(),timezone:String(input.timezone||'UTC'),
    current:input.current||{},hourly:Array.isArray(input.hourly)?input.hourly.slice(0,48):[],daily:Array.isArray(input.daily)?input.daily.slice(0,10):[],
    alerts:Array.isArray(input.alerts)?input.alerts.slice(0,20):[],attribution:String(input.attribution||''),providerUrl:input.providerUrl||null,staleAfterMinutes:Number(input.staleAfterMinutes)||30};
}
function rank(items=[],preferences={}){
  const now=Date.now();const wanted=new Set(preferences.sections||[]);const city=String(preferences.city||'').toLowerCase();const country=String(preferences.country||'').toUpperCase();
  return [...items].map(item=>{const age=Math.max(0,(now-new Date(item.publishedAt).getTime())/3600000);let score=Math.max(0,50-age);if(item.breaking)score+=25;if(item.emergency)score+=40;if(wanted.has(item.section))score+=15;if(country&&item.country===country)score+=10;if(city&&String(item.city).toLowerCase()===city)score+=20;score+=Number(item.confidence||0)*10;return {...item,rankScore:score};}).sort((a,b)=>b.rankScore-a.rankScore);
}
function edition({city,region,country='US',language='en'}={}){return {city:city||null,region:region||null,country:String(country).toUpperCase(),language,sections:SECTIONS,personalization:{locationOptIn:false,topicsOptIn:false},safety:{labelSponsored:true,labelOpinion:true,sourceLinks:true,noFabricatedHeadlines:true,noAutomaticEmergencyClaims:true}};}
function providerStatus(env=process.env){return {news:Boolean(env.NEWS_API_URL&&env.NEWS_API_KEY),weather:Boolean(env.WEATHER_API_URL&&env.WEATHER_API_KEY),translation:Boolean(env.TRANSLATION_API_URL&&env.TRANSLATION_API_KEY),alerts:Boolean(env.EMERGENCY_ALERT_API_URL&&env.EMERGENCY_ALERT_API_KEY)};}
module.exports={SECTIONS,SOURCE_TYPES,article,weatherCard,rank,edition,providerStatus};