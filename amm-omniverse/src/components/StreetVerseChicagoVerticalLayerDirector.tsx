import {useEffect,useMemo,useState} from 'react'
import {STREETVERSE_CHICAGO_VERTICAL_LAYERS,type ChicagoVerticalLayerId} from '../config/streetverseChicagoVerticalLayers'

type LayerRequest={layerId?:ChicagoVerticalLayerId;connectorId?:string;source?:string;reason?:string}

export default function StreetVerseChicagoVerticalLayerDirector(){
 const [activeId,setActiveId]=useState<ChicagoVerticalLayerId>('street')
 const [lastConnector,setLastConnector]=useState('SURFACE SPAWN')
 const active=useMemo(()=>STREETVERSE_CHICAGO_VERTICAL_LAYERS.find(layer=>layer.id===activeId)??STREETVERSE_CHICAGO_VERTICAL_LAYERS[1],[activeId])

 const activate=(layerId:ChicagoVerticalLayerId,connectorId='VERTICAL PROTOTYPE',source='layer-hud')=>{
  const next=STREETVERSE_CHICAGO_VERTICAL_LAYERS.find(layer=>layer.id===layerId)
  if(!next)return
  setActiveId(layerId);setLastConnector(connectorId)
  const detail={layerId:next.id,label:next.label,order:next.order,connectorId,source,gameAbstraction:true,at:new Date().toISOString()}
  window.dispatchEvent(new CustomEvent('tryamm:chicago-layer-change',{detail}))
  window.dispatchEvent(new CustomEvent('tryamm:chicago-vertical-state',{detail:{...detail,transitions:next.transitions,mobility:next.mobility,gameplay:next.gameplay}}))
 }

 useEffect(()=>{
  const onRequest=(event:Event)=>{
   const detail=(event as CustomEvent<LayerRequest>).detail||{}
   if(!detail.layerId)return
   activate(detail.layerId,detail.connectorId||'WORLD CONNECTOR',detail.source||'world')
  }
  window.addEventListener('tryamm:chicago-layer-request',onRequest)
  window.dispatchEvent(new CustomEvent('tryamm:chicago-layer-ready',{detail:{layerId:'street',layers:STREETVERSE_CHICAGO_VERTICAL_LAYERS.map(({id,label,order})=>({id,label,order}))}}))
  return()=>window.removeEventListener('tryamm:chicago-layer-request',onRequest)
 },[])

 return <aside aria-label="Chicago vertical city layers" style={{position:'fixed',right:12,top:84,zIndex:16980,width:250,padding:10,borderRadius:14,background:'rgba(3,10,18,.9)',border:'1px solid #62b8ff66',color:'#fff',fontFamily:'system-ui',boxShadow:'0 12px 38px #0008'}}>
  <div style={{fontSize:9,fontWeight:950,letterSpacing:1.4,color:'#8bd8ff'}}>CHICAGO VERTICAL CITY • 5 LAYERS</div>
  <div style={{marginTop:5,fontWeight:950}}>{active.order} • {active.label}</div>
  <div style={{fontSize:9,opacity:.7,marginTop:3}}>CONNECTOR • {lastConnector}</div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:4,marginTop:8}}>
   {[...STREETVERSE_CHICAGO_VERTICAL_LAYERS].sort((a,b)=>b.order-a.order).map(layer=><button key={layer.id} aria-label={`Switch Chicago layer to ${layer.label}`} onClick={()=>activate(layer.id,`PROTOTYPE CONNECTOR ${layer.order}`)} style={{minHeight:38,borderRadius:8,border:`1px solid ${layer.id===active.id?'#8bd8ff':'#314c61'}`,background:layer.id===active.id?'#12344a':'#07131e',color:'#fff',fontSize:10,fontWeight:900}}>{layer.order}</button>)}
  </div>
  <div style={{fontSize:9,lineHeight:1.35,opacity:.78,marginTop:7}}>{active.gameplay.slice(0,3).join(' • ')}</div>
 </aside>
}
