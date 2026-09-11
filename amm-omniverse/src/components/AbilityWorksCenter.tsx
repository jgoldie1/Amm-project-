import { useMemo, useState } from 'react'

type Tab = 'start' | 'jobs' | 'employers' | 'funding' | 'impact'

type FundingLayer = {
  name: string
  purpose: string
  payer: string
}

const fundingLayers: FundingLayer[] = [
  { name: 'Government workforce', purpose: 'Training, placement, supported employment and program delivery', payer: 'Federal, state and local agencies' },
  { name: 'Vocational rehabilitation', purpose: 'Eligible disability employment and training services', payer: 'State VR and approved partners' },
  { name: 'Education partnerships', purpose: 'Career pathways, credentials, labs and cohorts', payer: 'Schools, colleges and training partners' },
  { name: 'Employer-paid workforce', purpose: 'Recruiting, training, accessibility and retention support', payer: 'Employers' },
  { name: 'Corporate sponsorship', purpose: 'Sponsored cohorts, equipment, scholarships and events', payer: 'Corporate partners' },
  { name: 'Foundations', purpose: 'Pilot programs, scholarships, operations and community impact', payer: 'Philanthropic organizations' },
  { name: 'Government contracting', purpose: 'Technology, training, program management and outreach', payer: 'Government buyers / prime contractors' },
  { name: 'TRYAMM commercial services', purpose: 'Funding readiness, SaaS, licensing and implementation', payer: 'Organizations and businesses' },
]

const servicePricing = [
  ['Ability Passport / participant intake', '$0 when sponsored or eligible'],
  ['Funding Stack live class', '$149'],
  ['Funding Readiness Assessment', '$299'],
  ['Funding Passport Pro', '$499'],
  ['Employer accessibility/readiness assessment', '$750'],
  ['Small-business funding strategy', '$1,250'],
  ['Full organizational Funding Stack', '$2,500+'],
  ['Workforce training', '$1,500–$5,000/person'],
  ['Advanced technical training', '$5,000–$12,500/person'],
  ['Employer cohort', '$15,000–$100,000+'],
  ['Community/agency implementation', '$50,000–$250,000+'],
  ['City/state deployment', '$250,000–$1M+'],
]

const abilityPath = [
  'Create Ability Passport',
  'Choose accessibility preferences',
  'Select training pathway',
  'Complete competency-based learning',
  'Match to jobs / remote work / entrepreneurship',
  'Record verified placement or business outcome',
  'Track retention and economic impact',
]

const employerServices = [
  'Inclusive recruiting and candidate pipeline',
  'Accessible onboarding support',
  'Workforce cohort training',
  'Accessibility/readiness assessment',
  'Retention and outcome reporting',
  'Remote-work and AI-assisted operations pathways',
]

const jobs = [
  'AI-assisted customer support',
  'Cybersecurity and QA',
  'Creator/media operations',
  'Business onboarding and support',
  'Accessibility testing',
  'Digital administration',
  'Localization and translation operations',
  'Entrepreneurship / business launch',
]

const cardStyle: React.CSSProperties = {
  border: '1px solid #263a58',
  background: '#0b1324',
  borderRadius: 16,
  padding: 16,
}

export default function AbilityWorksCenter({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('start')
  const [status, setStatus] = useState('BUILDING')
  const tabs = useMemo(() => ([
    ['start', '♿ Start'],
    ['jobs', '💼 Jobs'],
    ['employers', '🏢 Employers'],
    ['funding', '💰 Funding Stack'],
    ['impact', '📊 Impact'],
  ] as const), [])

  return <div role="dialog" aria-modal="true" aria-label="TRYAMM AbilityWorks" style={{ position: 'fixed', inset: 0, zIndex: 12050, overflowY: 'auto', background: '#050816', color: '#fff', fontFamily: 'system-ui,sans-serif' }}>
    <header style={{ position: 'sticky', top: 0, zIndex: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '14px 18px', background: '#080e1d', borderBottom: '1px solid #263a58' }}>
      <div>
        <div style={{ fontSize: 10, letterSpacing: 3, fontWeight: 900, color: '#58e1ff' }}>TRYAMM NATIONAL COMMUNITY IMPACT</div>
        <strong style={{ fontSize: 22 }}>♿ AbilityWorks™</strong>
        <div style={{ fontSize: 12, opacity: .72 }}>Disability workforce · education · employers · funding · economic outcomes</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span aria-label={`Program status ${status}`} style={{ fontSize: 10, fontWeight: 900, padding: '7px 10px', borderRadius: 999, background: status === 'LIVE' ? '#123a28' : '#3a2e12', color: status === 'LIVE' ? '#8affbd' : '#ffd66b' }}>{status}</span>
        <button onClick={onClose} aria-label="Close AbilityWorks" style={{ width: 48, height: 48, borderRadius: 14, border: '1px solid #60708c', background: '#131a2c', color: '#fff', fontSize: 26 }}>×</button>
      </div>
    </header>

    <nav aria-label="AbilityWorks sections" style={{ display: 'flex', gap: 8, padding: 12, flexWrap: 'wrap', maxWidth: 1100, margin: '0 auto' }}>
      {tabs.map(([id, label]) => <button key={id} onClick={() => setTab(id)} style={{ minHeight: 48, padding: '10px 15px', borderRadius: 12, border: tab === id ? '2px solid #58e1ff' : '1px solid #33415f', background: tab === id ? '#0e3144' : '#101729', color: '#fff', fontWeight: 850 }}>{label}</button>)}
    </nav>

    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 16px 40px' }}>
      {tab === 'start' && <section>
        <h1 style={{ fontSize: 'clamp(28px,6vw,48px)', marginBottom: 8 }}>Ability Passport → Skills → Work → Independence</h1>
        <p style={{ maxWidth: 850, opacity: .8, lineHeight: 1.7 }}>AbilityWorks is the cross-disability workforce and community-development program inside TRYAMM. The participant should not be treated as the primary payer. Sponsored and eligible services can be offered at $0 participant cost while agencies, employers, education partners, sponsors and contracted programs pay TRYAMM for legitimate deliverables.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginTop: 18 }}>
          {abilityPath.map((item, index) => <div key={item} style={cardStyle}><div style={{ color: '#58e1ff', fontWeight: 950, fontSize: 12 }}>STEP {index + 1}</div><div style={{ marginTop: 8, fontWeight: 800 }}>{item}</div></div>)}
        </div>
        <div style={{ ...cardStyle, marginTop: 18, borderColor: '#725f25' }}>
          <strong style={{ color: '#ffd66b' }}>Privacy rule</strong>
          <p style={{ marginBottom: 0, opacity: .78, lineHeight: 1.6 }}>Collect only the minimum disability/accommodation information needed for the service. Keep accommodation information separate from ordinary employer-visible profiles and disclose it only with appropriate user authorization and legal basis.</p>
        </div>
      </section>}

      {tab === 'jobs' && <section>
        <h2>MiddleVerse Ability Jobs™</h2>
        <p style={{ opacity: .78 }}>Initial work pathways for accessible, remote, hybrid and entrepreneurship opportunities.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 12 }}>
          {jobs.map(job => <div key={job} style={cardStyle}><strong>{job}</strong><div style={{ marginTop: 8, fontSize: 12, opacity: .66 }}>Training + competency evidence + employer matching + verified outcome</div></div>)}
        </div>
        <div style={{ ...cardStyle, marginTop: 18 }}><strong>Employment guardrail</strong><p style={{ opacity: .75, marginBottom: 0 }}>TRYAMM can prepare and match candidates but must not guarantee a job because someone bought or completed training. Compensation, worker classification, accommodations and employment terms must be validated for the applicable jurisdiction and employer.</p></div>
      </section>}

      {tab === 'employers' && <section>
        <h2>Inclusive Employer Network™</h2>
        <p style={{ opacity: .78 }}>Employers become a paying customer class for recruiting, training, accessibility and retention support.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12 }}>
          {employerServices.map(service => <div key={service} style={cardStyle}><strong>{service}</strong></div>)}
        </div>
        <div style={{ ...cardStyle, marginTop: 18 }}>
          <h3 style={{ marginTop: 0 }}>Illustrative employer offers</h3>
          <p><strong>Inclusive Employer Starter:</strong> $2,500</p>
          <p style={{ marginBottom: 0 }}><strong>AbilityWorks Enterprise:</strong> $10,000–$50,000+ annually, scoped by workforce size, locations and service level.</p>
        </div>
      </section>}

      {tab === 'funding' && <section>
        <h2>Funding Stack™</h2>
        <p style={{ opacity: .78 }}>One program can combine multiple lawful funding sources instead of depending on a single grant.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>
          {fundingLayers.map(layer => <div key={layer.name} style={cardStyle}><strong style={{ color: '#58e1ff' }}>{layer.name}</strong><p style={{ margin: '8px 0', opacity: .8 }}>{layer.purpose}</p><div style={{ fontSize: 12, opacity: .62 }}>Typical payer: {layer.payer}</div></div>)}
        </div>
        <h3 style={{ marginTop: 26 }}>TRYAMM proposed commercial rate card</h3>
        <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid #263a58' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
            <thead><tr style={{ background: '#101a2d' }}><th style={{ textAlign: 'left', padding: 12 }}>Service</th><th style={{ textAlign: 'left', padding: 12 }}>Proposed price</th></tr></thead>
            <tbody>{servicePricing.map(([service, price]) => <tr key={service} style={{ borderTop: '1px solid #25324b' }}><td style={{ padding: 12 }}>{service}</td><td style={{ padding: 12, fontWeight: 800 }}>{price}</td></tr>)}</tbody>
          </table>
        </div>
        <p style={{ fontSize: 12, opacity: .62, lineHeight: 1.6 }}>These are TRYAMM planning prices, not government reimbursement rates or guaranteed allowable costs. Every government, workforce, education or VR contract must follow its own procurement, eligibility, cost and billing rules.</p>
      </section>}

      {tab === 'impact' && <section>
        <h2>Community Impact Ledger™</h2>
        <p style={{ opacity: .78 }}>Founder Command Nexus should report verified aggregate outcomes, not unverified marketing claims.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 12 }}>
          {['Participants enrolled','Training completed','Competencies mastered','Credentials earned','Interviews/referrals','Verified placements','90/180/365-day retention','Businesses launched','Businesses hiring graduates','Wages / contract income','Sponsored training dollars','Government / employer program revenue'].map(metric => <div key={metric} style={cardStyle}><div style={{ fontSize: 26, fontWeight: 950, color: '#58e1ff' }}>—</div><div style={{ marginTop: 6 }}>{metric}</div><div style={{ marginTop: 5, fontSize: 11, color: '#ffd66b' }}>Connect verified data source</div></div>)}
        </div>
        <div style={{ ...cardStyle, marginTop: 18 }}><strong>Release rule</strong><p style={{ opacity: .75, marginBottom: 0 }}>This screen stays BUILDING until the participant path, employer workflow, authorized payer/billing flow and verified outcome data are connected to production services and pass accessibility, security and release checks.</p></div>
        <button onClick={() => setStatus(status === 'BUILDING' ? 'BUILDING' : 'BUILDING')} style={{ marginTop: 18, minHeight: 48, padding: '0 18px', borderRadius: 12, border: '1px solid #60708c', background: '#101729', color: '#fff', fontWeight: 800 }}>STATUS: BUILDING</button>
      </section>}
    </main>
  </div>
}
