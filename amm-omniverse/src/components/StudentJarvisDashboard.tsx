import { useMemo, useState } from 'react';
import { coreLearningCredentials, createLearningPassport, learningPassportSummary, type LearningCredential } from '../education/learningPassport';
import { loadAccessibilityPassport } from '../accessibility/accessibilityPassport';
import { rankStudentOpportunities, type StudentOpportunity } from '../education/studentOpportunity';

const demoOpportunities: StudentOpportunity[] = [
  {
    id: 'demo-scholarship',
    title: 'Scholarship readiness example',
    organization: 'TRYAMM Demo',
    type: 'scholarship',
    stages: ['high', 'college'],
    features: { remote: true, captioning: true, accommodation_process: true },
    requirements: ['Verify official eligibility before applying'],
    source: 'demo-only',
    lastVerifiedAt: new Date().toISOString(),
  },
  {
    id: 'demo-internship',
    title: 'Accessible creator internship example',
    organization: 'TRYAMM Demo',
    type: 'internship',
    stages: ['high', 'college', 'adult'],
    features: { remote: true, flexible_schedule: true, keyboard_accessible: true, one_handed_compatible: true },
    requirements: ['Portfolio or learning project'],
    source: 'demo-only',
    lastVerifiedAt: new Date().toISOString(),
  },
];

export default function StudentJarvisDashboard() {
  const [passport, setPassport] = useState(() => createLearningPassport({
    stage: 'high',
    credentials: coreLearningCredentials.map((credential) => ({ ...credential })),
    goals: ['Finish school strong', 'Build financial literacy', 'Find the next opportunity'],
  }));

  const summary = useMemo(() => learningPassportSummary(passport), [passport]);
  const accessibility = useMemo(() => loadAccessibilityPassport(), []);
  const matches = useMemo(() => rankStudentOpportunities(passport, accessibility, demoOpportunities), [passport, accessibility]);

  function advanceCredential(id: string) {
    const credentials = passport.credentials.map((credential): LearningCredential => {
      if (credential.id !== id) return credential;
      if (credential.status === 'not_started') return { ...credential, status: 'in_progress', progress: 25 };
      if (credential.status === 'in_progress') return { ...credential, status: 'completed', progress: 100, completedAt: new Date().toISOString() };
      return credential;
    });
    setPassport({ ...passport, credentials, lastActiveAt: new Date().toISOString() });
  }

  return (
    <section aria-labelledby="student-jarvis-title" style={{ minHeight: '100vh', overflowY: 'auto', background: '#050814', color: 'white', padding: '24px', paddingBottom: '120px' }}>
      <header style={{ maxWidth: 1100, margin: '0 auto 24px' }}>
        <p style={{ margin: 0, color: '#73e7ff', fontWeight: 800 }}>POWERED BY STUBBS AI</p>
        <h1 id="student-jarvis-title" style={{ margin: '6px 0' }}>Student JARVIS</h1>
        <p style={{ maxWidth: 760, opacity: .82 }}>One place for school, Learning Passport progress, financial-literacy milestones, accessibility-aware opportunities, scholarships, college/trade planning and the next action to take.</p>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 18 }}>
        <article style={cardStyle}>
          <h2 style={headingStyle}>Today</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            <Action text="Finish the most urgent school assignment" />
            <Action text="Advance one Learning Passport milestone" />
            <Action text="Review one opportunity matched to your goals" />
          </div>
        </article>

        <article style={cardStyle}>
          <h2 style={headingStyle}>Learning Passport</h2>
          <p>{summary.completed} completed · {summary.active} active · {summary.percentComplete}% complete</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10 }}>
            {passport.credentials.map((credential) => (
              <button key={credential.id} onClick={() => advanceCredential(credential.id)} style={credentialStyle} aria-label={`${credential.title}: ${credential.status}. Activate to advance demo progress.`}>
                <strong>{credential.title}</strong>
                <span style={{ display: 'block', opacity: .72, marginTop: 6 }}>{credential.status.replace('_', ' ')} · {credential.progress}%</span>
              </button>
            ))}
          </div>
        </article>

        <article style={cardStyle}>
          <h2 style={headingStyle}>Opportunities for You</h2>
          <p style={{ opacity: .75 }}>These are demonstration records proving the matching workflow. Production opportunities must come from verified sources and never imply guaranteed admission or funding.</p>
          <div style={{ display: 'grid', gap: 12 }}>
            {matches.map(({ opportunity, status, reasons, missingInformation, accessibility: a11y }) => (
              <div key={opportunity.id} style={{ border: '1px solid #29415b', borderRadius: 14, padding: 14, background: '#091321' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <strong>{opportunity.title}</strong>
                  <span style={{ fontWeight: 800 }}>{status.replaceAll('_', ' ').toUpperCase()}</span>
                </div>
                <p style={{ margin: '8px 0', opacity: .8 }}>{opportunity.organization}</p>
                {[...reasons, ...a11y.explanation].slice(0, 5).map((reason) => <div key={reason}>• {reason}</div>)}
                {missingInformation.length > 0 && <p style={{ marginBottom: 0, opacity: .72 }}>Still need: {missingInformation.join(', ')}</p>}
              </div>
            ))}
          </div>
        </article>

        <article style={cardStyle}>
          <h2 style={headingStyle}>Ask JARVIS</h2>
          <p style={{ opacity: .82 }}>Examples: “What should I do for school today?”, “Help me understand this math problem”, “Find scholarships I may qualify for”, “Show me HBCU and trade-school pathways”, or “Make every lesson work with my Accessibility Passport.”</p>
          <button type="button" style={{ ...credentialStyle, width: '100%' }} onClick={() => (window as any).__showBennie?.()}>Open AI Assistant</button>
        </article>
      </div>
    </section>
  );
}

function Action({ text }: { text: string }) {
  return <div style={{ padding: 12, borderRadius: 12, background: '#0b1a2a', border: '1px solid #20364c' }}>✓ {text}</div>;
}

const cardStyle = { background: '#07101c', border: '1px solid #17334a', borderRadius: 18, padding: 18 } as const;
const headingStyle = { marginTop: 0 } as const;
const credentialStyle = { textAlign: 'left', color: 'white', background: '#0b1a2a', border: '1px solid #29415b', borderRadius: 12, padding: 14, cursor: 'pointer', minHeight: 56 } as const;
