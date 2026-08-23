// AMM Omniverse — Global Share Link System
// Real Supabase-backed share links with QR codes, analytics, translations, campaign templates
// Matches the ChatGPT architecture from the handoff documents exactly

import { useState, useEffect, useCallback } from 'react'
import { useGameStore } from '../game/state/useGameStore'

const API = (import.meta as any).env?.VITE_API_URL ?? ''

// ── TYPES ─────────────────────────────────────────────────────────────────────

type TargetType = 'track'|'release'|'creator_site'|'business'|'product'|'episode'|'live_room'|'game'|'card'

interface ShareLink {
  id: string; creator_id: string; target_type: TargetType; target_id: string
  title: string; description: string; image_url: string; public_url: string
  short_code: string; language: string; region: string; campaign: string
  created_at: string
}

interface ShareAnalytics {
  share: ShareLink; totalClicks: number
  byPlatform: Record<string,number>
  byCountry: Record<string,number>
  byDay: Record<string,number>
  recentClicks: { platform:string; country:string; created_at:string }[]
}

interface ShareTranslation { id: string; language: string; title: string; description: string }
interface CampaignTemplate { id: string; name: string; target_type: string; region: string; language: string; caption: string; hashtags: string; created_at: string }

const TARGET_TYPES: { value: TargetType; label: string; emoji: string }[] = [
  { value:'track',        label:'Music Track',     emoji:'🎵' },
  { value:'release',      label:'Album/Release',   emoji:'💿' },
  { value:'creator_site', label:'Creator Website', emoji:'🌐' },
  { value:'business',     label:'Business',        emoji:'✊' },
  { value:'product',      label:'Product',         emoji:'📦' },
  { value:'episode',      label:'Drama Episode',   emoji:'🎬' },
  { value:'live_room',    label:'Live Room',       emoji:'📡' },
  { value:'game',         label:'Game',            emoji:'🎮' },
  { value:'card',         label:'Card Battle',     emoji:'🃏' },
]

const REGIONS = [
  { value:'global',       label:'🌐 Global' },
  { value:'india',        label:'🇮🇳 India' },
  { value:'china',        label:'🇨🇳 China' },
  { value:'japan',        label:'🇯🇵 Japan' },
  { value:'australia',    label:'🇦🇺 Australia' },
  { value:'west_africa',  label:'🌍 West Africa' },
  { value:'east_africa',  label:'🌍 East Africa' },
  { value:'south_africa', label:'🇿🇦 South Africa' },
  { value:'north_africa', label:'🌍 North Africa' },
  { value:'music',        label:'🎵 Music Focus' },
  { value:'business',     label:'✊ Business' },
  { value:'faith',        label:'✝️ Faith' },
]

const LANGUAGES = [
  { code:'en', label:'English' }, { code:'es', label:'Español' },
  { code:'fr', label:'Français' }, { code:'pt', label:'Português' },
  { code:'hi', label:'हिंदी' }, { code:'ar', label:'العربية' },
  { code:'zh', label:'中文' }, { code:'ja', label:'日本語' },
  { code:'sw', label:'Kiswahili' }, { code:'yo', label:'Yorùbá' },
  { code:'ha', label:'Hausa' }, { code:'ig', label:'Igbo' },
]

// ── QR CODE GENERATOR (pure JS — no library needed) ──────────────────────────
// Simple data URL QR-like visual for demo; upgrades to real QR with npm install qrcode after Victor deploys

function generateQRDataUrl(text: string): string {
  // Returns a canvas-based QR placeholder until qrcode library is installed
  // After Victor deploys: replace with QRCode.toDataURL(text) from the 'qrcode' npm package
  const size = 200
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = '#000000'
  // Draw finder patterns (corners)
  const fp = (x: number, y: number) => {
    ctx.fillRect(x, y, 49, 49)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(x+7, y+7, 35, 35)
    ctx.fillStyle = '#000000'
    ctx.fillRect(x+14, y+14, 21, 21)
  }
  fp(0,0); fp(size-49,0); fp(0,size-49)
  // Draw data-like pattern from text hash
  let hash = 0
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) - hash) + text.charCodeAt(i)
  const cellSize = 6
  for (let row = 8; row < Math.floor(size/cellSize)-8; row++) {
    for (let col = 8; col < Math.floor(size/cellSize)-8; col++) {
      const bit = ((hash ^ (row * 31 + col * 17)) >>> 0) & 1
      if (bit) {
        ctx.fillRect(col * cellSize, row * cellSize, cellSize-1, cellSize-1)
      }
    }
  }
  // URL text below
  ctx.fillStyle = '#000000'
  ctx.font = '8px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(text.slice(0, 30), size/2, size-4)
  return canvas.toDataURL()
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

type Tab = 'create'|'mylinks'|'analytics'|'translate'|'templates'|'qr'

export default function ShareLinkSystem({ onClose }: { onClose: () => void }) {
  const store = useGameStore()
  const [tab, setTab] = useState<Tab>('create')
  const userId = (store.player as any)?.id ?? 'demo_user'

  // Create form
  const [form, setForm] = useState({
    targetType: 'track' as TargetType,
    targetId: '',
    title: '',
    description: '',
    imageUrl: '',
    publicUrl: 'https://tryamm.online',
    language: 'en',
    region: 'global',
    campaign: 'organic',
  })
  const [creating, setCreating] = useState(false)
  const [lastCreated, setLastCreated] = useState<{ shortUrl: string; platformLinks: Record<string,string> } | null>(null)

  // My links
  const [links, setLinks] = useState<ShareLink[]>([])
  const [linksLoading, setLinksLoading] = useState(false)

  // Analytics
  const [selectedLinkId, setSelectedLinkId] = useState<string|null>(null)
  const [analytics, setAnalytics] = useState<ShareAnalytics|null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Translations
  const [transLinkId, setTransLinkId] = useState<string|null>(null)
  const [translations, setTranslations] = useState<ShareTranslation[]>([])
  const [transForm, setTransForm] = useState({ language:'es', title:'', description:'' })

  // Templates
  const [templates, setTemplates] = useState<CampaignTemplate[]>([])
  const [genForm, setGenForm] = useState({ targetType:'track' as TargetType, title:'', region:'global', language:'en' })
  const [generatedTemplate, setGeneratedTemplate] = useState<{caption:string;hashtags:string}|null>(null)

  // QR
  const [qrCode, setQrCode] = useState<string|null>(null)
  const [qrUrl, setQrUrl] = useState('')

  const apiHeaders = { 'Content-Type': 'application/json', 'x-user-id': userId }

  // ── ACTIONS ────────────────────────────────────────────────────────────────

  const createLink = async () => {
    if (!form.title || !form.publicUrl) { store.setNotif('❌ Title and public URL required'); return }
    setCreating(true)
    if (API) {
      try {
        const res = await fetch(`${API}/api/shares`, { method:'POST', headers:apiHeaders, body:JSON.stringify(form) })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setLastCreated({ shortUrl: data.shortUrl, platformLinks: data.platformLinks })
        store.setNotif(`✅ Share link created! Short URL: ${data.shortUrl}`)
      } catch (e: any) { store.setNotif(`❌ ${e.message}`) }
    } else {
      // Demo mode
      const shortCode = Math.random().toString(36).slice(2,10)
      const shortUrl = `https://tryamm.online/s/${shortCode}`
      setLastCreated({ shortUrl, platformLinks: { facebook:`https://www.facebook.com/sharer/?u=${encodeURIComponent(shortUrl)}`, whatsapp:`https://wa.me/?text=${encodeURIComponent(form.title+' '+shortUrl)}`, x:`https://twitter.com/intent/tweet?url=${encodeURIComponent(shortUrl)}`, telegram:`https://t.me/share/url?url=${encodeURIComponent(shortUrl)}`, copy: shortUrl } })
      store.setNotif(`✅ Demo share link: ${shortUrl}`)
    }
    setCreating(false)
  }

  const loadLinks = useCallback(async () => {
    setLinksLoading(true)
    if (API) {
      try {
        const res = await fetch(`${API}/api/shares/me`, { headers:apiHeaders })
        const data = await res.json()
        setLinks(data.shares || [])
      } catch { setLinks([]) }
    } else {
      // Demo data
      setLinks([
        { id:'demo1', creator_id:userId, target_type:'track', target_id:'t1', title:'Kingdom Anthem', description:'Gospel track', image_url:'', public_url:'https://tryamm.online/music/kingdom-anthem', short_code:'abc12345', language:'en', region:'global', campaign:'organic', created_at: new Date().toISOString() },
        { id:'demo2', creator_id:userId, target_type:'episode', target_id:'e1', title:'The Chosen Path — Episode 1', description:'Faith drama', image_url:'', public_url:'https://tryamm.online/drama/chosen-path', short_code:'xyz67890', language:'en', region:'west_africa', campaign:'launch', created_at: new Date().toISOString() },
      ])
    }
    setLinksLoading(false)
  }, [API, userId])

  const loadAnalytics = async (id: string) => {
    setSelectedLinkId(id)
    setAnalyticsLoading(true)
    if (API) {
      try {
        const res = await fetch(`${API}/api/shares/${id}/analytics`, { headers:apiHeaders })
        const data = await res.json()
        setAnalytics(data)
      } catch { setAnalytics(null) }
    } else {
      setAnalytics({
        share: links.find(l=>l.id===id) as ShareLink,
        totalClicks: 247,
        byPlatform: { whatsapp:89, facebook:62, direct:48, telegram:31, x:17 },
        byCountry: { US:102, NG:58, KE:34, GH:28, GB:25 },
        byDay: { [new Date().toISOString().slice(0,10)]: 47, [new Date(Date.now()-86400000).toISOString().slice(0,10)]: 83 },
        recentClicks: [
          { platform:'whatsapp', country:'NG', created_at: new Date().toISOString() },
          { platform:'facebook', country:'US', created_at: new Date().toISOString() },
          { platform:'telegram', country:'KE', created_at: new Date().toISOString() },
        ]
      })
    }
    setAnalyticsLoading(false)
    setTab('analytics')
  }

  const loadTranslations = async (id: string) => {
    setTransLinkId(id)
    if (API) {
      const res = await fetch(`${API}/api/shares/${id}/translations`)
      const data = await res.json()
      setTranslations(data.translations || [])
    } else {
      setTranslations([{ id:'t1', language:'es', title:'Himno del Reino', description:'Pista de gospel' }])
    }
    setTab('translate')
  }

  const addTranslation = async () => {
    if (!transForm.title || !transLinkId) return
    if (API) {
      const res = await fetch(`${API}/api/shares/${transLinkId}/translations`, { method:'POST', headers:apiHeaders, body:JSON.stringify(transForm) })
      const data = await res.json()
      if (!data.error) { setTranslations(t=>[...t, data.translation]); store.setNotif('✅ Translation added!') }
    } else {
      setTranslations(t=>[...t, { id:Date.now().toString(), ...transForm }])
      store.setNotif('✅ Translation added (demo mode)')
    }
    setTransForm({ language:'fr', title:'', description:'' })
  }

  const generateTemplate = async () => {
    if (!genForm.title) { store.setNotif('❌ Enter a title'); return }
    if (API) {
      const res = await fetch(`${API}/api/share-templates/generate`, { method:'POST', headers:apiHeaders, body:JSON.stringify(genForm) })
      const data = await res.json()
      setGeneratedTemplate({ caption: data.caption, hashtags: data.hashtags })
    } else {
      setGeneratedTemplate({
        caption: `🌐 Check out "${genForm.title}" on All American Marketplace — faith-centered creator economy. Support Black-owned creators, music, drama, games, and community commerce. tryamm.online`,
        hashtags: '#AAM #BlackOwnedBusiness #FaithCreator #CreatorEconomy #BlackMusic #GospelMusic',
      })
    }
  }

  const generateQR = () => {
    const url = qrUrl || 'https://tryamm.online'
    const dataUrl = generateQRDataUrl(url)
    setQrCode(dataUrl)
  }

  const copyToClipboard = (text: string, label = 'Copied!') => {
    navigator.clipboard?.writeText(text)
    store.setNotif(`📋 ${label}`)
  }

  const PLATFORM_ICONS: Record<string,string> = {
    facebook:'👍', x:'𝕏', whatsapp:'💬', telegram:'✈️', linkedin:'💼',
    reddit:'🔶', email:'📧', sms:'📱', tiktok:'🎵', instagram:'📸',
    youtube:'▶️', snapchat:'👻', line:'💬', wechat:'💚', audiomack:'🎧',
    boomplay:'🔊', mdundo:'🎵', moya:'💙', ayoba:'🟡', sharechat:'🗣️',
    moj:'🎭', copy:'📋',
  }

  return (
    <div style={{ width:'100%',height:'100%',background:'#020212',fontFamily:'monospace',color:'#ccc',display:'flex',flexDirection:'column' }}>
      {/* Header */}
      <div style={{ padding:'10px 14px',borderBottom:'1px solid #1a1a3e',background:'#09091d',display:'flex',alignItems:'center',gap:10 }}>
        <button onClick={onClose} style={{ background:'none',border:'1px solid #333',color:'#555',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>← BACK</button>
        <span style={{ color:'#00ffcc',fontWeight:900,fontSize:13,letterSpacing:2 }}>🌍 GLOBAL SHARE LINK SYSTEM</span>
        <span style={{ marginLeft:'auto',color:'#555',fontSize:9 }}>Supabase · Analytics · QR · 12 regions</span>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex',borderBottom:'1px solid #1a1a3e',overflowX:'auto' }}>
        {([
          ['create','✨ Create','#00ffcc'], ['mylinks','📋 My Links','#00ccff'],
          ['analytics','📊 Analytics','#ffd700'], ['translate','🌐 Translate','#8800ff'],
          ['templates','🎯 Templates','#ff6600'], ['qr','QR Code','#00cc44'],
        ] as [Tab,string,string][]).map(([t,label,color])=>(
          <button key={t} onClick={()=>{setTab(t);if(t==='mylinks')loadLinks()}}
            style={{ flex:'0 0 auto',padding:'8px 12px',background:tab===t?`${color}10`:'transparent',border:'none',borderBottom:tab===t?`2px solid ${color}`:'2px solid transparent',color:tab===t?color:'#555',cursor:'pointer',fontFamily:'monospace',fontSize:10,fontWeight:tab===t?700:400,whiteSpace:'nowrap' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ flex:1,overflowY:'auto',padding:14 }}>

        {/* ── CREATE ── */}
        {tab==='create'&&(
          <div>
            <div style={{ background:'rgba(0,255,204,.06)',border:'1px solid #00ffcc22',borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:'#888',lineHeight:1.6 }}>
              Create a tracked short link for any AMM content. Share it globally across 70+ platforms. See exactly who clicked, from which country, from which platform.
            </div>

            {/* Target type */}
            <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>WHAT ARE YOU SHARING?</div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:14 }}>
              {TARGET_TYPES.map(tt=>(
                <button key={tt.value} onClick={()=>setForm(f=>({...f,targetType:tt.value}))}
                  style={{ background:form.targetType===tt.value?'rgba(0,255,204,.12)':'#09091c',border:`1px solid ${form.targetType===tt.value?'#00ffcc':'#222'}`,color:form.targetType===tt.value?'#00ffcc':'#666',borderRadius:8,padding:'8px 6px',cursor:'pointer',fontFamily:'monospace',textAlign:'center' }}>
                  <div style={{ fontSize:16,marginBottom:3 }}>{tt.emoji}</div>
                  <div style={{ fontSize:9,fontWeight:700 }}>{tt.label}</div>
                </button>
              ))}
            </div>

            {/* Form fields */}
            {[
              {key:'title', placeholder:'Share title — what people will see *', required:true},
              {key:'description', placeholder:'Description (optional)'},
              {key:'publicUrl', placeholder:'Destination URL (where link redirects) *', required:true},
              {key:'targetId', placeholder:'Content ID (track ID, product ID, etc.)'},
              {key:'imageUrl', placeholder:'Image URL for link preview (optional)'},
              {key:'campaign', placeholder:'Campaign tag (launch, organic, paid...)'},
            ].map(f=>(
              <input key={f.key} value={(form as any)[f.key]} onChange={e=>setForm(prev=>({...prev,[f.key]:e.target.value}))}
                placeholder={f.placeholder} style={{ width:'100%',background:'#09091c',border:`1px solid ${f.required?'#00ffcc33':'#222'}`,color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:12,marginBottom:8,boxSizing:'border-box' as const }}/>
            ))}

            {/* Region + Language */}
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14 }}>
              <select value={form.region} onChange={e=>setForm(f=>({...f,region:e.target.value}))}
                style={{ background:'#09091c',border:'1px solid #333',color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:12 }}>
                {REGIONS.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <select value={form.language} onChange={e=>setForm(f=>({...f,language:e.target.value}))}
                style={{ background:'#09091c',border:'1px solid #333',color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:12 }}>
                {LANGUAGES.map(l=><option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>

            <button onClick={createLink} disabled={creating}
              style={{ width:'100%',background:creating?'#09091c':'rgba(0,255,204,.15)',border:`2px solid ${creating?'#333':'#00ffcc'}`,color:creating?'#555':'#00ffcc',borderRadius:10,padding:14,cursor:creating?'default':'pointer',fontFamily:'monospace',fontWeight:900,fontSize:14,letterSpacing:2 }}>
              {creating?'CREATING...':'✨ CREATE GLOBAL SHARE LINK'}
            </button>

            {/* Result */}
            {lastCreated&&(
              <div style={{ marginTop:16,background:'rgba(0,204,68,.08)',border:'1px solid #00cc4444',borderRadius:12,padding:14 }}>
                <div style={{ color:'#00cc44',fontWeight:700,fontSize:13,marginBottom:10 }}>✅ Share Link Created!</div>
                <div style={{ background:'#09091c',borderRadius:8,padding:'8px 12px',marginBottom:10,display:'flex',alignItems:'center',gap:8 }}>
                  <span style={{ color:'#00ffcc',fontSize:12,flex:1,wordBreak:'break-all' }}>{lastCreated.shortUrl}</span>
                  <button onClick={()=>copyToClipboard(lastCreated.shortUrl,'Short URL copied!')} style={{ background:'rgba(0,255,204,.15)',border:'1px solid #00ffcc44',color:'#00ffcc',borderRadius:6,padding:'5px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10,flexShrink:0 }}>📋 COPY</button>
                </div>
                <div style={{ fontSize:11,color:'#555',marginBottom:8 }}>SHARE TO PLATFORM</div>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6 }}>
                  {Object.entries(lastCreated.platformLinks).slice(0,8).map(([platform, url])=>(
                    <button key={platform} onClick={()=>{ if(url.startsWith('http')) window.open(url,'_blank','width=600,height=400'); else copyToClipboard(url,'Link copied!') }}
                      style={{ background:'#09091c',border:'1px solid #1a1a3e',color:'#888',borderRadius:8,padding:'8px 5px',cursor:'pointer',fontFamily:'monospace',fontSize:9,textAlign:'center' }}>
                      <div style={{ fontSize:16,marginBottom:3 }}>{PLATFORM_ICONS[platform]||'🔗'}</div>
                      <div style={{ fontSize:8 }}>{platform}</div>
                    </button>
                  ))}
                </div>
                <button onClick={()=>{setQrUrl(lastCreated.shortUrl);setTab('qr');setTimeout(generateQR,100)}}
                  style={{ width:'100%',marginTop:10,background:'rgba(0,204,68,.1)',border:'1px solid #00cc4433',color:'#00cc44',borderRadius:8,padding:'8px',cursor:'pointer',fontFamily:'monospace',fontSize:11,fontWeight:700 }}>
                  📱 GENERATE QR CODE
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── MY LINKS ── */}
        {tab==='mylinks'&&(
          <div>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
              <span style={{ fontSize:12,color:'#555' }}>{links.length} share links</span>
              <button onClick={loadLinks} style={{ background:'rgba(0,204,255,.1)',border:'1px solid #00ccff44',color:'#00ccff',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>
                {linksLoading?'Loading...':'↻ REFRESH'}
              </button>
            </div>
            {links.length===0&&!linksLoading&&(
              <div style={{ textAlign:'center',padding:30,color:'#333' }}>
                No share links yet. Create one in the Create tab.
              </div>
            )}
            {links.map(link=>{
              const shortUrl = `https://tryamm.online/s/${link.short_code}`
              const tt = TARGET_TYPES.find(t=>t.value===link.target_type)
              return (
                <div key={link.id} style={{ background:'#09091c',border:'1px solid #1a1a3e',borderRadius:10,padding:12,marginBottom:10 }}>
                  <div style={{ display:'flex',gap:10,alignItems:'flex-start',marginBottom:8 }}>
                    <span style={{ fontSize:22,flexShrink:0 }}>{tt?.emoji||'🔗'}</span>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ color:'#fff',fontWeight:700,fontSize:13,marginBottom:2 }}>{link.title}</div>
                      <div style={{ color:'#555',fontSize:10 }}>{tt?.label} · {link.region} · {link.language} · {link.campaign}</div>
                    </div>
                  </div>
                  <div style={{ background:'#050510',borderRadius:6,padding:'6px 10px',marginBottom:8,display:'flex',alignItems:'center',gap:8 }}>
                    <span style={{ color:'#00ffcc',fontSize:10,flex:1,wordBreak:'break-all' }}>{shortUrl}</span>
                    <button onClick={()=>copyToClipboard(shortUrl,'Link copied!')} style={{ background:'none',border:'1px solid #00ffcc33',color:'#00ffcc',borderRadius:4,padding:'3px 8px',cursor:'pointer',fontFamily:'monospace',fontSize:9,flexShrink:0 }}>📋</button>
                  </div>
                  <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
                    <button onClick={()=>loadAnalytics(link.id)} style={{ background:'rgba(255,215,0,.1)',border:'1px solid #ffd70033',color:'#ffd700',borderRadius:6,padding:'5px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>📊 Analytics</button>
                    <button onClick={()=>loadTranslations(link.id)} style={{ background:'rgba(136,0,255,.1)',border:'1px solid #8800ff33',color:'#8800ff',borderRadius:6,padding:'5px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>🌐 Translate</button>
                    <button onClick={()=>{setQrUrl(shortUrl);setTab('qr');setTimeout(generateQR,100)}} style={{ background:'rgba(0,204,68,.1)',border:'1px solid #00cc4433',color:'#00cc44',borderRadius:6,padding:'5px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>📱 QR</button>
                    <button onClick={()=>{ if(navigator.share) navigator.share({url:shortUrl,title:link.title}); else copyToClipboard(shortUrl,'Link copied!') }} style={{ background:'rgba(0,204,255,.08)',border:'1px solid #00ccff33',color:'#00ccff',borderRadius:6,padding:'5px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>📤 Share</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab==='analytics'&&(
          <div>
            {analyticsLoading&&<div style={{ textAlign:'center',padding:30,color:'#00ffcc' }}>Loading analytics...</div>}
            {!analytics&&!analyticsLoading&&<div style={{ textAlign:'center',padding:30,color:'#333' }}>Select a link from "My Links" to view analytics.</div>}
            {analytics&&(
              <>
                <div style={{ background:'rgba(255,215,0,.08)',border:'1px solid #ffd70022',borderRadius:12,padding:14,marginBottom:14 }}>
                  <div style={{ color:'#ffd700',fontWeight:700,fontSize:13,marginBottom:4 }}>📊 {analytics.share?.title}</div>
                  <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8 }}>
                    <div style={{ background:'#09091c',borderRadius:8,padding:'10px',textAlign:'center' }}>
                      <div style={{ color:'#00ffcc',fontWeight:900,fontSize:22 }}>{analytics.totalClicks.toLocaleString()}</div>
                      <div style={{ color:'#555',fontSize:9,marginTop:2 }}>Total Clicks</div>
                    </div>
                    <div style={{ background:'#09091c',borderRadius:8,padding:'10px',textAlign:'center' }}>
                      <div style={{ color:'#ffd700',fontWeight:900,fontSize:22 }}>{Object.keys(analytics.byPlatform).length}</div>
                      <div style={{ color:'#555',fontSize:9,marginTop:2 }}>Platforms</div>
                    </div>
                    <div style={{ background:'#09091c',borderRadius:8,padding:'10px',textAlign:'center' }}>
                      <div style={{ color:'#ff66cc',fontWeight:900,fontSize:22 }}>{Object.keys(analytics.byCountry).length}</div>
                      <div style={{ color:'#555',fontSize:9,marginTop:2 }}>Countries</div>
                    </div>
                  </div>
                </div>

                {/* By platform */}
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>CLICKS BY PLATFORM</div>
                  {Object.entries(analytics.byPlatform).sort(([,a],[,b])=>b-a).map(([platform, count])=>{
                    const pct = Math.round((count/analytics.totalClicks)*100)
                    return (
                      <div key={platform} style={{ marginBottom:6 }}>
                        <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:2 }}>
                          <span>{PLATFORM_ICONS[platform]||'🔗'} {platform}</span>
                          <span style={{ color:'#00ffcc' }}>{count} ({pct}%)</span>
                        </div>
                        <div style={{ background:'#111',borderRadius:2,height:5 }}>
                          <div style={{ background:'#00ffcc',height:'100%',width:`${pct}%`,borderRadius:2,transition:'width .4s' }}/>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* By country */}
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>CLICKS BY COUNTRY</div>
                  <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6 }}>
                    {Object.entries(analytics.byCountry).sort(([,a],[,b])=>b-a).slice(0,9).map(([country, count])=>(
                      <div key={country} style={{ background:'#09091c',border:'1px solid #1a1a3e',borderRadius:6,padding:'7px',textAlign:'center' }}>
                        <div style={{ color:'#ccc',fontWeight:700,fontSize:11 }}>{country}</div>
                        <div style={{ color:'#555',fontSize:10 }}>{count} clicks</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent clicks */}
                <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>RECENT CLICKS</div>
                {analytics.recentClicks.slice(0,8).map((click,i)=>(
                  <div key={i} style={{ display:'flex',gap:10,padding:'6px 0',borderBottom:'1px solid #0a0a20',fontSize:11 }}>
                    <span>{PLATFORM_ICONS[click.platform]||'🔗'}</span>
                    <span style={{ color:'#888',flex:1 }}>{click.platform}</span>
                    <span style={{ color:'#555' }}>{click.country||'—'}</span>
                    <span style={{ color:'#333',fontSize:9 }}>{new Date(click.created_at).toLocaleTimeString()}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── TRANSLATE ── */}
        {tab==='translate'&&(
          <div>
            <div style={{ background:'rgba(136,0,255,.06)',border:'1px solid #8800ff22',borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:'#888',lineHeight:1.6 }}>
              Add translated versions of your share link titles for India, China, Japan, Africa and more. The backend serves the localized version based on the viewer's region.
            </div>

            {!transLinkId&&<div style={{ textAlign:'center',padding:20,color:'#333',fontSize:12 }}>Select a link from "My Links" → Translate to add translations.</div>}

            {transLinkId&&(
              <>
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>ADD TRANSLATION</div>
                  <select value={transForm.language} onChange={e=>setTransForm(f=>({...f,language:e.target.value}))}
                    style={{ width:'100%',background:'#09091c',border:'1px solid #8800ff33',color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:12,marginBottom:8 }}>
                    {LANGUAGES.map(l=><option key={l.code} value={l.code}>{l.label}</option>)}
                  </select>
                  <input value={transForm.title} onChange={e=>setTransForm(f=>({...f,title:e.target.value}))} placeholder="Translated title *"
                    style={{ width:'100%',background:'#09091c',border:'1px solid #8800ff33',color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:12,marginBottom:8,boxSizing:'border-box' as const }}/>
                  <input value={transForm.description} onChange={e=>setTransForm(f=>({...f,description:e.target.value}))} placeholder="Translated description (optional)"
                    style={{ width:'100%',background:'#09091c',border:'1px solid #333',color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:12,marginBottom:10,boxSizing:'border-box' as const }}/>
                  <button onClick={addTranslation} style={{ width:'100%',background:'rgba(136,0,255,.15)',border:'1px solid #8800ff',color:'#8800ff',borderRadius:8,padding:11,cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:12 }}>
                    🌐 ADD TRANSLATION
                  </button>
                </div>

                {translations.length>0&&(
                  <>
                    <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>SAVED TRANSLATIONS ({translations.length})</div>
                    {translations.map(t=>(
                      <div key={t.id} style={{ background:'#09091c',border:'1px solid #8800ff22',borderRadius:8,padding:10,marginBottom:6 }}>
                        <div style={{ display:'flex',gap:8,alignItems:'center',marginBottom:4 }}>
                          <span style={{ background:'rgba(136,0,255,.15)',color:'#8800ff',borderRadius:20,padding:'2px 8px',fontSize:10,fontWeight:700 }}>{LANGUAGES.find(l=>l.code===t.language)?.label||t.language}</span>
                        </div>
                        <div style={{ color:'#ccc',fontSize:12,fontWeight:700 }}>{t.title}</div>
                        {t.description&&<div style={{ color:'#555',fontSize:11,marginTop:3 }}>{t.description}</div>}
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* ── CAMPAIGN TEMPLATES ── */}
        {tab==='templates'&&(
          <div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11,color:'#555',marginBottom:10,letterSpacing:2 }}>AUTO-GENERATE CAPTION + HASHTAGS</div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8 }}>
                <select value={genForm.targetType} onChange={e=>setGenForm(f=>({...f,targetType:e.target.value as TargetType}))}
                  style={{ background:'#09091c',border:'1px solid #333',color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:12 }}>
                  {TARGET_TYPES.map(t=><option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                </select>
                <select value={genForm.region} onChange={e=>setGenForm(f=>({...f,region:e.target.value}))}
                  style={{ background:'#09091c',border:'1px solid #333',color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:12 }}>
                  {REGIONS.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <input value={genForm.title} onChange={e=>setGenForm(f=>({...f,title:e.target.value}))} placeholder="Content title *"
                style={{ width:'100%',background:'#09091c',border:'1px solid #ff660033',color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:12,marginBottom:8,boxSizing:'border-box' as const }}/>
              <button onClick={generateTemplate} style={{ width:'100%',background:'rgba(255,102,0,.15)',border:'1px solid #ff6600',color:'#ff6600',borderRadius:8,padding:11,cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:12 }}>
                🎯 GENERATE CAPTION + HASHTAGS
              </button>
            </div>

            {generatedTemplate&&(
              <div style={{ background:'rgba(255,102,0,.06)',border:'1px solid #ff660033',borderRadius:10,padding:14,marginBottom:14 }}>
                <div style={{ color:'#ff6600',fontWeight:700,fontSize:12,marginBottom:8 }}>Generated Template</div>
                <div style={{ background:'#09091c',borderRadius:8,padding:10,marginBottom:8 }}>
                  <div style={{ fontSize:10,color:'#555',marginBottom:4 }}>CAPTION</div>
                  <div style={{ color:'#ccc',fontSize:12,lineHeight:1.6 }}>{generatedTemplate.caption}</div>
                  <button onClick={()=>copyToClipboard(generatedTemplate.caption,'Caption copied!')} style={{ marginTop:6,background:'rgba(255,102,0,.1)',border:'1px solid #ff660033',color:'#ff6600',borderRadius:5,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>📋 COPY</button>
                </div>
                <div style={{ background:'#09091c',borderRadius:8,padding:10 }}>
                  <div style={{ fontSize:10,color:'#555',marginBottom:4 }}>HASHTAGS</div>
                  <div style={{ color:'#8800ff',fontSize:11,lineHeight:1.7 }}>{generatedTemplate.hashtags}</div>
                  <button onClick={()=>copyToClipboard(generatedTemplate.hashtags,'Hashtags copied!')} style={{ marginTop:6,background:'rgba(136,0,255,.1)',border:'1px solid #8800ff33',color:'#8800ff',borderRadius:5,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>📋 COPY</button>
                </div>
              </div>
            )}

            <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>SAVED TEMPLATES ({templates.length})</div>
            {templates.length===0&&<div style={{ color:'#333',fontSize:11,textAlign:'center',padding:20 }}>No saved templates. Generate one above and save it.</div>}
            {templates.map(t=>(
              <div key={t.id} style={{ background:'#09091c',border:'1px solid #1a1a3e',borderRadius:8,padding:10,marginBottom:8 }}>
                <div style={{ color:'#ff6600',fontWeight:700,fontSize:11,marginBottom:3 }}>{t.name}</div>
                <div style={{ color:'#555',fontSize:10,marginBottom:6 }}>{t.target_type} · {t.region} · {t.language}</div>
                <div style={{ color:'#888',fontSize:11,lineHeight:1.5,marginBottom:5 }}>{t.caption}</div>
                <div style={{ color:'#8800ff',fontSize:10 }}>{t.hashtags}</div>
                <button onClick={()=>copyToClipboard(`${t.caption}\n\n${t.hashtags}`,'Template copied!')} style={{ marginTop:6,background:'rgba(255,102,0,.1)',border:'1px solid #ff660033',color:'#ff6600',borderRadius:5,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>📋 COPY ALL</button>
              </div>
            ))}
          </div>
        )}

        {/* ── QR CODE ── */}
        {tab==='qr'&&(
          <div>
            <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>GENERATE QR CODE</div>
            <input value={qrUrl} onChange={e=>setQrUrl(e.target.value)} placeholder="URL to encode (e.g. https://tryamm.online/s/abc12345)"
              style={{ width:'100%',background:'#09091c',border:'1px solid #00cc4433',color:'#ccc',borderRadius:8,padding:'10px 12px',fontFamily:'monospace',fontSize:12,marginBottom:8,boxSizing:'border-box' as const }}/>
            <button onClick={generateQR} style={{ width:'100%',background:'rgba(0,204,68,.15)',border:'2px solid #00cc44',color:'#00cc44',borderRadius:10,padding:13,cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:14,marginBottom:16 }}>
              📱 GENERATE QR CODE
            </button>

            {qrCode&&(
              <div style={{ textAlign:'center' }}>
                <div style={{ background:'#ffffff',borderRadius:16,padding:20,display:'inline-block',marginBottom:14 }}>
                  <img src={qrCode} alt="QR Code" style={{ width:200,height:200,display:'block' }}/>
                  <div style={{ color:'#000',fontSize:10,marginTop:8,fontFamily:'monospace',wordBreak:'break-all',maxWidth:200 }}>{qrUrl.slice(0,40)}{qrUrl.length>40?'...':''}</div>
                </div>
                <div style={{ display:'flex',gap:8,justifyContent:'center' }}>
                  <button onClick={()=>{const a=document.createElement('a');a.href=qrCode;a.download='amm-share-qr.png';a.click()}}
                    style={{ background:'rgba(0,204,68,.15)',border:'1px solid #00cc44',color:'#00cc44',borderRadius:8,padding:'8px 16px',cursor:'pointer',fontFamily:'monospace',fontSize:11,fontWeight:700 }}>
                    ⬇ DOWNLOAD PNG
                  </button>
                  <button onClick={()=>copyToClipboard(qrUrl,'QR URL copied!')}
                    style={{ background:'rgba(0,204,255,.1)',border:'1px solid #00ccff44',color:'#00ccff',borderRadius:8,padding:'8px 16px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>
                    📋 COPY URL
                  </button>
                </div>
                <div style={{ color:'#444',fontSize:10,marginTop:12,lineHeight:1.6 }}>
                  Install: <code>npm install qrcode</code> in amm-omniverse<br/>
                  Then replace generateQRDataUrl() with QRCode.toDataURL() for production QR codes.
                </div>
              </div>
            )}

            {!qrCode&&(
              <div style={{ padding:20,color:'#333',fontSize:11,textAlign:'center',lineHeight:1.7 }}>
                Enter a URL above and tap Generate QR Code.<br/>
                QR codes work for: share links, music tracks, drama episodes, game invite links, live room links.<br/><br/>
                <strong style={{ color:'#555' }}>Print for events · Scan to play · Share on flyers</strong>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
