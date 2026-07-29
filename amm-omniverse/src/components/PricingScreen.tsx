// AMM Omniverse — Complete Pricing & Upgrade Screen
// All tiers, all prices, Stripe checkout, no placeholders

import { useState } from 'react'
import { useGameStore } from '../game/state/useGameStore'
import { AMM_PRICING } from '../game/pricing/PricingConfig'

type BillingCycle = 'monthly' | 'annual'

export default function PricingScreen({ onClose, forceUpgrade }: {
  onClose: () => void
  forceUpgrade?: boolean
}) {
  const store = useGameStore()
  const [billing, setBilling] = useState<BillingCycle>('monthly')
  const [loading, setLoading] = useState<string | null>(null)
  const [tab, setTab] = useState<'subs' | 'tokens' | 'addons'>('subs')

  const currentTier = (store.player as any)?.subscriptionTier ?? 'free'
  const apiUrl = (import.meta as any).env?.VITE_API_URL ?? ''
  const userEmail = (store.player as any)?.email ?? ''
  const userId = (store.player as any)?.id ?? 'demo_user'

  const checkout = async (planId: string, type: 'subscription' | 'tokens') => {
    setLoading(planId)
    if (!apiUrl) {
      // Demo mode — no backend yet
      store.setNotif(`💳 Demo mode — deploy backend to enable real payments. Plan: ${planId}`)
      setLoading(null)
      return
    }
    try {
      const res = await fetch(`${apiUrl}/api/stripe/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, userId, email: userEmail, type }),
      })
      const { url } = await res.json()
      if (url) window.open(url, '_blank')
    } catch {
      store.setNotif('❌ Payment system not connected yet. Victor wires this with $400 backend.')
    }
    setLoading(null)
  }

  const annualSaving = (monthly: number) => Math.round(monthly * 12 * 0.17)

  const TIERS = [
    {
      id: 'free',
      name: 'Free',
      emoji: '🌐',
      price_monthly: 0,
      price_annual: 0,
      color: '#555',
      borderColor: '#333',
      desc: 'Start exploring. No credit card.',
      features: [
        { text: '3 realm visits / day', ok: true },
        { text: '5 music streams / day', ok: true },
        { text: 'All 11 games (no saving)', ok: true },
        { text: '1 free Drama Box episode per series', ok: true },
        { text: 'Basic human avatar only', ok: true },
        { text: 'Live streaming', ok: false },
        { text: 'Music uploads', ok: false },
        { text: 'Marketplace selling', ok: false },
        { text: 'Progress saves between sessions', ok: false },
      ],
      cta: 'Current Plan',
      planId: '',
    },
    {
      id: 'pro',
      name: 'AMM Pro',
      emoji: '⭐',
      price_monthly: 7.99,
      price_annual: 79.90,
      color: '#00ffcc',
      borderColor: '#00ffcc',
      desc: 'Everything you need to create and earn.',
      popular: true,
      features: [
        { text: 'All 6 realms — unlimited', ok: true },
        { text: 'All 16 avatar species', ok: true },
        { text: 'Unlimited music streams', ok: true },
        { text: '50 music uploads / month', ok: true },
        { text: 'Live streaming up to 2 hrs / day', ok: true },
        { text: '10 Drama Box unlocks / month', ok: true },
        { text: 'All Tactical Realms maps + modes', ok: true },
        { text: 'Hero Realms full RPG', ok: true },
        { text: 'Progress saves permanently', ok: true },
        { text: 'Ranked card battle', ok: true },
        { text: 'Business directory listing', ok: true },
        { text: 'Chapelle AI unlimited', ok: true },
      ],
      cta: 'Start Pro',
      planId: billing === 'annual' ? 'pro_annual' : 'pro_monthly',
    },
    {
      id: 'creator',
      name: 'AMM Creator',
      emoji: '🎬',
      price_monthly: 14.99,
      price_annual: 149.90,
      color: '#8800ff',
      borderColor: '#8800ff',
      desc: 'Build your creator business on AMM.',
      features: [
        { text: 'Everything in Pro', ok: true },
        { text: 'Unlimited uploads (music + video)', ok: true },
        { text: 'Music distribution — Spotify, Apple, 4 more', ok: true },
        { text: 'Unlimited live streaming', ok: true },
        { text: 'QVC/HSN live selling studio', ok: true },
        { text: 'Marketplace storefront + analytics', ok: true },
        { text: 'Publish your own Drama Box series', ok: true },
        { text: '30 Drama Box unlocks / month', ok: true },
        { text: 'Ministry + church pages', ok: true },
        { text: 'DAO voting weight (20×)', ok: true },
        { text: 'Podcast studio', ok: true },
        { text: 'Holographic ad revenue share', ok: true },
        { text: 'AI ad campaign builder', ok: true },
      ],
      cta: 'Start Creator',
      planId: billing === 'annual' ? 'creator_annual' : 'creator_monthly',
    },
  ]

  const ADD_ONS = [
    {
      id: 'battle_pass',
      name: 'Battle Pass',
      emoji: '⚔️',
      price: 4.99,
      color: '#ff4400',
      desc: 'For the competitive player. Add to any tier.',
      features: [
        'All tournament access', 'Premium card skins (seasonal)',
        'Exclusive battle visual effects', 'Tactical Realms ranked queue',
        'Hero Realms premium classes', 'Weekly challenges (+500 tokens/wk)',
      ],
    },
    {
      id: 'drama_pass',
      name: 'Drama Pass',
      emoji: '🎬',
      price: 4.99,
      color: '#ff66cc',
      desc: 'Unlimited Drama Box episodes. Add to any tier.',
      features: [
        'Unlimited episode unlocks all series', '24-hour early access new episodes',
        'Ad-free viewing', 'Offline downloads (mobile)',
        'Exclusive drama creator badge',
      ],
    },
  ]

  return (
    <div style={{ width: '100%', height: '100%', background: '#020212', fontFamily: 'monospace', color: '#ccc', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #1a1a3e', background: '#09091d', display: 'flex', alignItems: 'center', gap: 10 }}>
        {!forceUpgrade && (
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #333', color: '#555', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10 }}>← BACK</button>
        )}
        <div>
          <div style={{ color: '#00ffcc', fontWeight: 900, fontSize: 14 }}>💳 AMM OMNIVERSE PRICING</div>
          <div style={{ color: '#555', fontSize: 10 }}>All plans include free trial features. Upgrade anytime.</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: 14 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {([['subs', '📋 Subscriptions'], ['tokens', '🪙 Token Packs'], ['addons', '➕ Add-Ons']] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: '8px 4px', background: tab === t ? 'rgba(0,255,204,0.12)' : 'transparent', border: `1px solid ${tab === t ? '#00ffcc' : '#333'}`, color: tab === t ? '#00ffcc' : '#555', borderRadius: 8, cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, fontWeight: tab === t ? 700 : 400 }}>
              {label}
            </button>
          ))}
        </div>

        {/* SUBSCRIPTIONS TAB */}
        {tab === 'subs' && (
          <div>
            {/* Billing toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
              <button onClick={() => setBilling('monthly')}
                style={{ background: billing === 'monthly' ? 'rgba(0,255,204,0.12)' : 'transparent', border: `1px solid ${billing === 'monthly' ? '#00ffcc' : '#333'}`, color: billing === 'monthly' ? '#00ffcc' : '#555', borderRadius: 20, padding: '6px 16px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}>
                Monthly
              </button>
              <button onClick={() => setBilling('annual')}
                style={{ background: billing === 'annual' ? 'rgba(255,215,0,0.12)' : 'transparent', border: `1px solid ${billing === 'annual' ? '#ffd700' : '#333'}`, color: billing === 'annual' ? '#ffd700' : '#555', borderRadius: 20, padding: '6px 16px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}>
                Annual <span style={{ color: '#00cc44', fontSize: 10 }}>SAVE 17%</span>
              </button>
            </div>

            {/* Tier cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {TIERS.map(tier => {
                const isCurrent = currentTier === tier.id
                const price = billing === 'annual' ? tier.price_annual : tier.price_monthly
                const saving = billing === 'annual' ? annualSaving(tier.price_monthly) : 0

                return (
                  <div key={tier.id} style={{ background: tier.popular ? `${tier.color}08` : '#09091c', border: `${tier.popular ? 2 : 1}px solid ${isCurrent ? tier.color : tier.popular ? tier.color + '66' : '#222'}`, borderRadius: 14, padding: 16, position: 'relative' }}>
                    {tier.popular && (
                      <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: tier.color, color: '#111', borderRadius: 20, padding: '2px 14px', fontSize: 10, fontWeight: 900 }}>
                        MOST POPULAR
                      </div>
                    )}
                    {isCurrent && (
                      <div style={{ position: 'absolute', top: 10, right: 12, background: 'rgba(0,204,68,0.2)', border: '1px solid #00cc44', color: '#00cc44', borderRadius: 20, padding: '2px 10px', fontSize: 9, fontWeight: 700 }}>
                        CURRENT PLAN
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 22 }}>{tier.emoji}</span>
                          <span style={{ color: tier.color, fontWeight: 900, fontSize: 15 }}>{tier.name}</span>
                        </div>
                        <div style={{ color: '#666', fontSize: 11 }}>{tier.desc}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {tier.price_monthly === 0 ? (
                          <div style={{ color: '#00cc44', fontSize: 20, fontWeight: 900 }}>FREE</div>
                        ) : (
                          <>
                            <div style={{ color: tier.color, fontSize: 22, fontWeight: 900 }}>
                              ${billing === 'annual' ? (tier.price_annual / 12).toFixed(2) : tier.price_monthly.toFixed(2)}
                              <span style={{ color: '#555', fontSize: 11 }}>/mo</span>
                            </div>
                            {billing === 'annual' && saving > 0 && (
                              <div style={{ color: '#00cc44', fontSize: 10 }}>Save ${saving}/yr</div>
                            )}
                            {billing === 'annual' && (
                              <div style={{ color: '#555', fontSize: 9 }}>${tier.price_annual}/year billed</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div style={{ marginBottom: 14 }}>
                      {tier.features.map((f, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, padding: '3px 0', fontSize: 11, color: f.ok ? '#ccc' : '#333' }}>
                          <span style={{ color: f.ok ? '#00cc44' : '#333', flexShrink: 0 }}>{f.ok ? '✓' : '✗'}</span>
                          <span>{f.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    {!isCurrent && tier.price_monthly > 0 && (
                      <button
                        onClick={() => checkout(tier.planId, 'subscription')}
                        disabled={loading === tier.planId}
                        style={{ width: '100%', background: `${tier.color}20`, border: `1px solid ${tier.color}`, color: tier.color, borderRadius: 8, padding: '12px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 900, fontSize: 13, opacity: loading === tier.planId ? 0.6 : 1 }}>
                        {loading === tier.planId ? 'Opening checkout...' : `${tier.cta} — $${billing === 'annual' ? tier.price_annual + '/yr' : tier.price_monthly + '/mo'}`}
                      </button>
                    )}
                    {isCurrent && (
                      <div style={{ textAlign: 'center', color: '#00cc44', fontSize: 11, padding: '10px 0' }}>✓ You are on this plan</div>
                    )}
                  </div>
                )
              })}
            </div>

            <div style={{ marginTop: 16, padding: 12, background: 'rgba(0,0,0,0.4)', borderRadius: 10, fontSize: 11, color: '#555', textAlign: 'center', lineHeight: 1.6 }}>
              All plans include 14-day money-back guarantee · Cancel anytime · No contracts<br />
              Stripe handles all payments securely · Your bank info never touches AMM servers
            </div>
          </div>
        )}

        {/* TOKEN PACKS TAB */}
        {tab === 'tokens' && (
          <div>
            <div style={{ marginBottom: 16, padding: 12, background: 'rgba(255,215,0,0.06)', border: '1px solid #ffd70022', borderRadius: 10, fontSize: 11, color: '#888', lineHeight: 1.6 }}>
              🪙 <strong style={{ color: '#ffd700' }}>1 token = $0.01 value.</strong> Use tokens for episode unlocks, gifts to streamers, card packs, tournament entry, marketplace boosts, and holographic ads. Tokens never expire.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {AMM_PRICING.tokenPacks.map(pack => (
                <div key={pack.id} style={{ background: pack.popular ? 'rgba(255,215,0,0.06)' : '#09091c', border: `1px solid ${pack.popular ? '#ffd70066' : '#222'}`, borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  {pack.popular && <div style={{ position: 'absolute', marginTop: -28, background: '#ffd700', color: '#111', borderRadius: 20, padding: '1px 10px', fontSize: 9, fontWeight: 900 }}>BEST VALUE</div>}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ color: '#ffd700', fontWeight: 700, fontSize: 13 }}>🪙 {((pack as any).total ?? pack.tokens).toLocaleString()} tokens</span>
                      {(pack as any).bonus > 0 && <span style={{ color: '#00cc44', fontSize: 10 }}>+{(pack as any).bonus} bonus</span>}
                    </div>
                    <div style={{ color: '#666', fontSize: 11 }}>{pack.name}</div>
                    <div style={{ color: '#444', fontSize: 10, marginTop: 2 }}>{pack.value_note}</div>
                  </div>
                  <button
                    onClick={() => checkout(pack.id, 'tokens')}
                    disabled={loading === pack.id}
                    style={{ background: pack.popular ? 'rgba(255,215,0,0.2)' : 'rgba(255,215,0,0.08)', border: `1px solid ${pack.popular ? '#ffd700' : '#ffd70044'}`, color: '#ffd700', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, fontSize: 12, flexShrink: 0, opacity: loading === pack.id ? 0.6 : 1 }}>
                    ${pack.price_usd}
                  </button>
                </div>
              ))}
            </div>

            {/* Token uses */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 10, letterSpacing: 2 }}>WHAT TOKENS BUY</div>
              {[
                ['🎬', 'Drama Box episode', '50 tokens'],
                ['🎁', 'Shofar Blast gift', '500 tokens'],
                ['🃏', 'Card booster pack', '100 tokens'],
                ['🏆', 'Tournament entry', '499 tokens'],
                ['⭐', 'Marketplace boost 7d', '50 tokens'],
                ['📺', 'Holographic ad slot', '500 tokens'],
                ['🦁', 'Lion of Judah gift', '1,000 tokens'],
                ['🌐', 'Omniverse Blast gift', '9,999 tokens'],
              ].map(([emoji, label, cost]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #111', fontSize: 11 }}>
                  <span style={{ color: '#888' }}>{emoji} {label}</span>
                  <span style={{ color: '#ffd700' }}>{cost}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADD-ONS TAB */}
        {tab === 'addons' && (
          <div>
            <div style={{ marginBottom: 16, fontSize: 11, color: '#666' }}>Add-ons stack on top of any subscription. Cancel independently.</div>
            {ADD_ONS.map(addon => (
              <div key={addon.id} style={{ background: `${addon.color}08`, border: `1px solid ${addon.color}44`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 22 }}>{addon.emoji}</span>
                      <span style={{ color: addon.color, fontWeight: 900, fontSize: 14 }}>{addon.name}</span>
                    </div>
                    <div style={{ color: '#666', fontSize: 11 }}>{addon.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: addon.color, fontSize: 20, fontWeight: 900 }}>${addon.price}<span style={{ fontSize: 11, color: '#555' }}>/mo</span></div>
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  {addon.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, padding: '3px 0', fontSize: 11 }}>
                      <span style={{ color: addon.color }}>✓</span>
                      <span style={{ color: '#ccc' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => checkout(addon.id, 'subscription')}
                  disabled={loading === addon.id}
                  style={{ width: '100%', background: `${addon.color}20`, border: `1px solid ${addon.color}`, color: addon.color, borderRadius: 8, padding: '10px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 900, fontSize: 12 }}>
                  {loading === addon.id ? 'Opening checkout...' : `Add ${addon.name} — $${addon.price}/mo`}
                </button>
              </div>
            ))}

            {/* Full bundle */}
            <div style={{ background: 'rgba(0,255,204,0.06)', border: '2px solid #00ffcc44', borderRadius: 12, padding: 16, marginTop: 8 }}>
              <div style={{ color: '#00ffcc', fontWeight: 900, fontSize: 14, marginBottom: 6 }}>🌐 Creator + Both Add-Ons Bundle</div>
              <div style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>Creator + Battle Pass + Drama Pass — everything unlocked</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#555', fontSize: 11, textDecoration: 'line-through' }}>$29.97/mo separately</div>
                  <div style={{ color: '#00ffcc', fontSize: 20, fontWeight: 900 }}>$24.99<span style={{ fontSize: 11, color: '#555' }}>/mo</span></div>
                  <div style={{ color: '#00cc44', fontSize: 10 }}>Save $5/month · 17% off</div>
                </div>
                <button
                  onClick={() => checkout('bundle_all', 'subscription')}
                  style={{ background: 'rgba(0,255,204,0.2)', border: '1px solid #00ffcc', color: '#00ffcc', borderRadius: 8, padding: '12px 18px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 900, fontSize: 12 }}>
                  GET BUNDLE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment method note */}
        {!apiUrl && (
          <div style={{ margin: '16px 0', padding: 12, background: 'rgba(255,170,0,0.08)', border: '1px solid #ffaa0033', borderRadius: 10, fontSize: 11, color: '#ffaa00', textAlign: 'center' }}>
            ⚠️ Demo mode — payments activate after Victor wires the Stripe backend ($400).
            <br />All features above are fully built and ready to charge the moment Stripe is connected.
          </div>
        )}
      </div>
    </div>
  )
}
