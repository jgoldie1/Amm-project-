import {useEffect,useState} from 'react'

type Mode='immersive-ar'|'immersive-vr'
type XRDevice={isSessionSupported:(mode:Mode)=>Promise<boolean>}
type Availability={ar:boolean;vr:boolean;checked:boolean}
const DESTINATIONS=[
  {id:'streetverse',label:'Enter StreetVerse',path:'/streetverse'},
  {id:'campusverse',label:'CampusVerse',path:'/campusverse'},
  {id:'live',label:'Watch LIVE',path:'/live'},
  {id:'network',label:'All American Network',path:'/network'},
] as const

export default function CrossVerseXRPortal(){
  const [xr,setXr]=useState<Availability>({ar:false,vr:false,checked:false})
  const [destination,setDestination]=useState<(typeof DESTINATIONS)[number]['id']>('streetverse')
  useEffect(()=>{
    let live=true
    async function check(){
      const nav=navigator as Navigator&{xr?:XRDevice}
      if(!window.isSecureContext||!nav.xr){if(live)setXr({ar:false,vr:false,checked:true});return}
      const [ar,vr]=await Promise.allSettled([
        nav.xr.isSessionSupported('immersive-ar'),
        nav.xr.isSessionSupported('immersive-vr'),
      ])
      if(live)setXr({ar:ar.status==='fulfilled'&&ar.value,vr:vr.status==='fulfilled'&&vr.value,checked:true})
    }
    void check()
    return()=>{live=false}
  },[])
  const chosen=DESTINATIONS.find(x=>x.id===destination)||DESTINATIONS[0]
  const btn:React.CSSProperties={minHeight:48,borderRadius:12,padding:'10px 16px',background:'#17475a',border:'1px solid #58b6d1',color:'#fff',fontWeight:800}
  function copy(){
    const link=new URL(chosen.path,window.location.origin).href
    void navigator.clipboard.writeText(link)
  }
  return <section aria-label="CrossVerse AR VR mixed reality portal" style={{marginTop:14,padding:16,border:'1px solid #244156',borderRadius:18,background:'#07111bd9'}}>
    <h2 style={{margin:'0 0 8px'}}>CROSSVERSE AR / VR / MIXED REALITY</h2>
    <p style={{fontSize:13,color:'#b9cbd6'}}>Launch worlds in a normal browser now. Immersive XR needs a compatible browser, headset, 3D renderer and a user-initiated XR session.</p>
    <p role="status" style={{fontSize:13,color:'#f0c68a'}}>
      {xr.checked?(xr.ar?'AR device capable':'AR unavailable')+' · '+(xr.vr?'VR device capable':'VR unavailable'):'Checking XR device capabilities…'}
    </p>
    <label style={{display:'block',marginBottom:12}}>World or broadcast destination
      <select value={destination} onChange={e=>setDestination(e.target.value as typeof destination)} style={{display:'block',marginTop:8,minHeight:48,padding:10,borderRadius:10,maxWidth:'100%'}}>
        {DESTINATIONS.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}
      </select>
    </label>
    <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
      <a href={chosen.path} style={{...btn,display:'inline-flex',alignItems:'center',textDecoration:'none'}}>OPEN {chosen.label.toUpperCase()}</a>
      <button type="button" onClick={copy} style={btn}>COPY CROSSVERSE LINK</button>
    </div>
    <p style={{fontSize:12,color:'#a9bccc'}}>This portal preserves a first-party destination link. It does not claim playable VR/AR, headset passthrough, volumetric streams or synchronized multiplayer until tested.</p>
  </section>
}
