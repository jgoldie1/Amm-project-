import { useEffect, useMemo, useState } from 'react'
import {
  CHICAGO_CIVIC_SOURCES,
  JUSTICE_PIPELINE,
  fetchChicagoActiveBusinesses,
  type BusinessLicenseRecord,
  type EncounterStage,
} from '../game/civic/ChicagoCivicSimulation'

const stages: EncounterStage[] = ['observed','stop','citation','arrest','pretrial','court','county-jail','state-corrections','federal-referral','federal-custody','released']

export default function ChicagoCivicCenter({ onClose }: { onClose: () => void }) {
  const [businesses, setBusinesses] = useState<BusinessLicenseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [district, setDistrict] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    fetchChicagoActiveBusinesses({ limit: 250, policeDistrict: district ? Number(district) : undefined, signal: controller.signal })
      .then(rows => { setBusinesses(rows); setError(null) })
      .catch(err => { if (err?.name !== 'AbortError') setError(String(err?.message ?? err)) })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [district])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return businesses
    return businesses.filter(b => [b.doingBusinessAs,b.legalName,b.licenseDescription,b.address].some(v => v?.toLowerCase().includes(q)))
  }, [businesses, query])

  return (
    <div role="dialog" aria-modal="true" aria-label="StreetVerse Chicago Civic Center" style={{position:'fixed',inset:0,zIndex:10060,overflowY:'auto',background:'radial-gradient(circle at top,#10263a,#050914 58%,#02030a)',color:'#fff',padding:18}}>
      <div style={{maxWidth:1180,margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
          <div><div style={{color:'#4fe3ff',fontSize:10,fontWeight:900,letterSpacing:3}}>STREETVERSE • CHICAGO EDITION</div><h1 style={{margin:'8px 0'}}>Civic + Justice + Business Simulation</h1></div>
          <button onClick={onClose} aria-label="Close Chicago Civic Center" style={{width:44,height:44,borderRadius:'50%',background:'#0c1620',color:'#fff',border:'1px solid #4fe3ff66'}}>×</button>
        </div>

        <div style={{padding:14,border:'1px solid #e8b94466',borderRadius:14,background:'#20180066',marginBottom:16}}>
          <strong>Simulation boundary:</strong> police may observe, stop, cite or arrest inside gameplay; courts determine court outcomes, and county/state/federal custody routes are separate. Real law/reference feeds inform the world but do not make real legal determinations about a player or real person.
        </div>

        <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:8}}>
          {stages.map(stage => <div key={stage} style={{border:'1px solid #1f3448',borderRadius:12,padding:10,background:'#08111b'}}><strong style={{fontSize:11}}>{stage.toUpperCase()}</strong><div style={{fontSize:9,color:'#8da3b8',marginTop:6}}>Next: {JUSTICE_PIPELINE[stage].join(' • ')}</div></div>)}
        </section>

        <section style={{marginTop:22,border:'1px solid #1f3448',borderRadius:16,padding:14,background:'#07101a'}}>
          <h2 style={{marginTop:0}}>Chicago Business Registry</h2>
          <p style={{color:'#9fb2c5'}}>Pulls current active City business-license records for world population. A license record is reference data, not an endorsement or guarantee that a location is open right now.</p>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <input aria-label="Search loaded businesses" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name, type, address" style={{minHeight:42,minWidth:260}} />
            <input aria-label="Police district filter" value={district} onChange={e=>setDistrict(e.target.value.replace(/\D/g,''))} placeholder="Police district" inputMode="numeric" style={{minHeight:42,width:140}} />
          </div>
          <div aria-live="polite" style={{fontSize:11,color:'#8da3b8',margin:'10px 0'}}>{loading ? 'Loading current City license feed…' : error ? `Feed unavailable: ${error}` : `${filtered.length} loaded records`}</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:8}}>
            {filtered.slice(0,24).map((business, index) => <article key={`${business.licenseId ?? index}-${business.licenseNumber ?? ''}`} style={{border:'1px solid #1b2b3b',borderRadius:12,padding:10,background:'#0a121d'}}>
              <strong>{business.doingBusinessAs || business.legalName || 'Licensed business'}</strong>
              <div style={{fontSize:10,color:'#4fe3ff',marginTop:4}}>{business.licenseDescription || 'License type unavailable'}</div>
              <div style={{fontSize:10,color:'#8da3b8',marginTop:4}}>{business.address || 'Address unavailable'} {business.zip || ''}</div>
              <div style={{fontSize:9,color:'#66798c',marginTop:4}}>District {business.policeDistrict || '—'} • Ward {business.ward || '—'}</div>
            </article>)}
          </div>
        </section>

        <section style={{marginTop:22}}>
          <h2>Official-source adapters</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:8}}>
            {Object.entries(CHICAGO_CIVIC_SOURCES).map(([name,url]) => <a key={name} href={url} target="_blank" rel="noreferrer" style={{display:'block',padding:10,border:'1px solid #1f3448',borderRadius:10,color:'#b9dfff',textDecoration:'none'}}>{name}</a>)}
          </div>
        </section>
      </div>
    </div>
  )
}
