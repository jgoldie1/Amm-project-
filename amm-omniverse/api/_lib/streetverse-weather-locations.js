export const STREETVERSE_WEATHER_LOCATIONS=Object.freeze({
  chicago:Object.freeze({id:'chicago',label:'Chicago',lat:41.8781,lon:-87.6298,scope:'local'}),
  greatLakes:Object.freeze({id:'greatLakes',label:'Great Lakes',lat:43.0389,lon:-87.9065,scope:'global'}),
  caribbean:Object.freeze({id:'caribbean',label:'Caribbean',lat:18.2208,lon:-66.5901,scope:'global'}),
  mediterranean:Object.freeze({id:'mediterranean',label:'Mediterranean',lat:35.8989,lon:14.5146,scope:'global'}),
  westAfrica:Object.freeze({id:'westAfrica',label:'West Africa • Lagos',lat:6.5244,lon:3.3792,scope:'global'}),
  eastAfrica:Object.freeze({id:'eastAfrica',label:'East Africa • Nairobi',lat:-1.2864,lon:36.8172,scope:'global'}),
  amazon:Object.freeze({id:'amazon',label:'Amazon Basin',lat:-3.4653,lon:-62.2159,scope:'global'}),
  pacific:Object.freeze({id:'pacific',label:'Pacific • Honolulu',lat:21.3069,lon:-157.8583,scope:'global'}),
  arctic:Object.freeze({id:'arctic',label:'Arctic • Tromsø',lat:69.6492,lon:18.9553,scope:'global'}),
  openOcean:Object.freeze({id:'openOcean',label:'Open Pacific',lat:0,lon:-140,scope:'global'})
});

export function getStreetVerseWeatherLocation(value){
  const id=String(value||'').trim();
  const location=STREETVERSE_WEATHER_LOCATIONS[id];
  if(!location)throw new Error('GLOBAL_WEATHER_LOCATION_NOT_APPROVED');
  return location;
}

export function publicStreetVerseWeatherLocations(){
  return Object.values(STREETVERSE_WEATHER_LOCATIONS).map(({id,label,scope})=>({id,label,scope}));
}
