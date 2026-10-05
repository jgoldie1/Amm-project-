import {useEffect,useState} from 'react'

type ModRow={
  id:string
  name:string
  version:string
  enabled:boolean
  scopes:string[]
}

type ModApi={
  list:()=>Array<{manifest:{id:string;name:string;version:string;scopes:string[];arPlacements?:Array<{id:string;label?:string}>};enabled:boolean}>
  enable:(id:string,enabled:boolean)=>boolean
  exportTo:(id:string,adapterId:string)=>Promise<Record<string,unknown>>
  placeAR:(modId:string,placementId:string)=>boolean
}

export default function ModPassCenter(){
  const [open,setOpen]=useState(false)
  const [mods,setMods]=useState<ModRow[]>([])
  const [placements,setPlacements]=useState<Record<string,Array<{id:string;label?:string}>>>({})
  const [note,setNote]=useState('')

  const refresh=()=>{
    const api=(window as typeof window&{__TRYAMM_MOD_PASS__?:ModApi}).__TRYAMM_MOD_PASS__
    if(!api){setMods([]);setPlacements({});return}
    const rows=api.list()
    setMods(rows.map(x=>({
      id:x.manifest.id,
      name:x.manifest.name,
      version:x.manifest.version,
      enabled:x.enabled,
      scopes:x.manifest.scopes,
    })))
    setPlacements(Object.fromEntries(rows.map(x=>[x.manifest.id,x.manifest.arPlacements||[]])))
  }

  useEffect(()=>{
    const onOpen=()=>{setOpen(true);refresh()}
    const onState=()=>refresh()
    addEventListener('tryamm:mod-pass-open',onOpen)
    addEventListener('tryamm:mod-pass-state',onState)
    refresh()
    return()=>{
      removeEventListener('tryamm:mod-pass-open',onOpen)
      removeEventListener('tryamm:mod-pass-state',onState)
    }
  },[])

  const toggle=(id:string,enabled:boolean)=>{
    const api=(window as typeof window&{__TRYAMM_MOD_PASS__?:ModApi}).__TRYAMM_MOD_PASS__
    if(!api)return
    api.enable(id,enabled)
    refresh()
  }

  const exportMod=async(id:string,adapterId:string)=>{
    const api=(window as typeof window&{__TRYAMM_MOD_PASS__?:ModApi}).__TRYAMM_MOD_PASS__
    if(!api)return
    try{
      await api.exportTo(id,adapterId)
      setNote(adapterId==='webxr-ar'?'AR package ready.':'CrossVerse package ready.')
    }catch(error){
      setNote(error instanceof Error?error.message:'Export failed.')
    }
  }

  const place=(modId:string,placementId:string)=>{
    const api=(window as typeof window&{__TRYAMM_MOD_PASS__?:ModApi}).__TRYAMM_MOD_PASS__
    if(!api)return
    const ok=api.placeAR(modId,placementId)
    setNote(ok?'AR placement sent to Holo/XR.':'AR placement unavailable.')
  }

  if(!open)return null
  return <div role="dialog" aria-modal="true" aria-label="TRYAMM Mod Pass" style={backdrop}>
    <section style={panel}>
      <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center'}}>
        <div>
          <div style={{fontSize:10,letterSpacing:2,color:'#8cecff',fontWeight:950}}>CROSSVERSE</div>
          <h2 style={{margin:'3px 0'}}>MOD PASS</h2>
          <div style={{fontSize:10,color:'#b6c6d0'}}>Sandboxed mods • no executable injection • AR/Holo ready</div>
        </div>
        <button aria-label="Close Mod Pass" onClick={()=>setOpen(false)} style={button}>×</button>
      </div>
      <div style={{marginTop:10,display:'grid',gap:8}}>
        {mods.length===0&&<div style={card}>No Mod Pass packages installed yet.</div>}
        {mods.map(mod=><article key={mod.id} style={card}>
          <div style={{display:'flex',justifyContent:'space-between',gap:8}}>
            <div><b>{mod.name}</b><div style={{fontSize:9,opacity:.65}}>{mod.id} • v{mod.version}</div></div>
            <button onClick={()=>toggle(mod.id,!mod.enabled)} style={{...button,minWidth:74,borderColor:mod.enabled?'#7dffad88':'#52606a'}}>{mod.enabled?'ON':'OFF'}</button>
          </div>
          <div style={{fontSize:9,color:'#99bfd5',marginTop:6}}>{mod.scopes.join(' • ')}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:8}}>
            <button disabled={!mod.enabled} onClick={()=>void exportMod(mod.id,'tryamm-native')} style={button}>CROSSVERSE</button>
            <button disabled={!mod.enabled} onClick={()=>void exportMod(mod.id,'webxr-ar')} style={button}>AR PACKAGE</button>
          </div>
          {mod.enabled&&(placements[mod.id]?.length||0)>0&&<div style={{marginTop:8,display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:5}}>
            {placements[mod.id].map(p=><button key={p.id} onClick={()=>place(mod.id,p.id)} style={{...button,minHeight:38,fontSize:9}}>AR • {p.label||p.id}</button>)}
          </div>}
        </article>)}
      </div>
      {note&&<div aria-live="polite" style={{marginTop:9,fontSize:10,color:'#9effbf'}}>{note}</div>}
      <div style={{marginTop:9,fontSize:9,lineHeight:1.4,color:'#8e9da6'}}>
        External games require an official mod/UGC adapter from that game or platform. Mod Pass does not use cheat injection or bypass another game's protections.
      </div>
    </section>
  </div>
}

const backdrop:React.CSSProperties={position:'fixed',inset:0,zIndex:49000,display:'grid',placeItems:'center',padding:12,background:'rgba(2,7,12,.88)',backdropFilter:'blur(5px)'}
const panel:React.CSSProperties={width:'min(94vw,520px)',maxHeight:'88dvh',overflowY:'auto',padding:14,borderRadius:18,border:'1px solid #6eeaff77',background:'#071018f8',color:'#fff',fontFamily:'system-ui,sans-serif',boxShadow:'0 22px 80px #000e'}
const card:React.CSSProperties={padding:10,border:'1px solid #2c5268',borderRadius:13,background:'#091923'}
const button:React.CSSProperties={minHeight:42,padding:'7px 10px',borderRadius:10,border:'1px solid #49a8d688',background:'#0b202d',color:'#fff',fontWeight:900,touchAction:'manipulation'}
