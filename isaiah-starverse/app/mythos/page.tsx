"use client"
import { useState, useRef } from "react"
import Nav from "../components/Nav"

type Genre = "Gospel" | "Hip-Hop" | "Cinematic" | "Trap" | "Worship" | "R&B" | "Jazz" | "Classical"
type BeatLayer = { genre: Genre; intensity: number; active: boolean; emoji: string; color: string }

const GENRE_DATA: Record<Genre, { emoji: string; color: string; description: string; bpm: number }> = {
  Gospel:    { emoji: "✝️", color: "#ffd700", description: "Soul-stirring faith and praise",    bpm: 80  },
  "Hip-Hop": { emoji: "🎤", color: "#ff6600", description: "Street rhythm and lyrical flow",    bpm: 92  },
  Cinematic: { emoji: "🎬", color: "#00ccff", description: "Epic orchestral storytelling",      bpm: 75  },
  Trap:      { emoji: "🥁", color: "#ff0066", description: "Hard-hitting 808s and hi-hats",     bpm: 140 },
  Worship:   { emoji: "🙏", color: "#ffffff", description: "Reverent praise and atmosphere",    bpm: 68  },
  "R&B":     { emoji: "🎸", color: "#ff66cc", description: "Soulful melody and groove",        bpm: 84  },
  Jazz:      { emoji: "🎷", color: "#f59e0b", description: "Improvisation and sophistication",  bpm: 110 },
  Classical: { emoji: "🎻", color: "#c084fc", description: "Orchestral depth and structure",    bpm: 60  },
}

const SIGNATURE_BLENDS = [
  { name: "Kingdom Anthem",    genres: ["Gospel","Cinematic","Trap"],     bpm: 90,  description: "The Mythos Blender signature sound. Faith-powered with cinematic scope and modern trap energy." },
  { name: "Street Testimony",  genres: ["Hip-Hop","Gospel","R&B"],        bpm: 88,  description: "Real stories from real streets. Hip-hop honesty with gospel redemption." },
  { name: "Praise Wave",       genres: ["Worship","Cinematic","R&B"],     bpm: 72,  description: "Surrender and elevation. Calm worship meets sweeping orchestration." },
  { name: "Legacy Record",     genres: ["Jazz","Hip-Hop","Gospel"],       bpm: 95,  description: "For the ones who came before us. Jazz sophistication meets hip-hop truth." },
  { name: "Faith & Fire",      genres: ["Gospel","Trap","Cinematic"],     bpm: 128, description: "High-energy praise for stadiums and sanctuaries alike." },
  { name: "Wisdom Session",    genres: ["Classical","Jazz","Hip-Hop"],    bpm: 85,  description: "Intellectual, layered, timeless. For the thinking creator." },
]

export default function MythosBlenderPage() {
  const [layers, setLayers] = useState<BeatLayer[]>(
    (Object.keys(GENRE_DATA) as Genre[]).map(g => ({
      genre: g, intensity: 0, active: false,
      emoji: GENRE_DATA[g].emoji, color: GENRE_DATA[g].color,
    }))
  )
  const [bpm, setBpm] = useState(90)
  const [selectedBlend, setSelectedBlend] = useState<typeof SIGNATURE_BLENDS[0] | null>(null)
  const [blendName, setBlendName] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [coaching, setCoaching] = useState("")
  const [loadingCoach, setLoadingCoach] = useState(false)
  const [beatDescription, setBeatDescription] = useState("")

  const activeLayers = layers.filter(l => l.active)
  const avgBPM = Math.round(
    activeLayers.reduce((s, l) => s + GENRE_DATA[l.genre].bpm * (l.intensity / 100), 0) /
    Math.max(activeLayers.length, 1)
  )

  function toggleLayer(genre: Genre) {
    setLayers(prev => prev.map(l =>
      l.genre === genre ? { ...l, active: !l.active, intensity: l.active ? 0 : 50 } : l
    ))
  }

  function setIntensity(genre: Genre, val: number) {
    setLayers(prev => prev.map(l => l.genre === genre ? { ...l, intensity: val, active: val > 0 } : l))
  }

  function loadBlend(blend: typeof SIGNATURE_BLENDS[0]) {
    setSelectedBlend(blend)
    setBlendName(blend.name)
    setBpm(blend.bpm)
    setLayers(prev => prev.map(l => ({
      ...l,
      active: blend.genres.includes(l.genre),
      intensity: blend.genres.includes(l.genre) ? 70 : 0,
    })))
  }

  async function getBlendCoaching() {
    if (activeLayers.length === 0) return
    setLoadingCoach(true)
    const blend = activeLayers.map(l => `${l.genre} (${l.intensity}%)`).join(", ")
    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Producer",
        talent: "Music Producer / Mythos Blender",
        goal: `Create a ${blendName || "custom blend"} at ${bpm} BPM blending ${blend}`,
        strength: "Genre blending and original sound creation",
        weakness: "Consistent release schedule",
      }),
    })
    const data = await res.json()
    setCoaching(data.plan)
    setLoadingCoach(false)
  }

  function generateBlendDescription() {
    if (activeLayers.length === 0) { setBeatDescription("Add layers to generate a blend description."); return }
    const names = activeLayers.map(l => l.genre)
    const primary = names[0]
    const secondary = names.slice(1).join(" and ")
    setBeatDescription(
      `This ${blendName || "custom"} blend leads with ${primary} energy${secondary ? `, woven through with ${secondary}` : ""}. ` +
      `Running at ${bpm} BPM, it creates a sound that is ${bpm < 80 ? "slow and meditative" : bpm < 100 ? "mid-tempo and groove-forward" : "high-energy and driving"}. ` +
      `The Mythos Blender system identifies this as a "${primary === "Gospel" || names.includes("Worship") ? "Faith-Forward" : names.includes("Hip-Hop") ? "Street-Ready" : "Signature"}" blend — ` +
      `suitable for ${names.includes("Cinematic") ? "film scores and major placements" : names.includes("Trap") ? "hard-hitting records and anthems" : "intimate sessions and streaming releases"}.`
    )
  }

  return (
    <>
      <Nav />

      {/* Hero */}
      <section style={{ padding: "60px 24px 40px", background: "radial-gradient(circle at top, #1a0050, #070713 55%)", textAlign: "center" }}>
        <span className="badge badge-gold">🎵 Mythos Blender</span>
        <h1 style={{ marginTop: 12, color: "var(--gold)" }}>Mythos Blender</h1>
        <p style={{ maxWidth: 560, margin: "12px auto 0", fontSize: 16 }}>
          The original genre-blending music production system. Gospel meets hip-hop meets cinematic.
          Blend any combination of genres into one original sound. No imitation — only creation.
        </p>
      </section>

      <main className="container">

        {/* Signature Blends */}
        <div style={{ margin: "40px 0" }}>
          <h2 style={{ marginBottom: 4 }}>Signature Blends</h2>
          <p style={{ marginBottom: 16, fontSize: 14 }}>Start with a Marcus Mythos signature blend — or build your own below.</p>
          <div className="grid">
            {SIGNATURE_BLENDS.map(blend => (
              <div key={blend.name}
                className={`card ${selectedBlend?.name === blend.name ? "card-gold" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() => loadBlend(blend)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ color: selectedBlend?.name === blend.name ? "var(--gold)" : "var(--text)" }}>{blend.name}</h3>
                  <span style={{ color: "var(--gold)", fontWeight: 700 }}>{blend.bpm} BPM</span>
                </div>
                <p style={{ fontSize: 13, marginTop: 6 }}>{blend.description}</p>
                <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {blend.genres.map(g => (
                    <span key={g} style={{ background: GENRE_DATA[g as Genre].color + "22", color: GENRE_DATA[g as Genre].color, border: `1px solid ${GENRE_DATA[g as Genre].color}44`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                      {GENRE_DATA[g as Genre].emoji} {g}
                    </span>
                  ))}
                </div>
                {selectedBlend?.name === blend.name && (
                  <div style={{ marginTop: 8, color: "var(--gold)", fontSize: 12, fontWeight: 700 }}>✓ LOADED INTO BLENDER</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Blender Studio */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ marginBottom: 4 }}>🎛️ Blender Studio</h2>
          <p style={{ marginBottom: 20, fontSize: 14 }}>Mix any genres together. Adjust intensity. Set BPM. Name your blend.</p>

          <div className="grid-2">
            {/* Layer controls */}
            <div className="card">
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Blend Name</label>
                <input className="input" placeholder="Name your blend..." value={blendName} onChange={e => setBlendName(e.target.value)} style={{ marginTop: 4 }} />
              </div>
              <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <label style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>BPM: {bpm}</label>
                <input type="range" min={60} max={160} value={bpm} onChange={e => setBpm(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "var(--gold)" }} />
              </div>

              {layers.map(layer => (
                <div key={layer.genre} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <button
                      onClick={() => toggleLayer(layer.genre)}
                      style={{ width: 36, height: 36, borderRadius: "50%", border: `2px solid ${layer.color}`, background: layer.active ? layer.color : "transparent", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}
                    >
                      {layer.active ? layer.emoji : "+"}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
                        <span style={{ color: layer.active ? layer.color : "var(--text-muted)", fontWeight: layer.active ? 700 : 400 }}>{layer.genre}</span>
                        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{layer.intensity}%</span>
                      </div>
                      <input type="range" min={0} max={100} value={layer.intensity}
                        onChange={e => setIntensity(layer.genre, Number(e.target.value))}
                        style={{ width: "100%", accentColor: layer.color, opacity: layer.active ? 1 : 0.3 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Blend preview */}
            <div>
              <div className="card card-gold" style={{ marginBottom: 16, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🎵</div>
                <div style={{ color: "var(--gold)", fontSize: 24, fontWeight: 900, marginBottom: 4 }}>
                  {blendName || "Untitled Blend"}
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 12 }}>
                  {activeLayers.length} layer{activeLayers.length !== 1 ? "s" : ""} · {bpm} BPM target
                </div>
                {/* Active layers visual */}
                <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
                  {activeLayers.length === 0
                    ? <span style={{ color: "var(--text-muted)", fontSize: 13 }}>No layers active yet</span>
                    : activeLayers.map(l => (
                      <div key={l.genre} style={{ background: l.color + "22", border: `1px solid ${l.color}`, borderRadius: 20, padding: "4px 12px", fontSize: 12, color: l.color, fontWeight: 700 }}>
                        {l.emoji} {l.genre} {l.intensity}%
                      </div>
                    ))
                  }
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  <button className="btn-gold" onClick={() => setIsPlaying(!isPlaying)} style={{ fontSize: 13 }}>
                    {isPlaying ? "⏸ Pause" : "▶ Preview"}
                  </button>
                  <button className="btn-holo" onClick={generateBlendDescription} style={{ fontSize: 13 }}>
                    📝 Describe
                  </button>
                </div>
                {isPlaying && (
                  <div style={{ marginTop: 12, fontSize: 12, color: "var(--holo)" }}>
                    🎵 Simulating {blendName || "blend"} playback... (connect Tone.js for real audio)
                  </div>
                )}
              </div>

              {beatDescription && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <h3 style={{ marginBottom: 8, fontSize: 14 }}>Blend Description</h3>
                  <p style={{ fontSize: 13, lineHeight: 1.7 }}>{beatDescription}</p>
                </div>
              )}

              <div className="card">
                <h3 style={{ marginBottom: 12 }}>🤖 Messiah AI MD Music Coaching</h3>
                {coaching ? (
                  <pre style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: 11, color: "var(--text-dim)", lineHeight: 1.6, maxHeight: 300, overflow: "auto" }}>
                    {coaching}
                  </pre>
                ) : (
                  <p style={{ fontSize: 13, marginBottom: 12 }}>
                    Build your blend above, then get a personalized production coaching plan from Messiah AI MD.
                  </p>
                )}
                <button className="btn" onClick={getBlendCoaching} disabled={loadingCoach || activeLayers.length === 0}
                  style={{ width: "100%", opacity: activeLayers.length === 0 ? 0.4 : 1, fontSize: 13 }}>
                  {loadingCoach ? "Messiah AI MD thinking..." : "🤖 Get Production Coaching"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* How Mythos Blender works */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ marginBottom: 16 }}>How Mythos Blender Works</h2>
          <div className="grid-3">
            {[
              { emoji: "🎛️", title: "Layer Any Genres", desc: "Choose from 8 base genres. Stack them in any combination. No rules — only creativity." },
              { emoji: "⚖️", title: "Adjust Intensity", desc: "Control how much of each genre comes through. 100% Gospel + 30% Trap is a completely different sound than 50/50." },
              { emoji: "⏱", title: "Set Your BPM", desc: "BPM defines the feel. 68 BPM worship and 140 BPM trap are different worlds — the blend lives between them." },
              { emoji: "🤖", title: "Messiah AI MD Coaching", desc: "Get production advice personalized to your specific blend — release strategy, mix tips, and career direction." },
              { emoji: "📦", title: "Export to AMM", desc: "Connect to AMM Omniverse Set Apart Music Network to upload and distribute your blended tracks directly." },
              { emoji: "🎬", title: "Film Placement Ready", desc: "Mythos Blender tracks are formatted for Isaiah AI Productions film and TV placements. Create once — place everywhere." },
            ].map(f => (
              <div className="card" key={f.title}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{f.emoji}</div>
                <h3 style={{ color: "var(--gold)", fontSize: 14 }}>{f.title}</h3>
                <p style={{ fontSize: 13, marginTop: 6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AMM integration */}
        <div className="card card-holo" style={{ marginBottom: 40, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontSize: 48 }}>🌐</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: "var(--holo)" }}>Connected to AMM Omniverse</h3>
            <p style={{ fontSize: 14, marginTop: 6 }}>Upload your Mythos Blender tracks to the Set Apart Music Network on AMM Omniverse. Earn $0.015–$0.019 per qualified stream — 3–6× Spotify rates. Keep 90% of royalties. No record deal required.</p>
          </div>
          <a href="https://tryamm.online" className="btn-holo" style={{ flexShrink: 0 }}>Upload to AMM</a>
        </div>

      </main>
    </>
  )
}
