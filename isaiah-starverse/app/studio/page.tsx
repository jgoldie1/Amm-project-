"use client"
import { useState, useEffect } from "react"
import Nav from "../components/Nav"
import { JUDGES, HOLO_ADS } from "../lib/data"

type ShowSegment = {
  id: number
  type: "intro"|"performance"|"judging"|"commercial"|"voting"|"results"|"outro"
  title: string
  duration: string
  performer?: string
  talent?: string
  active: boolean
  completed: boolean
}

type LivePerformer = {
  id: number
  name: string
  talent: string
  ageGroup: string
  scores: number[]
  avgScore: number
  fanVotes: number
  status: "waiting"|"performing"|"judged"|"done"
}

export default function StudioPage() {
  const [showRunning, setShowRunning] = useState(false)
  const [currentSegmentIdx, setCurrentSegmentIdx] = useState(0)
  const [activeHoloAd, setActiveHoloAd] = useState<typeof HOLO_ADS[0] | null>(null)
  const [totalViewers, setTotalViewers] = useState(247)
  const [showTime, setShowTime] = useState(0)
  const [chatMessages, setChatMessages] = useState([
    { user: "FaithFan", msg: "Let's go! So excited! 🙌" },
    { user: "MomOfStar", msg: "My daughter is performing tonight! 💃" },
    { user: "CoachDad", msg: "Isaiah AI Starverse is the real thing 🔥" },
  ])
  const [newChat, setNewChat] = useState("")

  const [performers, setPerformers] = useState<LivePerformer[]>([
    { id: 1, name: "Isaiah Stubbs",    talent: "Athlete",  ageGroup: "15-18", scores: [], avgScore: 0, fanVotes: 0, status: "waiting" },
    { id: 2, name: "Destiny Higfield", talent: "Dancer",   ageGroup: "13-17", scores: [], avgScore: 0, fanVotes: 0, status: "waiting" },
    { id: 3, name: "Grace Starfield",  talent: "Singer",   ageGroup: "11-14", scores: [], avgScore: 0, fanVotes: 0, status: "waiting" },
    { id: 4, name: "Marcus Mythos",    talent: "Producer", ageGroup: "19+",   scores: [], avgScore: 0, fanVotes: 0, status: "waiting" },
  ])

  const [segments, setSegments] = useState<ShowSegment[]>([
    { id: 1,  type: "intro",       title: "Show Open — Anyone Can Be A Star Vol. 1",       duration: "3 min",  active: false, completed: false },
    { id: 2,  type: "commercial",  title: "Holographic Ad — AMM Pro",                       duration: "15 sec", active: false, completed: false },
    { id: 3,  type: "performance", title: "Isaiah Stubbs — Athlete Showcase",               duration: "5 min",  performer: "Isaiah Stubbs",    talent: "Athlete",  active: false, completed: false },
    { id: 4,  type: "judging",     title: "Judge Panel — Isaiah Stubbs",                    duration: "3 min",  active: false, completed: false },
    { id: 5,  type: "performance", title: "Destiny Higfield — Dance Showcase",              duration: "5 min",  performer: "Destiny Higfield",  talent: "Dancer",   active: false, completed: false },
    { id: 6,  type: "judging",     title: "Judge Panel — Destiny Higfield",                 duration: "3 min",  active: false, completed: false },
    { id: 7,  type: "commercial",  title: "Holographic Ad — Gospel Beats Pack",             duration: "10 sec", active: false, completed: false },
    { id: 8,  type: "performance", title: "Grace Starfield — Vocal Performance",            duration: "4 min",  performer: "Grace Starfield",   talent: "Singer",   active: false, completed: false },
    { id: 9,  type: "judging",     title: "Judge Panel — Grace Starfield",                  duration: "3 min",  active: false, completed: false },
    { id: 10, type: "performance", title: "Marcus Mythos — Live Mythos Blender Session",    duration: "5 min",  performer: "Marcus Mythos",     talent: "Producer", active: false, completed: false },
    { id: 11, type: "judging",     title: "Judge Panel — Marcus Mythos",                    duration: "3 min",  active: false, completed: false },
    { id: 12, type: "voting",      title: "FAN VOTING OPEN — 5 Minutes",                   duration: "5 min",  active: false, completed: false },
    { id: 13, type: "commercial",  title: "Holographic Ad — Messiah AI MD",                 duration: "20 sec", active: false, completed: false },
    { id: 14, type: "results",     title: "Results Reveal — Isaiah AI Rankings",            duration: "5 min",  active: false, completed: false },
    { id: 15, type: "outro",       title: "Show Close — Next Show Preview",                 duration: "2 min",  active: false, completed: false },
  ])

  // Viewer counter simulation
  useEffect(() => {
    if (!showRunning) return
    const t = setInterval(() => {
      setTotalViewers(v => v + Math.floor(Math.random() * 8) - 2)
      setShowTime(t => t + 1)
    }, 1000)
    return () => clearInterval(t)
  }, [showRunning])

  const goToSegment = (idx: number) => {
    setCurrentSegmentIdx(idx)
    setSegments(prev => prev.map((s, i) => ({
      ...s,
      active: i === idx,
      completed: i < idx,
    })))

    // Trigger holo ad if commercial segment
    const seg = segments[idx]
    if (seg?.type === "commercial") {
      const ad = HOLO_ADS[Math.floor(Math.random() * HOLO_ADS.length)]
      setActiveHoloAd(ad)
      setTimeout(() => setActiveHoloAd(null), (ad.duration || 15) * 1000)
    }
  }

  const nextSegment = () => {
    const next = Math.min(currentSegmentIdx + 1, segments.length - 1)
    goToSegment(next)
  }

  const scorePerformer = (performerId: number, judgeIdx: number, score: number) => {
    setPerformers(prev => prev.map(p => {
      if (p.id !== performerId) return p
      const newScores = [...p.scores]
      newScores[judgeIdx] = score
      const filled = newScores.filter(s => s > 0)
      const avg = filled.length > 0 ? Math.round(filled.reduce((a,b) => a+b, 0) / filled.length) : 0
      return { ...p, scores: newScores, avgScore: avg, status: filled.length >= JUDGES.length ? "judged" : "performing" }
    }))
  }

  const voteForPerformer = (performerId: number) => {
    setPerformers(prev => prev.map(p =>
      p.id === performerId ? { ...p, fanVotes: p.fanVotes + 1 } : p
    ))
    setChatMessages(prev => [...prev.slice(-20), {
      user: "Fan" + Math.floor(Math.random() * 999),
      msg: `Just voted! 🗳️ ${performers.find(p => p.id === performerId)?.name}!`
    }])
  }

  const sendChat = () => {
    if (!newChat.trim()) return
    setChatMessages(prev => [...prev.slice(-20), { user: "Host", msg: newChat }])
    setNewChat("")
  }

  const sortedPerformers = [...performers].sort((a, b) => (b.avgScore + b.fanVotes * 0.5) - (a.avgScore + a.fanVotes * 0.5))
  const currentSegment = segments[currentSegmentIdx]

  const segTypeColor: Record<string, string> = {
    intro: "var(--gold)", performance: "var(--holo)", judging: "var(--purple-light)",
    commercial: "var(--family)", voting: "#00cc44", results: "var(--gold)", outro: "var(--text-muted)"
  }

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`

  return (
    <>
      <Nav />

      {/* Holographic Ad Overlay */}
      {activeHoloAd && (
        <div className="holo-ad" onClick={() => setActiveHoloAd(null)}>
          <div className="holo-ad-inner" style={{ borderColor: activeHoloAd.color, boxShadow: `0 0 60px ${activeHoloAd.color}44` }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>{activeHoloAd.emoji}</div>
            <div style={{ color: activeHoloAd.color, fontSize: 22, fontWeight: 900, marginBottom: 8 }}>{activeHoloAd.title}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>Brand: {activeHoloAd.brand} · {activeHoloAd.duration}s · {activeHoloAd.type.replace("_"," ")} ad</div>
            <button style={{ background: activeHoloAd.color, color: "#111", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 900, cursor: "pointer", fontSize: 14 }}>
              {activeHoloAd.cta}
            </button>
            <div style={{ marginTop: 16, fontSize: 11, color: "var(--text-muted)" }}>✨ Holographic Ad · Tap to dismiss</div>
          </div>
        </div>
      )}

      <section style={{ padding: "30px 24px", background: "radial-gradient(circle at top, #2d0060, #070713 50%)" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span className="badge badge-live" style={{ marginRight: 10 }}>🔴 PRODUCTION CONTROL</span>
            <h1 style={{ marginTop: 8 }}>Isaiah AI TV — Live Studio</h1>
            <p>Anyone Can Be A Star · Vol. 1 · Season 1 Episode 1</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "var(--family)" }}>{totalViewers.toLocaleString()}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>live viewers</div>
            {showRunning && <div style={{ color: "var(--holo)", fontSize: 14, fontWeight: 700, marginTop: 4 }}>⏱ {formatTime(showTime)}</div>}
          </div>
        </div>
      </section>

      <main className="container" style={{ marginTop: 24 }}>

        {/* Show controls */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          <button className={showRunning ? "btn-outline" : "btn-gold"} onClick={() => setShowRunning(!showRunning)} style={{ fontSize: 13 }}>
            {showRunning ? "⏸ Pause Show" : "▶ START SHOW"}
          </button>
          <button className="btn" onClick={nextSegment} style={{ fontSize: 13 }}>
            ⏭ Next Segment
          </button>
          <button className="btn-holo" onClick={() => { const ad = HOLO_ADS[Math.floor(Math.random()*HOLO_ADS.length)]; setActiveHoloAd(ad); setTimeout(()=>setActiveHoloAd(null), ad.duration * 1000) }} style={{ fontSize: 13 }}>
            ✨ Fire Holo Ad
          </button>
          <button className="btn-outline" onClick={() => setSegments(s => s.map(seg => ({ ...seg, active: false, completed: false })))} style={{ fontSize: 13 }}>
            🔄 Reset
          </button>
        </div>

        {/* 3-column control room */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr", gap: 16, marginBottom: 32 }}>

          {/* Run of Show */}
          <div>
            <h3 style={{ marginBottom: 12, fontSize: 14 }}>📋 Run of Show</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {segments.map((seg, i) => (
                <div key={seg.id} onClick={() => goToSegment(i)}
                  style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12,
                    background: seg.active ? `${segTypeColor[seg.type]}22` : seg.completed ? "#1a1a3a" : "var(--bg-card)",
                    border: `1px solid ${seg.active ? segTypeColor[seg.type] : seg.completed ? "#2a2a4a" : "var(--border)"}`,
                    opacity: seg.completed ? 0.6 : 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: segTypeColor[seg.type], fontWeight: seg.active ? 700 : 400 }}>
                      {seg.completed ? "✓" : seg.active ? "▶" : `${i+1}.`} {seg.title}
                    </span>
                    <span style={{ color: "var(--text-muted)", flexShrink: 0, marginLeft: 6 }}>{seg.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current segment / judge console */}
          <div>
            <h3 style={{ marginBottom: 12, fontSize: 14 }}>🎬 Current Segment</h3>
            {currentSegment ? (
              <div className="card" style={{ marginBottom: 16, borderColor: segTypeColor[currentSegment.type] }}>
                <div style={{ color: segTypeColor[currentSegment.type], fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                  {currentSegment.type.toUpperCase()} · {currentSegment.duration}
                </div>
                <h3>{currentSegment.title}</h3>
                {currentSegment.performer && (
                  <div style={{ marginTop: 8, padding: "8px", background: "rgba(0,255,204,.05)", borderRadius: 8 }}>
                    <div style={{ fontSize: 13, color: "var(--holo)" }}>🎤 Performing: {currentSegment.performer}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Talent: {currentSegment.talent}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card" style={{ textAlign: "center", padding: 30 }}>
                <p>Press START SHOW to begin</p>
              </div>
            )}

            {/* Judge scoring console */}
            {currentSegment?.type === "judging" && currentSegment.performer && (
              <div className="card">
                <h3 style={{ marginBottom: 12, fontSize: 13 }}>⚖️ Judge Scores — {currentSegment.performer}</h3>
                {(() => {
                  const perf = performers.find(p => p.name === currentSegment.performer)
                  if (!perf) return null
                  return (
                    <>
                      {JUDGES.map((j, idx) => (
                        <div key={j.id} style={{ marginBottom: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 18 }}>{j.emoji}</span>
                            <span style={{ fontSize: 12, fontWeight: 700 }}>{j.name}</span>
                            {perf.scores[idx] && <span style={{ color: "var(--gold)", fontWeight: 700, marginLeft: "auto" }}>{perf.scores[idx]}</span>}
                          </div>
                          <div style={{ display: "flex", gap: 4 }}>
                            {[60, 70, 80, 85, 90, 95, 98, 100].map(score => (
                              <button key={score} onClick={() => scorePerformer(perf.id, idx, score)}
                                style={{ flex: 1, padding: "5px 2px", borderRadius: 4, border: `1px solid ${perf.scores[idx] === score ? "var(--gold)" : "var(--border)"}`, background: perf.scores[idx] === score ? "var(--gold)" : "var(--bg-card2)", color: perf.scores[idx] === score ? "#111" : "var(--text-muted)", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>
                                {score}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      {perf.avgScore > 0 && (
                        <div style={{ textAlign: "center", marginTop: 12, padding: 12, background: "rgba(250,204,21,.1)", borderRadius: 10 }}>
                          <div style={{ color: "var(--gold)", fontSize: 28, fontWeight: 900 }}>{perf.avgScore}</div>
                          <div style={{ color: "var(--text-muted)", fontSize: 12 }}>avg judge score</div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            )}
          </div>

          {/* Live feed + chat */}
          <div>
            <h3 style={{ marginBottom: 12, fontSize: 14 }}>💬 Live Chat</h3>
            <div className="card" style={{ height: 200, overflowY: "auto", marginBottom: 8, padding: 12 }}>
              {chatMessages.map((m, i) => (
                <div key={i} style={{ fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: "var(--gold)", fontWeight: 700 }}>{m.user}:</span>
                  <span style={{ color: "var(--text-dim)", marginLeft: 6 }}>{m.msg}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input className="input" style={{ margin: 0, fontSize: 12, padding: "8px 12px" }}
                placeholder="Send as Host..." value={newChat}
                onChange={e => setNewChat(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendChat()} />
              <button className="btn" onClick={sendChat} style={{ padding: "8px 14px", fontSize: 12, flexShrink: 0 }}>Send</button>
            </div>

            {/* Holo ads panel */}
            <h3 style={{ margin: "16px 0 8px", fontSize: 14 }}>✨ Holographic Ads</h3>
            {HOLO_ADS.map(ad => (
              <button key={ad.id} onClick={() => { setActiveHoloAd(ad); setTimeout(() => setActiveHoloAd(null), ad.duration * 1000) }}
                style={{ width: "100%", marginBottom: 6, padding: "8px 12px", borderRadius: 8, border: `1px solid ${ad.color}44`, background: `${ad.color}11`, color: ad.color, cursor: "pointer", fontSize: 11, textAlign: "left", fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{ad.emoji} {ad.title}</span>
                <span style={{ color: "var(--text-muted)", fontSize: 10 }}>{ad.duration}s</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Rankings */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ marginBottom: 16 }}>⭐ Live Rankings</h2>
          <div className="grid">
            {sortedPerformers.map((p, i) => (
              <div key={p.id} className={`card ${i === 0 ? "card-gold" : ""}`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span className={`badge ${i === 0 ? "badge-gold" : "badge-purple"}`}>#{i + 1}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{p.status.toUpperCase()}</span>
                </div>
                <div style={{ color: "var(--gold)", fontSize: 32, fontWeight: 900, margin: "8px 0 4px" }}>
                  {p.avgScore > 0 ? p.avgScore : "—"}
                </div>
                <h3>{p.name}</h3>
                <p style={{ fontSize: 13 }}>{p.talent} · {p.ageGroup}</p>
                <div style={{ marginTop: 10, display: "flex", gap: 16, fontSize: 13 }}>
                  <span style={{ color: "var(--text-muted)" }}>🗳️ {p.fanVotes} fan votes</span>
                  {p.avgScore > 0 && <span style={{ color: "var(--gold)" }}>⚖️ {p.avgScore} judge avg</span>}
                </div>
                {currentSegment?.type === "voting" && (
                  <button className="btn-gold" onClick={() => voteForPerformer(p.id)} style={{ width: "100%", marginTop: 10, fontSize: 13 }}>
                    ⭐ Vote for {p.name.split(" ")[0]}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>
    </>
  )
}
