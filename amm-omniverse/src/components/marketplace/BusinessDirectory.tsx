// AMM Omniverse — Complete Business Directory System
// From the ChatGPT handoff documents — fully integrated into AMM
// 60+ profile fields · Verification levels · Trust scoring · Reviews · Admin controls
// Black-owned · Faith-based · Veteran-owned · Woman-owned · Minority-owned

import { useState, useCallback } from 'react'
import { useGameStore } from '../../game/state/useGameStore'

const API = (import.meta as any).env?.VITE_API_URL ?? ''

// ── TYPES ─────────────────────────────────────────────────────────────────────

type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected' | 'suspended'
type VerificationLevel  = 'basic' | 'business' | 'enhanced' | 'government'

interface Business {
  id: string; name: string; legal_business_name: string; tagline: string
  description: string; category: string; subcategory: string
  logo_url: string; banner_url: string; slug: string
  black_owned: boolean; minority_owned: boolean; veteran_owned: boolean
  woman_owned: boolean; faith_based: boolean; nonprofit: boolean
  owner_name: string; business_email: string; phone: string
  whatsapp: string; website: string
  country: string; state: string; city: string; postal_code: string
  address_line_1: string; service_area: string
  verification_status: VerificationStatus; verification_level: VerificationLevel
  trust_score: number; rating_average: number; review_count: number
  products_enabled: boolean; services_enabled: boolean; booking_enabled: boolean
  delivery_enabled: boolean; accepts_card: boolean; accepts_wallet: boolean
  average_price_range: string; return_policy: string; refund_policy: string
  sabbath_mode_enabled: boolean; featured: boolean; tags: string[]
  email_verified: boolean; phone_verified: boolean; website_verified: boolean
  address_verified: boolean; admin_review_note: string; created_at: string
}

interface Review {
  id: string; reviewer_name: string; rating: number
  review_text: string; approved: boolean; created_at: string
}

const CATEGORIES = [
  'Restaurant & Food','Retail & Shopping','Beauty & Wellness','Fashion & Apparel',
  'Health & Fitness','Faith & Ministry','Music & Entertainment','Technology',
  'Real Estate','Legal Services','Financial Services','Education & Tutoring',
  'Photography & Media','Catering & Events','Home Services','Auto & Transportation',
  'Agriculture & Farming','Art & Creative','Nonprofit','Other',
]

const STATUS_COLORS: Record<VerificationStatus, string> = {
  unverified:'#555', pending:'#ffaa00', verified:'#00cc44',
  rejected:'#ff4400', suspended:'#8800ff',
}
const STATUS_EMOJI: Record<VerificationStatus, string> = {
  unverified:'○', pending:'⏳', verified:'✓', rejected:'✗', suspended:'⊘',
}

type Tab = 'browse' | 'register' | 'mylist' | 'reviews' | 'admin'

export default function BusinessDirectory({ onClose }: { onClose: () => void }) {
  const store = useGameStore()
  const [tab, setTab] = useState<Tab>('browse')

  // Browse
  const [searchQ, setSearchQ] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterBlack, setFilterBlack] = useState(false)
  const [filterFaith, setFilterFaith] = useState(false)
  const [filterVerified, setFilterVerified] = useState(false)
  const [results, setResults] = useState<Business[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null)
  const [bizReviews, setBizReviews] = useState<Review[]>([])

  // Register form
  const [form, setForm] = useState({
    name:'', legalBusinessName:'', dbaName:'', tagline:'', description:'',
    category:'Restaurant & Food', subcategory:'',
    businessEmail:'', phone:'', whatsapp:'', website:'',
    country:'US', state:'', city:'', postalCode:'', addressLine1:'', serviceArea:'',
    ownerName:'',
    blackOwned:false, minorityOwned:false, veteranOwned:false, womanOwned:false,
    faithBased:false, nonprofit:false,
    productsEnabled:false, servicesEnabled:true, bookingEnabled:false,
    deliveryEnabled:false, acceptsCard:false, acceptsWallet:false,
    averagePriceRange:'', returnPolicy:'', refundPolicy:'',
    sabbathModeEnabled:false,
    termsAccepted:false, privacyAccepted:false,
  })
  const [registering, setRegistering] = useState(false)
  const [registerStep, setRegisterStep] = useState<1|2|3>(1)
  const [registered, setRegistered] = useState<Business | null>(null)

  // My listings
  const [myListings, setMyListings] = useState<Business[]>([])
  const [myListLoading, setMyListLoading] = useState(false)

  // Review form
  const [reviewBizId, setReviewBizId] = useState<string|null>(null)
  const [reviewForm, setReviewForm] = useState({ reviewerName:'', reviewerEmail:'', rating:5, reviewText:'' })
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  // Admin
  const [adminListings, setAdminListings] = useState<Business[]>([])
  const [adminReviews, setAdminReviews] = useState<Review[]>([])
  const [verifyForm, setVerifyForm] = useState({ verificationStatus:'verified' as VerificationStatus, verificationLevel:'business' as VerificationLevel, adminReviewNote:'Approved after review.', emailVerified:true, phoneVerified:false, websiteVerified:false, addressVerified:false })

  const userId = (store.player as any)?.id ?? 'demo_user'
  const headers = { 'Content-Type':'application/json', 'x-user-id': userId }

  // ── SEARCH ────────────────────────────────────────────────────────────────

  const search = useCallback(async () => {
    setSearching(true)
    setSelectedBiz(null)
    if (API) {
      try {
        const params = new URLSearchParams()
        if (searchQ) params.set('q', searchQ)
        if (filterCategory) params.set('category', filterCategory)
        if (filterCity) params.set('city', filterCity)
        if (filterBlack) params.set('black_owned', 'true')
        if (filterFaith) params.set('faith_based', 'true')
        if (filterVerified) params.set('verified', 'true')
        const res = await fetch(`${API}/api/businesses?${params}`)
        const data = await res.json()
        setResults(data.businesses || [])
      } catch { setResults(DEMO_BUSINESSES) }
    } else {
      // Demo
      setResults(DEMO_BUSINESSES.filter(b => {
        if (searchQ && !`${b.name} ${b.category} ${b.city} ${b.description}`.toLowerCase().includes(searchQ.toLowerCase())) return false
        if (filterCategory && b.category !== filterCategory) return false
        if (filterBlack && !b.black_owned) return false
        if (filterFaith && !b.faith_based) return false
        if (filterVerified && b.verification_status !== 'verified') return false
        return true
      }))
    }
    setSearching(false)
  }, [searchQ, filterCategory, filterCity, filterBlack, filterFaith, filterVerified])

  const openBusiness = async (biz: Business) => {
    setSelectedBiz(biz)
    if (API) {
      const res = await fetch(`${API}/api/businesses/${biz.id}/reviews`)
      const data = await res.json()
      setBizReviews(data.reviews || [])
    } else {
      setBizReviews(DEMO_REVIEWS)
    }
  }

  // ── REGISTER ──────────────────────────────────────────────────────────────

  const register = async () => {
    if (!form.name || !form.category) { store.setNotif('❌ Business name and category required'); return }
    if (!form.termsAccepted || !form.privacyAccepted) { store.setNotif('❌ Accept terms and privacy policy'); return }
    setRegistering(true)
    if (API) {
      try {
        const res = await fetch(`${API}/api/businesses`, { method:'POST', headers, body: JSON.stringify(form) })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setRegistered(data.business)
        store.setNotif(`✅ "${form.name}" submitted! Under review within 48 hours.`)
      } catch (e: any) { store.setNotif(`❌ ${e.message}`) }
    } else {
      // Demo mode
      const demo: Business = {
        id: 'demo_' + Date.now(), name: form.name, legal_business_name: form.legalBusinessName,
        tagline: form.tagline, description: form.description, category: form.category,
        subcategory: form.subcategory, logo_url:'', banner_url:'',
        slug: form.name.toLowerCase().replace(/\s+/g,'-') + '-abc123',
        black_owned: form.blackOwned, minority_owned: form.minorityOwned,
        veteran_owned: form.veteranOwned, woman_owned: form.womanOwned,
        faith_based: form.faithBased, nonprofit: form.nonprofit,
        owner_name: form.ownerName, business_email: form.businessEmail,
        phone: form.phone, whatsapp: form.whatsapp, website: form.website,
        country: form.country, state: form.state, city: form.city,
        postal_code: form.postalCode, address_line_1: form.addressLine1,
        service_area: form.serviceArea,
        verification_status:'pending', verification_level:'basic',
        trust_score:0, rating_average:0, review_count:0,
        products_enabled: form.productsEnabled, services_enabled: form.servicesEnabled,
        booking_enabled: form.bookingEnabled, delivery_enabled: form.deliveryEnabled,
        accepts_card: form.acceptsCard, accepts_wallet: form.acceptsWallet,
        average_price_range: form.averagePriceRange, return_policy: form.returnPolicy,
        refund_policy: form.refundPolicy, sabbath_mode_enabled: form.sabbathModeEnabled,
        featured:false, tags:[], email_verified:false, phone_verified:false,
        website_verified:false, address_verified:false, admin_review_note:'',
        created_at: new Date().toISOString(),
      }
      setRegistered(demo)
      store.setNotif(`✅ "${form.name}" submitted for review! (Demo mode)`)
    }
    setRegistering(false)
  }

  // ── MY LISTINGS ──────────────────────────────────────────────────────────

  const loadMyListings = async () => {
    setMyListLoading(true)
    if (API) {
      const res = await fetch(`${API}/api/businesses/me`, { headers })
      const data = await res.json()
      setMyListings(data.businesses || [])
    } else {
      setMyListings(DEMO_BUSINESSES.slice(0,2))
    }
    setMyListLoading(false)
  }

  // ── SUBMIT REVIEW ────────────────────────────────────────────────────────

  const submitReview = async () => {
    if (!reviewForm.reviewerName) { store.setNotif('❌ Enter your name'); return }
    if (!reviewBizId) return
    if (API) {
      const res = await fetch(`${API}/api/businesses/${reviewBizId}/reviews`, { method:'POST', headers, body: JSON.stringify(reviewForm) })
      const data = await res.json()
      if (!data.error) { setReviewSubmitted(true); store.setNotif('✅ Review submitted! Pending moderation.') }
    } else {
      setReviewSubmitted(true); store.setNotif('✅ Review submitted! (Demo mode)')
    }
  }

  // ── ADMIN ────────────────────────────────────────────────────────────────

  const loadAdminData = async () => {
    if (API) {
      const [bRes, rRes] = await Promise.all([
        fetch(`${API}/api/businesses?q=`, { headers }),
        fetch(`${API}/api/admin/business-reviews`, { headers }),
      ])
      setAdminListings((await bRes.json()).businesses || [])
      setAdminReviews((await rRes.json()).reviews || [])
    } else {
      setAdminListings(DEMO_BUSINESSES)
      setAdminReviews(DEMO_REVIEWS)
    }
  }

  const verifyBusiness = async (id: string) => {
    if (API) {
      const res = await fetch(`${API}/api/admin/businesses/${id}/verify`, { method:'POST', headers, body: JSON.stringify(verifyForm) })
      const data = await res.json()
      store.setNotif(data.error ? `❌ ${data.error}` : `✅ Business ${verifyForm.verificationStatus}! Trust score: ${data.trustScore}`)
    } else {
      store.setNotif(`✅ Business set to ${verifyForm.verificationStatus} (Demo mode)`)
    }
    loadAdminData()
  }

  const approveReview = async (id: string) => {
    if (API) {
      await fetch(`${API}/api/admin/business-reviews/${id}/approve`, { method:'POST', headers })
    }
    store.setNotif('✅ Review approved!')
    loadAdminData()
  }

  const TABS: { id: Tab; label: string; color: string }[] = [
    { id:'browse',  label:'🔍 Browse',   color:'#00ffcc' },
    { id:'register',label:'✊ Register',  color:'#00cc44' },
    { id:'mylist',  label:'📋 My Listings', color:'#ffd700' },
    { id:'reviews', label:'⭐ Reviews',   color:'#ffaa00' },
    { id:'admin',   label:'🛡 Admin',     color:'#8800ff' },
  ]

  return (
    <div style={{ width:'100%',height:'100%',background:'#020212',fontFamily:'monospace',color:'#ccc',display:'flex',flexDirection:'column' }}>
      {/* Header */}
      <div style={{ padding:'10px 14px',borderBottom:'1px solid #00cc4422',background:'#09091d',display:'flex',alignItems:'center',gap:10 }}>
        <button onClick={onClose} style={{ background:'none',border:'1px solid #333',color:'#555',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>← BACK</button>
        <span style={{ fontSize:18 }}>✊</span>
        <div>
          <div style={{ color:'#00cc44',fontWeight:900,fontSize:13 }}>ALL AMERICAN MARKETPLACE — BUSINESS DIRECTORY</div>
          <div style={{ color:'#555',fontSize:9 }}>Verified listings · Trust scores · Black-owned · Faith-based · Woman-owned · Veteran-owned</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex',borderBottom:'1px solid #1a1a3e',overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); if(t.id==='mylist') loadMyListings(); if(t.id==='admin') loadAdminData(); }}
            style={{ flex:'0 0 auto',padding:'8px 12px',background:tab===t.id?`${t.color}10`:'transparent',border:'none',borderBottom:tab===t.id?`2px solid ${t.color}`:'2px solid transparent',color:tab===t.id?t.color:'#555',cursor:'pointer',fontFamily:'monospace',fontSize:10,fontWeight:tab===t.id?700:400,whiteSpace:'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex:1,overflowY:'auto',padding:14 }}>

        {/* ── BROWSE ── */}
        {tab==='browse' && (
          <div>
            {!selectedBiz ? (
              <>
                {/* Search */}
                <div style={{ marginBottom:12 }}>
                  <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()}
                    placeholder="Search businesses by name, category, city..." style={{ width:'100%',background:'#09091c',border:'1px solid #00cc4444',color:'#ccc',borderRadius:8,padding:'10px 12px',fontFamily:'monospace',fontSize:12,marginBottom:8,boxSizing:'border-box' as const }}/>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:8 }}>
                    <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}
                      style={{ background:'#09091c',border:'1px solid #333',color:'#888',borderRadius:8,padding:'8px 10px',fontFamily:'monospace',fontSize:11 }}>
                      <option value=''>All categories</option>
                      {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                    </select>
                    <input value={filterCity} onChange={e=>setFilterCity(e.target.value)} placeholder="City..."
                      style={{ background:'#09091c',border:'1px solid #333',color:'#ccc',borderRadius:8,padding:'8px 10px',fontFamily:'monospace',fontSize:11 }}/>
                  </div>
                  <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:10 }}>
                    {[['✊ Black-owned',filterBlack,setFilterBlack],['✝️ Faith-based',filterFaith,setFilterFaith],['✓ Verified only',filterVerified,setFilterVerified]].map(([label,val,setter])=>(
                      <button key={label as string} onClick={()=>(setter as any)(!val)}
                        style={{ background:(val as boolean)?'rgba(0,204,68,.15)':'transparent',border:`1px solid ${(val as boolean)?'#00cc44':'#333'}`,color:(val as boolean)?'#00cc44':'#555',borderRadius:20,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>
                        {label as string}
                      </button>
                    ))}
                  </div>
                  <button onClick={search} disabled={searching}
                    style={{ width:'100%',background:searching?'#09091c':'rgba(0,204,68,.15)',border:`1px solid ${searching?'#333':'#00cc44'}`,color:searching?'#555':'#00cc44',borderRadius:8,padding:'10px',cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:12 }}>
                    {searching?'Searching...':'🔍 SEARCH BUSINESSES'}
                  </button>
                </div>

                {/* Results */}
                {results.length > 0 && results.map(biz => (
                  <div key={biz.id} onClick={() => openBusiness(biz)}
                    style={{ background:'#09091c',border:`1px solid ${biz.black_owned?'#00cc4433':'#1a1a3e'}`,borderRadius:10,padding:12,marginBottom:8,cursor:'pointer' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor='#00cc44'}
                    onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor=biz.black_owned?'#00cc4433':'#1a1a3e'}>
                    <div style={{ display:'flex',gap:10,alignItems:'flex-start' }}>
                      <div style={{ width:44,height:44,background:'rgba(0,204,68,.1)',border:'1px solid #00cc4433',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0 }}>
                        {biz.faith_based?'✝️':biz.black_owned?'✊':biz.veteran_owned?'🎖️':biz.woman_owned?'👑':'🏪'}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:2 }}>
                          <span style={{ color:'#fff',fontWeight:700,fontSize:13 }}>{biz.name}</span>
                          <span style={{ color:STATUS_COLORS[biz.verification_status],fontSize:11 }}>{STATUS_EMOJI[biz.verification_status]}</span>
                        </div>
                        <div style={{ color:'#555',fontSize:10,marginBottom:3 }}>{biz.category}{biz.subcategory?` · ${biz.subcategory}`:''}</div>
                        <div style={{ color:'#888',fontSize:10 }}>{[biz.city,biz.state,biz.country].filter(Boolean).join(', ')}</div>
                        {biz.tagline && <div style={{ color:'#666',fontSize:10,marginTop:3,fontStyle:'italic' }}>{biz.tagline}</div>}
                        <div style={{ display:'flex',gap:4,marginTop:5,flexWrap:'wrap' }}>
                          {biz.black_owned    && <span style={{ background:'rgba(0,204,68,.1)',color:'#00cc44',  borderRadius:20,padding:'1px 7px',fontSize:8,border:'1px solid #00cc4422' }}>✊ Black-owned</span>}
                          {biz.faith_based    && <span style={{ background:'rgba(255,215,0,.1)',color:'#ffd700', borderRadius:20,padding:'1px 7px',fontSize:8,border:'1px solid #ffd70022' }}>✝️ Faith</span>}
                          {biz.veteran_owned  && <span style={{ background:'rgba(0,204,255,.1)',color:'#00ccff', borderRadius:20,padding:'1px 7px',fontSize:8,border:'1px solid #00ccff22' }}>🎖 Veteran</span>}
                          {biz.woman_owned    && <span style={{ background:'rgba(255,102,204,.1)',color:'#ff66cc',borderRadius:20,padding:'1px 7px',fontSize:8,border:'1px solid #ff66cc22' }}>👑 Woman</span>}
                          {biz.nonprofit      && <span style={{ background:'rgba(136,0,255,.1)',color:'#8800ff', borderRadius:20,padding:'1px 7px',fontSize:8,border:'1px solid #8800ff22' }}>🤝 Nonprofit</span>}
                        </div>
                      </div>
                      <div style={{ textAlign:'right',flexShrink:0 }}>
                        {biz.review_count>0 && <div style={{ color:'#ffd700',fontSize:10 }}>⭐ {biz.rating_average?.toFixed(1)} ({biz.review_count})</div>}
                        <div style={{ fontSize:9,color:'#444',marginTop:3 }}>Trust: {biz.trust_score}/100</div>
                      </div>
                    </div>
                  </div>
                ))}
                {results.length===0 && (
                  <div style={{ textAlign:'center',padding:30,color:'#333',fontSize:12 }}>
                    Search for Black-owned businesses, faith-based organizations, veteran-owned companies, and more.<br/><br/>
                    <button onClick={()=>search()} style={{ background:'rgba(0,204,68,.1)',border:'1px solid #00cc4433',color:'#00cc44',borderRadius:8,padding:'8px 16px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>
                      Show All Listings
                    </button>
                  </div>
                )}
              </>
            ) : (
              // Business detail view
              <div>
                <button onClick={()=>setSelectedBiz(null)} style={{ background:'none',border:'1px solid #333',color:'#555',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontFamily:'monospace',fontSize:10,marginBottom:14 }}>← Back to results</button>

                <div style={{ background:'rgba(0,204,68,.06)',border:'1px solid #00cc4433',borderRadius:12,padding:16,marginBottom:14 }}>
                  <div style={{ display:'flex',gap:12,alignItems:'flex-start',marginBottom:10 }}>
                    <div style={{ fontSize:40 }}>{selectedBiz.faith_based?'✝️':selectedBiz.black_owned?'✊':selectedBiz.veteran_owned?'🎖️':selectedBiz.woman_owned?'👑':'🏪'}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ color:'#fff',fontWeight:900,fontSize:16,marginBottom:2 }}>{selectedBiz.name}</div>
                      {selectedBiz.legal_business_name && <div style={{ color:'#555',fontSize:10 }}>Legal: {selectedBiz.legal_business_name}</div>}
                      <div style={{ color:'#888',fontSize:11,marginTop:3 }}>{selectedBiz.category}</div>
                      <div style={{ display:'flex',gap:6,marginTop:6 }}>
                        <span style={{ color:STATUS_COLORS[selectedBiz.verification_status],background:`${STATUS_COLORS[selectedBiz.verification_status]}15`,border:`1px solid ${STATUS_COLORS[selectedBiz.verification_status]}33`,borderRadius:20,padding:'2px 8px',fontSize:9,fontWeight:700 }}>
                          {STATUS_EMOJI[selectedBiz.verification_status]} {selectedBiz.verification_status.toUpperCase()}
                        </span>
                        <span style={{ color:'#ffd700',fontSize:9,background:'rgba(255,215,0,.1)',border:'1px solid #ffd70022',borderRadius:20,padding:'2px 8px' }}>Trust: {selectedBiz.trust_score}/100</span>
                      </div>
                    </div>
                  </div>

                  {selectedBiz.tagline && <div style={{ color:'#aaa',fontSize:12,fontStyle:'italic',marginBottom:8 }}>{selectedBiz.tagline}</div>}
                  {selectedBiz.description && <p style={{ color:'#888',fontSize:12,lineHeight:1.6,margin:'0 0 12px' }}>{selectedBiz.description}</p>}

                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,fontSize:11 }}>
                    {selectedBiz.phone && <div><span style={{ color:'#555' }}>📞 </span><a href={`tel:${selectedBiz.phone}`} style={{ color:'#00cc44',textDecoration:'none' }}>{selectedBiz.phone}</a></div>}
                    {selectedBiz.business_email && <div><span style={{ color:'#555' }}>✉️ </span><a href={`mailto:${selectedBiz.business_email}`} style={{ color:'#00cc44',textDecoration:'none' }}>{selectedBiz.business_email}</a></div>}
                    {selectedBiz.website && <div><span style={{ color:'#555' }}>🌐 </span><a href={selectedBiz.website} target="_blank" rel="noreferrer" style={{ color:'#00ffcc',textDecoration:'none' }}>{selectedBiz.website}</a></div>}
                    {selectedBiz.whatsapp && <div><span style={{ color:'#555' }}>💬 </span><a href={`https://wa.me/${selectedBiz.whatsapp}`} target="_blank" rel="noreferrer" style={{ color:'#00cc44',textDecoration:'none' }}>WhatsApp</a></div>}
                  </div>

                  <div style={{ marginTop:10,color:'#666',fontSize:10 }}>
                    📍 {[selectedBiz.address_line_1,selectedBiz.city,selectedBiz.state,selectedBiz.postal_code,selectedBiz.country].filter(Boolean).join(', ')}
                    {selectedBiz.service_area && <span style={{ color:'#555' }}> · Serves: {selectedBiz.service_area}</span>}
                  </div>

                  {/* Services + payment */}
                  <div style={{ marginTop:10,display:'flex',gap:4,flexWrap:'wrap' }}>
                    {selectedBiz.products_enabled  && <span style={{ background:'rgba(0,204,68,.1)',color:'#00cc44',borderRadius:20,padding:'2px 8px',fontSize:9,border:'1px solid #00cc4422' }}>📦 Products</span>}
                    {selectedBiz.services_enabled  && <span style={{ background:'rgba(0,204,255,.1)',color:'#00ccff',borderRadius:20,padding:'2px 8px',fontSize:9 }}>🛠 Services</span>}
                    {selectedBiz.booking_enabled   && <span style={{ background:'rgba(255,215,0,.1)',color:'#ffd700',borderRadius:20,padding:'2px 8px',fontSize:9 }}>📅 Booking</span>}
                    {selectedBiz.delivery_enabled  && <span style={{ background:'rgba(0,204,68,.1)',color:'#00cc44',borderRadius:20,padding:'2px 8px',fontSize:9 }}>🚗 Delivery</span>}
                    {selectedBiz.accepts_card      && <span style={{ background:'rgba(136,0,255,.1)',color:'#8800ff',borderRadius:20,padding:'2px 8px',fontSize:9 }}>💳 Card</span>}
                    {selectedBiz.accepts_wallet    && <span style={{ background:'rgba(255,215,0,.1)',color:'#ffd700',borderRadius:20,padding:'2px 8px',fontSize:9 }}>🪙 Wallet</span>}
                    {selectedBiz.sabbath_mode_enabled && <span style={{ background:'rgba(255,215,0,.1)',color:'#ffd700',borderRadius:20,padding:'2px 8px',fontSize:9 }}>🕯 Sabbath-aware</span>}
                  </div>
                </div>

                {/* Reviews */}
                <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>CUSTOMER REVIEWS ({bizReviews.length})</div>
                {bizReviews.length===0 && <div style={{ color:'#333',fontSize:11,marginBottom:12 }}>No approved reviews yet. Be the first!</div>}
                {bizReviews.map(r => (
                  <div key={r.id} style={{ background:'#09091c',border:'1px solid #1a1a3e',borderRadius:8,padding:10,marginBottom:8 }}>
                    <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
                      <span style={{ color:'#ccc',fontWeight:700,fontSize:12 }}>{r.reviewer_name}</span>
                      <span style={{ color:'#ffd700',fontSize:12 }}>{'⭐'.repeat(r.rating)}</span>
                    </div>
                    {r.review_text && <div style={{ color:'#888',fontSize:11,lineHeight:1.5 }}>{r.review_text}</div>}
                  </div>
                ))}

                {/* Leave a review */}
                {!reviewSubmitted ? (
                  <div style={{ marginTop:12,background:'rgba(255,170,0,.06)',border:'1px solid #ffaa0022',borderRadius:10,padding:12 }}>
                    <div style={{ color:'#ffaa00',fontWeight:700,fontSize:12,marginBottom:10 }}>⭐ Leave a Review</div>
                    <input value={reviewForm.reviewerName} onChange={e=>setReviewForm(f=>({...f,reviewerName:e.target.value}))} placeholder="Your name *"
                      style={{ width:'100%',background:'#09091c',border:'1px solid #333',color:'#ccc',borderRadius:8,padding:'8px 10px',fontFamily:'monospace',fontSize:11,marginBottom:8,boxSizing:'border-box' as const }}/>
                    <input value={reviewForm.reviewerEmail} onChange={e=>setReviewForm(f=>({...f,reviewerEmail:e.target.value}))} placeholder="Email (optional)"
                      style={{ width:'100%',background:'#09091c',border:'1px solid #333',color:'#ccc',borderRadius:8,padding:'8px 10px',fontFamily:'monospace',fontSize:11,marginBottom:8,boxSizing:'border-box' as const }}/>
                    <div style={{ display:'flex',gap:6,marginBottom:8 }}>
                      {[1,2,3,4,5].map(n=>(
                        <button key={n} onClick={()=>setReviewForm(f=>({...f,rating:n}))}
                          style={{ background:reviewForm.rating>=n?'rgba(255,215,0,.2)':'transparent',border:`1px solid ${reviewForm.rating>=n?'#ffd700':'#333'}`,color:reviewForm.rating>=n?'#ffd700':'#555',borderRadius:6,padding:'6px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:14 }}>
                          ⭐
                        </button>
                      ))}
                      <span style={{ color:'#ffd700',fontSize:11,alignSelf:'center' }}>{reviewForm.rating}/5</span>
                    </div>
                    <textarea value={reviewForm.reviewText} onChange={e=>setReviewForm(f=>({...f,reviewText:e.target.value}))} placeholder="Your review (optional)" rows={3}
                      style={{ width:'100%',background:'#09091c',border:'1px solid #333',color:'#ccc',borderRadius:8,padding:'8px 10px',fontFamily:'monospace',fontSize:11,marginBottom:8,resize:'vertical',boxSizing:'border-box' as const }}/>
                    <button onClick={()=>{setReviewBizId(selectedBiz.id);submitReview()}}
                      style={{ width:'100%',background:'rgba(255,170,0,.15)',border:'1px solid #ffaa00',color:'#ffaa00',borderRadius:8,padding:'10px',cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:12 }}>
                      ⭐ SUBMIT REVIEW
                    </button>
                    <div style={{ fontSize:9,color:'#333',marginTop:6,textAlign:'center' }}>Reviews are moderated before appearing publicly</div>
                  </div>
                ) : (
                  <div style={{ background:'rgba(0,204,68,.08)',border:'1px solid #00cc4433',borderRadius:8,padding:12,textAlign:'center',color:'#00cc44',fontSize:12 }}>
                    ✅ Review submitted! Pending moderation.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── REGISTER ── */}
        {tab==='register' && (
          <div>
            {!registered ? (
              <>
                <div style={{ background:'rgba(0,204,68,.06)',border:'1px solid #00cc4422',borderRadius:10,padding:12,marginBottom:16,fontSize:11,color:'#888',lineHeight:1.7 }}>
                  List your business in the All American Marketplace directory. <strong style={{ color:'#00cc44' }}>Free for all users.</strong> Verified listings get a trust badge, higher search ranking, and more discovery. Black-owned businesses are highlighted throughout the platform.
                </div>

                {/* Step indicator */}
                <div style={{ display:'flex',gap:4,marginBottom:16 }}>
                  {[1,2,3].map(s=>(
                    <div key={s} style={{ flex:1,height:6,borderRadius:3,background:registerStep>=s?'#00cc44':'#1a1a3e',transition:'background .3s' }}/>
                  ))}
                </div>

                {/* Step 1: Basic info */}
                {registerStep===1 && (
                  <>
                    <div style={{ fontSize:11,color:'#555',marginBottom:10,letterSpacing:2 }}>STEP 1 — BUSINESS IDENTITY</div>
                    {[
                      {key:'name',label:'Business Name *',required:true},
                      {key:'legalBusinessName',label:'Legal Business Name'},
                      {key:'dbaName',label:'DBA / Also Known As'},
                      {key:'tagline',label:'Tagline (one line)'},
                    ].map(f=>(
                      <input key={f.key} value={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.label}
                        style={{ width:'100%',background:'#09091c',border:`1px solid ${f.required?'#00cc4433':'#222'}`,color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:12,marginBottom:8,boxSizing:'border-box' as const }}/>
                    ))}
                    <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Business description" rows={3}
                      style={{ width:'100%',background:'#09091c',border:'1px solid #222',color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:12,marginBottom:8,resize:'vertical',boxSizing:'border-box' as const }}/>
                    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14 }}>
                      <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}
                        style={{ background:'#09091c',border:'1px solid #00cc4433',color:'#ccc',borderRadius:8,padding:'9px 10px',fontFamily:'monospace',fontSize:12 }}>
                        {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                      </select>
                      <input value={form.subcategory} onChange={e=>setForm(p=>({...p,subcategory:e.target.value}))} placeholder="Subcategory"
                        style={{ background:'#09091c',border:'1px solid #222',color:'#ccc',borderRadius:8,padding:'9px 10px',fontFamily:'monospace',fontSize:12 }}/>
                    </div>
                    {/* Ownership flags */}
                    <div style={{ fontSize:11,color:'#555',marginBottom:8 }}>OWNERSHIP IDENTITY (check all that apply)</div>
                    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,marginBottom:14 }}>
                      {[
                        {key:'blackOwned',label:'✊ Black-Owned'},
                        {key:'womanOwned',label:'👑 Woman-Owned'},
                        {key:'veteranOwned',label:'🎖 Veteran-Owned'},
                        {key:'minorityOwned',label:'🌍 Minority-Owned'},
                        {key:'faithBased',label:'✝️ Faith-Based'},
                        {key:'nonprofit',label:'🤝 Nonprofit'},
                      ].map(f=>(
                        <label key={f.key} style={{ display:'flex',alignItems:'center',gap:8,background:(form as any)[f.key]?'rgba(0,204,68,.08)':'#09091c',border:`1px solid ${(form as any)[f.key]?'#00cc44':'#222'}`,borderRadius:8,padding:'8px 10px',cursor:'pointer',fontSize:11,color:(form as any)[f.key]?'#00cc44':'#666' }}>
                          <input type="checkbox" checked={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.checked}))} style={{ accentColor:'#00cc44' }}/>
                          {f.label}
                        </label>
                      ))}
                    </div>
                    <button onClick={()=>{ if(!form.name){store.setNotif('❌ Business name required');return}; setRegisterStep(2) }}
                      style={{ width:'100%',background:'rgba(0,204,68,.15)',border:'2px solid #00cc44',color:'#00cc44',borderRadius:10,padding:12,cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:13 }}>
                      NEXT: Contact & Location →
                    </button>
                  </>
                )}

                {/* Step 2: Contact + Location */}
                {registerStep===2 && (
                  <>
                    <div style={{ fontSize:11,color:'#555',marginBottom:10,letterSpacing:2 }}>STEP 2 — CONTACT & LOCATION</div>
                    {[
                      {key:'ownerName',label:'Owner / Contact Name'},
                      {key:'businessEmail',label:'Business Email'},
                      {key:'phone',label:'Phone Number'},
                      {key:'whatsapp',label:'WhatsApp Number'},
                      {key:'website',label:'Website URL'},
                    ].map(f=>(
                      <input key={f.key} value={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.label}
                        style={{ width:'100%',background:'#09091c',border:'1px solid #222',color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:12,marginBottom:8,boxSizing:'border-box' as const }}/>
                    ))}
                    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8 }}>
                      <input value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))} placeholder="City" style={{ background:'#09091c',border:'1px solid #222',color:'#ccc',borderRadius:8,padding:'9px 10px',fontFamily:'monospace',fontSize:12 }}/>
                      <input value={form.state} onChange={e=>setForm(p=>({...p,state:e.target.value}))} placeholder="State / Province" style={{ background:'#09091c',border:'1px solid #222',color:'#ccc',borderRadius:8,padding:'9px 10px',fontFamily:'monospace',fontSize:12 }}/>
                    </div>
                    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8 }}>
                      <input value={form.postalCode} onChange={e=>setForm(p=>({...p,postalCode:e.target.value}))} placeholder="ZIP / Postal code" style={{ background:'#09091c',border:'1px solid #222',color:'#ccc',borderRadius:8,padding:'9px 10px',fontFamily:'monospace',fontSize:12 }}/>
                      <input value={form.country} onChange={e=>setForm(p=>({...p,country:e.target.value}))} placeholder="Country" style={{ background:'#09091c',border:'1px solid #222',color:'#ccc',borderRadius:8,padding:'9px 10px',fontFamily:'monospace',fontSize:12 }}/>
                    </div>
                    <input value={form.serviceArea} onChange={e=>setForm(p=>({...p,serviceArea:e.target.value}))} placeholder="Service area (e.g. Chicagoland, Nationwide)"
                      style={{ width:'100%',background:'#09091c',border:'1px solid #222',color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:12,marginBottom:14,boxSizing:'border-box' as const }}/>

                    {/* Capabilities */}
                    <div style={{ fontSize:11,color:'#555',marginBottom:8 }}>CAPABILITIES</div>
                    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,marginBottom:14 }}>
                      {[
                        {key:'productsEnabled',label:'📦 Sells Products'},
                        {key:'servicesEnabled',label:'🛠 Offers Services'},
                        {key:'bookingEnabled',label:'📅 Takes Bookings'},
                        {key:'deliveryEnabled',label:'🚗 Delivery'},
                        {key:'acceptsCard',label:'💳 Accepts Card'},
                        {key:'acceptsWallet',label:'🪙 Accepts Tokens'},
                        {key:'sabbathModeEnabled',label:'🕯 Sabbath-aware'},
                      ].map(f=>(
                        <label key={f.key} style={{ display:'flex',alignItems:'center',gap:8,background:(form as any)[f.key]?'rgba(0,204,68,.06)':'#09091c',border:`1px solid ${(form as any)[f.key]?'#00cc4422':'#111'}`,borderRadius:8,padding:'7px 10px',cursor:'pointer',fontSize:10,color:(form as any)[f.key]?'#00cc44':'#555' }}>
                          <input type="checkbox" checked={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.checked}))} style={{ accentColor:'#00cc44' }}/>
                          {f.label}
                        </label>
                      ))}
                    </div>
                    <div style={{ display:'flex',gap:8 }}>
                      <button onClick={()=>setRegisterStep(1)} style={{ flex:1,background:'transparent',border:'1px solid #333',color:'#555',borderRadius:8,padding:10,cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>← Back</button>
                      <button onClick={()=>setRegisterStep(3)} style={{ flex:2,background:'rgba(0,204,68,.15)',border:'2px solid #00cc44',color:'#00cc44',borderRadius:10,padding:12,cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:13 }}>NEXT: Review & Submit →</button>
                    </div>
                  </>
                )}

                {/* Step 3: Review + Submit */}
                {registerStep===3 && (
                  <>
                    <div style={{ fontSize:11,color:'#555',marginBottom:10,letterSpacing:2 }}>STEP 3 — REVIEW & SUBMIT</div>
                    <div style={{ background:'#09091c',border:'1px solid #1a1a3e',borderRadius:10,padding:12,marginBottom:14 }}>
                      <div style={{ color:'#fff',fontWeight:700,fontSize:14,marginBottom:4 }}>{form.name}</div>
                      <div style={{ color:'#555',fontSize:11 }}>{form.category} · {form.city}, {form.state}, {form.country}</div>
                      {form.description && <div style={{ color:'#888',fontSize:11,marginTop:6,lineHeight:1.5 }}>{form.description.slice(0,100)}...</div>}
                      <div style={{ display:'flex',gap:4,marginTop:8,flexWrap:'wrap' }}>
                        {form.blackOwned && <span style={{ background:'rgba(0,204,68,.1)',color:'#00cc44',borderRadius:20,padding:'1px 7px',fontSize:9 }}>✊ Black-owned</span>}
                        {form.womanOwned && <span style={{ background:'rgba(255,102,204,.1)',color:'#ff66cc',borderRadius:20,padding:'1px 7px',fontSize:9 }}>👑 Woman-owned</span>}
                        {form.veteranOwned && <span style={{ background:'rgba(0,204,255,.1)',color:'#00ccff',borderRadius:20,padding:'1px 7px',fontSize:9 }}>🎖 Veteran</span>}
                        {form.faithBased && <span style={{ background:'rgba(255,215,0,.1)',color:'#ffd700',borderRadius:20,padding:'1px 7px',fontSize:9 }}>✝️ Faith</span>}
                      </div>
                    </div>
                    <label style={{ display:'flex',gap:10,alignItems:'flex-start',marginBottom:8,fontSize:11,color:'#888',cursor:'pointer' }}>
                      <input type="checkbox" checked={form.termsAccepted} onChange={e=>setForm(p=>({...p,termsAccepted:e.target.checked}))} style={{ marginTop:2,accentColor:'#00cc44' }}/>
                      I agree to the AMM Business Directory Terms of Service. My listing information is accurate.
                    </label>
                    <label style={{ display:'flex',gap:10,alignItems:'flex-start',marginBottom:14,fontSize:11,color:'#888',cursor:'pointer' }}>
                      <input type="checkbox" checked={form.privacyAccepted} onChange={e=>setForm(p=>({...p,privacyAccepted:e.target.checked}))} style={{ marginTop:2,accentColor:'#00cc44' }}/>
                      I accept the AMM Privacy Policy. Contact info may be displayed publicly.
                    </label>
                    <div style={{ display:'flex',gap:8 }}>
                      <button onClick={()=>setRegisterStep(2)} style={{ flex:1,background:'transparent',border:'1px solid #333',color:'#555',borderRadius:8,padding:10,cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>← Back</button>
                      <button onClick={register} disabled={registering||!form.termsAccepted||!form.privacyAccepted}
                        style={{ flex:2,background:registering?'#09091c':'rgba(0,204,68,.2)',border:`2px solid ${registering?'#333':'#00cc44'}`,color:registering?'#555':'#00cc44',borderRadius:10,padding:12,cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:13 }}>
                        {registering?'Submitting...':'✊ SUBMIT TO DIRECTORY'}
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div style={{ textAlign:'center',padding:'30px 20px' }}>
                <div style={{ fontSize:52,marginBottom:12 }}>✊</div>
                <div style={{ color:'#00cc44',fontSize:16,fontWeight:900,marginBottom:8 }}>Business Registered!</div>
                <div style={{ color:'#888',fontSize:12,lineHeight:1.7,marginBottom:16 }}>
                  "{registered.name}" is now pending review.<br/>
                  AMM team verifies within 48 hours.<br/>
                  Once verified, your listing appears in search results.
                </div>
                <div style={{ background:'rgba(0,204,68,.08)',border:'1px solid #00cc4422',borderRadius:10,padding:12,marginBottom:16,fontSize:11,color:'#888' }}>
                  <div style={{ color:'#00cc44',fontWeight:700,marginBottom:6 }}>What verification does for you</div>
                  ✓ Verified badge on your listing<br/>
                  ✓ Higher trust score → higher search ranking<br/>
                  ✓ Unlock Holo Delivery and HoloRideShare driver access<br/>
                  ✓ Priority placement in AMM Marketplace<br/>
                  ✓ Access to AMM Business SDK
                </div>
                <div style={{ color:'#555',fontSize:11,marginBottom:12 }}>Your slug: <code style={{ color:'#00ffcc' }}>tryamm.online/biz/{registered.slug}</code></div>
                <button onClick={()=>{ setRegistered(null); setRegisterStep(1); setForm(f=>({...f,name:'',description:'',tagline:'',businessEmail:'',phone:'',termsAccepted:false,privacyAccepted:false})) }}
                  style={{ background:'rgba(0,204,68,.1)',border:'1px solid #00cc44',color:'#00cc44',borderRadius:8,padding:'10px 20px',cursor:'pointer',fontFamily:'monospace',fontSize:12 }}>
                  Register Another Business
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── MY LISTINGS ── */}
        {tab==='mylist' && (
          <div>
            <button onClick={loadMyListings} style={{ background:'rgba(255,215,0,.1)',border:'1px solid #ffd70033',color:'#ffd700',borderRadius:8,padding:'8px 14px',cursor:'pointer',fontFamily:'monospace',fontSize:11,marginBottom:14 }}>
              {myListLoading?'Loading...':'↻ REFRESH MY LISTINGS'}
            </button>
            {myListings.length===0&&!myListLoading&&<div style={{ textAlign:'center',padding:30,color:'#333' }}>No listings yet. Register your first business in the Register tab.</div>}
            {myListings.map(biz=>(
              <div key={biz.id} style={{ background:'#09091c',border:'1px solid #1a1a3e',borderRadius:10,padding:12,marginBottom:10 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8 }}>
                  <div>
                    <div style={{ color:'#fff',fontWeight:700,fontSize:13 }}>{biz.name}</div>
                    <div style={{ color:'#555',fontSize:10,marginTop:2 }}>{biz.category} · {biz.city}, {biz.state}</div>
                  </div>
                  <span style={{ color:STATUS_COLORS[biz.verification_status],background:`${STATUS_COLORS[biz.verification_status]}15`,border:`1px solid ${STATUS_COLORS[biz.verification_status]}33`,borderRadius:20,padding:'2px 8px',fontSize:9,fontWeight:700 }}>
                    {STATUS_EMOJI[biz.verification_status]} {biz.verification_status.toUpperCase()}
                  </span>
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,fontSize:11,marginBottom:8 }}>
                  <div style={{ background:'#050510',borderRadius:6,padding:'6px',textAlign:'center' }}>
                    <div style={{ color:'#ffd700',fontWeight:700 }}>{biz.trust_score}</div>
                    <div style={{ color:'#444',fontSize:9 }}>Trust</div>
                  </div>
                  <div style={{ background:'#050510',borderRadius:6,padding:'6px',textAlign:'center' }}>
                    <div style={{ color:'#00ffcc',fontWeight:700 }}>{biz.review_count}</div>
                    <div style={{ color:'#444',fontSize:9 }}>Reviews</div>
                  </div>
                  <div style={{ background:'#050510',borderRadius:6,padding:'6px',textAlign:'center' }}>
                    <div style={{ color:'#ff66cc',fontWeight:700 }}>{biz.rating_average?.toFixed(1)||'—'}</div>
                    <div style={{ color:'#444',fontSize:9 }}>Rating</div>
                  </div>
                  <div style={{ background:'#050510',borderRadius:6,padding:'6px',textAlign:'center' }}>
                    <div style={{ color:'#8800ff',fontWeight:700 }}>{biz.verification_level}</div>
                    <div style={{ color:'#444',fontSize:9 }}>Level</div>
                  </div>
                </div>
                {biz.admin_review_note && <div style={{ fontSize:10,color:'#ffd700',marginTop:4 }}>📋 Admin note: {biz.admin_review_note}</div>}
                <div style={{ fontSize:9,color:'#333',marginTop:4 }}>Slug: tryamm.online/biz/{biz.slug}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab==='reviews' && (
          <div>
            <div style={{ background:'rgba(255,170,0,.06)',border:'1px solid #ffaa0022',borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:'#888',lineHeight:1.6 }}>
              Submit a review for any business in the directory. Reviews are moderated before going public. One review per customer per business.
            </div>
            <input value={reviewBizId||''} onChange={e=>{ setReviewBizId(e.target.value); setReviewSubmitted(false) }} placeholder="Paste business ID to review..."
              style={{ width:'100%',background:'#09091c',border:'1px solid #ffaa0044',color:'#ccc',borderRadius:8,padding:'10px 12px',fontFamily:'monospace',fontSize:12,marginBottom:10,boxSizing:'border-box' as const }}/>
            {reviewBizId && !reviewSubmitted && (
              <div>
                <input value={reviewForm.reviewerName} onChange={e=>setReviewForm(f=>({...f,reviewerName:e.target.value}))} placeholder="Your name *"
                  style={{ width:'100%',background:'#09091c',border:'1px solid #333',color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:12,marginBottom:8,boxSizing:'border-box' as const }}/>
                <div style={{ display:'flex',gap:5,marginBottom:8 }}>
                  {[1,2,3,4,5].map(n=>(
                    <button key={n} onClick={()=>setReviewForm(f=>({...f,rating:n}))}
                      style={{ background:reviewForm.rating>=n?'rgba(255,215,0,.2)':'#09091c',border:`1px solid ${reviewForm.rating>=n?'#ffd700':'#333'}`,color:reviewForm.rating>=n?'#ffd700':'#555',borderRadius:6,padding:'6px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:14 }}>⭐</button>
                  ))}
                </div>
                <textarea value={reviewForm.reviewText} onChange={e=>setReviewForm(f=>({...f,reviewText:e.target.value}))} placeholder="Your review" rows={3}
                  style={{ width:'100%',background:'#09091c',border:'1px solid #333',color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:12,marginBottom:10,resize:'vertical',boxSizing:'border-box' as const }}/>
                <button onClick={submitReview} style={{ width:'100%',background:'rgba(255,170,0,.15)',border:'1px solid #ffaa00',color:'#ffaa00',borderRadius:8,padding:'10px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>
                  ⭐ SUBMIT REVIEW
                </button>
              </div>
            )}
            {reviewSubmitted && <div style={{ background:'rgba(0,204,68,.08)',border:'1px solid #00cc4422',borderRadius:8,padding:12,textAlign:'center',color:'#00cc44',fontSize:12 }}>✅ Review submitted! Pending moderation.</div>}
          </div>
        )}

        {/* ── ADMIN ── */}
        {tab==='admin' && (
          <div>
            <div style={{ background:'rgba(136,0,255,.06)',border:'1px solid #8800ff22',borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:'#888' }}>
              Admin controls for business verification and review moderation. Set verification status, level, and trust score calculation is automatic.
            </div>

            {/* Verify settings */}
            <div style={{ marginBottom:14,background:'#09091c',border:'1px solid #8800ff22',borderRadius:10,padding:12 }}>
              <div style={{ color:'#8800ff',fontWeight:700,fontSize:12,marginBottom:10 }}>🛡 Verification Settings</div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8 }}>
                <select value={verifyForm.verificationStatus} onChange={e=>setVerifyForm(f=>({...f,verificationStatus:e.target.value as VerificationStatus}))}
                  style={{ background:'#050510',border:'1px solid #8800ff33',color:'#ccc',borderRadius:8,padding:'8px 10px',fontFamily:'monospace',fontSize:11 }}>
                  {['unverified','pending','verified','rejected','suspended'].map(s=><option key={s}>{s}</option>)}
                </select>
                <select value={verifyForm.verificationLevel} onChange={e=>setVerifyForm(f=>({...f,verificationLevel:e.target.value as VerificationLevel}))}
                  style={{ background:'#050510',border:'1px solid #8800ff33',color:'#ccc',borderRadius:8,padding:'8px 10px',fontFamily:'monospace',fontSize:11 }}>
                  {['basic','business','enhanced','government'].map(l=><option key={l}>{l}</option>)}
                </select>
              </div>
              <textarea value={verifyForm.adminReviewNote} onChange={e=>setVerifyForm(f=>({...f,adminReviewNote:e.target.value}))} placeholder="Admin review note" rows={2}
                style={{ width:'100%',background:'#050510',border:'1px solid #333',color:'#ccc',borderRadius:8,padding:'8px 10px',fontFamily:'monospace',fontSize:11,marginBottom:8,resize:'none',boxSizing:'border-box' as const }}/>
              <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                {[['emailVerified','Email ✓'],['phoneVerified','Phone ✓'],['websiteVerified','Website ✓'],['addressVerified','Address ✓']].map(([key,label])=>(
                  <label key={key} style={{ display:'flex',alignItems:'center',gap:4,fontSize:10,color:(verifyForm as any)[key]?'#00cc44':'#555',cursor:'pointer' }}>
                    <input type="checkbox" checked={(verifyForm as any)[key]} onChange={e=>setVerifyForm(f=>({...f,[key]:e.target.checked}))} style={{ accentColor:'#00cc44' }}/>
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Business listings */}
            <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>PENDING BUSINESSES ({adminListings.filter(b=>b.verification_status==='pending').length})</div>
            {adminListings.filter(b=>b.verification_status==='pending').map(biz=>(
              <div key={biz.id} style={{ background:'#09091c',border:'1px solid #1a1a3e',borderRadius:8,padding:10,marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                <div>
                  <div style={{ color:'#fff',fontWeight:700,fontSize:12 }}>{biz.name}</div>
                  <div style={{ color:'#555',fontSize:10 }}>{biz.category} · {biz.city}, {biz.state}</div>
                </div>
                <button onClick={()=>verifyBusiness(biz.id)} style={{ background:'rgba(136,0,255,.15)',border:'1px solid #8800ff',color:'#8800ff',borderRadius:6,padding:'6px 12px',cursor:'pointer',fontFamily:'monospace',fontSize:10,fontWeight:700 }}>
                  APPLY DECISION
                </button>
              </div>
            ))}

            {/* Review moderation */}
            <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2,marginTop:16 }}>PENDING REVIEWS ({adminReviews.filter(r=>!r.approved).length})</div>
            {adminReviews.filter(r=>!r.approved).map(review=>(
              <div key={review.id} style={{ background:'#09091c',border:'1px solid #1a1a3e',borderRadius:8,padding:10,marginBottom:8 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4 }}>
                  <div>
                    <span style={{ color:'#ccc',fontWeight:700,fontSize:11 }}>{review.reviewer_name}</span>
                    <span style={{ color:'#ffd700',fontSize:11,marginLeft:8 }}>{'⭐'.repeat(review.rating)}</span>
                  </div>
                  <div style={{ display:'flex',gap:5 }}>
                    <button onClick={()=>approveReview(review.id)} style={{ background:'rgba(0,204,68,.15)',border:'1px solid #00cc44',color:'#00cc44',borderRadius:5,padding:'4px 8px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>✓ Approve</button>
                    <button onClick={async()=>{ if(API) await fetch(`${API}/api/admin/business-reviews/${review.id}/delete`,{method:'POST',headers}); loadAdminData() }} style={{ background:'rgba(255,68,0,.1)',border:'1px solid #ff440033',color:'#ff4400',borderRadius:5,padding:'4px 8px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>✗ Delete</button>
                  </div>
                </div>
                {review.review_text && <div style={{ color:'#666',fontSize:10,lineHeight:1.4 }}>{review.review_text}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── DEMO DATA ─────────────────────────────────────────────────────────────────

const DEMO_BUSINESSES: Business[] = [
  { id:'b1', name:"Sister Ruth's Kitchen", legal_business_name:"Ruth's Home Cooking LLC", tagline:"Soul food made with love and prayer", description:"Authentic Southern soul food catering and delivery. 25 years serving the Chicago community.", category:'Restaurant & Food', subcategory:'Soul Food & Catering', logo_url:'', banner_url:'', slug:'sister-ruths-kitchen-abc123', black_owned:true, minority_owned:true, veteran_owned:false, woman_owned:true, faith_based:true, nonprofit:false, owner_name:'Ruth Johnson', business_email:'ruth@sisterskitchen.com', phone:'3125550100', whatsapp:'3125550100', website:'https://sisterskitchen.com', country:'US', state:'IL', city:'Chicago', postal_code:'60620', address_line_1:'5500 S King Dr', service_area:'Chicago Southside', verification_status:'verified', verification_level:'business', trust_score:85, rating_average:4.9, review_count:47, products_enabled:false, services_enabled:true, booking_enabled:true, delivery_enabled:true, accepts_card:true, accepts_wallet:true, average_price_range:'$10–$50 per person', return_policy:'Refunds within 24 hours of order', refund_policy:'Full refund if not satisfied', sabbath_mode_enabled:true, featured:true, tags:['soul food','catering','chicago'], email_verified:true, phone_verified:true, website_verified:true, address_verified:true, admin_review_note:'Verified business registration and insurance.', created_at: new Date().toISOString() },
  { id:'b2', name:'Kingdom Grill ATL', legal_business_name:'Kingdom Grill LLC', tagline:'Jerk chicken seasoned with the Spirit', description:"Atlanta's best jerk chicken. Jamaican and Southern fusion. Faith-first business serving the city since 2019.", category:'Restaurant & Food', subcategory:'Caribbean & Southern', logo_url:'', banner_url:'', slug:'kingdom-grill-atl-def456', black_owned:true, minority_owned:true, veteran_owned:false, woman_owned:false, faith_based:true, nonprofit:false, owner_name:'Marcus Williams', business_email:'info@kingdomgrillatl.com', phone:'4045550200', whatsapp:'4045550200', website:'', country:'US', state:'GA', city:'Atlanta', postal_code:'30310', address_line_1:'1234 MLK Blvd', service_area:'Atlanta Metro', verification_status:'verified', verification_level:'business', trust_score:75, rating_average:4.7, review_count:23, products_enabled:false, services_enabled:true, booking_enabled:false, delivery_enabled:true, accepts_card:true, accepts_wallet:false, average_price_range:'$12–$35', return_policy:'', refund_policy:'', sabbath_mode_enabled:false, featured:false, tags:['jerk chicken','atl','caribbean'], email_verified:true, phone_verified:true, website_verified:false, address_verified:true, admin_review_note:'', created_at: new Date().toISOString() },
  { id:'b3', name:'Zion Beauty Supply', legal_business_name:'Zion Beauty Supply LLC', tagline:'Natural beauty rooted in faith', description:'100% natural Black hair care products. Shea butter, African black soap, and natural oils. Woman and faith-owned.', category:'Beauty & Wellness', subcategory:'Natural Hair Care', logo_url:'', banner_url:'', slug:'zion-beauty-supply-ghi789', black_owned:true, minority_owned:true, veteran_owned:false, woman_owned:true, faith_based:true, nonprofit:false, owner_name:'Keisha Thompson', business_email:'keisha@zionbeauty.com', phone:'7135550300', whatsapp:'7135550300', website:'https://zionbeauty.com', country:'US', state:'TX', city:'Houston', postal_code:'77004', address_line_1:'2200 Almeda Rd', service_area:'Houston + Online Nationwide', verification_status:'pending', verification_level:'basic', trust_score:40, rating_average:4.8, review_count:12, products_enabled:true, services_enabled:false, booking_enabled:false, delivery_enabled:false, accepts_card:true, accepts_wallet:true, average_price_range:'$8–$45', return_policy:'30-day returns', refund_policy:'Full refund on unopened items', sabbath_mode_enabled:true, featured:false, tags:['natural hair','shea butter','houston'], email_verified:true, phone_verified:false, website_verified:false, address_verified:false, admin_review_note:'', created_at: new Date().toISOString() },
]

const DEMO_REVIEWS: Review[] = [
  { id:'r1', reviewer_name:'Deacon James', rating:5, review_text:"Best soul food in Chicago. Sister Ruth prays over every meal. You can taste the love.", approved:true, created_at: new Date().toISOString() },
  { id:'r2', reviewer_name:'Pastor Mike', rating:5, review_text:"Used for our church banquet. 200 people served, not one complaint. Will use again.", approved:true, created_at: new Date().toISOString() },
]
