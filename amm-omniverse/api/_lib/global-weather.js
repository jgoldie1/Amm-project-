const GLOBAL_WEATHER_BASE='https://customer-api.open-meteo.com';
const truthy=value=>String(value||'').toLowerCase()==='true';
const clampText=(value,max)=>String(value||'').trim().slice(0,max);
const nullableNumber=value=>value===null||value===undefined||value===''?null:(Number.isFinite(Number(value))?Number(value):null);

export function globalWeatherStatus(){
  const enabled=truthy(process.env.GLOBAL_WEATHER_ENABLED);
  const licenseVerified=truthy(process.env.OPEN_METEO_COMMERCIAL_LICENSE_VERIFIED);
  const productionVerified=truthy(process.env.OPEN_METEO_PRODUCTION_VERIFIED);
  const configured=String(process.env.OPEN_METEO_API_KEY||'').trim().length>0;
  const configurationReady=enabled&&licenseVerified&&configured;
  const certificationReady=configurationReady;
  const adapterReady=configurationReady&&productionVerified;
  return {
    id:'open-meteo-global-commercial',
    provider:'Open-Meteo commercial weather API',
    baseUrl:GLOBAL_WEATHER_BASE,
    enabled,
    licenseVerified,
    productionVerified,
    configured,
    configurationReady,
    certificationReady,
    adapterReady,
    liveDataAllowed:adapterReady,
    mode:adapterReady?'enabled_gated':'disabled_gated',
    geographies:['global'],
    lanes:['weather_environment','global_international'],
    desks:['weather','international_news'],
    purposes:['newsroom','sparrow_map','environment_context','streetverse_mission'],
    releaseGates:[
      'OPEN_METEO_COMMERCIAL_LICENSE_VERIFIED=true',
      'GLOBAL_WEATHER_ENABLED=true',
      'OPEN_METEO_PRODUCTION_VERIFIED=true',
      'OPEN_METEO_API_KEY configured server-side',
      'attribution displayed where required',
      'rate-limit/backoff behavior verified',
      'production health verification'
    ],
    note:'The free Open-Meteo endpoint is intentionally not used by TRYAMM production.'
  };
}

export function normalizeGlobalCoordinates(latValue,lonValue){
  const lat=Number(latValue),lon=Number(lonValue);
  if(!Number.isFinite(lat)||!Number.isFinite(lon))throw new Error('GLOBAL_WEATHER_COORDINATES_REQUIRED');
  if(lat<-90||lat>90||lon<-180||lon>180)throw new Error('GLOBAL_WEATHER_COORDINATES_INVALID');
  return {lat:Number(lat.toFixed(4)),lon:Number(lon.toFixed(4))};
}

function buildForecastUrl({lat,lon,days=7}){
  const coords=normalizeGlobalCoordinates(lat,lon);
  const forecastDays=Math.max(1,Math.min(16,Number(days)||7));
  const key=String(process.env.OPEN_METEO_API_KEY||'').trim();
  if(!key)throw new Error('GLOBAL_WEATHER_API_KEY_REQUIRED');
  const url=new URL('/v1/forecast',GLOBAL_WEATHER_BASE);
  url.searchParams.set('latitude',String(coords.lat));
  url.searchParams.set('longitude',String(coords.lon));
  url.searchParams.set('timezone','auto');
  url.searchParams.set('forecast_days',String(forecastDays));
  url.searchParams.set('current',[
    'temperature_2m','apparent_temperature','relative_humidity_2m',
    'precipitation','rain','snowfall','weather_code','cloud_cover',
    'wind_speed_10m','wind_direction_10m','wind_gusts_10m'
  ].join(','));
  url.searchParams.set('daily',[
    'weather_code','temperature_2m_max','temperature_2m_min',
    'apparent_temperature_max','apparent_temperature_min',
    'sunrise','sunset','precipitation_sum','rain_sum','snowfall_sum',
    'precipitation_probability_max','wind_speed_10m_max','wind_gusts_10m_max'
  ].join(','));
  url.searchParams.set('apikey',key);
  return {url,coords,forecastDays};
}

async function fetchJson(url,{timeoutMs=10000}={}){
  if(url.origin!==GLOBAL_WEATHER_BASE)throw new Error('GLOBAL_WEATHER_ORIGIN_NOT_ALLOWED');
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),Math.max(1000,Math.min(20000,Number(timeoutMs)||10000)));
  try{
    const response=await fetch(url,{
      method:'GET',
      redirect:'error',
      signal:controller.signal,
      headers:{accept:'application/json'}
    });
    if(!response.ok){
      const error=new Error('GLOBAL_WEATHER_HTTP_'+response.status);
      error.status=response.status;
      throw error;
    }
    return await response.json();
  }catch(error){
    if(error?.name==='AbortError')throw new Error('GLOBAL_WEATHER_REQUEST_TIMEOUT');
    throw error;
  }finally{
    clearTimeout(timer);
  }
}

const indexed=(obj,key,index)=>Array.isArray(obj?.[key])?obj[key][index]:null;

async function fetchGlobalForecastCore({lat,lon,days=7}){
  const {url,coords,forecastDays}=buildForecastUrl({lat,lon,days});
  const payload=await fetchJson(url);
  const daily=payload?.daily||{};
  const dates=Array.isArray(daily.time)?daily.time.slice(0,forecastDays):[];
  return {
    source:{
      id:'open-meteo-global-commercial',
      name:'Open-Meteo',
      url:'https://open-meteo.com/',
      customerEndpoint:GLOBAL_WEATHER_BASE,
      attribution:'Weather data via Open-Meteo; underlying datasets require attribution under applicable licences.',
      retrievedAt:new Date().toISOString()
    },
    location:{
      latitude:nullableNumber(payload?.latitude),
      longitude:nullableNumber(payload?.longitude),
      elevation:nullableNumber(payload?.elevation),
      timezone:clampText(payload?.timezone,80),
      timezoneAbbreviation:clampText(payload?.timezone_abbreviation,20),
      utcOffsetSeconds:nullableNumber(payload?.utc_offset_seconds)
    },
    current:payload?.current?{
      time:payload.current.time||null,
      temperature:nullableNumber(payload.current.temperature_2m),
      apparentTemperature:nullableNumber(payload.current.apparent_temperature),
      relativeHumidity:nullableNumber(payload.current.relative_humidity_2m),
      precipitation:nullableNumber(payload.current.precipitation),
      rain:nullableNumber(payload.current.rain),
      snowfall:nullableNumber(payload.current.snowfall),
      weatherCode:nullableNumber(payload.current.weather_code),
      cloudCover:nullableNumber(payload.current.cloud_cover),
      windSpeed:nullableNumber(payload.current.wind_speed_10m),
      windDirection:nullableNumber(payload.current.wind_direction_10m),
      windGusts:nullableNumber(payload.current.wind_gusts_10m)
    }:null,
    days:dates.map((date,index)=>({
      date,
      weatherCode:indexed(daily,'weather_code',index),
      temperatureMax:indexed(daily,'temperature_2m_max',index),
      temperatureMin:indexed(daily,'temperature_2m_min',index),
      apparentTemperatureMax:indexed(daily,'apparent_temperature_max',index),
      apparentTemperatureMin:indexed(daily,'apparent_temperature_min',index),
      sunrise:indexed(daily,'sunrise',index),
      sunset:indexed(daily,'sunset',index),
      precipitationSum:indexed(daily,'precipitation_sum',index),
      rainSum:indexed(daily,'rain_sum',index),
      snowfallSum:indexed(daily,'snowfall_sum',index),
      precipitationProbabilityMax:indexed(daily,'precipitation_probability_max',index),
      windSpeedMax:indexed(daily,'wind_speed_10m_max',index),
      windGustsMax:indexed(daily,'wind_gusts_10m_max',index)
    })),
    request:{
      latitude:coords.lat,
      longitude:coords.lon,
      forecastDays
    }
  };
}

export async function fetchGlobalForecast({lat,lon,days=7}){
  const status=globalWeatherStatus();
  if(!status.adapterReady)throw new Error('GLOBAL_WEATHER_PROVIDER_NOT_ENABLED');
  return await fetchGlobalForecastCore({lat,lon,days});
}

export async function fetchGlobalForecastForCertification({lat,lon,days=2}){
  const status=globalWeatherStatus();
  if(!status.certificationReady)throw new Error('GLOBAL_WEATHER_CERTIFICATION_NOT_READY');
  return await fetchGlobalForecastCore({lat,lon,days});
}

export {GLOBAL_WEATHER_BASE,buildForecastUrl,nullableNumber};
