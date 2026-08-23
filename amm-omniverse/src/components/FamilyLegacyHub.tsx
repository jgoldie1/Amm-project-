import { useEffect, useState } from 'react'
import JacobieVisionCenter from './JacobieVisionCenter'
import {
  createAniyahAudio,
  createJacobieCyber,
  createJacobieRealEstate,
  getAniyahAudio,
  getAniyahCrossborder,
  getFamilyPlugins,
  getJacobieCyber,
  getJacobieRealEstate,
  getStarverseLink,
} from '../services/familyVentures'

type Props = { onClose: () => void }

export default function FamilyLegacyHub({ onClose }: Props) {
  const [plugins, setPlugins] = useState<any[]>([])
  const [cyber, setCyber] = useState<any[]>([])
  const [realEstate, setRealEstate] = useState<any[]>([])
  const [audio, setAudio] = useState<any[]>([])
  const [starverse, setStarverse] = useState<any>(null)
  const [crossborder, setCrossborder] = useState<any>(null)
  const [status, setStatus] = useState('Loading family ventures…')
  const [showJacobieVision, setShowJacobieVision] = useState(false)

  async function refresh() {
    try {
      const [p, c, r, a, s, x] = await Promise.all([
        getFamilyPlugins(), getJacobieCyber(), getJacobieRealEstate(), getAniyahAudio(), getStarverseLink(), getAniyahCrossborder(),
      ])
      setPlugins(p.plugins || [])
      setCyber(c.projects || [])
      setRealEstate(r.projects || [])
      setAudio(a.projects || [])
      setStarverse(s)
      setCrossborder(x)
      setStatus('Connected')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to load')
    }
  }

  useEffect(() => { refresh() }, [])

  if (showJacobieVision) return <JacobieVisionCenter onClose={() => setShowJacobieVision(false)} />

  const card: React.CSSProperties = { background:'#0b1324', border:'1px solid #28486a', borderRadius:16, padding:16, minHeight:180 }
  const action: React.CSSProperties = { border:'1px solid #76d7ff88', background:'#10283a', color:'#e9fbff', borderRadius:10, padding:'8px 10px', cursor:'pointer', fontWeight:800 }

  return (
    <div style={{position:'fixed',inset:0,zIndex:10020,background:'#020711',color:'#fff',overflow:'auto',padding:24,fontFamily:'system-ui,sans-serif'}}>
      <div style={{maxWidth:1180,margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'center'}}>
          <div><div style={{color:'#ffd166',fontWeight:900,letterSpacing:1}}>FAMILY LEGACY SYSTEMS</div><h1 style={{margin:'4px 0'}}>Jacobie • Isaiah • Aniyah</h1><p style={{color:'#a9bdd4'}}>Cybersecurity, real estate, Starverse/AI TV, 64-track music production, plugins and compliant cross-border payment architecture.</p></div>
          <button onClick={onClose} style={action}>Close</button>
        </div>
        <div style={{padding:'10px 12px',background:'#071a28',borderLeft:'4px solid #54e0b4',margin:'16px 0'}}>{status}</div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:14}}>
          <section style={card}>
            <h2>Jacobie Vision Cybersecurity</h2>
            <p>Defensive security audits, threat models, training labs, privacy reviews, compliance readiness and cyber-range simulations.</p>
            <p>{cyber.length} project(s)</p>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button style={action} onClick={()=>setShowJacobieVision(true)}>Open Jacobie Vision</button>
              <button style={action} onClick={async()=>{await createJacobieCyber('New Cybersecurity Lab'); await refresh()}}>Create Cyber Lab</button>
            </div>
          </section>

          <section style={card}>
            <h2>Jacobie Vision Real Estate</h2>
            <p>Land, home flipping, rentals and development analysis with purchase/rehab/ARV/carrying-cost and due-diligence models.</p>
            <p>{realEstate.length} project(s)</p>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button style={action} onClick={()=>setShowJacobieVision(true)}>Open Team + Training</button>
              <button style={action} onClick={async()=>{await createJacobieRealEstate('New Property Analysis'); await refresh()}}>Create Flip Analysis</button>
            </div>
          </section>

          <section style={card}>
            <h2>Isaiah AI TV / Starverse</h2>
            <p><strong>Anyone Can Be A Star.</strong> Auditions, showcases, fan voting, films, TV, talent development and youth-guardian protections reuse the existing Starverse application.</p>
            <p>{starverse?.link ? 'Profile linked' : 'Ready for profile linking'}</p>
            <div style={{color:'#8fdcff'}}>Existing app: {starverse?.app || 'isaiah-starverse'}</div>
          </section>

          <section style={card}>
            <h2>Aniyah 64-Track Studio</h2>
            <p>64-track DAW project model with pitch correction, vocal coaching, mix/master assistance and universal DAW export.</p>
            <p>{audio.length} project(s)</p>
            <button style={action} onClick={async()=>{await createAniyahAudio('New 64-Track Session'); await refresh()}}>Create Session</button>
          </section>

          <section style={card}>
            <h2>Aniyah Cross-Border Pay</h2>
            <p>Provider-neutral quote/transfer architecture with KYC/AML/sanctions and human confirmation gates before real funds move.</p>
            <p>{crossborder?.liveTransfersEnabled ? 'Live transfers enabled' : 'Simulation/adapter stage'}</p>
            <small style={{color:'#a9bdd4'}}>{crossborder?.reason}</small>
          </section>

          <section style={card}>
            <h2>Music + Platform Plugins</h2>
            <p>Ableton Link/export, Pro Tools/AAX bridge, FL Studio, Korg MIDI/MIDI 2.0, VST3/AU/AAX native bridges, Bandcamp, vocal coach, pitch and mix/master tools.</p>
            <p>{plugins.length} approved/sandbox plugin(s)</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{plugins.slice(0,12).map(p=><span key={p.plugin_key} style={{fontSize:11,border:'1px solid #365a72',borderRadius:999,padding:'4px 7px'}}>{p.name}</span>)}</div>
          </section>
        </div>
      </div>
    </div>
  )
}
