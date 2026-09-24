import crypto from 'node:crypto';

const clampText=(value,max)=>String(value||'').trim().slice(0,max);
const hash=value=>crypto.createHash('sha256').update(String(value||'')).digest('hex').slice(0,20);

function control(){
  return {
    live:false,
    publishAuthority:false,
    missionAuthority:false,
    routingStatus:'candidate_only',
    requiresRoutingReview:true
  };
}

function freshness(value){
  const ts=Date.parse(String(value||''));
  if(!Number.isFinite(ts))return .25;
  const hours=Math.max(0,(Date.now()-ts)/36e5);
  if(hours<=1)return 1;
  if(hours<=6)return .9;
  if(hours<=24)return .75;
  if(hours<=72)return .55;
  return .35;
}

export function globalForecastToOracleSignals(forecast,{region='Global/international'}={}){
  const source=forecast?.source||{};
  const safeRegion=clampText(region,120)||'Global/international';
  const current=forecast?.current||null;
  const signals=[];

  if(current){
    signals.push({
      id:'global_weather_now_'+hash([safeRegion,current.time,current.weatherCode,current.temperature].join('|')),
      lane:'weather_environment',
      desk:'weather',
      purposes:['newsroom','sparrow_map','environment_context'],
      headline:clampText(`Current weather: ${current.temperature??'--'}°`,240),
      summary:clampText(`Current conditions with apparent temperature ${current.apparentTemperature??'--'}°, precipitation ${current.precipitation??0}, wind ${current.windSpeed??'--'}.`,1200),
      region:safeRegion,
      sourceName:'Open-Meteo',
      sourceType:'licensed_api',
      sourceUrl:'https://open-meteo.com/',
      canonicalUrl:'https://open-meteo.com/',
      publishedAt:current.time||null,
      providerTimestamp:current.time||null,
      ingestedAt:source.retrievedAt||new Date().toISOString(),
      verification:'verified',
      confidence:.9,
      freshness:freshness(current.time),
      privacy:'public',
      provider:'open-meteo-global-commercial',
      weather:{
        temperature:current.temperature??null,
        apparentTemperature:current.apparentTemperature??null,
        relativeHumidity:current.relativeHumidity??null,
        precipitation:current.precipitation??null,
        weatherCode:current.weatherCode??null,
        cloudCover:current.cloudCover??null,
        windSpeed:current.windSpeed??null,
        windDirection:current.windDirection??null,
        windGusts:current.windGusts??null
      },
      ...control()
    });
  }

  for(const day of (forecast?.days||[]).slice(0,16)){
    signals.push({
      id:'global_weather_day_'+hash([safeRegion,day?.date,day?.weatherCode,day?.temperatureMax,day?.temperatureMin].join('|')),
      lane:'weather_environment',
      desk:'weather',
      purposes:['newsroom','sparrow_map','environment_context','streetverse_mission'],
      headline:clampText(`${day?.date||'Forecast'}: ${day?.temperatureMin??'--'}° to ${day?.temperatureMax??'--'}°`,240),
      summary:clampText(`Daily forecast. Precipitation chance up to ${day?.precipitationProbabilityMax??'--'}%, precipitation ${day?.precipitationSum??0}, maximum wind ${day?.windSpeedMax??'--'}.`,1200),
      region:safeRegion,
      sourceName:'Open-Meteo',
      sourceType:'licensed_api',
      sourceUrl:'https://open-meteo.com/',
      canonicalUrl:'https://open-meteo.com/',
      publishedAt:day?.date||null,
      providerTimestamp:day?.date||null,
      ingestedAt:source.retrievedAt||new Date().toISOString(),
      verification:'verified',
      confidence:.9,
      freshness:freshness(day?.date),
      privacy:'public',
      provider:'open-meteo-global-commercial',
      weather:{
        weatherCode:day?.weatherCode??null,
        temperatureMax:day?.temperatureMax??null,
        temperatureMin:day?.temperatureMin??null,
        apparentTemperatureMax:day?.apparentTemperatureMax??null,
        apparentTemperatureMin:day?.apparentTemperatureMin??null,
        sunrise:day?.sunrise||null,
        sunset:day?.sunset||null,
        precipitationSum:day?.precipitationSum??null,
        rainSum:day?.rainSum??null,
        snowfallSum:day?.snowfallSum??null,
        precipitationProbabilityMax:day?.precipitationProbabilityMax??null,
        windSpeedMax:day?.windSpeedMax??null,
        windGustsMax:day?.windGustsMax??null
      },
      ...control()
    });
  }
  return signals;
}

export function globalWeatherOracleBridgeStatus(){
  return {
    id:'global-weather-oracle-bridge',
    source:'open-meteo-global-commercial',
    output:'oracle_candidate_signals',
    live:false,
    publishAuthority:false,
    missionAuthority:false,
    supported:['current','daily_forecast'],
    note:'Global weather signals remain candidates until TRYAMM Oracle routing review. Provider verification does not grant direct publication or mission authority.'
  };
}
