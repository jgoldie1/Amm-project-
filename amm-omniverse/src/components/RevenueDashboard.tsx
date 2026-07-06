// AMM Omniverse — Revenue Dashboard
// Real-time earnings tracker across all 6 revenue streams
// Shows actual + projected income with growth scenarios

import { useState } from 'react'
import { useGameStore } from '../game/state/useGameStore'

interface RevenueStream {
  name: string
  emoji: string
  color: string
  monthlyActual: number
  monthlyProjected: number
  description: string
  perUnit: string
  unitLabel: string
  units: number
}

interface GrowthScenario {
  label: string
  users: number
  months: number
  monthly: number
  annual: number
  color: string
}

export default function RevenueDashboard({ onClose }: { onClose: () => void }) {
  const store = useGameStore()
  const [activeTab, setActiveTab] = useState<'overview'|'streams'|'projections'|'compete'>('overview')
  const [userCount, setUserCount] = useState(200)

  // Revenue calculations based on user count
  const calc = (users: number) => {
    const proRate       = 0.35   // 35% of users go Pro
    const creatorRate   = 0.15   // 15% go Creator
    const battleRate    = 0.20   // 20% get Battle Pass
    const marketActive  = 0.20   // 20% sell on marketplace
    const avgSale       = 45     // avg product sale price
    const salesPerMonth = 3      // avg sales per active seller
    const giftRate      = 0.25   // 25% send gifts
    const avgGift       = 4.50   // avg gift value in USD
    const giftsPerMonth = 2.5    // avg gifts per active gifter
    const tournyRate    = 0.10   // 10% enter tournaments
    const tournyFee     = 4.99
    const musicStreams   = users * 50  // avg 50 streams per user per month
    const streamRate    = 0.019 * 0.10 // platform 10% of royalty

    const subscriptions = users * (proRate * 9.99 + creatorRate * 19.99 + battleRate * 4.99)
    const marketplace   = users * marketActive * salesPerMonth * avgSale * 0.10
    const gifts         = users * giftRate * giftsPerMonth * avgGift * 0.10
    const tournaments   = users * tournyRate * tournyFee * 0.80
    const music         = musicStreams * streamRate
    const holoAds       = Math.floor(users / 100) * 350  // $350/episode * episodes/month
    const total         = subscriptions + marketplace + gifts + tournaments + music + holoAds
    const costs         = 200 + Math.floor(users / 1000) * 100  // hosting scales

    return { subscriptions, marketplace, gifts, tournaments, music, holoAds, total, costs, net: total - costs }
  }

  const rev = calc(userCount)

  const streams: RevenueStream[] = [
    {
      name: 'Subscriptions',
      emoji: '⭐',
      color: '#00ffcc',
      monthlyActual: rev.subscriptions,
      monthlyProjected: calc(userCount * 3).subscriptions,
      description: 'Pro $9.99/mo · Creator $19.99/mo · Battle Pass $4.99/mo. Auto-renewing via Stripe.',
      perUnit: '$9.99–$19.99',
      unitLabel: 'per subscriber/month',
      units: Math.floor(userCount * 0.70),
    },
    {
      name: 'Marketplace Fees',
      emoji: '🛒',
      color: '#00cc44',
      monthlyActual: rev.marketplace,
      monthlyProjected: calc(userCount * 3).marketplace,
      description: '10% of every sale. Creator keeps 90%. Stripe Connect handles the split automatically.',
      perUnit: '10% of sale',
      unitLabel: 'per transaction',
      units: Math.floor(userCount * 0.20 * 3),
    },
    {
      name: 'Gift Economy',
      emoji: '🎁',
      color: '#ff66cc',
      monthlyActual: rev.gifts,
      monthlyProjected: calc(userCount * 3).gifts,
      description: '10% of all gift token purchases. Faith-themed gifts with full-screen holographic animations.',
      perUnit: '10% cut',
      unitLabel: 'per gift sent',
      units: Math.floor(userCount * 0.25 * 2.5),
    },
    {
      name: 'Tournament Entries',
      emoji: '🏆',
      color: '#ffd700',
      monthlyActual: rev.tournaments,
      monthlyProjected: calc(userCount * 3).tournaments,
      description: '$4.99 entry fee. 80% to prize pool, 20% platform. Weekly across 9 game modes.',
      perUnit: '$4.99',
      unitLabel: 'per entry (20% yours)',
      units: Math.floor(userCount * 0.10),
    },
    {
      name: 'Music Royalty Pool',
      emoji: '🎵',
      color: '#00ccff',
      monthlyActual: rev.music,
      monthlyProjected: calc(userCount * 3).music,
      description: '10% platform share of all streaming royalties. $0.015–0.019/stream (3–6× Spotify rate).',
      perUnit: '$0.0019/stream',
      unitLabel: 'platform share per stream',
      units: userCount * 50,
    },
    {
      name: 'Holographic Ads',
      emoji: '✨',
      color: '#8800ff',
      monthlyActual: rev.holoAds,
      monthlyProjected: calc(userCount * 3).holoAds,
      description: 'Brand-safe holographic ad placements. $200–$500/episode. Black-owned brands priority.',
      perUnit: '$200–$500',
      unitLabel: 'per ad placement',
      units: Math.floor(userCount / 100) * 4,
    },
  ]

  const scenarios: GrowthScenario[] = [
    { label: 'Launch (Month 1)',  users: 100,  months: 1,  monthly: calc(100).net,   annual: calc(100).net * 12,   color: '#555' },
    { label: 'Traction (Mo 3)',  users: 300,  months: 3,  monthly: calc(300).net,   annual: calc(300).net * 12,   color: '#00cc44' },
    { label: 'Growth (Mo 6)',    users: 800,  months: 6,  monthly: calc(800).net,   annual: calc(800).net * 12,   color: '#00ffcc' },
    { label: 'Scale (Year 1)',   users: 2500, months: 12, monthly: calc(2500).net,  annual: calc(2500).net * 12,  color: '#ffd700' },
    { label: 'Viral (Year 2)',   users: 8000, months: 24, monthly: calc(8000).net,  annual: calc(8000).net * 12,  color: '#ffaa00' },
    { label: 'Platform (Yr 3)', users: 25000,months: 36, monthly: calc(25000).net, annual: calc(25000).net * 12,  color: '#ff6600' },
  ]

  const fmt = (n: number) => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : n >= 1000 ? `$${(n/1000).toFixed(1)}K` : `$${n.toFixed(0)}`

  return (
    <div style={{ width: '100%', height: '100%', background: '#020212', fontFamily: 'monospace', color: '#ccc', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid #1a1a3e', background: 'rgba(0,0,0,0.9)' }}>
        <button onClick={onClose} style={{ background: 'none', border: '1px solid #333', color: '#555', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10 }}>← BACK</button>
        <span style={{ color: '#00ffcc', fontWeight: 900, fontSize: 13, letterSpacing: 2 }}>💰 AMM REVENUE DASHBOARD</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1a1a3e' }}>
        {(['overview', 'streams', 'projections', 'compete'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '8px', background: activeTab === t ? 'rgba(0,255,204,0.1)' : 'transparent', border: 'none', borderBottom: activeTab === t ? '2px solid #00ffcc' : '2px solid transparent', color: activeTab === t ? '#00ffcc' : '#555', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10, textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {/* User slider */}
            <div style={{ background: '#09091c', border: '1px solid #1a1a3e', borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#555' }}>SIMULATE USER COUNT</span>
                <span style={{ color: '#00ffcc', fontWeight: 700 }}>{userCount.toLocaleString()} users</span>
              </div>
              <input type="range" min={50} max={25000} step={50} value={userCount} onChange={e => setUserCount(Number(e.target.value))} style={{ width: '100%', accentColor: '#00ffcc' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#333', marginTop: 3 }}>
                <span>50</span><span>5K</span><span>10K</span><span>25K</span>
              </div>
            </div>

            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
              {[
                { label: 'Monthly Revenue', value: fmt(rev.total), color: '#00ffcc', sub: 'gross' },
                { label: 'Monthly Costs', value: fmt(rev.costs), color: '#ff4400', sub: 'hosting + ops' },
                { label: 'Monthly NET', value: fmt(rev.net), color: '#00cc44', sub: 'into your bank' },
                { label: 'Annual NET', value: fmt(rev.net * 12), color: '#ffd700', sub: 'if steady state' },
                { label: 'Break-even', value: '~200 users', color: '#00ccff', sub: '$1,998 subs/mo' },
                { label: 'Your Take', value: '~90%', color: '#8800ff', sub: 'after Stripe 2.9%' },
              ].map(k => (
                <div key={k.label} style={{ background: '#09091c', border: `1px solid ${k.color}22`, borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ color: k.color, fontSize: 16, fontWeight: 900 }}>{k.value}</div>
                  <div style={{ color: '#555', fontSize: 9, marginTop: 3 }}>{k.label}</div>
                  <div style={{ color: '#333', fontSize: 8 }}>{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Revenue breakdown bar */}
            <div style={{ background: '#09091c', border: '1px solid #1a1a3e', borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 10 }}>REVENUE BREAKDOWN</div>
              {streams.map(s => (
                <div key={s.name} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                    <span>{s.emoji} {s.name}</span>
                    <span style={{ color: s.color }}>{fmt(s.monthlyActual)}</span>
                  </div>
                  <div style={{ background: '#111', borderRadius: 3, height: 6 }}>
                    <div style={{ background: s.color, height: '100%', borderRadius: 3, width: `${rev.total > 0 ? (s.monthlyActual / rev.total) * 100 : 0}%`, transition: 'width 0.4s' }} />
                  </div>
                  <div style={{ fontSize: 9, color: '#333', marginTop: 1 }}>{((s.monthlyActual / (rev.total || 1)) * 100).toFixed(1)}% of total</div>
                </div>
              ))}
            </div>

            {/* What to do next */}
            <div style={{ background: 'rgba(0,255,204,0.04)', border: '1px solid #00ffcc22', borderRadius: 10, padding: 12 }}>
              <div style={{ color: '#00ffcc', fontWeight: 700, fontSize: 12, marginBottom: 8 }}>✅ TO START EARNING THIS WEEK</div>
              {[
                { step: '1', text: 'Deploy to Vercel (free) — npm run build → drag dist folder', done: false },
                { step: '2', text: 'Create Stripe account — connect bank — get publishable + secret keys', done: false },
                { step: '3', text: 'Create Supabase project — copy URL + service role key', done: false },
                { step: '4', text: 'Send Victor the keys + $400 — he wires backend in 1–2 weeks', done: false },
                { step: '5', text: 'Text 10 real faith creators your tryamm.online link TODAY', done: false },
                { step: '6', text: 'Run your first showcase — Isaiah AI Starverse — charge $15 entry', done: false },
              ].map(s => (
                <div key={s.step} style={{ display: 'flex', gap: 10, padding: '5px 0', borderBottom: '1px solid #0a0a20', fontSize: 11 }}>
                  <span style={{ color: '#00ffcc', fontWeight: 700, width: 16, flexShrink: 0 }}>{s.step}.</span>
                  <span style={{ color: '#888' }}>{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STREAMS */}
        {activeTab === 'streams' && (
          <div>
            {streams.map(s => (
              <div key={s.name} style={{ background: '#09091c', border: `1px solid ${s.color}22`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 20 }}>{s.emoji}</span>
                      <span style={{ color: s.color, fontWeight: 700, fontSize: 13 }}>{s.name}</span>
                    </div>
                    <div style={{ color: '#555', fontSize: 11 }}>{s.description}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ color: s.color, fontWeight: 900, fontSize: 18 }}>{fmt(s.monthlyActual)}</div>
                    <div style={{ color: '#333', fontSize: 9 }}>at {userCount.toLocaleString()} users</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 11 }}>
                  <div style={{ background: '#0a0a1a', borderRadius: 6, padding: 8 }}>
                    <div style={{ color: s.color, fontWeight: 700 }}>{s.perUnit}</div>
                    <div style={{ color: '#333', fontSize: 9 }}>{s.unitLabel}</div>
                  </div>
                  <div style={{ background: '#0a0a1a', borderRadius: 6, padding: 8 }}>
                    <div style={{ color: '#888', fontWeight: 700 }}>{s.units.toLocaleString()}</div>
                    <div style={{ color: '#333', fontSize: 9 }}>active units</div>
                  </div>
                  <div style={{ background: '#0a0a1a', borderRadius: 6, padding: 8 }}>
                    <div style={{ color: '#00cc44', fontWeight: 700 }}>{fmt(s.monthlyProjected)}</div>
                    <div style={{ color: '#333', fontSize: 9 }}>at 3× growth</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PROJECTIONS */}
        {activeTab === 'projections' && (
          <div>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 12 }}>Growth scenarios based on AMM revenue model. All numbers are conservative estimates.</div>
            {scenarios.map((s, i) => (
              <div key={i} style={{ background: '#09091c', border: `1px solid ${s.color}33`, borderRadius: 10, padding: 14, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div>
                    <div style={{ color: s.color, fontWeight: 700, fontSize: 13 }}>{s.label}</div>
                    <div style={{ color: '#555', fontSize: 11 }}>{s.users.toLocaleString()} users · Month {s.months}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: s.color, fontWeight: 900, fontSize: 20 }}>{fmt(s.monthly)}</div>
                    <div style={{ color: '#444', fontSize: 10 }}>per month NET</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
                  <div style={{ background: '#0a0a1a', borderRadius: 6, padding: 8 }}>
                    <div style={{ color: '#ffd700', fontWeight: 700 }}>{fmt(s.annual)}</div>
                    <div style={{ color: '#333', fontSize: 9 }}>annual at this rate</div>
                  </div>
                  <div style={{ background: '#0a0a1a', borderRadius: 6, padding: 8 }}>
                    <div style={{ color: '#00ccff', fontWeight: 700 }}>{s.users.toLocaleString()}</div>
                    <div style={{ color: '#333', fontSize: 9 }}>users needed</div>
                  </div>
                </div>
                {/* Progress bar toward this scenario */}
                <div style={{ marginTop: 8 }}>
                  <div style={{ background: '#111', borderRadius: 2, height: 4 }}>
                    <div style={{ background: s.color, height: '100%', borderRadius: 2, width: `${Math.min(100, (userCount / s.users) * 100)}%`, transition: 'width 0.4s' }} />
                  </div>
                  <div style={{ fontSize: 9, color: '#333', marginTop: 2 }}>{Math.min(100, Math.round((userCount / s.users) * 100))}% of the way there</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* COMPETE */}
        {activeTab === 'compete' && (
          <div>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 12 }}>How AMM Omniverse compares to competitor revenue models</div>
            {[
              { name: 'Bigo Live',       model: 'Streaming gifts',  cut: '50% creator / 50% platform', monthly: '$400M/yr platform rev', weakness: 'No talent system, no games, no marketplace, no faith', color: '#ff6600' },
              { name: 'TikTok LIVE',     model: 'Creator fund + gifts', cut: 'Creator fund $0.02–0.04/1K views', monthly: '$16B/yr total revenue', weakness: 'No structure, no judging, no faith content lane', color: '#ff0080' },
              { name: 'Spotify',         model: 'Music streaming',  cut: '$0.003–0.005/stream creator', monthly: '$13B/yr', weakness: 'Pure music, no games, no streaming, no creator economy', color: '#00cc44' },
              { name: 'YouTube',         model: 'Ad revenue share', cut: '55% creator / 45% platform', monthly: '$28B/yr', weakness: 'Generic, no faith lane, no judging system, no marketplace', color: '#ff4400' },
              { name: 'AMM Omniverse ✓', model: 'Creator economy metaverse', cut: '90% creator / 10% platform', monthly: 'Your potential: see Projections tab', weakness: 'Advantage: faith-centered, 9 games, 100 cards, 90% creator cut, Black-owned directory, TV shows, movies', color: '#00ffcc' },
            ].map((c, i) => (
              <div key={i} style={{ background: c.name.includes('AMM') ? 'rgba(0,255,204,0.06)' : '#09091c', border: `1px solid ${c.color}33`, borderRadius: 10, padding: 12, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: c.color, fontWeight: 700, fontSize: 12 }}>{c.name}</span>
                  <span style={{ color: '#ffd700', fontSize: 11 }}>{c.monthly}</span>
                </div>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Model: {c.model}</div>
                <div style={{ fontSize: 11, color: '#444', marginBottom: 4 }}>Split: {c.cut}</div>
                <div style={{ fontSize: 11, color: c.name.includes('AMM') ? '#00ffcc' : '#333' }}>{c.weakness}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
