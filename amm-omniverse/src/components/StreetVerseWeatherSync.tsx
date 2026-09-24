import {useEffect} from 'react'
import {weatherVisualFromState,type StreetVerseWeatherState} from '../runtime/StreetVerseWeatherRuntime'

type WeatherPoint={id:string;label:string;lat:number;lon:number;scope:'local'|'global'}

const LOCAL_POINT:WeatherPoint={id:'chicago',label:'Chicago',lat:41.8781,lon:-87.6298,scope:'local'}

export const STREETVERSE_GLOBAL_WEATHER_POINTS:Record<string,WeatherPoint>={
  chicago:LOCAL_POINT,
  greatLakes:{id:'greatLakes',label:'Great Lakes',lat:43.0389,lon:-87.9065,scope:'global'},
  caribbean:{id:'caribbean',label:'Caribbean',lat:18.2208,lon:-66.5901,scope:'global'},
  mediterranean:{id:'mediterranean',label:'Mediterranean',lat:35.8989,lon:14.5146,scope:'global'},
  westAfrica:{id:'westAfrica',label:'West Africa • Lagos',lat:6.5244,lon:3.3792,scope:'global'},
  eastAfrica:{id:'eastAfrica',label:'East Africa • Nairobi',lat:-1.2864,lon:36.8172,scope:'global'},
  amazon:{id:'amazon',label:'Amazon Basin',lat:-3.4653,lon:-62.2159,scope:'global'},
  pacific:{id:'pacific',label:'Pacific • Honolulu',lat:21.3069,lon:-157.8583,scope:'global'},
  arctic:{id:'arctic',label:'Arctic • Tromsø',lat:69.6492,lon:18.9553,scope:'global'},
  openOcean:{id:'openOcean',label:'Open Pacific',lat:0,lon:-140,scope:'global'},
}

const CACHE_KEY='tryamm.streetverse.weather.v1'
const REFRESH_MS=15*60*1000

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
  if(!current)return unavailable(point,'Current weather is not available yet.')
  return {
    scope:point.scope,
    regionId:point.id,
    regionLabel:point.label,
    provider:String(source?.id||'open-meteo-global-commercial'),
    sourceTimestamp:current?.time||null,
    retrievedAt:String(source?.retrievedAt||new Date().toISOString()),
    temperature:Number.isFinite(Number(current?.temperature))?Number(current.temperature):null,
    apparentTemperature:Number.isFinite(Number(current?.apparentTemperature))?Number(current.apparentTemperature):null,
    precipitation:Number.isFinite(Number(current?.precipitation))?Number(current.precipitation):null,
    rain:Number.isFinite(Number(current?.rain))?Number(current.rain):null,
    snowfall:Number.isFinite(Number(current?.snowfall))?Number(current.snowfall):null,
    weatherCode:Number.isFinite(Number(current?.weatherCode))?Number(current.weatherCode):null,
    cloudCover:Number.isFinite(Number(current?.cloudCover))?Number(current.cloudCover):null,
    windSpeed:Number.isFinite(Number(current?.windSpeed))?Number(current.windSpeed):null,
    windDirection:Number.isFinite(Number(current?.windDirection))?Number(current.windDirection):null,
    windGusts:Number.isFinite(Number(current?.windGusts))?Number(current.windGusts):null,
    current:true,
    simulated:false
  }
}

export async function refreshStreetVerseWeather(point:WeatherPoint){
  try{
    const params=new URLSearchParams({action:'forecast',lat:String(point.lat),lon:String(point.lon),days:'2'})
    const response=await fetch('/api/intelligence/global-weather?'+params.toString(),{headers:{accept:'application/json'}})
    const payload=await response.json().catch(()=>null)
    if(!response.ok){
      const state=unavailable(point,response.status===503?'Global live weather is installed but not activated.':'Weather provider request failed.')
      dispatch(state)
      return state
    }
    const state=normalize(point,payload)
    dispatch(state)
    return state
  }catch{
    const state=unavailable(point,'Weather connection is temporarily unavailable.')
    dispatch(state)
    return state
  }
}

export default function StreetVerseWeatherSync(){
  useEffect(()=>{
    let point=LOCAL_POINT
    try{const savedRegion=localStorage.getItem('tryamm.streetverse.global-world.v1');if(savedRegion&&STREETVERSE_GLOBAL_WEATHER_POINTS[savedRegion])point=STREETVERSE_GLOBAL_WEATHER_POINTS[savedRegion]}catch{}
    let timer=0
    let disposed=false
    let requestId=0

    const refresh=async(next=point)=>{
      point=next
      const id=++requestId
      const state=await refreshStreetVerseWeather(point)
      if(disposed||id!==requestId)return
      document.body.dataset.svWeatherRegion=state.regionId
    }

    try{
      const saved=JSON.parse(localStorage.getItem(CACHE_KEY)||'null') as StreetVerseWeatherState|null
      if(saved&&Date.now()-Date.parse(saved.retrievedAt)<REFRESH_MS)dispatch(saved)
    }catch{}

    const onRegion=(event:Event)=>{
      const detail=(event as CustomEvent<{regionId?:string}>).detail||{}
      const next=STREETVERSE_GLOBAL_WEATHER_POINTS[String(detail.regionId||'')]
      if(next)void refresh(next)
    }
    const onLocal=()=>void refresh(LOCAL_POINT)

    window.addEventListener('tryamm:streetverse-global-region',onRegion)
    window.addEventListener('tryamm:streetverse-local-weather',onLocal)
    void refresh(point)
    timer=window.setInterval(()=>void refresh(point),REFRESH_MS)

    return()=>{
      disposed=true
      window.clearInterval(timer)
      window.removeEventListener('tryamm:streetverse-global-region',onRegion)
      window.removeEventListener('tryamm:streetverse-local-weather',onLocal)
      delete document.body.dataset.svWeatherRegion
      delete document.body.dataset.svWeather
      delete document.body.dataset.svWeatherLive
    }
  },[])
  return null
}
