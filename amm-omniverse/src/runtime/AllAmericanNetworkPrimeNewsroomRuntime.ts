export type PrimeNewsItem={id:string;headline:string;summary?:string;region?:string;sourceName?:string;sourceUrl?:string|null;publishedAt?:string|null;verification?:string;live?:boolean;score?:number}
export type PrimeNewsSection={id:string;label:string;query:string;items:PrimeNewsItem[];configured:boolean;degraded?:boolean;error?:string}
export type PrimeWeatherState={configured:boolean;ready:boolean;location:string;summary:string;source?:string;raw?:unknown}
export type PrimeNewsroomState={sections:PrimeNewsSection[];weather:PrimeWeatherState;updatedAt:string}

const QUERIES=[
 {id:'local',label:'Chicago & Local',query:'Chicago local community business schools public safety culture'},
 {id:'national',label:'National',query:'United States national news business culture science'},
 {id:'international',label:'International',query:'international world news global affairs business culture'},
 {id:'crypto',label:'Digital Assets',query:'cryptocurrency blockchain digital assets stablecoins regulation security'},
] as const

const cleanItems=(data:any):PrimeNewsItem[]=>Array.isArray(data?.results)?data.results.slice(0,8).map((x:any)=>({
 id:String(x.id||x.sourceUrl||x.headline||Math.random()),headline:String(x.headline||'Untitled'),summary:String(x.summary||''),region:String(x.region||''),sourceName:String(x.sourceName||'Source'),sourceUrl:x.sourceUrl||null,publishedAt:x.publishedAt||null,verification:String(x.verification||'unverified'),live:Boolean(x.live),score:Number(x.score||0)
})):[]

async function getJson(url:string){const r=await fetch(url,{headers:{accept:'application/json'},cache:'no-store'});const text=await r.text();let data:any={};try{data=text?JSON.parse(text):{}}catch{};return {ok:r.ok,status:r.status,data}}

async function loadWeather():Promise<PrimeWeatherState>{
 try{
  const status=await getJson('/api/intelligence/global-weather?action=status')
  const ready=Boolean(status.data?.status?.adapterReady)
  if(!ready)return{configured:Boolean(status.data?.status),ready:false,location:'Chicago',summary:'Weather adapter installed; live forecast is not verified/enabled yet.'}
  const forecast=await getJson('/api/intelligence/global-weather?action=forecast&format=data&location=chicago')
  if(!forecast.ok)return{configured:true,ready:false,location:'Chicago',summary:'Weather source temporarily unavailable.'}
  const periods=forecast.data?.data?.periods||forecast.data?.data?.forecast?.periods||[]
  const first=Array.isArray(periods)?periods[0]:null
  const summary=first?String(first.name||'Chicago')+' • '+String(first.temperature??'')+(first.temperatureUnit?('°'+first.temperatureUnit):'')+' • '+String(first.shortForecast||first.summary||''):'Chicago forecast source connected.'
  return{configured:true,ready:true,location:'Chicago',summary,source:String(forecast.data?.source||'approved weather provider'),raw:forecast.data}
 }catch(error){return{configured:false,ready:false,location:'Chicago',summary:'Weather desk is waiting for a verified provider.',raw:String(error)}}
}

export async function loadAllAmericanPrimeNewsroom():Promise<PrimeNewsroomState>{
 const sections:PrimeNewsSection[]=[]
 for(const q of QUERIES){
  try{const res=await getJson('/api/oracle/search?q='+encodeURIComponent(q.query));sections.push({id:q.id,label:q.label,query:q.query,items:cleanItems(res.data),configured:Boolean(res.data?.configured),degraded:Boolean(res.data?.degraded),error:res.ok?undefined:String(res.data?.error||'oracle unavailable')})}
  catch(error){sections.push({id:q.id,label:q.label,query:q.query,items:[],configured:false,degraded:true,error:String(error)})}
 }
 const weather=await loadWeather()
 return{sections,weather,updatedAt:new Date().toISOString()}
}

export function installAllAmericanPrimeNewsroomRuntime(){
 if(typeof window==='undefined')return()=>{}
 let disposed=false;let timer=0
 const publish=async(reason:string)=>{const state=await loadAllAmericanPrimeNewsroom();if(disposed)return;window.dispatchEvent(new CustomEvent('tryamm:all-american-prime-newsroom-state',{detail:{...state,reason}}))}
 const onRequest=()=>void publish('request')
 addEventListener('tryamm:all-american-prime-newsroom-request',onRequest)
 void publish('startup')
 timer=window.setInterval(()=>void publish('refresh'),5*60*1000)
 return()=>{disposed=true;window.clearInterval(timer);removeEventListener('tryamm:all-american-prime-newsroom-request',onRequest)}
}