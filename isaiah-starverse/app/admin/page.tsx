import Nav from "../components/Nav"
import { STARS, AUDITIONS, JUDGES, SHOWCASES, MOVIES, TV_SHOWS, PRODUCT_PLACEMENTS } from "../lib/data"

export default function AdminPage() {
  const totalVotes = STARS.reduce((s, st) => s + st.votes, 0)
  const youthStars = STARS.filter(s => s.age && s.age < 18)
  const parentEnrolled = STARS.filter(s => s.parentSupported)
  const showcaseReady = STARS.filter(s => s.showcaseReady)

  return (
    <>
      <Nav />

      <section style={{ padding: "40px 24px", background: "radial-gradient(circle at top, #1a1a3a, #070713 50%)" }}>
        <div className="container">
          <span className="badge">⚙️ Admin Review Board</span>
          <h1 style={{ marginTop: 12 }}>Platform Command Center</h1>
          <p>Senior team view for talent discovery, moderation, showcase management, and production oversight.</p>
        </div>
      </section>

      <main className="container" style={{ marginTop: 32 }}>

        {/* Platform stats */}
        <h2 style={{ marginBottom: 16 }}>📊 Platform Stats</h2>
        <div className="grid" style={{ marginBottom: 40 }}>
          {[
            { label: "Total Stars", value: STARS.length, color: "var(--gold)", emoji: "⭐" },
            { label: "Total Votes", value: totalVotes.toLocaleString(), color: "var(--purple-light)", emoji: "🗳️" },
            { label: "Youth Stars (under 18)", value: youthStars.length, color: "var(--family)", emoji: "🧒" },
            { label: "Parent Enrolled", value: parentEnrolled.length, color: "var(--family)", emoji: "👨‍👧" },
            { label: "Showcase Ready", value: showcaseReady.length, color: "var(--holo)", emoji: "🎭" },
            { label: "Auditions Received", value: AUDITIONS.length, color: "var(--gold)", emoji: "🎤" },
            { label: "TV Shows", value: TV_SHOWS.length, color: "var(--purple-light)", emoji: "📺" },
            { label: "Films in Dev", value: MOVIES.length, color: "var(--gold)", emoji: "🎬" },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32 }}>{s.emoji}</div>
              <div style={{ color: s.color, fontSize: 28, fontWeight: 900, marginTop: 6 }}>{s.value}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Safety rules */}
        <div className="card card-family" style={{ marginBottom: 40 }}>
          <h2 style={{ marginBottom: 12 }}>🛡️ Platform Safety Rules</h2>
          <div className="grid-2">
            {[
              "No bullying, harassment, or negative commentary about performers",
              "No exploitation of minors — parent consent required for all under-18 participants",
              "No fake votes, bot traffic, or vote manipulation",
              "No stolen content — original work only in auditions",
              "No adult content — family-safe and faith-centered at all times",
              "All youth performers must have a parent or guardian account linked",
              "Judges score on talent, character, growth, and story — not appearance",
              "All product placements reviewed for family-safe and faith-friendly compliance",
            ].map((rule, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                <span style={{ color: "var(--family)", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                <span style={{ color: "var(--text-dim)" }}>{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stars */}
        <h2 style={{ marginBottom: 16 }}>⭐ All Stars</h2>
        <div style={{ marginBottom: 40, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
                {["Name","Talent","Level","Score","Votes","Parent","Showcase Ready","Age"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 12px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...STARS].sort((a, b) => b.score - a.score).map(star => (
                <tr key={star.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 700 }}>{star.emoji} {star.name}</td>
                  <td style={{ padding: "10px 12px", color: "var(--text-muted)" }}>{star.talent.join(", ")}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span className="badge badge-gold" style={{ fontSize: 10 }}>{star.level}</span>
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--gold)", fontWeight: 700 }}>{star.score}</td>
                  <td style={{ padding: "10px 12px" }}>{star.votes.toLocaleString()}</td>
                  <td style={{ padding: "10px 12px" }}>{star.parentSupported ? "✅" : "—"}</td>
                  <td style={{ padding: "10px 12px" }}>{star.showcaseReady ? "✅" : "⏳"}</td>
                  <td style={{ padding: "10px 12px", color: "var(--text-muted)" }}>{star.age || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Auditions */}
        <h2 style={{ marginBottom: 16 }}>🎤 Auditions</h2>
        <div className="grid" style={{ marginBottom: 40 }}>
          {AUDITIONS.map(a => (
            <div className="card" key={a.id}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span className={`badge ${a.status === "featured" ? "badge-gold" : a.status === "approved" ? "badge-holo" : "badge-purple"}`}>
                  {a.status.toUpperCase()}
                </span>
                <span style={{ color: "var(--gold)", fontWeight: 700 }}>{a.score}/100</span>
              </div>
              <h3>{a.name}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{a.talent} · {a.city}, {a.state}</p>
              <p style={{ fontSize: 13, marginTop: 8 }}>{a.story}</p>
              {a.parentName && <p style={{ fontSize: 12, color: "var(--family)", marginTop: 6 }}>👨‍👧 Parent: {a.parentName}</p>}
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>Submitted: {a.submittedAt}</p>
              {a.judgeScores.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Judge Scores:</div>
                  {a.judgeScores.map((js, i) => (
                    <div key={i} style={{ fontSize: 11, color: "var(--text-dim)" }}>
                      Judge {i + 1}: {js.score}/100 — {js.comment}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Product placements */}
        <h2 style={{ marginBottom: 16 }}>📦 Active Sponsorships</h2>
        <div className="grid" style={{ marginBottom: 40 }}>
          {PRODUCT_PLACEMENTS.map(pp => (
            <div className="card" key={pp.id}>
              <h3>{pp.brand}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{pp.product}</p>
              <div style={{ margin: "8px 0", display: "flex", gap: 4, flexWrap: "wrap" }}>
                {pp.blackOwned && <span className="badge badge-gold" style={{ fontSize: 10 }}>✊ Black-Owned</span>}
                {pp.faithFriendly && <span className="badge badge-family" style={{ fontSize: 10 }}>✝️ Faith-Safe</span>}
                {pp.holoCapable && <span className="badge badge-holo" style={{ fontSize: 10 }}>✨ Holo</span>}
              </div>
              <div style={{ color: "var(--gold)", fontWeight: 700 }}>{pp.rate}</div>
            </div>
          ))}
        </div>

      </main>
    </>
  )
}
