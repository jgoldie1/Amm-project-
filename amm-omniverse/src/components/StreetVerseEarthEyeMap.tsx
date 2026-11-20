import {useEffect,useRef,useState} from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'
import {EARTH_EYE_CITIES} from '../runtime/StreetVerseEarthEyeDirector'

/** MapLibre geographic PREVIEW: bundled MapLibre, no paid tiles, user tracking or live satellite feed.
 * Region-only cartography without imagery until an approved licensed tile style is deployed.
 * Mounted only by explicit user action to avoid a second WebGL context during normal gameplay.
 */
const itinerary=['chicago','detroit','tampa','memphis','atlanta'] as const
const routeCities=itinerary.map(id=>EARTH_EYE_CITIES.find(c=>c.id===id)!)
const features={
 type:'FeatureCollection' as const,
 features:routeCities.map(city=>({type:'Feature' as const,properties:{id:city.id,name:city.label,readiness:city.worldState},geometry:{type:'Point' as const,coordinates:[city.lon,city.lat]}}))
}
const route={
 type:'FeatureCollection' as const,
 features:[{type:'Feature' as const,properties:{kind:'planned-route'},geometry:{type:'LineString' as const,coordinates:routeCities.map(c=>[c.lon,c.lat])}}]
}
export const EARTH_EYE_FIVE_CITY_ROUTE=Object.freeze([...itinerary])
const NASA_BLUE_MARBLE_TILES='https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_NextGeneration/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg'
export default function StreetVerseEarthEyeMap({selected,onSelect,imageryEnabled=false}:{selected:string;onSelect:(city:string)=>void;imageryEnabled?:boolean}){
 const mount=useRef<HTMLDivElement>(null)
 const mapRef=useRef<{flyTo:(opts:{center:[number,number];zoom:number;essential:boolean})=>void;remove:()=>void}|null>(null)
 const [error,setError]=useState('')
 useEffect(()=>{
  let disposed=false
  let map:{remove:()=>void}|null=null
  const run=async()=>{
   if(!mount.current)return
   try{
    const {default:maplibregl}=await import('maplibre-gl')
    if(disposed||!mount.current)return
    if(!maplibregl.supported()){setError('Map graphics unavailable on this device. The text city selector still works.');return}
    const instance=new maplibregl.Map({
     container:mount.current,
     style:{version:8,sources:{},layers:[{id:'earth-eye-background',type:'background',paint:{'background-color':'#08243a'}}]},
     projection:{type:'globe'},center:[-88,37],zoom:2.6,attributionControl:false,interactive:true,maxZoom:7
    })
    map=instance
    mapRef.current=instance
    instance.on('load',()=>{
     if(disposed)return
     // Historical Blue Marble satellite mosaic; requested only after explicit user opt-in.
     if(imageryEnabled){
      instance.addSource('earth-eye-nasa-blue-marble',{type:'raster',tiles:[NASA_BLUE_MARBLE_TILES],tileSize:256,maxzoom:8,attribution:'NASA Blue Marble Next Generation via NASA GIBS (historical composite)'})
      instance.addLayer({id:'earth-eye-nasa-imagery',type:'raster',source:'earth-eye-nasa-blue-marble',paint:{'raster-opacity':.95}})
     }
     instance.addSource('earth-eye-itinerary',{type:'geojson',data:route})
     instance.addSource('earth-eye-cities',{type:'geojson',data:features})
     instance.addLayer({id:'earth-eye-route',type:'line',source:'earth-eye-itinerary',paint:{'line-color':'#6bdeff','line-width':3,'line-opacity':.75,'line-dasharray':[2,2]}})
     instance.addLayer({id:'earth-eye-points',type:'circle',source:'earth-eye-cities',paint:{'circle-radius':7,'circle-color':['case',['==',['get','readiness'],'chicago-code'],'#36f5bb','#ffd071'],'circle-stroke-width':2,'circle-stroke-color':'#ffffff'}})
     instance.on('click','earth-eye-points',(e)=>{const id=e.features?.[0]?.properties?.id;if(typeof id==='string'&&itinerary.includes(id as typeof itinerary[number]))onSelect(id)})
    })
    instance.on('error',()=>{if(!disposed)setError('Map renderer could not display this preview; the text selector remains available.')})
   }catch{if(!disposed)setError('MapLibre could not load; use the text city selector instead.')}
  }
  void run()
  return()=>{disposed=true;mapRef.current=null;map?.remove()}
 },[])
 useEffect(()=>{
  const city=EARTH_EYE_CITIES.find(c=>c.id===selected)
  if(city)mapRef.current?.flyTo({center:[city.lon,city.lat],zoom:4,essential:false})
 },[selected])
 return <div aria-label="Five-city MapLibre globe preview" style={{display:'grid',gap:5}}>
  <div ref={mount} role="img" aria-label="Geographic globe with Chicago, Detroit, Tampa, Memphis, Atlanta and a schematic connection route; preview only" style={{height:220,minHeight:220,border:'1px solid #47839e',borderRadius:10,overflow:'hidden'}}/>
  {error&&<small role="status">{error}</small>}
  <small>Chicago → Detroit → Tampa → Memphis → Atlanta • planned route, not playable travel. {imageryEnabled?'NASA Blue Marble Next Generation historical satellite composite (not current/live). Credit: NASA GIBS.':'Schematic globe without external map tiles.'} No device location tracking.</small>
 </div>
}
