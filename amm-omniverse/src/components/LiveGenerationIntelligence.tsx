import { useMemo, useState } from 'react'

type Generation = 'gen-x' | 'millennial' | 'gen-z' | 'gen-alpha' | 'mixed'

type Profile = {
  label: string
  years: string
  discovery: string
  pacing: string
  captions: string
  hostAssist: string
  moderation: string
}

const PROFILES: Record<Generation, Profile> = {
  'gen-x': {
    label: 'Gen X',
    years: '1965–1980',
    discovery: 'Topic-first discovery, clear titles, trusted hosts and fewer interruptions.',
    pacing: 'Longer context windows, calmer cuts and direct controls.',
    captions: 'Readable captions, larger controls and optional transcript view.',
    hostAssist: 'Surface context, fact-check prompts, agenda tracking and concise recaps.',
    moderation: 'Prioritize civility, spam reduction and clear moderator actions.',
  },
  millennial: {
    label: 'Millennials',
    years: '1981–1996',
    discovery: 'Community, creator, business, podcast and interest-based discovery.',
    pacing: 'Balanced long-form conversation with clip-worthy moments.',
    captions: 'Live captions, chapter markers and replay summaries.',
    hostAssist: 'Prompt follow-ups, commerce hooks, collaboration cues and replay highlights.',
    moderation: 'Context-aware chat controls, harassment protection and transparent actions.',
  },
  'gen-z': {
    label: 'Gen Z',
    years: '1997–2012',
    discovery: 'Fast creator discovery, trends, friends, PK, music and short-form entry points.',
    pacing: 'Faster visual feedback, reactions, clips and interactive moments.',
    captions: 'Always-visible captions, translation and high-contrast mobile layouts.',
    hostAssist: 'Suggest hooks, polls, challenge moments, clip markers and audience prompts.',
    moderation: 'Fast abuse detection, anti-dogpile controls and creator safety shortcuts.',
  },
  'gen-alpha': {
    label: 'Gen Alpha',
    years: '2013+',
    discovery: 'Age-appropriate discovery only, with guardian and youth-safety controls where applicable.',
    pacing: 'Simple navigation, strong visual cues and reduced cognitive load.',
    captions: 'Large captions, read-aloud compatibility and simplified controls.',
    hostAssist: 'Educational prompts, safe participation cues and age-appropriate interaction patterns.',
    moderation: 'Strict youth protections, limited contact surfaces and stronger review gates.',
  },
  mixed: {
    label: 'Mixed Audience',
    years: 'All generations',
    discovery: 'Blend topic, creator, social and accessibility signals without assuming age.',
    pacing: 'Adaptive pacing with user-controlled density and motion.',
    captions: 'Captions, translation, transcript and accessible control sizing by default.',
    hostAssist: 'Balance context, energy, polls, summaries and panel fairness.',
    moderation: 'Use the strongest applicable safety setting for the room and audience.',
  },
}

export default function LiveGenerationIntelligence({ format }: { format: string }) {
  const [generation, setGeneration] = useState<Generation>('mixed')
  const [enabled, setEnabled] = useState(true)
  const profile = PROFILES[generation]

  const modeAssist = useMemo(() => {
    if (format === 'debate') return 'Debate assist: track speaking time, flag interruptions, surface neutral moderator prompts and prepare equal-time reminders.'
    if (format === 'shopping') return 'Shopping assist: surface product context, disclosure reminders, questions and accessible purchase cues without fabricating claims.'
    if (format === 'podcast') return 'Podcast assist: chapters, guest prompts, quote markers, summaries and replay clip suggestions.'
    if (format === 'starverse') return 'StarVerse assist: performance timing, audience prompts, accessibility cues and clip markers.'
    if (format === 'gamecast') return 'GameCast assist: score context, play-by-play prompts, chat safety and highlight markers.'
    return 'LIVE assist: host prompts, captions, audience signals, moderation cues, summaries and clip markers.'
  }, [format])

  return (
    <section aria-label="Generation Intelligence" style={s.card}>
      <div style={s.header}>
        <div>
          <div style={s.eyebrow}>STUBBS AI • LIVE INTELLIGENCE</div>
          <h2 style={s.title}>Gen X → Gen Alpha Intelligence</h2>
        </div>
        <label style={s.toggle}><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} /> Adaptive assist</label>
      </div>

      <p style={s.note}>This is an adaptive AI assistance layer, not a claim of human-level autonomous AGI. It changes presentation and assistance while keeping age, safety and accessibility controls explicit.</p>

      <div style={s.chips} role="group" aria-label="Audience generation profile">
        {(Object.keys(PROFILES) as Generation[]).map(id => (
          <button key={id} type="button" onClick={() => setGeneration(id)} style={{ ...s.chip, ...(generation === id ? s.chipActive : {}) }}>
            {PROFILES[id].label}
          </button>
        ))}
      </div>

      <div style={{ ...s.profile, opacity: enabled ? 1 : .45 }} aria-disabled={!enabled}>
        <div style={s.profileTop}><strong>{profile.label}</strong><span>{profile.years}</span></div>
        <div style={s.grid}>
          <div><b>Discovery</b><span>{profile.discovery}</span></div>
          <div><b>Pacing</b><span>{profile.pacing}</span></div>
          <div><b>Accessibility</b><span>{profile.captions}</span></div>
          <div><b>Host AI</b><span>{profile.hostAssist}</span></div>
          <div><b>Safety</b><span>{profile.moderation}</span></div>
          <div><b>{format.toUpperCase()} mode</b><span>{modeAssist}</span></div>
        </div>
      </div>
    </section>
  )
}

const s: Record<string, React.CSSProperties> = {
  card: { maxWidth: 1200, margin: '16px auto 0', border: '1px solid rgba(79,227,255,.22)', borderRadius: 20, background: 'rgba(5,18,32,.75)', padding: 16 },
  header: { display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' },
  eyebrow: { fontSize: 10, letterSpacing: 2.2, fontWeight: 950, color: '#66e7ff' },
  title: { margin: '4px 0 0', fontSize: 19 },
  toggle: { display: 'flex', gap: 7, alignItems: 'center', fontSize: 12, fontWeight: 800 },
  note: { margin: '10px 0', fontSize: 12, lineHeight: 1.5, opacity: .72 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  chip: { border: '1px solid rgba(255,255,255,.16)', borderRadius: 999, background: '#0b1224', color: '#fff', padding: '8px 11px', cursor: 'pointer', fontWeight: 800, minHeight: 38 },
  chipActive: { border: '1px solid #66e7ff', background: '#123145', boxShadow: '0 0 14px rgba(102,231,255,.18)' },
  profile: { marginTop: 12, borderRadius: 15, background: '#070d1b', border: '1px solid rgba(255,255,255,.08)', padding: 12, transition: 'opacity .2s ease' },
  profileTop: { display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 10 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 9 },
}
