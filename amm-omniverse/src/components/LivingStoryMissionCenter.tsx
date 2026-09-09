import { useMemo, useState } from 'react'
import { bigBosses, livingStoryMissionCatalog, musicCompanies, type TryammWorld } from '../data/livingStoryMissionCatalog'

const worldLabels: Record<TryammWorld,string> = {
  'streetverse':'StreetVerse',
  'we-are-the-world':'We Are the World',
  'starverse':'StarVerse',
}

export default function LivingStoryMissionCenter({onClose}:{onClose:()=>void}) {
  const [world,setWorld] = useState<TryammWorld>('streetverse')
  const missions = useMemo(()=>livingStoryMissionCatalog.filter(m=>m.worlds.includes(world)),[world])

  return <div role="dialog" aria-modal="true" aria-label="Living Story Mission Center" style={{position:'fixed',inset:0,zIndex:10080,background:'rgba(1,4,12,.96)',color:'#fff',overflowY:'auto',fontFamily:'system-ui,sans-serif'}}>
    <div style={{maxWidth:980,margin:'0 auto',padding:'28px 16px 64px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16,marginBottom:18}}>
        <div>
          <div style={{fontSize:11,letterSpacing:3,color:'#77e9ff',fontWeight:900}}>TRYAMM LIVING STORY ENGINE</div>
          <h1 style={{fontSize:'clamp(26px,5vw,46px)',margin:'6px 0 8px'}}>Chicago Stories → Global Empire</h1>
          <div style={{color:'#a9b7c7',lineHeight:1.55,maxWidth:760}}>Original rescue, investigation, neighborhood, artist, entertainment and Big Boss mission arcs spanning StreetVerse, StarVerse and We Are the World.</div>
        </div>
        <button onClick={onClose} aria-label="Close Living Story Mission Center" style={{width:42,height:42,borderRadius:'50%',border:'1px solid #33445a',background:'#0b1420',color:'#fff',fontSize:22,cursor:'pointer'}}>×</button>
      </div>

      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20}}>
        {(Object.keys(worldLabels) as TryammWorld[]).map(key=><button key={key} onClick={()=>setWorld(key)} style={{border:world===key?'1px solid #77e9ff':'1px solid #27364a',background:world===key?'#112b35':'#0a101a',color:world===key?'#dffbff':'#afbdcc',borderRadius:999,padding:'10px 14px',fontWeight:850,cursor:'pointer'}}>{worldLabels[key]}</button>)}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12}}>
        {missions.map(m=><article key={m.id} style={{border:'1px solid #233449',borderRadius:18,padding:16,background:'linear-gradient(160deg,#0b1420,#080b12)'}}>
          <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center'}}><span style={{fontSize:10,textTransform:'uppercase',letterSpacing:1.5,color:'#7bdff2',fontWeight:900}}>{m.lane.replace(/-/g,' ')}</span><span style={{fontSize:9,fontWeight:950,color:m.status==='building'?'#ffd166':'#9ca7b7'}}>{m.status.toUpperCase()}</span></div>
          <h2 style={{fontSize:20,margin:'10px 0 8px'}}>{m.title}</h2>
          <p style={{color:'#b7c3d2',lineHeight:1.5,fontSize:13,margin:0}}>{m.summary}</p>
          <div style={{marginTop:12,fontSize:11,color:'#8393a7'}}>Unlocks: {m.unlocks.join(' • ')}</div>
          {m.monetization?.length ? <div style={{marginTop:9,fontSize:11,color:'#7fe3b1'}}>Revenue: {m.monetization.join(' • ')}</div> : null}
        </article>)}
      </div>

      <section style={{marginTop:22,border:'1px solid #493d22',borderRadius:18,padding:16,background:'#131006'}}>
        <div style={{fontSize:10,color:'#f6c85f',fontWeight:950,letterSpacing:2}}>MUSIC EMPIRE</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12,marginTop:10}}>
          {Object.values(musicCompanies).map(company=><div key={company.id}><div style={{fontSize:18,fontWeight:950}}>{company.name}</div><div style={{fontSize:12,color:'#c8b98f',lineHeight:1.5,marginTop:5}}>{company.role}</div></div>)}
        </div>
      </section>

      <section style={{marginTop:14,border:'1px solid #32265b',borderRadius:18,padding:16,background:'#0c0818'}}>
        <div style={{fontSize:10,color:'#b89cff',fontWeight:950,letterSpacing:2}}>BIG BOSS NETWORK</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:10,marginTop:10}}>{bigBosses.map(b=><div key={b.id} style={{padding:12,borderRadius:12,background:'#100d20'}}><div style={{fontWeight:900}}>{b.title}</div><div style={{fontSize:11,color:'#aaa1c6',marginTop:4,lineHeight:1.45}}>{b.domain}</div></div>)}</div>
      </section>

      <div style={{marginTop:18,fontSize:11,color:'#77869a',lineHeight:1.55}}>Release rule: mission records are not LIVE until gameplay logic, rights review, build/test, deployment and public verification pass. Real artists, voices, songs and likenesses require documented rights or consent.</div>
    </div>
  </div>
}
