import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window { Cesium?: any; CESIUM_BASE_URL?: string }
}

const CESIUM_VERSION='1.138'
const CESIUM_BASE=`https://cdn.jsdelivr.net/npm/cesium@${CESIUM_VERSION}/Build/Cesium/`
const CHICAGO={lon:-87.6298,lat:41.8781,height:2100}

type Props={onClose?:()=>void}

function loadCesium(){
  if(window.Cesium)return Promise.resolve(window.Cesium)
  window.CESIUM_BASE_URL=CESIUM_BASE
  if(!document.querySelector('link[data-streetverse-cesium]')){
    const link=document.createElement('link');link.rel='stylesheet';link.href=`${CESIUM_BASE}Widgets/widgets.css`;link.dataset.streetverseCesium='1';document.head.appendChild(link)
  }
  return new Promise<any>((resolve,reject)=>{
    const existing=document.querySelector<HTMLScriptElement>('script[data-streetverse-cesium]')
    if(existing){existing.addEventListener('load',()=>resolve(window.Cesium),{once:true});existing.addEventListener('error',reject,{once:true});return}
    const script=document.createElement('script');script.src=`${CESIUM_BASE}Cesium.js`;script.async=true;script.dataset.streetverseCesium='1';script.onload=()=>resolve(window.Cesium);script.onerror=()=>reject(new Error('CesiumJS failed to load'));document.head.appendChild(script)
  })
}

export default function StreetVerseTwinWorld({onClose}:Props){
  const host=useRef<HTMLDivElement|null>(null)
  const [status,setStatus]=useState('Starting Twin World…')
  const [provider,setProvider]=useState('REAL EARTH • OSM')

  useEffect(()=>{
    let viewer:any
    let cancelled=false
    ;(async()=>{
      try{
        const C=await loadCesium();if(cancelled||!host.current||!C)return
        const googleKey=String(import.meta.env.VITE_GOOGLE_MAP_TILES_API_KEY||'').trim()
        viewer=new C.Viewer(host.current,{
          animation:false,timeline:false,baseLayerPicker:false,sceneModePicker:true,homeButton:true,fullscreenButton:true,
          navigationHelpButton:false,infoBox:false,selectionIndicator:false,geocoder:false,globe:googleKey?false:undefined,
          imageryProvider:googleKey?false:new C.OpenStreetMapImageryProvider({url:'https://tile.openstreetmap.org/',credit:'© OpenStreetMap contributors'}),
          terrainProvider:googleKey?undefined:new C.EllipsoidTerrainProvider(),
        })
        viewer.scene.skyAtmosphere.show=true
        viewer.scene.globe && (viewer.scene.globe.depthTestAgainstTerrain=true)
        if(googleKey){
          try{
            C.GoogleMaps.defaultApiKey=googleKey
            const tileset=await C.createGooglePhotorealistic3DTileset({key:googleKey,onlyUsingWithGoogleGeocoder:true},{showCreditsOnScreen:true,maximumScreenSpaceError:10})
            if(!cancelled){viewer.scene.primitives.add(tileset);setProvider('GOOGLE PHOTOREALISTIC 3D TILES')}
          }catch(err){console.error('[TwinWorld] Google 3D Tiles failed',err);setProvider('REAL EARTH FALLBACK • OSM');setStatus('Google 3D Tiles unavailable; using real-world map fallback.')}
        }
        viewer.camera.flyTo({destination:C.Cartesian3.fromDegrees(CHICAGO.lon,CHICAGO.lat,CHICAGO.height),orientation:{heading:C.Math.toRadians(20),pitch:C.Math.toRadians(-45),roll:0},duration:0})
        const chicago=viewer.entities.add({name:'StreetVerse Chicago Twin',position:C.Cartesian3.fromDegrees(CHICAGO.lon,CHICAGO.lat,250),point:{pixelSize:13,color:C.Color.GOLD,outlineColor:C.Color.BLACK,outlineWidth:3},label:{text:'STREETVERSE • CHICAGO TWIN',font:'700 18px sans-serif',pixelOffset:new C.Cartesian2(0,-26),fillColor:C.Color.WHITE,showBackground:true,backgroundColor:new C.Color(0,0,0,.68)}})
        viewer.trackedEntity=undefined
        setStatus(googleKey?'Chicago digital twin online. Photorealistic tiles stream as you move closer.':'Chicago geospatial Twin World online. Add VITE_GOOGLE_MAP_TILES_API_KEY to enable Google Photorealistic 3D Tiles.')
        window.dispatchEvent(new CustomEvent('tryamm:twin-world-ready',{detail:{city:'Chicago',lat:CHICAGO.lat,lon:CHICAGO.lon,provider:googleKey?'google-photorealistic-3d':'osm-geospatial',earthScale:true}}))
        return chicago
      }catch(err){console.error('[TwinWorld]',err);setStatus('Twin World could not initialize on this device/browser.')}
    })()
    return()=>{cancelled=true;try{viewer?.destroy?.()}catch{}}
  },[])

  return <div style={{position:'fixed',inset:0,zIndex:17000,background:'#02060a',color:'#fff',fontFamily:'system-ui,sans-serif'}}>
    <div ref={host} style={{position:'absolute',inset:0}} aria-label="StreetVerse Twin World real-Earth Chicago map" />
    <div style={{position:'absolute',left:12,top:12,zIndex:3,maxWidth:390,padding:'12px 14px',borderRadius:14,background:'rgba(2,8,14,.86)',border:'1px solid rgba(255,215,92,.5)',backdropFilter:'blur(10px)'}}>
      <div style={{fontWeight:1000,letterSpacing:'.08em'}}>STREETVERSE • TWIN WORLD</div>
      <div style={{marginTop:4,fontSize:12,fontWeight:800,color:'#ffd75c'}}>{provider}</div>
      <div style={{marginTop:7,fontSize:12,lineHeight:1.35,color:'#d8e5ee'}}>{status}</div>
      <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
        <button onClick={()=>{window.location.href='/streetverse'}} style={buttonStyle}>OPEN GAME WORLD</button>
        <button onClick={()=>{window.location.href='/streetverse/twin-world'}} style={buttonStyle}>CHICAGO TWIN</button>
        <button onClick={()=>onClose?onClose():window.location.assign('/')} style={buttonStyle}>HOME</button>
      </div>
    </div>
    <div style={{position:'absolute',right:12,bottom:30,zIndex:3,padding:'8px 10px',borderRadius:10,background:'rgba(0,0,0,.68)',fontSize:11,maxWidth:330}}>
      Real geospatial layer. StreetVerse missions/gameplay remain original overlays; Google imagery is used only when a licensed Map Tiles API key is configured and required attribution remains visible.
    </div>
  </div>
}

const buttonStyle:React.CSSProperties={border:'1px solid #ffffff33',background:'#111b24',color:'#fff',borderRadius:999,padding:'8px 10px',fontWeight:900,cursor:'pointer',fontSize:11}
