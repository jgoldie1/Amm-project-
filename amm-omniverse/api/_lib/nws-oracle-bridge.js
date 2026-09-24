import crypto from 'node:crypto';

const clampText=(value,max)=>String(value||'').trim().slice(0,max);
const hash=value=>crypto.createHash('sha256').update(String(value||'')).digest('hex').slice(0,20);

function freshnessScore(value){
  const ts=Date.parse(String(value||''));
  if(!Number.isFinite(ts))return .25;
  const ageHours=Math.max(0,(Date.now()-ts)/36e5);
  if(ageHours<=1)return 1;
  if(ageHours<=6)return .9;
  if(ageHours<=24)return .75;
  if(ageHours<=72)return .55;
  if(ageHours<=168)return .35;
  return .15;
}

function control(){
  return {
    live:false,
    publishAuthority:false,
    missionAuthority:false,
    routingStatus:'candidate_only',
    requiresRoutingReview:true
  };
}

export function nwsForecastToOracleSignals(forecast,{region='United States'}={}){
  const source=forecast?.source||{};
  const safeRegion=clampText(region,120)||'United States';
  return (forecast?.periods||[]).slice(0,6).map(period=>{
    const providerTimestamp=source.providerUpdatedAt||period?.startTime||null;
    return {
      id:'nws_forecast_'+hash([period?.startTime,period?.name,forecast?.location?.gridId,forecast?.location?.gridX,forecast?.location?.gridY].join('|')),
      lane:'weather_environment',
      desk:'weather',
      purposes:['newsroom','sparrow_map','environment_context'],
      headline:clampText(`${period?.name||'Forecast'}: ${period?.shortForecast||'Weather update'}`,240),
      summary:clampText(period?.detailedForecast||period?.shortForecast||'',1200),
      region:safeRegion,
      sourceName:'National Weather Service',
      sourceType:'official_feed',
      sourceUrl:'https://api.weather.gov',
      canonicalUrl:'https://api.weather.gov',
      publishedAt:providerTimestamp,
      providerTimestamp,
      ingestedAt:source.retrievedAt||new Date().toISOString(),
      verification:'official',
      confidence:1,
      freshness:freshnessScore(providerTimestamp),
      privacy:'public',
      provider:'nws-weather-us',
      weather:{
        startTime:period?.startTime||null,
        endTime:period?.endTime||null,
        temperature:period?.temperature??null,
        temperatureUnit:period?.temperatureUnit||null,
        precipitationProbability:period?.probabilityOfPrecipitation??null,
        windSpeed:period?.windSpeed||null,
        windDirection:period?.windDirection||null
      },
      ...control()
    };
  });
}

export function nwsAlertsToOracleSignals(alertPayload,{region}={}){
  const source=alertPayload?.source||{};
  const safeRegion=clampText(region||alertPayload?.area||'United States',120)||'United States';
  return (alertPayload?.alerts||[]).slice(0,100).map(alert=>{
    const providerTimestamp=alert?.sent||source.providerUpdatedAt||null;
    return {
      id:'nws_alert_'+hash(alert?.id||[alert?.event,alert?.sent,alert?.expires].join('|')),
      lane:'weather_environment',
      desk:'weather',
      purposes:['newsroom','sparrow_map','public_alert','streetverse_mission'],
      headline:clampText(alert?.headline||alert?.event||'National Weather Service alert',240),
      summary:clampText(alert?.description||alert?.instruction||'',1200),
      region:safeRegion,
      sourceName:'National Weather Service',
      sourceType:'official_feed',
      sourceUrl:'https://api.weather.gov',
      canonicalUrl:clampText(alert?.web,500)||'https://api.weather.gov',
      publishedAt:alert?.sent||null,
      providerTimestamp,
      ingestedAt:source.retrievedAt||new Date().toISOString(),
      verification:'official',
      confidence:1,
      freshness:freshnessScore(providerTimestamp),
      privacy:'public',
      provider:'nws-weather-us',
      alert:{
        event:alert?.event||null,
        severity:alert?.severity||null,
        urgency:alert?.urgency||null,
        certainty:alert?.certainty||null,
        effective:alert?.effective||null,
        onset:alert?.onset||null,
        expires:alert?.expires||null,
        areaDesc:alert?.areaDesc||null,
        instruction:alert?.instruction||null
      },
      ...control()
    };
  });
}

export function nwsOracleBridgeStatus(){
  return {
    id:'nws-oracle-bridge',
    source:'nws-weather-us',
    output:'oracle_candidate_signals',
    live:false,
    publishAuthority:false,
    missionAuthority:false,
    supported:['forecast','alerts'],
    note:'Official NWS verification does not grant TRYAMM publication or StreetVerse mission authority. Signals remain candidates until Oracle routing review.'
  };
}
