import {fetchGlobalForecastForCertification} from './global-weather.js';
import {getStreetVerseWeatherLocation} from './streetverse-weather-locations.js';

export const GLOBAL_WEATHER_CERTIFICATION_LOCATIONS=Object.freeze([
  'chicago','lagos','abuja','london','tokyo','sydney'
]);

const finite=value=>value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value));
const text=value=>typeof value==='string'&&value.trim().length>0;
const validDate=value=>text(value)&&Number.isFinite(Date.parse(value));

export function validateGlobalWeatherCertificationForecast(forecast){
  const checks={
    provider:forecast?.source?.id==='open-meteo-global-commercial',
    retrievedAt:validDate(forecast?.source?.retrievedAt),
    timezone:text(forecast?.location?.timezone),
    currentTime:text(forecast?.current?.time),
    temperature:finite(forecast?.current?.temperature),
    weatherCode:finite(forecast?.current?.weatherCode),
    windSpeed:finite(forecast?.current?.windSpeed),
    daily:Array.isArray(forecast?.days)&&forecast.days.length>=1,
    dailyDate:text(forecast?.days?.[0]?.date),
    dailyTemperatureMax:finite(forecast?.days?.[0]?.temperatureMax),
    dailyTemperatureMin:finite(forecast?.days?.[0]?.temperatureMin)
  };
  return {
    pass:Object.values(checks).every(Boolean),
    checks
  };
}

export async function runGlobalWeatherCertification({fetchForecast=fetchGlobalForecastForCertification}={}){
  const results=[];
  for(const id of GLOBAL_WEATHER_CERTIFICATION_LOCATIONS){
    const location=getStreetVerseWeatherLocation(id);
    try{
      const forecast=await fetchForecast({lat:location.lat,lon:location.lon,days:2});
      const validation=validateGlobalWeatherCertificationForecast(forecast);
      results.push({
        id:location.id,
        label:location.label,
        country:location.country||null,
        continent:location.continent||null,
        pass:validation.pass,
        checks:validation.checks,
        provider:forecast?.source?.id||null,
        sourceTimestamp:forecast?.current?.time||null,
        retrievedAt:forecast?.source?.retrievedAt||null,
        dailyCount:Array.isArray(forecast?.days)?forecast.days.length:0
      });
    }catch(error){
      results.push({
        id:location.id,
        label:location.label,
        country:location.country||null,
        continent:location.continent||null,
        pass:false,
        checks:{request:false},
        error:String(error?.message||'GLOBAL_WEATHER_CERTIFICATION_REQUEST_FAILED')
      });
    }
  }
  const passed=results.filter(item=>item.pass).length;
  return {
    provider:'open-meteo-global-commercial',
    executedAt:new Date().toISOString(),
    requiredLocations:GLOBAL_WEATHER_CERTIFICATION_LOCATIONS.length,
    passed,
    failed:results.length-passed,
    readyToVerify:results.length===GLOBAL_WEATHER_CERTIFICATION_LOCATIONS.length&&results.every(item=>item.pass),
    results
  };
}
