import React, { useMemo, useState } from 'react'
import { formatURA } from '../platform/quantumverse/universalRealityAddress'

type Node = {
  id: string
  label: string
  domain: string
  provenance: string
  source: string
  children?: Node[]
}

const root: Node = {
  id: 'city-of-praise', label: 'Judah — City of Praise', domain: 'city', provenance: 'DIGITAL_TWIN', source: 'StreetVerse/12D reference twin', children: [
    { id: 'energy-district', label: 'Energy District', domain: 'district', provenance: 'DIGITAL_TWIN', source: 'City planning twin', children: [
      { id: 'transformer-27', label: 'Transformer QT-27', domain: 'machine', provenance: 'DIGITAL_TWIN', source: 'Quantum Transformer R&D twin', children: [
        { id: 'winding', label: 'Winding Assembly', domain: 'component', provenance: 'DIGITAL_TWIN', source: 'Engineering model', children: [
          { id: 'material-sample', label: 'Material Sample', domain: 'material', provenance: 'MEASURED', source: 'Material passport placeholder', children: [
            { id: 'microstructure', label: 'Microstructure Dataset', domain: 'microstructure', provenance: 'OBSERVED', source: 'Digital microscope adapter required' },
          ] },
        ] },
      ] },
    ] },
  ],
}

export default function QuantumZoomViewer({ onClose }: { onClose: () => void }) {
  const [trail, setTrail] = useState<Node[]>([root])
  const current = trail[trail.length - 1]
  const ura = useMemo(() => formatURA({ world:'quantumverse', objectId:current.id, scale:current.domain, provenance:[current.provenance as any], accessScope:'demo' }), [current])

  return <div role="dialog" aria-label="Quantum Zoom Viewer" style={{position:'fixed',inset:0,zIndex:10050,background:'radial-gradient(circle at 50% 20%,#142746,#050711 58%,#010208)',color:'#fff',overflowY:'auto'}}>
    <div style={{maxWidth:960,margin:'0 auto',padding:20}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:16}}><div><div style={{fontSize:11,letterSpacing:4,color:'#74e8ff',fontWeight:900}}>QUANTUMVERSE</div><h1 style={{margin:'8px 0'}}>Quantum Zoom</h1></div><button onClick={onClose} aria-label="Close Quantum Zoom" style={{width:42,height:42,borderRadius:'50%',background:'#0d1624',border:'1px solid #35506b',color:'#fff',fontSize:22}}>×</button></div>
      <div style={{margin:'18px 0',padding:14,border:'1px solid #25445c',borderRadius:16,background:'#07111dcc'}}><div style={{fontSize:10,color:'#8fa9be'}}>UNIVERSAL REALITY ADDRESS</div><code style={{display:'block',marginTop:8,fontSize:11,wordBreak:'break-all',color:'#c8f6ff'}}>{ura}</code></div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:18}}>{trail.map((node,index)=><button key={`${node.id}-${index}`} onClick={()=>setTrail(trail.slice(0,index+1))} style={{border:'1px solid #2a4055',borderRadius:999,padding:'7px 10px',background:index===trail.length-1?'#17314a':'#0a1019',color:'#fff',fontSize:10}}>{node.label}</button>)}</div>
      <section style={{padding:22,border:'1px solid #38506b',borderRadius:22,background:'#080d18cc'}}><div style={{fontSize:12,color:'#e8b944',fontWeight:900}}>{current.provenance}</div><h2 style={{fontSize:'clamp(28px,7vw,54px)',margin:'10px 0 6px'}}>{current.label}</h2><div style={{color:'#9fb0c2'}}>Scale domain: {current.domain} • Source: {current.source}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:10,marginTop:22}}>{current.children?.map(child=><button key={child.id} onClick={()=>setTrail([...trail,child])} style={{textAlign:'left',padding:16,borderRadius:16,border:'1px solid #24506a',background:'#0a1623',color:'#fff',cursor:'pointer'}}><div style={{fontSize:10,color:'#74e8ff'}}>ZOOM IN → {child.domain.toUpperCase()}</div><div style={{fontWeight:900,marginTop:8}}>{child.label}</div><div style={{fontSize:10,color:'#8799aa',marginTop:6}}>{child.provenance}</div></button>) || <div style={{padding:14,borderRadius:14,background:'#111821',color:'#b9c5d1'}}>Verified deeper data is not connected yet. Quantum Zoom stops here instead of inventing hidden detail.</div>}</div>
      </section>
      <div style={{marginTop:16,padding:14,border:'1px solid #274e3a',borderRadius:16,background:'#07130dcc',fontSize:12,lineHeight:1.6,color:'#c8d8cf'}}>Time Machine integration will let this same object move between historical snapshots, reconstructed states and clearly labeled simulations while keeping the same URA identity.</div>
    </div>
  </div>
}
