import Nav from "../components/Nav"
import { MOVIES, TV_SHOWS, PRODUCT_PLACEMENTS, HOLO_ADS } from "../lib/data"

export default function MoviesPage() {
  return (
    <>
      <Nav />

      <section className="hero-gold">
        <div className="container">
          <span className="badge badge-gold">🎬 Isaiah AI Productions</span>
          <h1 style={{ marginTop: 16 }}>
            <span style={{ color: "var(--gold)" }}>Real Movies.</span><br />
            Real Stories.
          </h1>
          <p style={{ maxWidth: 580, margin: "16px auto 24px", fontSize: 16 }}>
            From 30-minute shorts to 2-hour feature films. Faith-centered stories, real people,
            original music, and holographic advertisement integration. Casting is open now.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/audition" className="btn-gold">🎬 Apply to Cast</a>
            <a href="#product-placement" className="btn-outline">📦 Product Placement</a>
          </div>
        </div>
      </section>

      <main className="container">

        {/* How it works */}
        <div style={{ margin: "40px 0" }}>
          <h2 style={{ marginBottom: 16 }}>How Isaiah AI Productions Works</h2>
          <div className="grid-3">
            {[
              { emoji: "📝", step: "1. Story Development", desc: "Real stories from the community. Isaiah AI assists with script development, scene planning, and narrative structure." },
              { emoji: "🎭", step: "2. Casting Open", desc: "Real people. Youth, adults, families. Submit an audition video. Isaiah AI MD scores every submission." },
              { emoji: "🎬", step: "3. Production", desc: "Filmed on location or in the AMM Omniverse digital studio. Parent consent required for minors on set." },
              { emoji: "✨", step: "4. Holo Ads Integration", desc: "Holographic advertisements appear naturally in scenes. Brand-safe, faith-friendly product placement." },
              { emoji: "📺", step: "5. Release", desc: "Streamed on Isaiah AI TV and AMM Omniverse platform. Available for digital download and licensing." },
              { emoji: "💰", step: "6. Revenue Share", desc: "Cast members and crew share in streaming revenue. Creator economy model — stars earn from the work they create." },
            ].map(s => (
              <div className="card card-gold" key={s.step}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{s.emoji}</div>
                <h3 style={{ color: "var(--gold)", fontSize: 14 }}>{s.step}</h3>
                <p style={{ fontSize: 13, marginTop: 6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Movies */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ marginBottom: 16 }}>🎬 Films in Development</h2>
          {MOVIES.map(movie => (
            <div className="card" key={movie.id} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                    <span className="badge badge-gold">{movie.format.replace("_"," ").toUpperCase()}</span>
                    <span className="badge" style={{ background: "#1a1a00", color: "var(--gold)" }}>⏱ {movie.duration}</span>
                    <span className={`prod-status-${movie.status}`} style={{ fontWeight: 700, fontSize: 12, alignSelf: "center" }}>
                      {movie.status.replace("_"," ").toUpperCase()}
                    </span>
                    {movie.castingOpen && <span className="badge badge-holo">🎭 CASTING OPEN</span>}
                    {movie.parentChildFocus && <span className="badge badge-family">👨‍👧 FAMILY FOCUS</span>}
                    {movie.holoAds && <span className="badge" style={{ background: "#001a00", color: "var(--holo)", border: "1px solid var(--holo-dim)", fontSize: 10 }}>✨ HOLO ADS</span>}
                  </div>
                  <h2>{movie.title}</h2>
                  <p style={{ color: "var(--gold)", fontStyle: "italic", marginTop: 6, fontSize: 14 }}>{movie.logline}</p>
                  <p style={{ marginTop: 10, fontSize: 13 }}>{movie.synopsis}</p>
                  <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "var(--text-muted)" }}>
                    <span>Budget: {movie.budget}</span>
                    <span>Audience: {movie.targetAudience.join(", ")}</span>
                  </div>
                  <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {movie.genre.map(g => <span key={g} className="badge" style={{ fontSize: 10 }}>{g}</span>)}
                  </div>
                  <p style={{ marginTop: 10, color: "var(--family)", fontSize: 13, fontStyle: "italic" }}>
                    Theme: {movie.theme}
                  </p>
                </div>
                <div style={{ textAlign: "center", minWidth: 120 }}>
                  <div style={{ fontSize: 56, marginBottom: 12 }}>🎬</div>
                  {movie.castingOpen && (
                    <a href="/audition" className="btn-gold" style={{ fontSize: 12, display: "block" }}>Apply to Cast</a>
                  )}
                  {movie.aiAssisted && (
                    <div style={{ marginTop: 8, fontSize: 11, color: "var(--holo)" }}>🤖 AI-Assisted</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TV Shows */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ marginBottom: 16 }}>📺 TV Shows</h2>
          <div className="grid">
            {TV_SHOWS.map(show => (
              <div className="card" key={show.id}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  <span className="badge badge-purple">{show.format.replace("_"," ").toUpperCase()}</span>
                  <span className={`prod-status-${show.status}`} style={{ fontWeight: 700, fontSize: 11, alignSelf: "center" }}>
                    {show.status.replace("_"," ").toUpperCase()}
                  </span>
                  {show.holoAds && <span className="badge badge-holo" style={{ fontSize: 9 }}>HOLO ADS</span>}
                </div>
                <h3>{show.title}</h3>
                <p style={{ fontSize: 13, marginTop: 8 }}>{show.description}</p>
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)" }}>
                  <div>{show.episodes} episodes · {show.episodeDuration}</div>
                  {show.hosts.length > 0 && <div>Hosts: {show.hosts.join(", ")}</div>}
                  {show.judges && <div>Judges: {show.judges.slice(0,3).join(", ")}...</div>}
                </div>
                <p style={{ marginTop: 8, fontSize: 13, color: "var(--family)", fontStyle: "italic" }}>
                  {show.theme}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Holographic Ads */}
        <div id="product-placement" style={{ marginBottom: 40 }}>
          <h2 style={{ marginBottom: 8 }}>✨ Holographic Advertisement System</h2>
          <p style={{ marginBottom: 20 }}>Ads appear as holographic overlays during natural breaks in programming. Brand-safe. Faith-friendly. Interactive.</p>
          <div className="grid">
            {HOLO_ADS.map(ad => (
              <div key={ad.id} style={{ background: `${ad.color}11`, border: `1px solid ${ad.color}44`, borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{ad.emoji}</div>
                <div style={{ color: ad.color, fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{ad.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
                  {ad.type.replace("_"," ").toUpperCase()} · {ad.duration}s · Triggers on: {ad.triggerEvent.replace("_"," ")}
                </div>
                <div style={{ background: ad.color, color: "#111", borderRadius: 8, padding: "8px 14px", fontWeight: 800, fontSize: 12, display: "inline-block" }}>
                  {ad.cta}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product placement rates */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ marginBottom: 16 }}>📦 Product Placement Rates</h2>
          <div className="grid">
            {PRODUCT_PLACEMENTS.map(pp => (
              <div className="card" key={pp.id}>
                <h3>{pp.brand}</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{pp.product}</p>
                <div style={{ margin: "10px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span className="badge" style={{ fontSize: 10 }}>{pp.placement.replace("_"," ")}</span>
                  {pp.blackOwned && <span className="badge badge-gold" style={{ fontSize: 10 }}>✊ Black-Owned</span>}
                  {pp.holoCapable && <span className="badge badge-holo" style={{ fontSize: 10 }}>✨ Holo-Ready</span>}
                  {pp.faithFriendly && <span className="badge badge-family" style={{ fontSize: 10 }}>✝️ Faith-Safe</span>}
                </div>
                <div style={{ color: "var(--gold)", fontWeight: 800, fontSize: 16 }}>{pp.rate}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  Shows: {pp.shows.join(" · ")}
                </div>
              </div>
            ))}
          </div>
          <div className="card card-gold" style={{ marginTop: 16 }}>
            <h3>Want to place your Black-owned business in a show or film?</h3>
            <p style={{ fontSize: 13, marginTop: 8 }}>Faith-friendly brands and Black-owned businesses get priority placement. All ads reviewed for family-safe content. Contact through the AMM Marketplace to start the process.</p>
            <a href="https://tryamm.online/marketplace" className="btn-gold" style={{ marginTop: 14, display: "inline-block" }}>List on AMM Marketplace</a>
          </div>
        </div>

      </main>
    </>
  )
}
