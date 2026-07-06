import Link from "next/link"
import Nav from "./components/Nav"
import { STARS, JUDGES, SHOWCASES, TV_SHOWS } from "./lib/data"

export default function Home() {
  const topStars = [...STARS].sort((a, b) => b.score - a.score).slice(0, 3)
  const nextShowcase = SHOWCASES[0]

  return (
    <>
      <Nav />

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <span className="badge badge-gold">✨ Higfield Dance 2.0 · Mythos Blender · Messiah AI MD</span>
          <h1 style={{ marginTop: 16 }}>
            <span style={{ color: "var(--gold)" }}>Anyone</span><br />
            Can Be A Star
          </h1>
          <p style={{ maxWidth: 580, margin: "16px auto 28px", fontSize: 18 }}>
            The first faith-centered AI talent discovery platform. Dancers, athletes, singers, actors,
            creators, speakers, and families rise together through the Starverse.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <Link className="btn-gold" href="/audition">🎤 Submit Audition</Link>
            <Link className="btn-holo" href="/starverse">⭐ Enter Starverse</Link>
            <Link className="btn-outline" href="/showcase">🎭 Online Showcase</Link>
          </div>
          <div style={{ marginTop: 20, display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
            {[["⭐","Starverse Active"],["💃","Higfield Dance 2.0"],["🤖","Messiah AI MD"],["📺","AI TV Live"],["🎬","Movies In Production"]].map(([e, l]) => (
              <div key={l} style={{ color: "var(--text-dim)", fontSize: 13 }}><span style={{ marginRight: 6 }}>{e}</span>{l}</div>
            ))}
          </div>
        </div>
      </section>

      {/* PARENT & CHILD BANNER */}
      <div className="container" style={{ marginTop: 32 }}>
        <div className="parent-child-banner">
          <div className="parent-child-icon">👨‍👧</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4, color: "var(--family)" }}>Parent & Child Program</div>
            <p style={{ fontSize: 14, margin: 0 }}>Every young star needs a parent partner. Isaiah AI Starverse is built for families — parents enroll, support, and celebrate alongside their children every step of the way. Parent consent is required for all performers under 18.</p>
          </div>
          <Link href="/audition" className="btn-family" style={{ flexShrink: 0 }}>Enroll Together</Link>
        </div>
      </div>

      <main className="container">

        {/* NEXT SHOWCASE */}
        <div style={{ margin: "40px 0 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2>🎭 Next Online Showcase</h2>
            <Link href="/showcase" style={{ color: "var(--holo)", fontSize: 14 }}>See all →</Link>
          </div>
          <div className="card card-holo">
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <span className="badge badge-holo">{nextShowcase.format.replace("_", " ").toUpperCase()}</span>
                <h2 style={{ marginTop: 10 }}>{nextShowcase.title}</h2>
                <p>{nextShowcase.date} at {nextShowcase.time}</p>
                <p style={{ marginTop: 6 }}>{nextShowcase.venue}</p>
                <p style={{ marginTop: 8 }}>🏆 {nextShowcase.prizePool}</p>
                <p style={{ marginTop: 4 }}>Entry: ${nextShowcase.entryFee} · {nextShowcase.currentEntries}/{nextShowcase.maxPerformers} spots filled</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🎭</div>
                <Link href="/showcase" className="btn">Register Now</Link>
              </div>
            </div>
          </div>
        </div>

        {/* TOP STARS */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2>⭐ Top Stars This Week</h2>
            <Link href="/starverse" style={{ color: "var(--gold)", fontSize: 14 }}>Full Starverse →</Link>
          </div>
          <div className="grid">
            {topStars.map((star, i) => (
              <div className="card card-star" key={star.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span className="badge badge-gold">#{i + 1} Ranked</span>
                  <span style={{ fontSize: 28 }}>{star.emoji}</span>
                </div>
                <div className="rank" style={{ marginTop: 8 }}>{star.score}</div>
                <h2 style={{ marginTop: 4 }}>{star.name}</h2>
                <p style={{ fontSize: 13 }}>{star.talent.join(" · ")} · {star.city}, {star.state}</p>
                <p style={{ marginTop: 8, fontSize: 13 }}>{star.bio}</p>
                <div style={{ marginTop: 10 }}>
                  <span className={`badge badge-gold`}>{star.level}</span>
                  {star.parentSupported && <span className="badge badge-family" style={{ marginLeft: 6 }}>👨‍👧 Parent Enrolled</span>}
                </div>
                <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-muted)" }}>
                  <span>🗳️ {star.votes.toLocaleString()} votes</span>
                  <Link href="/starverse" style={{ color: "var(--gold)" }}>Vote →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* JUDGES PANEL */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ marginBottom: 16 }}>🎤 Meet the Judges</h2>
          <div className="grid">
            {JUDGES.map(j => (
              <div className={`judge-card judge-style-${j.style}`} key={j.id}>
                <div className="judge-emoji">{j.emoji}</div>
                <h3>{j.name}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 8 }}>{j.title}</p>
                <p style={{ fontSize: 13, fontStyle: "italic", color: "var(--gold)" }}>"{j.aiPersonality}"</p>
                <div style={{ marginTop: 10, display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {j.expertise.slice(0, 3).map(e => <span key={e} className="badge" style={{ fontSize: 10 }}>{e}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WHAT'S ON AI TV */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2>📺 What's on Isaiah AI TV</h2>
            <Link href="/tv" style={{ color: "var(--purple-light)", fontSize: 14 }}>All shows →</Link>
          </div>
          <div className="grid">
            {TV_SHOWS.slice(0, 3).map(show => (
              <div className="card" key={show.id}>
                <span className="badge badge-purple">{show.format.replace("_", " ").toUpperCase()}</span>
                <h3 style={{ marginTop: 10 }}>{show.title}</h3>
                <p style={{ fontSize: 13, marginTop: 6 }}>{show.description.slice(0, 120)}...</p>
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)" }}>
                  {show.episodes} episodes · {show.episodeDuration}
                  {show.holoAds && <span className="badge badge-holo" style={{ marginLeft: 8, fontSize: 10 }}>HOLO ADS</span>}
                </div>
                <div className={`prod-status-${show.status}`} style={{ marginTop: 6, fontSize: 12, fontWeight: 700 }}>
                  {show.status.replace("_", " ").toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PROGRAMS */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ marginBottom: 16 }}>🌟 Programs & Features</h2>
          <div className="grid-3">
            {[
              { emoji: "💃", title: "Higfield Dance 2.0", desc: "Contemporary, hip-hop, praise dance, and stomp. Parent-child enrollment welcome.", href: "/higfield-dance", color: "var(--family)" },
              { emoji: "🎵", title: "Mythos Blender", desc: "Original music production blending gospel, hip-hop, and cinematic sound into one.", href: "/tv", color: "var(--gold)" },
              { emoji: "🤖", title: "Messiah AI MD", desc: "Real-time AI life coaching. Personalized star plans for every talent and every age.", href: "/profile", color: "var(--holo)" },
              { emoji: "📺", title: "Isaiah AI TV", desc: "Live shows, competitions, talk shows, and variety entertainment streaming weekly.", href: "/tv", color: "var(--purple-light)" },
              { emoji: "🎬", title: "Movies & Films", desc: "30-minute shorts to 2-hour features. Casting open. Real productions, real stories.", href: "/movies", color: "#f59e0b" },
              { emoji: "🏆", title: "Online Showcases", desc: "Compete live from anywhere. 5 judges. Real prizes. Fan voting. Global audience.", href: "/showcase", color: "var(--gold)" },
            ].map(p => (
              <Link href={p.href} key={p.title} className="card" style={{ display: "block" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{p.emoji}</div>
                <h3 style={{ color: p.color }}>{p.title}</h3>
                <p style={{ fontSize: 13, marginTop: 6 }}>{p.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "40px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        <p style={{ color: "var(--gold)", fontWeight: 800, fontSize: 16, marginBottom: 8 }}>Isaiah AI Starverse</p>
        <p>Faith · Family · Talent · Legacy · Anyone Can Be A Star</p>
        <p style={{ marginTop: 8 }}>Higfield Dance 2.0 · Mythos Blender · Messiah AI MD · AI TV · AMM Omniverse</p>
        <p style={{ marginTop: 16, fontSize: 11 }}>© 2026 Isaiah AI Starverse · All Rights Reserved · Family-safe · Faith-centered</p>
      </footer>
    </>
  )
}
