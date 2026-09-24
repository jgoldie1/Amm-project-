import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

type LayerId = 'business'|'mobility'|'environment'|'missions'|'infrastructure'|'alerts'
type SparrowFeature = {
  id:string
  kind:LayerId
  label:string
  detail:string
  coordinates:[number,number]
  status:'public'|'consented'|'simulation'
  actionPath?:string
}

const CHICAGO_CENTER:[number,number]=[-87.6298,41.8781]

const LAYERS:{id:LayerId;label:string;icon:string}[]=[
  {id:'business',label:'Business + Services',icon:'▦'},
  {id:'mobility',label:'Mobility + Delivery',icon:'↗'},
  {id:'environment',label:'Environment',icon:'◌'},
  {id:'missions',label:'Missions + Events',icon:'★'},
  {id:'infrastructure',label:'Infrastructure',icon:'⌁'},
  {id:'alerts',label:'Public Alerts',icon:'!'},
]

const FEATURES:SparrowFeature[]=[
  {id:'biz-loop',kind:'business',label:'Loop Business Cluster',detail:'StreetVerse commerce and service discovery zone.',coordinates:[-87.6295,41.8837],status:'simulation',actionPath:'/marketplace'},
  {id:'mob-south',kind:'mobility',label:'South Mobility Corridor',detail:'Ride, delivery and route-demand simulation.',coordinates:[-87.6249,41.8218],status:'simulation',actionPath:'/streetverse'},
  {id:'env-lake',kind:'environment',label:'Lakefront Air + Weather Layer',detail:'Environmental layer reserved for public or consented sensor feeds.',coordinates:[-87.6066,41.8925],status:'simulation'},
  {id:'mission-west',kind:'missions',label:'West Side Mission Zone',detail:'Area-aware StreetVerse mission and event trigger.',coordinates:[-87.7062,41.8818],status:'simulation',actionPath:'/streetverse'},
  {id:'infra-north',kind:'infrastructure',label:'North Infrastructure Node',detail:'Connectivity, road, energy and service-status visualization.',coordinates:[-87.6534,41.9396],status:'simulation',actionPath:'/connect'},
  {id:'alert-downtown',kind:'alerts',label:'Downtown Public Alert Zone',detail:'Reserved for verified public alerts. No private-person tracking.',coordinates:[-87.6359,41.8756],status:'simulation'},
]

const layerColor:Record<LayerId,string>={
  business:'#4fe3ff',
  mobility:'#75ffa1',
  environment:'#b5ff5b',
  missions:'#ffd15c',
  infrastructure:'#bf8bff',
  alerts:'#ff6b7a',
}

const defaultStyle:any={
  version:8,
  sources:{
    osm:{
      type:'raster',
      tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize:256,
      attribution:'© OpenStreetMap contributors',
    },
  },
  layers:[{id:'osm',type:'raster',source:'osm'}],
}

export default function SparrowMapCenter({onClose}:{onClose:()=>void}){
  const containerRef=useRef<HTMLDivElement|null>(null)
  const mapRef=useRef<MapLibreMap|null>(null)
  const [selectedId,setSelectedId]=useState<string>(FEATURES[0].id)
  const [mapReady,setMapReady]=useState(false)
  const [enabled,setEnabled]=useState<Record<LayerId,boolean>>({
    business:true,mobility:true,environment:true,missions:true,infrastructure:true,alerts:true,
  })

  const selected=useMemo(()=>FEATURES.find(x=>x.id===selectedId)||FEATURES[0],[selectedId])

  useEffect(()=>{
    if(!containerRef.current||mapRef.current)return
    const configuredStyle=(import.meta as any).env?.VITE_SPARROW_MAP_STYLE_URL
    const map=new maplibregl.Map({
      container:containerRef.current,
      style:configuredStyle||defaultStyle,
      center:CHICAGO_CENTER,
      zoom:10.8,
      attributionControl:true,
    })
    mapRef.current=map
    map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right')
    map.on('load',()=>{
      const sourceData:any={
        type:'FeatureCollection',
        features:FEATURES.map(feature=>({
          type:'Feature',
          id:feature.id,
          geometry:{type:'Point',coordinates:feature.coordinates},
          properties:{id:feature.id,kind:feature.kind,label:feature.label},
        })),
      }
      map.addSource('sparrow-features',{type:'geojson',data:sourceData})
      for(const layer of LAYERS){
        map.addLayer({
          id:`sparrow-${layer.id}`,
          type:'circle',
          source:'sparrow-features',
          filter:['==',['get','kind'],layer.id],
          paint:{
            'circle-radius':9,
            'circle-color':layerColor[layer.id],
            'circle-stroke-width':2,
            'circle-stroke-color':'#081019',
            'circle-opacity':0.92,
          },
        } as any)
        map.on('click',`sparrow-${layer.id}`,event=>{
          const id=String(event.features?.[0]?.properties?.id||'')
          if(id)setSelectedId(id)
        })
        map.on('mouseenter',`sparrow-${layer.id}`,()=>{map.getCanvas().style.cursor='pointer'})
        map.on('mouseleave',`sparrow-${layer.id}`,()=>{map.getCanvas().style.cursor=''})
      }
      setMapReady(true)
    })
    return()=>{map.remove();mapRef.current=null}
  },[])

  useEffect(()=>{
    const map=mapRef.current
    if(!map||!mapReady)return
    for(const layer of LAYERS){
      if(map.getLayer(`sparrow-${layer.id}`))map.setLayoutProperty(`sparrow-${layer.id}`,'visibility',enabled[layer.id]?'visible':'none')
    }
  },[enabled,mapReady])

  const focusFeature=(feature:SparrowFeature)=>{
    setSelectedId(feature.id)
    mapRef.current?.flyTo({center:feature.coordinates,zoom:13.5,essential:true})
  }

  const launch=(path?:string)=>{
    if(!path)return
    const nav=(window as any).__tryammNavigate
    if(typeof nav==='function'){onClose();nav(path)}
  }

  return <div role="dialog" aria-modal="true" aria-label="TRYAMM Sparrow Map" style={{position:'fixed',inset:0,zIndex:10060,background:'#020711',color:'#fff',display:'grid',gridTemplateRows:'auto 1fr',fontFamily:'Inter,system-ui,sans-serif'}}>
    <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'12px 14px',borderBottom:'1px solid #193244',background:'linear-gradient(90deg,#07131f,#111022)'}}>
      <div>
        <div style={{fontSize:10,letterSpacing:2.5,fontWeight:900,color:'#4fe3ff'}}>TRYAMM • STREETVERSE</div>
        <div style={{fontSize:20,fontWeight:950}}>Sparrow Situational Map <span style={{fontSize:9,color:'#ffd15c',verticalAlign:'middle'}}>BETA</span></div>
      </div>
      <button type="button" aria-label="Close Sparrow Map" onClick={onClose} style={{width:44,height:44,borderRadius:'50%',border:'1px solid #365063',background:'#0b1722',color:'#fff',fontSize:22,cursor:'pointer'}}>×</button>
    </header>

    <div style={{minHeight:0,display:'grid',gridTemplateColumns:'minmax(0,1fr) min(360px,38vw)'}}>
      <section style={{position:'relative',minHeight:0}}>
        <div ref={containerRef} aria-label="Interactive Chicago Sparrow map" style={{position:'absolute',inset:0}} />
        <div style={{position:'absolute',left:12,top:12,zIndex:3,maxWidth:330,background:'#07121ee8',border:'1px solid #2b5369',borderRadius:14,padding:10,boxShadow:'0 12px 34px #0009'}}>
          <div style={{fontSize:10,fontWeight:900,color:'#75ffa1'}}>PRIVACY-FIRST MODE</div>
          <div style={{fontSize:11,lineHeight:1.45,color:'#c7d8e5',marginTop:4}}>Public, consented or simulated situational data only. No private-person tracking and no live law-enforcement or camera-avoidance feed.</div>
        </div>
      </section>

      <aside style={{minHeight:0,overflowY:'auto',padding:14,background:'#07101a',borderLeft:'1px solid #193244'}}>
        <div style={{fontSize:12,fontWeight:950,marginBottom:8}}>Map layers</div>
        <div style={{display:'grid',gap:7}}>
          {LAYERS.map(layer=><label key={layer.id} style={{display:'flex',alignItems:'center',gap:9,minHeight:44,padding:'8px 10px',border:'1px solid #193244',borderRadius:12,background:'#0a1621',cursor:'pointer'}}>
            <input type="checkbox" checked={enabled[layer.id]} onChange={event=>setEnabled(v=>({...v,[layer.id]:event.target.checked}))} />
            <span aria-hidden="true" style={{width:24,textAlign:'center',color:layerColor[layer.id],fontWeight:900}}>{layer.icon}</span>
            <span style={{fontSize:11,fontWeight:800}}>{layer.label}</span>
          </label>)}
        </div>

        <div style={{height:1,background:'#193244',margin:'14px 0'}} />
        <div style={{fontSize:12,fontWeight:950}}>Nearby / active intelligence</div>
        <div style={{fontSize:10,color:'#8195a6',marginTop:3}}>Current build uses safe simulation records until verified providers are connected.</div>
        <div style={{display:'grid',gap:8,marginTop:10}}>
          {FEATURES.filter(feature=>enabled[feature.kind]).map(feature=><button key={feature.id} type="button" onClick={()=>focusFeature(feature)} style={{minHeight:58,textAlign:'left',padding:10,border:selectedId===feature.id?'1px solid #4fe3ff':'1px solid #1d3343',borderRadius:12,background:selectedId===feature.id?'#0c2330':'#0a151f',color:'#fff',cursor:'pointer'}}>
            <div style={{display:'flex',justifyContent:'space-between',gap:8}}>
              <span style={{fontSize:11,fontWeight:900}}>{feature.label}</span>
              <span style={{fontSize:8,textTransform:'uppercase',color:feature.status==='simulation'?'#ffd15c':'#75ffa1'}}>{feature.status}</span>
            </div>
            <div style={{fontSize:9,color:'#8da1b2',marginTop:4}}>{LAYERS.find(x=>x.id===feature.kind)?.label}</div>
          </button>)}
        </div>

        {selected&&<div style={{marginTop:14,padding:12,border:'1px solid #2b5369',borderRadius:14,background:'#0a1823'}}>
          <div style={{fontSize:9,color:layerColor[selected.kind],fontWeight:950,textTransform:'uppercase'}}>{selected.kind}</div>
          <div style={{fontSize:15,fontWeight:950,marginTop:3}}>{selected.label}</div>
          <div style={{fontSize:11,lineHeight:1.5,color:'#b5c6d3',marginTop:6}}>{selected.detail}</div>
          {selected.actionPath&&<button type="button" onClick={()=>launch(selected.actionPath)} style={{width:'100%',minHeight:44,marginTop:10,border:'1px solid #4fe3ff88',borderRadius:10,background:'#0b2634',color:'#dffaff',fontWeight:900,cursor:'pointer'}}>OPEN IN TRYAMM</button>}
        </div>}

        <div style={{marginTop:14,padding:11,border:'1px solid #303c49',borderRadius:12,background:'#0a1017'}}>
          <div style={{fontSize:10,fontWeight:900,color:'#d7e2ea'}}>What Sparrow becomes when providers are verified</div>
          <div style={{fontSize:10,lineHeight:1.5,color:'#8395a4',marginTop:5}}>A shared context layer for missions, businesses, rides/delivery, environmental conditions, infrastructure status and verified public alerts. Each provider should be source-labeled, freshness-stamped and permission-scoped before it can appear as live.</div>
        </div>
      </aside>
    </div>
  </div>
}
