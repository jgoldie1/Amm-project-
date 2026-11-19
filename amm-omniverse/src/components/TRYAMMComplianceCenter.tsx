import { useState } from 'react'

const departments = [
  { name: 'HIPAA / OmniCare360', description: 'Data flows, role determination, BAAs, risk analysis, access controls, security evidence, incident response, clinician/telehealth approval', blocked: true },
  { name: 'AI Law and Governance', description: 'AI model register, risk classification, IP and licensing review, consumer claims, privacy notices, counsel escalation and documented human signoff', blocked: true },
  { name: 'Accessibility and Youth Safety', description: 'One-hand control tests, keyboard focus, captions, assistive technology, age gates, minors and education privacy review', blocked: true },
  { name: 'Creator and Business Economy', description: 'Licenses, payout disclosure, authorized customer consent, refunds, invoices, taxes and permitted use of partner information', blocked: true },
  { name: 'Trading / Financial Services', description: 'Paper trading only until actual broker integration, adviser/broker laws, market-abuse controls, consent and authorization have been reviewed', blocked: true },
]
const controls = [
  'Legal role and responsible officers appointed', 'Inventory of sensitive data and vendors approved',
  'HIPAA/FTC/state-law applicability reviewed', 'Security risk analysis and mitigation approved',
  'Required BAAs and telehealth vendor diligence complete',
  'Clinical licensing, malpractice, informed consent reviewed',
  'MFA, authorization, audit logging and encryption verified',
  'PHI isolation from game, advertising and AI memory verified',
  'Incident response, breach notifications and restore drill tested',
  'Accessibility, minors and language-access testing complete',
  'Financial, creator and AI model licensing reviewed',
  'Independent legal, security and product release signatures obtained'
]
export default function TRYAMMComplianceCenter({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'controls' | 'departments' | 'autonomy'>('controls')
  const actionStyle = { minHeight: 50, borderRadius: 12, padding: '10px 14px', fontWeight: 750, background: '#16334a', color: '#fff', border: '1px solid #6eb8d0', cursor: 'pointer' } as const
  return <section role="dialog" aria-modal="true" aria-label="TRYAMM compliance and AI law department" style={{ position: 'fixed', inset: 0, zIndex: 2147483550, background: '#07121c', color: '#fff', overflow: 'auto', padding: 'clamp(16px,4vw,38px)' }}>
    <main style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gap: 18 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 27 }}>TRYAMM Compliance & AI Law</h1><button onClick={onClose} style={actionStyle}>Close</button>
      </header>
      <p role="status" style={{ border: '2px solid #b68e4c', padding: 14, borderRadius: 12, lineHeight: 1.6 }}>
        <strong>RELEASE BLOCKED — planning and controls inventory only.</strong> This is not a HIPAA certification, legal department staffed by lawyers, clinical service, investment service or proof of operational compliance.
      </p>
      <nav aria-label="Compliance views" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button style={actionStyle} onClick={() => setTab('controls')} aria-pressed={tab==='controls'}>Release gates</button>
        <button style={actionStyle} onClick={() => setTab('departments')} aria-pressed={tab==='departments'}>Departments</button>
        <button style={actionStyle} onClick={() => setTab('autonomy')} aria-pressed={tab==='autonomy'}>AI automation</button>
      </nav>
      {tab==='controls' && <div style={{ display: 'grid', gap: 9 }}>
        <h2>Evidence required before regulated launch</h2>
        {controls.map((label, index)=><div key={label} style={{ border: '1px solid #355367', borderRadius: 10, padding: 12, lineHeight: 1.55 }}><strong>{index+1}. {label}</strong><div style={{ color: '#ffca81' }}>Not verified</div></div>)}
      </div>}
      {tab==='departments' && <div style={{ display: 'grid', gap: 10 }}>
        {departments.map(item=><article key={item.name} style={{ background: '#142434', borderRadius: 12, padding: 16 }}>
          <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>{item.name}</h2><p style={{ margin: 0, lineHeight: 1.6 }}>{item.description}</p><p style={{ color: '#ffca81' }}>{item.blocked ? 'Not approved for regulated operation' : 'Approved'}</p>
        </article>)}
      </div>}
      {tab==='autonomy' && <article style={{ lineHeight: 1.75 }}>
        <h2>What AI can do without pretending to be a licensed professional</h2>
        <p>Assist with public information, optional accessible site navigation, non-sensitive creator listings, support ticket drafts, publication review queues and paper trading simulations.</p>
        <h2>Always requires separate authorization</h2>
        <p>Real-money trading, customer charging, binding contracts, legal representation, individual medical decisions, prescriptions, clinical video and access to patient records are disabled by policy until a separately reviewed and authorized system exists.</p>
        <p>No automated profit is guaranteed. Human accountability and auditable permissions remain mandatory.</p>
      </article>}
    </main>
  </section>
}
