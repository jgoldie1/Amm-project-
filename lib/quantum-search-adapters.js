'use strict';

function norm(v,max=2000){return String(v??'').replace(/\s+/g,' ').trim().slice(0,max);}
function hostOf(url){try{return new URL(url).host}catch{return''}}

async function braveSearch(query,count=12){
 const key=process.env.BRAVE_SEARCH_API_KEY;if(!key)return[];
 const params=new URLSearchParams({q:query,count:String(Math.min(Math.max(count,1),20)),country:process.env.HOLO_SEARCH_COUNTRY||'US',search_lang:process.env.HOLO_SEARCH_LANG||'en'});
 const r=await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`,{headers:{Accept:'application/json','X-Subscription-Token':key}});if(!r.ok)throw new Error(`brave_search_${r.status}`);
 const body=await r.json();return(body.web?.results||[]).map((x,i)=>({title:norm(x.title,300)||'Web result',summary:norm(x.description,1200),url:x.url,host:hostOf(x.url),sourceType:'external',sourceLabel:'LIVE WEB',score:55-i,provider:'brave'}));
}

async function kagiSearch(query,count=12){
 const key=process.env.KAGI_SEARCH_API_KEY;if(!key)return[];
 const params=new URLSearchParams({q:query,limit:String(Math.min(Math.max(count,1),20))});
 const r=await fetch(`https://kagi.com/api/v1/search?${params}`,{headers:{Authorization:`Bot ${key}`,Accept:'application/json'}});if(!r.ok)throw new Error(`kagi_search_${r.status}`);
 const body=await r.json();const data=Array.isArray(body.data)?body.data:[];return data.filter(x=>x.t===0||x.url).map((x,i)=>({title:norm(x.title,300)||'Web result',summary:norm(x.snippet,1200),url:x.url,host:hostOf(x.url),sourceType:'external',sourceLabel:'LIVE WEB',score:53-i,provider:'kagi'}));
}

async function liveWebSearch(query,count=12){
 const providers=[];if(process.env.BRAVE_SEARCH_API_KEY)providers.push(['brave',braveSearch]);if(process.env.KAGI_SEARCH_API_KEY)providers.push(['kagi',kagiSearch]);
 const results=[],errors=[];for(const[name,fn]of providers){try{results.push(...await fn(query,count));}catch(e){errors.push({provider:name,error:e.message});}}
 return{results,providers:providers.map(x=>x[0]),errors,configured:providers.length>0};
}

module.exports={braveSearch,kagiSearch,liveWebSearch};
