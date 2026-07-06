import Nav from "../components/Nav"
import { TV_SHOWS, JUDGES } from "../lib/data"

export default function TVPage() {
  return (
    <>
      <Nav/>
      <section className="hero" style={{background:"radial-gradient(circle at top,#1e1b4b,#070713 55%)"}}>
        <div className="container">
          <span className="badge badge-purple">📺 Isaiah AI TV</span>
          <h1 style={{marginTop:12,color:"var(--purple-light)"}}>Isaiah AI TV</h1>
          <p style={{maxWidth:520,margin:"12px auto 0"}}>Live shows. Competitions. Talk shows. Variety. All faith-centered. All family-safe. All streaming on AMM Omniverse.</p>
        </div>
      </section>
      <main className="container" style={{marginTop:32}}>
        <h2 style={{marginBottom:16}}>Current Lineup</h2>
        {TV_SHOWS.map(show=>(
          <div className="card" key={show.id} style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
                  <span className="badge badge-purple">{show.format.replace("_"," ").toUpperCase()}</span>
                  <span className={`prod-status-${show.status}`} style={{fontWeight:700,fontSize:12,alignSelf:"center"}}>{show.status.replace("_"," ").toUpperCase()}</span>
                  {show.holoAds && <span className="badge badge-holo" style={{fontSize:10}}>✨ HOLO ADS</span>}
                  {show.productPlacement && <span className="badge" style={{fontSize:10}}>📦 SPONSORS</span>}
                  {show.aiGenerated && <span className="badge" style={{background:"rgba(0,255,204,.1)",color:"var(--holo)",fontSize:10}}>🤖 AI-ASSISTED</span>}
                </div>
                <h2>{show.title}</h2>
                <p style={{marginTop:8}}>{show.description}</p>
                <p style={{marginTop:10,color:"var(--family)",fontStyle:"italic",fontSize:13}}>Theme: {show.theme}</p>
                <div style={{marginTop:12,display:"flex",gap:16,flexWrap:"wrap",fontSize:13,color:"var(--text-muted)"}}>
                  <span>📺 {show.episodes} episodes</span>
                  <span>⏱ {show.episodeDuration}</span>
                  <span>👥 {show.targetAudience.join(", ")}</span>
                </div>
                {show.judges && (
                  <div style={{marginTop:10}}>
                    <span style={{fontSize:12,color:"var(--text-muted)"}}>Judges: </span>
                    {show.judges.map(j=><span key={j} className="badge" style={{marginLeft:6,fontSize:10}}>{j}</span>)}
                  </div>
                )}
              </div>
              <div style={{textAlign:"center",minWidth:100}}>
                <div style={{fontSize:48}}>📺</div>
                <a href="https://tryamm.online" className="btn-outline" style={{fontSize:11,display:"block",marginTop:10}}>Watch Live</a>
              </div>
            </div>
          </div>
        ))}
        <div className="card card-gold" style={{marginTop:24}}>
          <h2>🎙️ Want to Host or Sponsor a Show?</h2>
          <p style={{marginTop:8}}>Isaiah AI TV is actively seeking hosts, sponsors, and Black-owned brand partners. All shows stream on AMM Omniverse — the faith-centered creator metaverse.</p>
          <a href="https://tryamm.online/marketplace" className="btn-gold" style={{marginTop:14,display:"inline-block"}}>Partner With Us</a>
        </div>
      </main>
    </>
  )
}
