import {useEffect,useMemo,useState} from 'react'
import {STREETVERSE_DOJO_BUSINESS_MODEL} from '../config/streetverseDojoEconomy'
import {readDojoState,type DojoState} from '../runtime/StreetVerseDojoBusinessRuntime'

export default function StreetVerseDojoBusinessCenter(){
  const [open,setOpen]=useState(false)
  const [state,setState]=useState<DojoState>(()=>readDojoState())
  const [name,setName]=useState(state.name)
  const [affiliation,setAffiliation]=useState<DojoState['affiliation']>(state.affiliation)
  useEffect(()=>{
    const refresh=(e:Event)=>setState((e as CustomEvent<DojoState>).detail||readDojoState())
    const show=()=>setOpen(true)
    window.addEventListener('tryamm:dojo-business-state',refresh)
    window.addEventListener('tryamm:open-dojo-business',show)
    return()=>{window.removeEventListener('tryamm:dojo-business-state',refresh);window.removeEventListener('tryamm:open-dojo-business',show)}
  },[])
  const level=useMemo(()=>[...STREETVERSE_DOJO_BUSINESS_MODEL.progression.levels].reverse().find(x=>state.reputation>=x.rep)||STREETVERSE_DOJO_BUSINESS_MODEL.progression.levels[0],[state.reputation])
  const create=()=>window.dispatchEvent(new CustomEvent('tryamm:dojo-create',{detail:{name,affiliation}}))
  const operate=(operation:string)=>window.dispatchEvent(new CustomEvent('tryamm:dojo-operation',{detail:{operation}}))
  if(!open)return <button aria-label="Open dojo business" onClick={()=>setOpen(true)} style={{position:'fixed',right:68,bottom:340,zIndex:17025,width:48,height:48,borderRadius:'50%',border:'1px solid #7fe8c788',background:'#071914ef',color:'#fff',fontWeight:950}}>🏯</button>
  return <div role="dialog" aria-label="StreetVerse dojo business center" style={{position:'fixed',inset:'6vh 3vw',zIndex:17350,overflow:'auto',background:'#050806f8',border:'1px solid #436252',borderRadius:20,color:'#fff',padding:16}}>
    <header style={{display:'flex',justifyContent:'space-between',gap:12}}><div><div style={{fontSize:10,color:'#8df2a6',fontWeight:950,letterSpacing:2}}>STREETVERSE • DOJO BUSINESS OS</div><h2 style={{margin:'5px 0'}}>{state.created?state.name:'Create Your Chicago Dojo'}</h2><div style={{fontSize:11,opacity:.68}}>RP business • martial progression • mentor bonds • Time Machine heritage</div></div><button onClick={()=>setOpen(false)} style={{width:46,height:46,borderRadius:12}}>×</button></header>
    {!state.created?<section style={{display:'grid',gap:9,maxWidth:620,marginTop:18}}>
      <input aria-label="Dojo name" value={name} onChange={e=>setName(e.target.value)} maxLength={60} style={{minHeight:52,borderRadius:12,padding:'0 12px',fontSize:16}} />
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:8}}>{STREETVERSE_DOJO_BUSINESS_MODEL.affiliations.map(a=><button key={a.id} onClick={()=>setAffiliation(a.id)} style={{minHeight:80,borderRadius:13,border:`1px solid ${affiliation===a.id?'#8df2a6':'#385043'}`,background:'#0b160f',color:'#fff',textAlign:'left',padding:10}}><b>{a.label}</b><div style={{fontSize:9,opacity:.65,marginTop:4}}>{a.historyLabel}</div></button>)}</div>
      <button onClick={create} style={{minHeight:56,borderRadius:14,border:'1px solid #8df2a6',background:'#12371d',color:'#fff',fontWeight:950}}>OPEN DOJO</button>
    </section>:<>
      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:8,marginTop:16}}>
        <div style={card}><b>{level.label}</b><small>LEVEL {level.level}</small></div>
        <div style={card}><b>{state.reputation}</b><small>REPUTATION</small></div>
        <div style={card}><b>{state.students}</b><small>STUDENTS</small></div>
        <div style={card}><b>{state.tournamentWins}/{state.tournaments}</b><small>TOURNAMENT WINS</small></div>
        <div style={card}><b>{state.heritage}</b><small>HISTORY / HERITAGE</small></div>
        <div style={card}><b>{state.communityTrust}</b><small>COMMUNITY TRUST</small></div>
      </section>
      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:8,marginTop:14}}>
        {STREETVERSE_DOJO_BUSINESS_MODEL.operations.map(op=><button key={op.id} onClick={()=>operate(op.id)} style={{minHeight:82,borderRadius:14,border:'1px solid #456c56',background:'#0a1710',color:'#fff',textAlign:'left',padding:11}}><b>{op.label}</b><div style={{fontSize:9,opacity:.65,marginTop:5}}>{op.effect}</div></button>)}
      </section>
      <section style={{marginTop:14,padding:12,border:'1px solid #3b5245',borderRadius:14}}>
        <b>MENTOR / COMMUNITY BONDS</b>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:7,marginTop:8}}>{Object.entries(state.mentorBonds).map(([k,v])=><div key={k} style={{padding:9,borderRadius:10,background:'#0b130e'}}>{k.toUpperCase()}<br/><b>{v}%</b></div>)}</div>
      </section>
      <div style={{fontSize:9,opacity:.55,marginTop:12}}>Prototype dojo economy uses game-state/Holo Credits only. Any future real-money creator or tournament payout must be verified server-side.</div>
    </>}
  </div>
}
const card:React.CSSProperties={display:'grid',gap:5,padding:12,border:'1px solid #35483d',borderRadius:13,background:'#09110c'}
