import {json} from '../_lib/supabase-admin.js';
import {fetchGlobalForecast,globalWeatherStatus} from '../_lib/global-weather.js';
import {globalForecastToOracleSignals,globalWeatherOracleBridgeStatus} from '../_lib/global-weather-oracle-bridge.js';
import {getStreetVerseWeatherLocation,publicStreetVerseWeatherLocations} from '../_lib/streetverse-weather-locations.js';

const CACHE_TTL_MS=10*60*1000;
const forecastCache=new Map();
const inflight=new Map();

async function cachedForecast(location){
  const key=location.id;
  const now=Date.now();
  const cached=forecastCache.get(key);
  if(cached&&now-cached.at<CACHE_TTL_MS)return cached.data;
  if(inflight.has(key))return await inflight.get(key);
  const pending=fetchGlobalForecast({lat:location.lat,lon:location.lon,days:2})
    .then(data=>{forecastCache.set(key,{at:Date.now(),data});return data})
    .finally(()=>inflight.delete(key));
  inflight.set(key,pending);
  return await pending;
}

export default async function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET');
    return json(res,405,{error:'method_not_allowed'});
  }
  const action=String(req.query?.action||'status').trim().toLowerCase();
  const format=String(req.query?.format||'data').trim().toLowerCase();
  const status=globalWeatherStatus();
  if(action==='status')return json(res,200,{ok:true,status,bridge:globalWeatherOracleBridgeStatus(),locations:publicStreetVerseWeatherLocations()});
  if(!['data','oracle'].includes(format))return json(res,400,{error:'unsupported_format',allowed:['data','oracle']});
  if(action!=='forecast')return json(res,400,{error:'unsupported_action',allowed:['status','forecast']});
  if(!status.adapterReady){
    return json(res,503,{
      ok:false,
      error:'global_weather_provider_not_enabled',
      status,
      note:'The global weather adapter is installed but remains disabled until commercial licensing, server configuration, explicit enablement, and production verification are complete.'
    });
  }
  try{
    if(req.query?.lat!==undefined||req.query?.lon!==undefined)return json(res,400,{ok:false,error:'global_weather_direct_coordinates_prohibited'});
    const location=getStreetVerseWeatherLocation(req.query?.location);
    res.setHeader('Cache-Control','public, s-maxage=600, stale-while-revalidate=300');
    const data=await cachedForecast(location);
    if(format==='oracle'){
      const signals=globalForecastToOracleSignals(data,{region:req.query?.region||location.label});
      return json(res,200,{ok:true,action,format,source:data.source,signals,control:globalWeatherOracleBridgeStatus()});
    }
    return json(res,200,{ok:true,action,format,location:{id:location.id,label:location.label,scope:location.scope},data});
  }catch(error){
    const code=String(error?.message||'global_weather_request_failed');
    const statusCode=code.startsWith('GLOBAL_WEATHER_HTTP_')?502:
      code==='GLOBAL_WEATHER_REQUEST_TIMEOUT'?504:
      code==='GLOBAL_WEATHER_LOCATION_NOT_APPROVED'||code==='GLOBAL_WEATHER_COORDINATES_REQUIRED'||code==='GLOBAL_WEATHER_COORDINATES_INVALID'?400:500;
    return json(res,statusCode,{ok:false,error:code});
  }
}
