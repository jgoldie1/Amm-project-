"use client"
import { useState } from "react"
import Nav from "../components/Nav"
import { SHOWCASES, JUDGES } from "../lib/data"

export default function ShowcasePage() {
  const [activeShowcase, setActiveShowcase] = useState(SHOWCASES[0])
  const [votes, setVotes] = useState<Record<string,number>>({})
  const [registered, setRegistered] = useState(false)
  const [regForm, setRegForm] = useState({ name: "", talent: "", age: "", parentName: "", email: "" })
  const [liveMode, setLiveMode] = useState(false)

  const mockPerformers = [
    { id: "p1", name: "Isaiah Stubbs", talent: "Athlete", score: 0, votes: 0, judgeScores: [0,0,0,0,0] },
    { id: "p2", name: "Destiny Higfield", talent: "Dancer", score: 0, votes: 0, judgeScores: [0,0,0,0,0] },
    { id: "p3", name: "Grace Starfield", talent: "Singer", score: 0, votes: 0, judgeScores: [0,0,0,0,0] },
  ]
  const [performers, setPerformers] = useState(mockPerformers)

  const voteForPerformer = (id: string) => {
    setVotes(v => ({ ...v, [id]: (v[id] || 0) + 1 }))
    setPerformers(prev => prev.map(p => p.id === id ? { ...p, votes: p.votes + 1 } : p))
  }

  const judgeScore = (performerId: string, judgeIdx: number, score: number) => {
    setPerformers(prev => prev.map(p => {
      if (p.id !== performerId) return p
      const newScores = [...p.judgeScores]
      newScores[judgeIdx] = score
      const avg = Math.round(newScores.reduce((a,b) => a+b,0) / newScores.filter(s => s > 0).length) || 0
      return { ...p, judgeScores: newScores, score: avg }
    }))
  }

  return (
    <>
      <Nav />

      <section className="hero-holo">
        <div className="container">
          <span className="badge badge-holo">🎭 Online Showcase</span>
          <h1 style={{ marginTop: 16, color: "var(--holo)" }}>Starverse Showcase</h1>
          <p style={{ maxWidth: 560, margin: "12px auto 24px" }}>
            5 live judges. Fan voting in real time. Anyone can compete from anywhere.
            Family-safe. Faith-centered. Real prizes.
          </p>
          <button className="btn-holo" onClick={() => setLiveMode(!liveMode)}>
            {liveMode ? "🔴 LIVE NOW — Click to exit" : "📡 Enter Live Mode"}
          </button>
        </div>
      </section>

      <main className="container">

        {/* Upcoming showcases */}
        <div style={{ margin: "40px 0" }}>
          <h2 style={{ marginBottom: 16 }}>Upcoming Showcases</h2>
          {SHOWCASES.map(showcase => (
            <div
              key={showcase.id}
              className={`card ${activeShowcase.id === showcase.id ? "card-holo" : ""}`}
              style={{ marginBottom: 14, cursor: "pointer" }}
              onClick={() => setActiveShowcase(showcase)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    <span className="badge badge-holo">{showcase.format.replace("_"," ").toUpperCase()}</span>
                    <span className={`badge ${showcase.status === "upcoming" ? "badge-purple" : "badge-live"}`}>
                      {showcase.status === "live" ? "🔴 LIVE" : showcase.status.toUpperCase()}
                    </span>
                    {showcase.parentRequired && <span className="badge badge-family">👨‍👧 PARENT REQUIRED</span>}
                  </div>
                  <h3>{showcase.title}</h3>
                  <p style={{ fontSize: 13 }}>📅 {showcase.date} · {showcase.time}</p>
                  <p style={{ fontSize: 13 }}>📍 {showcase.venue}</p>
                  <p style={{ fontSize: 13, marginTop: 6 }}>🏆 {showcase.prizePool}</p>
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
                    {showcase.currentEntries}/{showcase.maxPerformers} spots filled
                    <div style={{ background: "#1a1a3a", borderRadius: 4, height: 6, marginTop: 4, width: 200 }}>
                      <div style={{ background: "var(--holo)", height: "100%", borderRadius: 4, width: `${(showcase.currentEntries/showcase.maxPerformers)*100}%` }} />
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Age Groups:</div>
                  {showcase.ageGroups.map(ag => <span key={ag} className="badge" style={{ display: "block", marginBottom: 4, fontSize: 10 }}>{ag}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Registration */}
        {!registered ? (
          <div className="card card-holo" style={{ marginBottom: 40 }}>
            <h2>🎤 Register for {activeShowcase.title}</h2>
            <p style={{ marginTop: 6, marginBottom: 16 }}>Entry fee: ${activeShowcase.entryFee} · Parent consent required for under 18</p>
            <div className="grid-2">
              <div>
                <input className="input" placeholder="Performer name *" onChange={e => setRegForm(f => ({...f, name: e.target.value}))} />
                <input className="input" placeholder="Talent category *" onChange={e => setRegForm(f => ({...f, talent: e.target.value}))} />
                <input className="input" placeholder="Age *" onChange={e => setRegForm(f => ({...f, age: e.target.value}))} />
                <input className="input" placeholder="Parent/Guardian name (required if under 18)" onChange={e => setRegForm(f => ({...f, parentName: e.target.value}))} />
                <input className="input" placeholder="Email for confirmation *" onChange={e => setRegForm(f => ({...f, email: e.target.value}))} />
                <label style={{ display: "flex", gap: 8, alignItems: "center", margin: "10px 0", fontSize: 13, color: "var(--text-dim)", cursor: "pointer" }}>
                  <input type="checkbox" />
                  I confirm parent/guardian consent and agree this is family-safe content
                </label>
                <button className="btn-holo" onClick={() => setRegistered(true)} style={{ width: "100%" }}>
                  Register — ${activeShowcase.entryFee} Entry
                </button>
              </div>
              <div>
                <h3 style={{ marginBottom: 12 }}>Categories Open</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {activeShowcase.categories.map(c => <span key={c} className="badge">{c}</span>)}
                </div>
                <h3 style={{ margin: "16px 0 12px" }}>Your Judges</h3>
                {JUDGES.map(j => (
                  <div key={j.id} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>{j.emoji}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{j.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{j.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="card card-holo" style={{ marginBottom: 40, textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ color: "var(--holo)" }}>You&apos;re Registered!</h2>
            <p style={{ marginTop: 8 }}>Confirmation will be sent to your email. Tune in on {activeShowcase.date} at {activeShowcase.time}.</p>
            <div style={{ marginTop: 20, padding: "16px", background: "rgba(0,255,204,.08)", borderRadius: 12 }}>
              <p style={{ fontSize: 13 }}>📱 Add to home screen from tryamm.online for show-day notifications</p>
              <p style={{ fontSize: 13, marginTop: 6 }}>👨‍👧 Parent: you&apos;ll receive a separate confirmation and pre-show guide</p>
            </div>
          </div>
        )}

        {/* LIVE SHOWCASE MODE */}
        {liveMode && (
          <div style={{ marginBottom: 40 }}>
            <div className="stage" style={{ marginBottom: 24 }}>
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 20 }}>
                  <span className="badge badge-live">🔴 LIVE</span>
                  <span style={{ color: "var(--text-muted)", fontSize: 14 }}>Starverse Showcase · Fan votes update live</span>
                </div>
                <h2 style={{ color: "var(--gold)", marginBottom: 24 }}>🎭 Performers on Stage</h2>
                {performers.map(p => (
                  <div key={p.id} className="card" style={{ marginBottom: 16, textAlign: "left" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                      <div>
                        <h3>{p.name} <span style={{ color: "var(--text-muted)", fontSize: 13 }}>· {p.talent}</span></h3>
                        <div style={{ display: "flex", gap: 4, margin: "10px 0", flexWrap: "wrap" }}>
                          {JUDGES.map((j, idx) => (
                            <div key={j.id} style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 14 }}>{j.emoji}</div>
                              <div style={{ display: "flex", gap: 2, marginTop: 4 }}>
                                {[70,80,90,95,100].map(score => (
                                  <button key={score} onClick={() => judgeScore(p.id, idx, score)}
                                    style={{ background: p.judgeScores[idx] === score ? "var(--gold)" : "var(--bg-card2)", border: "1px solid var(--border)", color: p.judgeScores[idx] === score ? "#111" : "var(--text-dim)", borderRadius: 4, padding: "2px 4px", cursor: "pointer", fontSize: 10 }}>
                                    {score}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        {p.score > 0 && (
                          <div>
                            <span style={{ color: "var(--gold)", fontWeight: 900, fontSize: 24 }}>{p.score}</span>
                            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>/100 avg judge score</span>
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: 900, color: "var(--family)" }}>{p.votes}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>fan votes</div>
                        <button className="btn-gold" onClick={() => voteForPerformer(p.id)} style={{ fontSize: 12 }}>
                          ⭐ VOTE
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </>
  )
}
