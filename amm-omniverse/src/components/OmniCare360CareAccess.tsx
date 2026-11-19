import { useState, type CSSProperties } from 'react'

export default function OmniCare360CareAccess({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'care' | 'insurance' | 'partners' | 'access' | 'readiness'>('care')
  const button: CSSProperties = { minHeight: 54, borderRadius: 12, padding: '12px 16px', background: '#183b4a', border: '1px solid #4ebebd', color: 'white', fontSize: 17, fontWeight: 750, cursor: 'pointer' }
  return <section role="dialog" aria-modal="true" aria-label="OmniCare360 care access" style={{ position: 'fixed', inset: 0, zIndex: 2147483550, overflowY: 'auto', padding: 'clamp(16px,4vw,36px)', color: '#fff', background: '#071725' }}>
    <main style={{ maxWidth: 760, margin: '0 auto', display: 'grid', gap: 18 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 27 }}>OmniCare360 · Care Access</h1>
        <button onClick={onClose} style={button}>Close</button>
      </header>
      <p style={{ lineHeight: 1.65 }}>TRYAMM's healthcare access and accessibility pathway. This preview can help visitors learn about planned care coordination, telehealth partnerships, and mobility support.</p>
      <div role="status" style={{ padding: 16, background: '#2d2523', borderRadius: 12, lineHeight: 1.6 }}>
        <strong>Clinical services are not active in this interface.</strong> No medical appointments, prescribing, provider credentials, patient records, or insurance transactions are connected or verified. Do not submit personal health information here.
      </div>
      <nav aria-label="OmniCare360 information" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button style={button} aria-pressed={tab==='care'} onClick={() => setTab('care')}>Care coordination</button>
        <button style={button} aria-pressed={tab==='insurance'} onClick={() => setTab('insurance')}>Insurance & Raymond</button>
        <button style={button} aria-pressed={tab==='partners'} onClick={() => setTab('partners')}>Telehealth partners</button>
        <button style={button} aria-pressed={tab==='access'} onClick={() => setTab('access')}>Accessibility</button>
        <button style={button} aria-pressed={tab==='readiness'} onClick={() => setTab('readiness')}>Clinical readiness</button>
      </nav>
      {tab === 'care' && <article><h2>Care coordination</h2><p>Planned services include accessible appointment navigation, provider directory search, nonclinical resource guidance, and support for caregivers. Any actual booking must be handled by a verified healthcare provider or authorized HIPAA-appropriate system.</p></article>}
      {tab === 'insurance' && <article style={{lineHeight:1.65}}><h2>Raymond Jarreau · Insurance Services</h2><p>The TRYAMM project owner identifies Raymond as the proposed licensed insurance-services lead for OmniCare360. Existing designs cover insurance education, health and life insurance navigation, 401(k) and retirement education, infinite banking concepts, and legacy planning referrals.</p><p>Insurance enrollment, quotes, policy sales, and customer account services remain unavailable until Raymond's active producer license, lines of authority, permitted states, insurer appointments where required, approved disclosures and secured service partners are verified.</p><p>Insurance-services oversight is different from providing clinical telehealth. Clinical video appointments, diagnosis, prescribing and EHR access remain restricted to appropriately authorized healthcare providers and systems.</p></article>}
      {tab === 'partners' && <article><h2>Telehealth partnerships</h2><p>Provider enrollment, licensing verification, secure communications, consent, agreements and healthcare privacy review are required before a clinical visit can be launched. There is no live consultation link in this preview.</p></article>}
      {tab === 'access' && <article><h2>Accessible access</h2><p>Large one-hand controls, readable instructions, keyboard support, caption options, and mobility-friendly navigation are priorities. Device-specific usability and accessibility conformance still require testing.</p></article>}
      {tab === 'readiness' && <article style={{lineHeight:1.65}}><h2>Evidence and provider readiness</h2><p>Checklist selections have not been verified with signed documents. No licensed clinical organization has been validated for OmniCare360 in this integration.</p><ol>{['Choose and contract with a licensed clinical operator','Check clinician licensing and malpractice against primary records','Verify executed BAAs and vendor security reviews','Configure isolated patient identity, scheduling and clinician-only video','Obtain telehealth and privacy consent workflow approval','Connect protected records within an authorized EHR','Complete HIPAA role determination and documented security risk analysis','Test accessible patient journeys on Chromebook and iPhone','Collect independent clinical, privacy, security and legal authorization'].map(item=><li key={item} style={{marginBottom:8}}>{item} — Evidence outstanding</li>)}</ol><p>Patient records, booking, diagnosis, and calls remain disabled. Public information and care-navigation planning may continue without collecting medical details.</p></article>}
      <p style={{ fontSize: 14, opacity: .85, lineHeight: 1.6 }}>For an immediate medical emergency, call 911 in the United States. This page is not for diagnosis, treatment, triage, or emergencies.</p>
    </main>
  </section>
}
