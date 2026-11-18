import { lazy,Suspense,useState } from 'react'
const CommonsStreetVerseCharacterStudio=lazy(()=>import('./CommonsStreetVerseCharacterStudio'))
const TRYAMMPrintStudio=lazy(()=>import('./TRYAMMPrintStudio'))

type Step = 'commons' | 'jarvis' | 'conversation' | 'mission' | 'saved'
type Event = { step: Step; at: string; status: 'opened' | 'user_confirmed' | 'requested'; detail: string }
const KEY = 'tryamm_ai_commons_one_push_v1'
const readEvents = (): Event[] => {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(value) ? value.filter(item => item && typeof item.step === 'string') : []
  } catch { return [] }
}

export default function AICommonsOnePush({ onClose, onOpenAgent, onStartMission, onOpenCare }: {
  onClose: () => void
  onOpenAgent: () => void
  onStartMission: () => void
  onOpenCare: () => void
}) {
  const [events, setEvents] = useState<Event[]>(readEvents)
  const [openCharacters,setOpenCharacters]=useState(false)
  const [openPrinter,setOpenPrinter]=useState(false)
  const [notice, setNotice] = useState('AI Commons is ready for a guided integration check. External services are not automatically certified.')
  const record = (step: Step, status: Event['status'], detail: string) => {
    const next = [...events, { step, status, detail, at: new Date().toISOString() }]
    setEvents(next)
    try { localStorage.setItem(KEY, JSON.stringify(next)) }
    catch { setNotice('Browser storage is unavailable: export the report before leaving.') }
    return next
  }
  const exportReport = () => {
    const report = {
      schema: 'tryamm.ai-commons.one-push.v1',
      generatedAt: new Date().toISOString(),
      browser: navigator.userAgent,
      events,
      checks: {
        commons: events.some(e => e.step === 'commons'),
        jarvis_launcher: events.some(e => e.step === 'jarvis'),
        conversation: events.some(e => e.step === 'conversation'),
        mission_launch_requested: events.some(e => e.step === 'mission'),
        local_save_attempted: events.some(e => e.step === 'saved'),
        character_render_verified: false,
        livekit_verified: false,
        npc_response_verified: false,
        mission_completion_verified: false,
        backend_persistence_verified: false
      },
      releaseReady: false,
      note: 'Button events are local evidence only. They do not certify connected agents, mission completion, backend persistence or production readiness.'
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'TRYAMM_AI_Commons_One_Push_Report.json'
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const buttonStyle = { minHeight: 54, padding: '12px 16px', borderRadius: 13, border: '1px solid #62889d', background: '#152737', color: '#fff', fontSize: 16, fontWeight: 750 as const, cursor: 'pointer', textAlign: 'left' as const }
  return (
    <section role="dialog" aria-modal="true" aria-label="TRYAMM AI Commons one-push integration" style={{ position: 'fixed', inset: 0, zIndex: 2147483500, overflowY: 'auto', background: '#07101b', color: '#fff', padding: 'clamp(16px, 4vw, 40px)' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', display: 'grid', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <h1 style={{ fontSize: 26, margin: 0 }}>TRYAMM AI Commons</h1>
          <button onClick={onClose} aria-label="Close AI Commons" style={buttonStyle}>Close ×</button>
        </div>
        <p style={{ lineHeight: 1.6 }}>One entrance to your existing HoloGPT assistant and StreetVerse mission. This checkpoint records real button actions without pretending that unfinished integrations passed.</p>
        <p role="status" aria-live="polite" style={{ background: '#17293a', borderRadius: 12, padding: 12, margin: 0 }}>{notice}</p>
        <button style={buttonStyle} onClick={() => { record('commons', 'opened', 'Opened guided AI Commons entry'); setNotice('AI Commons entry recorded. Open the existing HoloGPT assistant next.') }}>1. ONE PUSH — Enter AI Commons</button>
        <button style={buttonStyle} onClick={() => { record('jarvis', 'requested', 'Requested existing HoloGPT assistant'); onOpenAgent(); setNotice('Existing HoloGPT launched. A real reply still requires manual verification.') }}>2. Meet JARVIS / HoloGPT</button>
        <button style={buttonStyle} onClick={() => { record('conversation', 'user_confirmed', 'User reported an agent conversation'); setNotice('Your conversation confirmation was recorded; this is not an automatic agent-response test.') }}>3. I spoke with the agent</button>
        <button style={buttonStyle} onClick={() => { record('saved', 'requested', 'Attempted local checkpoint save'); setNotice('Local checkpoint updated where browser storage permits. This does not verify backend saves.') }}>4. Save checkpoint locally</button>
        <button style={buttonStyle} onClick={() => { record('mission', 'requested', 'Requested existing StreetVerse city gameplay'); onStartMission() }}>5. Launch existing StreetVerse mission area</button>
        <button style={buttonStyle} onClick={()=>{window.dispatchEvent(new CustomEvent('tryamm:streetverse-open-npc-factory',{detail:{source:'ai-commons',ownerReviewRequired:true}}));setNotice('Character Factory requested. If StreetVerse is not mounted, open the StreetVerse shopping area and create the NPC there.')}}>6. Make approved AI Commons character for StreetVerse</button>
        <button style={buttonStyle} onClick={onOpenCare}>7. Open OmniCare360 care access (nonclinical preview)</button>
        <button style={buttonStyle} aria-expanded={openCharacters} onClick={()=>setOpenCharacters(v=>!v)}>7. AI PLAYGROUND → STREETVERSE CHARACTER STUDIO</button>
        {openCharacters&&<Suspense fallback={<p>Loading AI character tools…</p>}><CommonsStreetVerseCharacterStudio onOpenStreetVerse={onStartMission}/></Suspense>}
        <button style={buttonStyle} aria-expanded={openPrinter} onClick={()=>setOpenPrinter(v=>!v)}>8. 2D CREATOR PRINT STUDIO</button>
        {openPrinter&&<Suspense fallback={<p>Loading original print templates…</p>}><TRYAMMPrintStudio/></Suspense>}
        <button style={buttonStyle} onClick={exportReport}>9. Export JSON test report</button>
        <p style={{ color: '#bad0dc', lineHeight: 1.6 }}>To export a report after visiting StreetVerse, reopen AI Commons. The checkpoint is saved in this browser when storage is available. The mission must be played and separately verified in the existing game.</p>
        <div style={{ fontSize: 14, background: '#211b1b', padding: 14, borderRadius: 12 }}>Production gates still open: character render, NPC interaction, LiveKit, mission completion, backend save, and Chromebook/iPhone end-to-end verification.</div>
      </div>
    </section>
  )
}
