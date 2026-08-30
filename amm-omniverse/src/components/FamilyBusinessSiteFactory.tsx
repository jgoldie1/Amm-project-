import { useMemo, useState } from 'react'
import { FAMILY_BUSINESS_REGISTRY, buildSiteBlueprint } from '../data/familyBusinessRegistry'

export default function FamilyBusinessSiteFactory(){
  const [open,setOpen]=useState(false)
  const [selected,setSelected]=useState(FAMILY_BUSINESS_REGISTRY[0]?.id||'')
  const profile=useMemo(()=>FAMILY_BUSINESS_REGISTRY.find(x=>x.id===selected)||FAMILY_BUSINESS_REGISTRY[0],[selected])
  if(!profile)return null
  const blueprint=buildSiteBlueprint(profile)
  const launch=()=>{
    window.dispatchEvent(new CustomEvent('tryamm:ai-website-business-builder-open',{detail:{profile,blueprint}}))
    ;(window as any).__showAIWebsiteBusinessBuilder?.({profile,blueprint})
  }
  return <>
    <button type="button" onClick={()=>setOpen(true)} style={{position:'fixed',right:12,bottom:174,zIndex:9001,background:'#102315',color:'#9dffb2',border:'1px solid #9dffb255',borderRadius:999,padding:'10px 14px',fontSize:10,fontWeight:900,cursor:'pointer'}}>FAMILY BUSINESS SITES</button>
    {open&&<div style={{position:'fixed',inset:0,zIndex:10060,background:'#03070bcc',backdropFilter:'blur(10px)',overflow:'auto',color:'#fff'}}>
      <div style={{maxWidth:1000,margin:'30px auto',padding:18}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><div><div style={{fontSize:11,letterSpacing:2,color:'#9dffb2',fontWeight:900}}>TRYAMM SITE FACTORY</div><h2 style={{margin:'4px 0'}}>Friends & Family Business Websites</h2><div style={{color:'#9fb0bf'}}>Registry → blueprint → AI website builder → provider gates → domain → verified live site.</div></div><button onClick={()=>setOpen(false)} style={{borderRadius:999,width:40,height:40,background:'#101923',color:'#fff',border:'1px solid #31404f'}}>×</button></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:10,marginTop:16}}>{FAMILY_BUSINESS_REGISTRY.map(x=><button key={x.id} onClick={()=>setSelected(x.id)} style={{textAlign:'left',padding:14,borderRadius:14,border:selected===x.id?'1px solid #9dffb2':'1px solid #263747',background:selected===x.id?'#102315':'#09111a',color:'#fff'}}><div style={{fontWeight:950}}>{x.owner}</div><div style={{fontSize:12,color:'#9fb0bf',marginTop:4}}>{x.ventures.join(' • ')}</div><div style={{fontSize:10,color:'#e8b944',marginTop:8}}>{x.status.toUpperCase()}</div></button>)}</div>
        <div style={{marginTop:16,padding:16,borderRadius:16,border:'1px solid #263747',background:'#07101a'}}><h3 style={{marginTop:0}}>{blueprint.title}</h3><div style={{color:'#9fb0bf'}}>Region: {profile.region}</div><div style={{marginTop:10,fontSize:12}}>Modules: {blueprint.modules.join(' • ')}</div><div style={{marginTop:8,fontSize:12,color:'#9dffb2'}}>Pipeline: {blueprint.pipeline.join(' → ')}</div><div style={{marginTop:12,color:'#ffd98a',fontSize:12}}>Status is registry-only until domain, provider credentials, payments and public verification are complete.</div><button onClick={launch} style={{marginTop:14,padding:'11px 14px',borderRadius:10,border:'1px solid #4fe3ff66',background:'#103249',color:'#fff',fontWeight:900}}>OPEN IN AI WEBSITE BUILDER</button></div>
      </div>
    </div>}
  </>
}
