import {json} from '../_lib/supabase-admin.js';
import {fetchNwsAlerts,fetchNwsForecast,nwsWeatherStatus} from '../_lib/nws-weather.js';
import {nwsAlertsToOracleSignals,nwsForecastToOracleSignals,nwsOracleBridgeStatus} from '../_lib/nws-oracle-bridge.js';

export default async function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET');
    return json(res,405,{error:'method_not_allowed'});
  }
  const action=String(req.query?.action||'status').trim().toLowerCase();
  const format=String(req.query?.format||'data').trim().toLowerCase();
  const status=nwsWeatherStatus();
  if(action==='status')return json(res,200,{ok:true,status,bridge:nwsOracleBridgeStatus()});
  if(!['data','oracle'].includes(format))return json(res,400,{error:'unsupported_format',allowed:['data','oracle']});
  if(!status.adapterReady){
    return json(res,503,{
      ok:false,
      error:'nws_provider_not_enabled',
      status,
      note:'The NWS adapter is installed but remains disabled until provider review, the explicit server-side enable flag, and production verification are all set.'
    });
  }
  try{
    if(action==='forecast'){
      const data=await fetchNwsForecast({lat:req.query?.lat,lon:req.query?.lon});
      if(format==='oracle'){
        const signals=nwsForecastToOracleSignals(data,{region:req.query?.region||'United States'});
        return json(res,200,{ok:true,action,format,source:data.source,signals,control:nwsOracleBridgeStatus()});
      }
      return json(res,200,{ok:true,action,format,data});
    }
    if(action==='alerts'){
      const data=await fetchNwsAlerts({area:req.query?.area});
      if(format==='oracle'){
        const signals=nwsAlertsToOracleSignals(data,{region:req.query?.region});
        return json(res,200,{ok:true,action,format,source:data.source,signals,control:nwsOracleBridgeStatus()});
      }
      return json(res,200,{ok:true,action,format,data});
    }
    return json(res,400,{error:'unsupported_action',allowed:['status','forecast','alerts']});
  }catch(error){
    const code=String(error?.message||'nws_request_failed');
    const statusCode=code.startsWith('NWS_HTTP_')?502:
      code==='NWS_REQUEST_TIMEOUT'?504:
      code==='NWS_COORDINATES_REQUIRED'||code==='NWS_COORDINATES_INVALID'||code==='NWS_AREA_INVALID'?400:500;
    return json(res,statusCode,{ok:false,error:code});
  }
}
