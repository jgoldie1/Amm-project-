"use client"
import { useState } from "react"
import Nav from "../components/Nav"
import { DANCE_PRODUCTIONS, STARS } from "../lib/data"

export default function HigfieldDancePage() {
  const [showHoloAd, setShowHoloAd] = useState(false)
  const dancers = STARS.filter(s => s.talent.includes("Dancer"))

  return (
    <>
      <Nav />

      {/* Holo Ad overlay */}
      {showHoloAd && (
        <div className="holo-ad" onClick={() => setShowHoloAd(false)}>
          <div className="holo-ad-inner">
            <div style={{ fontSize: 64, marginBottom: 16 }}>💃</div>
            <div style={{ color: "var(--holo)", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>HIGFIELD DANCE 2.0</div>
            <p style={{ marginBottom: 20 }}>Join the next generation of faith-centered dance. Auditions open now for the Genesis showcase.</p>
            <button className="btn-holo" onClick={() => setShowHoloAd(false)}>AUDITION NOW</button>
            <p style={{ fontSize: 11, marginTop: 12, color: "var(--text-muted)" }}>Tap anywhere to close</p>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="hero-family">
        <div className="container">
          <span className="badge badge-family">💃 Higfield Dance 2.0</span>
          <h1 style={{ marginTop: 16 }}>
            <span style={{ color: "var(--family)" }}>Movement</span><br />
            Is Ministry
          </h1>
          <p style={{ maxWidth: 580, margin: "16px auto 24px", fontSize: 16 }}>
            Higfield Dance 2.0 blends contemporary, hip-hop, praise dance, stomp, and step into a unified movement experience rooted in faith, family, and excellence.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-family" onClick={() => setShowHoloAd(true)}>💃 Audition for Dance</button>
            <a href="/showcase" className="btn-outline">🎭 See Upcoming Showcases</a>
          </div>
        </div>
      </section>

      <main className="container">

        {/* Dance styles */}
        <div style={{ margin: "40px 0" }}>
          <h2>Dance Styles</h2>
          <div className="grid" style={{ marginTop: 16 }}>
            {[
              { emoji: "🌊", style: "Contemporary", desc: "Fluid, expressive movement exploring emotion and story through the body." },
              { emoji: "🔥", style: "Hip-Hop", desc: "Street dance roots with performance polish. Breaking, popping, and freestyle." },
              { emoji: "🙏", style: "Praise Dance", desc: "Liturgical movement as worship. Scarves, flags, and sacred choreography." },
              { emoji: "👟", style: "Stomp & Step", desc: "HBCU-rooted rhythmic percussive movement. Unity, power, and precision." },
              { emoji: "🎭", style: "Musical Theater", desc: "Acting through dance. Narrative-driven performance with character and story." },
              { emoji: "✨", style: "Holographic Fusion", desc: "Dance combined with AR holographic effects. The future of performance art." },
            ].map(s => (
              <div className="card card-family" key={s.style}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>{s.emoji}</div>
                <h3 style={{ color: "var(--family)" }}>{s.style}</h3>
                <p style={{ fontSize: 13, marginTop: 6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Current productions */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ marginBottom: 16 }}>Current Productions</h2>
          {DANCE_PRODUCTIONS.map(prod => (
            <div className="card" key={prod.id} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                    <span className={`prod-status-${prod.status}`} style={{ fontWeight: 700, fontSize: 12 }}>
                      {prod.status.replace("_", " ").toUpperCase()}
                    </span>
                    {prod.holoEffect && <span className="badge badge-holo">✨ HOLOGRAPHIC</span>}
                  </div>
                  <h2>{prod.title}</h2>
                  <p style={{ marginTop: 8 }}>{prod.description}</p>
                  <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "var(--text-muted)" }}>
                    <span>⏱ {prod.duration}</span>
                    <span>🎵 {prod.music}</span>
                    {prod.showcaseDate && <span>📅 {prod.showcaseDate}</span>}
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Styles: </span>
                    {prod.style.map(s => <span key={s} className="badge" style={{ marginLeft: 6, fontSize: 10 }}>{s}</span>)}
                  </div>
                  <p style={{ marginTop: 10, fontSize: 13, color: "var(--family)", fontStyle: "italic" }}>
                    Theme: {prod.theme}
                  </p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 48 }}>💃</div>
                  {prod.status === "casting" && (
                    <a href="/audition" className="btn-family" style={{ marginTop: 10, display: "block", fontSize: 12 }}>
                      Apply
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dancers */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ marginBottom: 16 }}>Featured Dancers</h2>
          <div className="grid">
            {dancers.map(d => (
              <div className="card card-family" key={d.id}>
                <div style={{ fontSize: 40 }}>{d.emoji}</div>
                <h3 style={{ marginTop: 8 }}>{d.name}</h3>
                <p style={{ fontSize: 13 }}>{d.city}, {d.state}</p>
                <p style={{ fontSize: 13, marginTop: 6 }}>{d.bio}</p>
                <div className="score-bar" style={{ marginTop: 12 }}>
                  <div className="score-fill" style={{ width: `${d.score}%`, background: "linear-gradient(90deg, var(--family), var(--purple))" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "var(--text-muted)" }}>
                  <span>Score: {d.score}/100</span>
                  <span>🗳️ {d.votes} votes</span>
                </div>
                {d.parentSupported && <span className="badge badge-family" style={{ marginTop: 8 }}>👨‍👧 Parent Enrolled</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Parent-child section */}
        <div className="parent-child-banner" style={{ marginBottom: 40 }}>
          <div className="parent-child-icon">👨‍👧</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: "var(--family)", marginBottom: 6 }}>Parents Welcome — Required for Under 18</h3>
            <p style={{ fontSize: 14 }}>Higfield Dance 2.0 is a family program. Parents attend rehearsals, learn basic choreography alongside their children, and participate in the parent-child showcase segments. We believe the best stars are built at home first.</p>
          </div>
          <a href="/audition" className="btn-family" style={{ flexShrink: 0 }}>Join Together</a>
        </div>

      </main>
    </>
  )
}
