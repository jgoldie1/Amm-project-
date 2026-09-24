import {json} from '../_lib/supabase-admin.js';
import {fetchGlobalForecast,globalWeatherStatus} from '../_lib/global-weather.js';
import {globalForecastToOracleSignals,globalWeatherOracleBridgeStatus} from '../_lib/global-weather-oracle-bridge.js';

export default async function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET');
    return json(res,405,{error:'method_not_allowed'});
  }
  const action=String(req.query?.action||'status').trim().toLowerCase();
  const format=String(req.query?.format||'data').trim().toLowerCase();
  const status=globalWeatherStatus();
  if(action==='status')return json(res,200,{ok:true,status,bridge:globalWeatherOracleBridgeStatus()});
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
    const data=await fetchGlobalForecast({lat:req.query?.lat,lon:req.query?.lon,days:req.query?.days});
    if(format==='oracle'){
      const signals=globalForecastToOracleSignals(data,{region:req.query?.region||'Global/international'});
      return json(res,200,{ok:true,action,format,source:data.source,signals,control:globalWeatherOracleBridgeStatus()});
    }
    return json(res,200,{ok:true,action,format,data});
  }catch(error){
    const code=String(error?.message||'global_weather_request_failed');
    const statusCode=code.startsWith('GLOBAL_WEATHER_HTTP_')?502:
      code==='GLOBAL_WEATHER_REQUEST_TIMEOUT'?504:
      code==='GLOBAL_WEATHER_COORDINATES_REQUIRED'||code==='GLOBAL_WEATHER_COORDINATES_INVALID'?400:500;
    return json(res,statusCode,{ok:false,error:code});
  }
}
