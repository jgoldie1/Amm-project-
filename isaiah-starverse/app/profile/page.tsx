"use client"
import { useState } from "react"
import Nav from "../components/Nav"

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "", talent: "", city: "", age: "",
    goal: "", weakness: "", strength: "", parentName: ""
  })
  const [plan, setPlan] = useState("")
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isYouth, setIsYouth] = useState(false)

  async function getCoaching() {
    if (!profile.name || !profile.talent) return
    setLoading(true)
    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    })
    const data = await res.json()
    setPlan(data.plan)
    setScore(data.score || 0)
    setIsYouth(data.isYouth || false)
    setLoading(false)
  }

  const u = (key: string, val: string) => setProfile(p => ({ ...p, [key]: val }))

  return (
    <>
      <Nav />

      <section style={{ padding: "60px 24px 40px", background: "radial-gradient(circle at top, #3b0764, #070713 55%)", textAlign: "center" }}>
        <span className="badge badge-purple">🤖 Messiah AI MD</span>
        <h1 style={{ marginTop: 12, color: "var(--purple-light)" }}>Build Your Star Profile</h1>
        <p style={{ maxWidth: 520, margin: "12px auto 0" }}>
          Get your personalized 30-day star development plan from Messiah AI MD — the AI coach that sees your potential before you do.
        </p>
      </section>

      <main className="container">
        <div className="grid-2" style={{ marginTop: 32 }}>
          {/* Form */}
          <div className="card">
            <h2 style={{ marginBottom: 16 }}>Your Profile</h2>

            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 2 }}>Star Name *</label>
            <input className="input" placeholder="Your name" onChange={e => u("name", e.target.value)} />

            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 2 }}>Talent Category *</label>
            <select className="input" onChange={e => u("talent", e.target.value)}>
              <option value="">Select your talent...</option>
              {["Athlete","Dancer","Singer","Actor","Comedian","Musician","Speaker","Creator","Gamer","Artist","Poet","Student","Chef","Designer","Producer"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block" }}>City</label>
                <input className="input" placeholder="Your city" onChange={e => u("city", e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block" }}>Age</label>
                <input className="input" placeholder="Age" type="number" onChange={e => { u("age", e.target.value); setIsYouth(parseInt(e.target.value) < 18) }} />
              </div>
            </div>

            {/* Parent section if youth */}
            {isYouth && (
              <div className="parent-child-banner" style={{ margin: "10px 0" }}>
                <span style={{ fontSize: 24 }}>👨‍👧</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "var(--family)", fontWeight: 700 }}>Parent Partner Required</div>
                  <input className="input" placeholder="Parent/Guardian name" style={{ marginTop: 6 }} onChange={e => u("parentName", e.target.value)} />
                </div>
              </div>
            )}

            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 2 }}>Your Big Goal</label>
            <textarea className="input" placeholder="What do you want to achieve? Be specific." onChange={e => u("goal", e.target.value)} />

            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 2 }}>Your Greatest Strength</label>
            <textarea className="input" placeholder="What are you already great at?" onChange={e => u("strength", e.target.value)} />

            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 2 }}>Your Weakness to Improve</label>
            <textarea className="input" placeholder="What do you need to work on most?" onChange={e => u("weakness", e.target.value)} />

            <button className="btn" onClick={getCoaching} disabled={loading || !profile.name || !profile.talent} style={{ width: "100%", marginTop: 8, opacity: (!profile.name || !profile.talent) ? 0.5 : 1 }}>
              {loading ? "Messiah AI MD is thinking..." : "🤖 Get My Star Plan"}
            </button>
          </div>

          {/* Plan output */}
          <div>
            {score > 0 && (
              <div className="card card-gold" style={{ marginBottom: 16, textAlign: "center" }}>
                <div className="rank-big">{score}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>Isaiah AI Star Score</div>
                <div style={{ marginTop: 12 }}>
                  <div className="score-bar">
                    <div className="score-fill" style={{ width: `${score}%` }} />
                  </div>
                </div>
                <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  <a href="/audition" className="btn-gold" style={{ fontSize: 12 }}>Submit Audition</a>
                  <a href="/showcase" className="btn-outline" style={{ fontSize: 12 }}>Enter Showcase</a>
                </div>
              </div>
            )}

            <div className="card" style={{ background: "#09091c" }}>
              <h2 style={{ marginBottom: 16 }}>🤖 Messiah AI MD</h2>
              {plan ? (
                <pre style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: 12, color: "var(--text-dim)", lineHeight: 1.7, overflow: "auto" }}>
                  {plan}
                </pre>
              ) : (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
                  <p>Fill out your profile and get a custom 30-day star-building plan — personalized to your talent, your goals, and your current level.</p>
                  {isYouth && (
                    <p style={{ marginTop: 12, color: "var(--family)", fontSize: 13 }}>
                      👨‍👧 Your plan will include a parent partner section for {profile.parentName || "your parent/guardian"}.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
