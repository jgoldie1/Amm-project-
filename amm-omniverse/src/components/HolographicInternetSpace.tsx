import type { OmniNetResult } from '../services/omninet'

type Props={results:OmniNetResult[]; onExit:()=>void}

export default function HolographicInternetSpace({results,onExit}:Props){
  const cards=results.slice(0,12)
  return <div role="dialog" aria-modal="true" aria-label="Holographic Internet" style={{position:'fixed',inset:0,zIndex:12650,overflow:'hidden',background:'radial-gradient(circle at 50% 45%,#0a2b3d 0,#05111f 32%,#02050b 72%)',color:'#fff',perspective:'1200px'}}>
    <div style={{position:'absolute',inset:0,pointerEvents:'none',background:'repeating-linear-gradient(180deg,rgba(79,227,255,.035) 0 1px,transparent 1px 5px)'}}/>
    <header style={{position:'absolute',left:18,right:18,top:16,zIndex:5,display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
      <div><div style={{font:'800 10px monospace',letterSpacing:2,color:'#82f4ff'}}>OMNINET™ HOLOGRAPHIC INTERNET</div><div style={{fontSize:12,opacity:.68}}>Spatial source view · raw links remain selectable</div></div>
      <button onClick={onExit} style={{width:46,height:46,borderRadius:14,border:'1px solid #4c7081',background:'#0a1522',color:'#fff',fontSize:25}}>×</button>
    </header>
    <main style={{position:'absolute',inset:'76px 20px 28px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:18,alignContent:'center',transformStyle:'preserve-3d',overflowY:'auto',padding:10}}>
      {cards.map((r,i)=>{
        const depth=((i%3)-1)*32
        const tilt=((i%2)?1:-1)*(2+(i%3))
        return <article key={r.id||`${r.url}-${i}`} style={{padding:16,border:'1px solid rgba(79,227,255,.45)',borderRadius:20,background:'linear-gradient(160deg,rgba(10,31,48,.88),rgba(6,10,25,.84))',boxShadow:'0 18px 45px rgba(0,0,0,.35),0 0 26px rgba(79,227,255,.10)',transform:`translateZ(${depth}px) rotateY(${tilt}deg)`,backdropFilter:'blur(12px)'}}>
          <div style={{font:'800 10px monospace',color:r.source==='omninet'?'#ffe083':'#84efff'}}>{r.source==='omninet'?'OMNINET NODE':'PUBLIC WEB NODE'}{r.sourceType?` · ${r.sourceType.toUpperCase()}`:''}</div>
          <h3 style={{margin:'8px 0 6px'}}>{r.title}</h3>
          {r.description&&<p style={{opacity:.72,lineHeight:1.45,fontSize:13}}>{r.description}</p>}
          {r.url?<a href={r.url} target="_blank" rel="noreferrer" style={{display:'inline-block',marginTop:6,color:'#8ff5ff',fontWeight:900}}>OPEN SOURCE ↗</a>:<span style={{display:'inline-block',marginTop:6,fontSize:12,opacity:.55}}>Internal OmniNet record</span>}
        </article>
      })}
      {!cards.length&&<div style={{textAlign:'center',opacity:.65}}>Run a Holo Search first, then enter Spatial Internet.</div>}
    </main>
    <div style={{position:'absolute',left:'50%',bottom:10,transform:'translateX(-50%)',font:'700 9px monospace',color:'#ffe493',opacity:.8}}>VOICE / GESTURE / WEBXR HANDOFF READY · HOLO OVERLAY · QUANTUM BEAT™</div>
  </div>
}
