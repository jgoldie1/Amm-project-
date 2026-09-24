import {globalWeatherStatus} from '../api/_lib/global-weather.js';
import {runGlobalWeatherCertification} from '../api/_lib/global-weather-certification.js';

const status=globalWeatherStatus();
if(!status.certificationReady){
  console.error(JSON.stringify({
    ok:false,
    error:'GLOBAL_WEATHER_CERTIFICATION_NOT_READY',
    configuration:{
      enabled:status.enabled,
      licenseVerified:status.licenseVerified,
      configured:status.configured
    },
    note:'Certification requires GLOBAL_WEATHER_ENABLED=true, OPEN_METEO_COMMERCIAL_LICENSE_VERIFIED=true, and OPEN_METEO_API_KEY configured server-side. OPEN_METEO_PRODUCTION_VERIFIED may remain false during certification.'
  },null,2));
  process.exit(1);
}

const report=await runGlobalWeatherCertification();
console.log(JSON.stringify({
  ok:report.readyToVerify,
  ...report,
  next:report.readyToVerify
    ? 'Certification passed. Review the report, then set OPEN_METEO_PRODUCTION_VERIFIED=true and re-test the public StreetVerse forecast path.'
    : 'Certification failed. Keep OPEN_METEO_PRODUCTION_VERIFIED=false and repair the failed provider/location checks.'
},null,2));

if(!report.readyToVerify)process.exit(1);
