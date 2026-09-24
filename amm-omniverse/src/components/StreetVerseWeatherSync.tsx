import {useEffect} from 'react'
import {weatherVisualFromState,type StreetVerseWeatherState} from '../runtime/StreetVerseWeatherRuntime'

type WeatherPoint={id:string;label:string;scope:'local'|'global'}

const LOCAL_POINT:WeatherPoint={id:'chicago',label:'Chicago',scope:'local'}

export const STREETVERSE_GLOBAL_WEATHER_POINTS:Record<string,WeatherPoint>={
  chicago:LOCAL_POINT,
  greatLakes:{id:'greatLakes',label:'Great Lakes',scope:'global'},
  caribbean:{id:'caribbean',label:'Caribbean',scope:'global'},
  mediterranean:{id:'mediterranean',label:'Mediterranean',scope:'global'},
  westAfrica:{id:'westAfrica',label:'West Africa • Lagos',scope:'global'},
  eastAfrica:{id:'eastAfrica',label:'East Africa • Nairobi',scope:'global'},
  amazon:{id:'amazon',label:'Amazon Basin',scope:'global'},
  pacific:{id:'pacific',label:'Pacific • Honolulu',scope:'global'},
  arctic:{id:'arctic',label:'Arctic • Tromsø',scope:'global'},
  openOcean:{id:'openOcean',label:'Open Pacific',scope:'global'},
}

const CACHE_KEY='tryamm.streetverse.weather.v1'
const DEST_KEY='tryamm.streetverse.weather-destination.v1'
const REFRESH_MS=15*60*1000
const nullableNumber=(value:unknown)=>value===null||value===undefined||value===''?null:(Number.isFinite(Number(value))?Number(value):null)

function dispatch(state:StreetVerseWeatherState){
  try{localStorage.setItem(CACHE_KEY,JSON.stringify(state))}catch{}
  const visual=weatherVisualFromState(state)
  document.body.dataset.svWeather=visual.kind
  document.body.dataset.svWeatherLive=String(state.current&&!state.simulated&&!state.unavailable)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-weather-state',{detail:state}))
}

function unavailable(point:WeatherPoint,message:string):StreetVerseWeatherState{
  return {
    scope:point.scope,regionId:point.id,regionLabel:point.label,provider:'none',sourceTimestamp:null,retrievedAt:new Date().toISOString(),
    temperature:null,apparentTemperature:null,precipitation:null,rain:null,snowfall:null,weatherCode:null,cloudCover:null,
    windSpeed:null,windDirection:null,windGusts:null,current:false,simulated:true,unavailable:true,message
  }
}

function normalize(point:WeatherPoint,payload:any):StreetVerseWeatherState{
  const current=payload?.data?.current||null
  const source=payload?.data?.source||{}
  const location=payload?.location||{}
  if(!current)return unavailable(point,'Current weather is not available yet.')
  return {
    scope:location?.scope==='local'?'local':'global',
    regionId:String(location?.id||point.id),
    regionLabel:String(location?.label||point.label),
    provider:String(source?.id||'open-meteo-global-commercial'),
    sourceTimestamp:current?.time||null,
    retrievedAt:String(source?.retrievedAt||new Date().toISOString()),
    temperature:nullableNumber(current?.temperature),
    apparentTemperature:nullableNumber(current?.apparentTemperature),
    precipitation:nullableNumber(current?.precipitation),
    rain:nullableNumber(current?.rain),
    snowfall:nullableNumber(current?.snowfall),
    weatherCode:nullableNumber(current?.weatherCode),
    cloudCover:nullableNumber(current?.cloudCover),
    windSpeed:nullableNumber(current?.windSpeed),
    windDirection:nullableNumber(current?.windDirection),
    windGusts:nullableNumber(current?.windGusts),
    current:true,
    simulated:false
  }
}

export async function refreshStreetVerseWeather(point:WeatherPoint){
  try{
    const params=new URLSearchParams({action:'forecast',location:point.id})
    const response=await fetch('/api/intelligence/global-weather?'+params.toString(),{headers:{accept:'application/json'}})
    const payload=await response.json().catch(()=>null)
    if(!response.ok)return unavailable(point,response.status===503?'Global live weather is installed but not activated.':'Weather provider request failed.')
    return normalize(point,payload)
  }catch{
    return unavailable(point,'Weather connection is temporarily unavailable.')
  }
}

export default function StreetVerseWeatherSync(){
  useEffect(()=>{
    let point=LOCAL_POINT
    try{const savedDestination=JSON.parse(localStorage.getItem(DEST_KEY)||'null') as WeatherPoint|null;if(savedDestination?.id&&savedDestination?.label)point={id:String(savedDestination.id),label:String(savedDestination.label),scope:'global'};else{const savedRegion=localStorage.getItem('tryamm.streetverse.global-world.v1');if(savedRegion&&STREETVERSE_GLOBAL_WEATHER_POINTS[savedRegion])point=STREETVERSE_GLOBAL_WEATHER_POINTS[savedRegion]}}catch{}
    let timer=0
    let disposed=false
    let requestId=0

    const refresh=async(next=point)=>{
      point=next
      const id=++requestId
      const state=await refreshStreetVerseWeather(point)
      if(disposed||id!==requestId)return
      dispatch(state)
      document.body.dataset.svWeatherRegion=state.regionId
    }

    try{
      const saved=JSON.parse(localStorage.getItem(CACHE_KEY)||'null') as StreetVerseWeatherState|null
      if(saved&&Date.now()-Date.parse(saved.retrievedAt)<REFRESH_MS)dispatch(saved)
    }catch{}

    const onRegion=(event:Event)=>{
      const detail=(event as CustomEvent<{regionId?:string}>).detail||{}
      const next=STREETVERSE_GLOBAL_WEATHER_POINTS[String(detail.regionId||'')]
      if(next){try{localStorage.removeItem(DEST_KEY)}catch{};void refresh(next)}
    }
    const onDestination=(event:Event)=>{
      const detail=(event as CustomEvent<{id?:string;label?:string}>).detail||{}
      const id=String(detail.id||'').trim(),label=String(detail.label||'').trim().slice(0,120)
      if(!id||!label)return
      const next:WeatherPoint={id,label,scope:'global'}
      try{localStorage.setItem(DEST_KEY,JSON.stringify(next))}catch{}
      void refresh(next)
    }
    const onLocal=()=>{try{localStorage.removeItem(DEST_KEY)}catch{};void refresh(LOCAL_POINT)}

    window.addEventListener('tryamm:streetverse-global-region',onRegion)
    window.addEventListener('tryamm:streetverse-weather-destination',onDestination)
    window.addEventListener('tryamm:streetverse-local-weather',onLocal)
    void refresh(point)
    timer=window.setInterval(()=>void refresh(point),REFRESH_MS)

    return()=>{
      disposed=true
      window.clearInterval(timer)
      window.removeEventListener('tryamm:streetverse-global-region',onRegion)
      window.removeEventListener('tryamm:streetverse-weather-destination',onDestination)
      window.removeEventListener('tryamm:streetverse-local-weather',onLocal)
      delete document.body.dataset.svWeatherRegion
      delete document.body.dataset.svWeather
      delete document.body.dataset.svWeatherLive
    }
  },[])
  return null
}
