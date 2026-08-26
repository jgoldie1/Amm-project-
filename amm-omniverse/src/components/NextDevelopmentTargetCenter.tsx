import React from 'react'

type Props = { onClose: () => void }

type Target = {
  title: string
  status: 'READY' | 'BUILD' | 'VERIFY' | 'EXTERNAL'
  purpose: string
  needs: string[]
}

const targets: Target[] = [
  {
    title: 'Construct Engine v0.1',
    status: 'BUILD',
    purpose: 'Turn text/voice intent into a digital construct request, validate it, generate a scene description, and route it to supported display/robotics adapters.',
    needs: ['Intent schema', 'Construct registry', 'Physics/safety gate', 'Device adapter interface', 'Telemetry contract'],
  },
  {
    title: 'BMO-class Desktop Prototype',
    status: 'EXTERNAL',
    purpose: 'Physical companion reference design for voice, vision, display, motion, sensors and HoloGPT/Stubbs AI integration.',
    needs: ['Mini computer', 'Display', 'Camera/mic/speaker', 'Battery/power', 'Microcontroller + sensors', 'Enclosure + motors'],
  },
  {
    title: 'Room-scale Construct Demonstration',
    status: 'EXTERNAL',
    purpose: 'Combine projection/AR, haptics and controlled robotics into a room-scale interactive construct experience.',
    needs: ['Projection or XR display', 'Tracking', 'Haptics', 'Safety boundary', 'Construct Engine device adapters'],
  },
  {
    title: 'Automan-class Low-speed Vehicle',
    status: 'EXTERNAL',
    purpose: 'Controlled-environment electric vehicle demonstrator using a conventional EV platform underneath the Construct Engine interface.',
    needs: ['Engineering mule', 'Battery/BMS', 'Motor controller', 'Steering/braking', 'Emergency stop', 'Charging', 'Vehicle telemetry'],
  },
]

const verification = [
  ['PHONE / CONTROLLER', 'Run real-device input, movement, orientation and accessibility checks.'],
  ['SAVE + REJOIN', 'Persist passport/world state server-side and verify rejoin from a second session/device.'],
  ['XR / WORLDS', 'Finish world implementations, device capability detection and safe fallback rendering.'],
  ['HOLOGPT PROVIDER', 'Activate production provider credentials, timeout/fallback behavior and observable health checks.'],
  ['PAYMENTS / PAYOUTS', 'Verify a real sandbox purchase, authoritative ledger entry, payable balance and creator payout eligibility.'],
  ['TELECOM / eSIM', 'Keep provider adapters gated until carrier/eSIM partner credentials and commercial agreements exist.'],
  ['BROADCAST / DISTRIBUTION', 'Verify outbound provider credentials, ingest endpoints, rights metadata and delivery receipts.'],
] as const

export default function NextDevelopmentTargetCenter({ onClose }: Props) {
  return (
    <div role="dialog" aria-label="Next Development Target" style={{position:'fixed',inset:0,zIndex:10040,overflowY:'auto',background:'radial-gradient(circle at top,#102237 0%,#050812 46%,#02030a 100%)',color:'#fff',fontFamily:'system-ui, sans-serif'}}>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'24px 16px 56px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16}}>
          <div>
            <div style={{fontSize:11,letterSpacing:4,color:'#74e8ff',fontWeight:900}}>TRYAMM • STREETVERSE • 12D</div>
            <h1 style={{margin:'8px 0 4px',fontSize:'clamp(28px,6vw,58px)',lineHeight:1}}>NEXT DEVELOPMENT TARGET</h1>
            <p style={{margin:0,maxWidth:820,color:'#b8c5d4',lineHeight:1.6}}>Construct Engine v0.1 → BMO-class desktop prototype → room-scale construct demonstration → Automan-class low-speed vehicle, with release verification gates for phone, persistence, XR, HoloGPT, payments, telecom and distribution.</p>
          </div>
          <button onClick={onClose} aria-label="Close Next Development Target" style={{width:42,height:42,borderRadius:'50%',border:'1px solid #496579',background:'#0b1520',color:'#fff',fontSize:24,cursor:'pointer'}}>×</button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:12,marginTop:28}}>
          {targets.map((target, index) => <section key={target.title} style={{border:'1px solid #25445c',borderRadius:18,padding:16,background:'#07111dcc'}}>
            <div style={{display:'flex',justifyContent:'space-between',gap:10}}><span style={{color:'#74e8ff',fontWeight:900}}>0{index + 1}</span><span style={{fontSize:10,fontWeight:900,color:target.status==='BUILD'?'#ffdb6e':target.status==='READY'?'#7cffb4':'#ff9e72'}}>{target.status}</span></div>
            <h2 style={{fontSize:18,margin:'12px 0 8px'}}>{target.title}</h2>
            <p style={{fontSize:12,color:'#b8c5d4',lineHeight:1.55}}>{target.purpose}</p>
            <ul style={{paddingLeft:18,fontSize:11,color:'#d9e4ee',lineHeight:1.7}}>{target.needs.map(item => <li key={item}>{item}</li>)}</ul>
          </section>)}
        </div>

        <section style={{marginTop:22,border:'1px solid #38506b',borderRadius:20,padding:18,background:'#080d18cc'}}>
          <div style={{fontSize:11,letterSpacing:3,color:'#e8b944',fontWeight:900}}>PRODUCTION RELEASE MATRIX</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:10,marginTop:12}}>
            {verification.map(([title, description]) => <div key={title} style={{padding:13,borderRadius:14,border:'1px solid #1c2c3e',background:'#0b111b'}}>
              <div style={{fontSize:11,fontWeight:950}}>{title}</div>
              <div style={{fontSize:11,color:'#9fb0c2',lineHeight:1.5,marginTop:6}}>{description}</div>
            </div>)}
          </div>
        </section>

        <section style={{marginTop:18,border:'1px solid #274e3a',borderRadius:20,padding:18,background:'#07130dcc'}}>
          <div style={{fontSize:11,letterSpacing:3,color:'#7cffb4',fontWeight:900}}>WHAT THIS DOES</div>
          <p style={{fontSize:13,color:'#c8d8cf',lineHeight:1.65,marginBottom:0}}>It creates one visible command center for the engineering roadmap and prevents unfinished or externally dependent systems from being represented as production-ready. Software work can proceed now, while hardware, carrier, payment, XR and broadcast capabilities remain explicitly gated until their required devices, credentials, partners and verification evidence exist.</p>
        </section>
      </div>
    </div>
  )
}
