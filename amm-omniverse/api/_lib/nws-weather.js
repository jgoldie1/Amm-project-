const NWS_BASE='https://api.weather.gov';
const truthy=value=>String(value||'').toLowerCase()==='true';
const clampText=(value,max)=>String(value||'').trim().slice(0,max);

export function nwsWeatherStatus(){
  const enabled=truthy(process.env.NWS_WEATHER_ENABLED);
  const providerReviewed=truthy(process.env.NWS_PROVIDER_REVIEWED);
  const userAgent=String(process.env.NWS_USER_AGENT||'TRYAMM/1.0 (https://tryamm.online)').trim();
  const adapterReady=enabled&&providerReviewed&&Boolean(userAgent);
  return {
    id:'nws-weather-us',
    provider:'National Weather Service',
    baseUrl:NWS_BASE,
    enabled,
    providerReviewed,
    userAgentConfigured:Boolean(userAgent),
    adapterReady,
    liveDataAllowed:adapterReady,
    mode:adapterReady?'enabled_gated':'disabled_gated',
    lanes:['weather_environment','us_national','local_chicago'],
    desks:['weather','local_news','national_news'],
    purposes:['newsroom','sparrow_map','environment_context','public_alert'],
    releaseGates:[
      'NWS_PROVIDER_REVIEWED=true',
      'NWS_WEATHER_ENABLED=true',
      'server-side user agent/contact policy',
      'rate-limit/backoff handling',
      'provider timestamps retained',
      'production health verification'
    ]
  };
}

export function normalizeCoordinates(latValue,lonValue){
  const lat=Number(latValue),lon=Number(lonValue);
  if(!Number.isFinite(lat)||!Number.isFinite(lon))throw new Error('NWS_COORDINATES_REQUIRED');
  if(lat<-90||lat>90||lon<-180||lon>180)throw new Error('NWS_COORDINATES_INVALID');
  return {
    lat:Number(lat.toFixed(4)),
    lon:Number(lon.toFixed(4))
  };
}

export function normalizeArea(areaValue){
  const area=String(areaValue||'').trim().toUpperCase();
  if(!/^[A-Z]{2}$/.test(area))throw new Error('NWS_AREA_INVALID');
  return area;
}

function assertNwsUrl(value){
  let url;
  try{url=new URL(String(value||''),NWS_BASE)}catch{throw new Error('NWS_URL_INVALID')}
  if(url.origin!==NWS_BASE)throw new Error('NWS_ORIGIN_NOT_ALLOWED');
  return url;
}

async function nwsFetchJson(value,{timeoutMs=10000}={}){
  const status=nwsWeatherStatus();
  if(!status.adapterReady)throw new Error('NWS_PROVIDER_NOT_ENABLED');
  const url=assertNwsUrl(value);
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),Math.max(1000,Math.min(20000,Number(timeoutMs)||10000)));
  try{
    const response=await fetch(url,{
      method:'GET',
      redirect:'error',
      signal:controller.signal,
      headers:{
        accept:'application/geo+json, application/ld+json;q=0.9, application/json;q=0.8',
        'user-agent':String(process.env.NWS_USER_AGENT||'TRYAMM/1.0 (https://tryamm.online)').trim()
      }
    });
    if(!response.ok){
      const error=new Error('NWS_HTTP_'+response.status);
      error.status=response.status;
      throw error;
    }
    return await response.json();
  }catch(error){
    if(error?.name==='AbortError')throw new Error('NWS_REQUEST_TIMEOUT');
    throw error;
  }finally{
    clearTimeout(timer);
  }
}

export async function fetchNwsForecast({lat,lon}){
  const coords=normalizeCoordinates(lat,lon);
  const point=await nwsFetchJson(`/points/${coords.lat},${coords.lon}`);
  const forecastUrl=assertNwsUrl(point?.properties?.forecast);
  const forecast=await nwsFetchJson(forecastUrl.toString());
  const periods=(forecast?.properties?.periods||[]).slice(0,14).map(period=>({
    number:Number(period?.number)||null,
    name:clampText(period?.name,80),
    startTime:period?.startTime||null,
    endTime:period?.endTime||null,
    isDaytime:Boolean(period?.isDaytime),
    temperature:Number.isFinite(Number(period?.temperature))?Number(period.temperature):null,
    temperatureUnit:clampText(period?.temperatureUnit,12),
    probabilityOfPrecipitation:Number.isFinite(Number(period?.probabilityOfPrecipitation?.value))?Number(period.probabilityOfPrecipitation.value):null,
    windSpeed:clampText(period?.windSpeed,60),
    windDirection:clampText(period?.windDirection,20),
    shortForecast:clampText(period?.shortForecast,180),
    detailedForecast:clampText(period?.detailedForecast,1200)
  }));
  return {
    source:{
      id:'nws-weather-us',
      name:'National Weather Service',
      url:NWS_BASE,
      providerUpdatedAt:forecast?.properties?.updated||point?.properties?.updateTime||null,
      retrievedAt:new Date().toISOString()
    },
    location:{
      lat:coords.lat,
      lon:coords.lon,
      gridId:point?.properties?.gridId||null,
      gridX:Number(point?.properties?.gridX)||null,
      gridY:Number(point?.properties?.gridY)||null,
      forecastOffice:point?.properties?.forecastOffice||null,
      timeZone:point?.properties?.timeZone||null
    },
    periods
  };
}

export async function fetchNwsAlerts({area}){
  const normalizedArea=normalizeArea(area);
  const payload=await nwsFetchJson(`/alerts/active?area=${encodeURIComponent(normalizedArea)}`);
  const alerts=(payload?.features||[]).slice(0,100).map(feature=>{
    const p=feature?.properties||{};
    return {
      id:String(feature?.id||p?.id||'').slice(0,300),
      event:clampText(p.event,160),
      headline:clampText(p.headline,300),
      severity:clampText(p.severity,40),
      urgency:clampText(p.urgency,40),
      certainty:clampText(p.certainty,40),
      areaDesc:clampText(p.areaDesc,500),
      sent:p.sent||null,
      effective:p.effective||null,
      onset:p.onset||null,
      expires:p.expires||null,
      ends:p.ends||null,
      status:clampText(p.status,40),
      messageType:clampText(p.messageType,40),
      category:Array.isArray(p.category)?p.category.slice(0,10):[],
      response:clampText(p.response,60),
      description:clampText(p.description,1400),
      instruction:clampText(p.instruction,1400),
      web:p.web||null
    };
  });
  return {
    source:{
      id:'nws-weather-us',
      name:'National Weather Service',
      url:NWS_BASE,
      providerUpdatedAt:payload?.updated||null,
      retrievedAt:new Date().toISOString()
    },
    area:normalizedArea,
    count:alerts.length,
    alerts
  };
}

export {NWS_BASE,assertNwsUrl};
