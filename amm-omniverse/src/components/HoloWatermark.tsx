// AMM Omniverse — Holographic Watermark System
// Animates on every screen, shares, screenshots, exported content
// All American Marketplace LLC © 2026

import { useEffect, useRef, useState } from 'react'

interface HoloWatermarkProps {
  variant?: 'corner' | 'center' | 'diagonal' | 'share_card'
  opacity?: number
  animated?: boolean
  text?: string
  showOnScreenshot?: boolean
}

// ── DIAGONAL WATERMARK (for screenshots and share exports) ───────────────────
export function HoloWatermarkDiagonal({ opacity = 0.07, text = 'AMM OMNIVERSE · tryamm.online · © 2026' }: HoloWatermarkProps) {
  return (
    <div style={{ position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:50 }}>
      <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%' }} viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="wm-diag" x="0" y="0" width="200" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
            <text x="10" y="20" fontFamily="monospace" fontSize="11" fontWeight="700" letterSpacing="3" fill={`rgba(0,255,204,${opacity})`}>{text}</text>
            <text x="10" y="48" fontFamily="monospace" fontSize="9" fill={`rgba(0,255,204,${opacity * 0.6})`}>ALL AMERICAN MARKETPLACE LLC · CARY IL</text>
          </pattern>
        </defs>
        <rect width="400" height="600" fill="url(#wm-diag)"/>
      </svg>
    </div>
  )
}

// ── CORNER WATERMARK (always visible, subtle) ─────────────────────────────────
export function HoloWatermarkCorner({ animated = true }: HoloWatermarkProps) {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (!animated) return
    const t = setInterval(() => setPulse(p => !p), 2000)
    return () => clearInterval(t)
  }, [animated])

  return (
    <div style={{ position:'absolute',bottom:4,right:8,pointerEvents:'none',zIndex:60,display:'flex',flexDirection:'column',alignItems:'flex-end',gap:1 }}>
      {/* Holographic shimmer line */}
      <div style={{ height:1,width:60,background:`linear-gradient(90deg,transparent,rgba(0,255,204,${pulse?0.6:0.3}),transparent)`,transition:'all 2s ease' }}/>
      {/* Logo mark */}
      <div style={{ display:'flex',alignItems:'center',gap:3 }}>
        <div style={{ width:6,height:6,borderRadius:'50%',background:`rgba(0,255,204,${pulse?0.8:0.4})`,transition:'all 2s ease',boxShadow:`0 0 ${pulse?6:3}px rgba(0,255,204,0.5)` }}/>
        <span style={{ color:`rgba(0,255,204,${pulse?0.7:0.35})`,fontSize:8,fontFamily:'monospace',fontWeight:700,letterSpacing:2,transition:'all 2s ease' }}>AMM</span>
      </div>
    </div>
  )
}

// ── ANIMATED HOLOGRAPHIC WATERMARK (full screen, for video/live) ──────────────
export function HoloWatermarkAnimated() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let frame = 0

    const draw = () => {
      canvas.width  = canvas.offsetWidth  || 400
      canvas.height = canvas.offsetHeight || 600
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)

      // Scan line effect
      frame++
      const scanY = (frame * 2) % H
      ctx.fillStyle = 'rgba(0,255,204,0.015)'
      ctx.fillRect(0, scanY, W, 2)

      // Corner marks
      const corners = [[0,0], [W-60,0], [0,H-20], [W-60,H-20]]
      corners.forEach(([x, y]) => {
        ctx.fillStyle = `rgba(0,255,204,${0.04 + Math.sin(frame * 0.02) * 0.02})`
        ctx.font = '7px monospace'
        ctx.fillText('◈ AMM OMNIVERSE', x + 4, y + 12)
      })

      // Floating AMM text particles
      const particles = [
        { x: 0.15, y: 0.25, phase: 0 },
        { x: 0.75, y: 0.45, phase: 1.5 },
        { x: 0.35, y: 0.70, phase: 3 },
        { x: 0.85, y: 0.20, phase: 4.5 },
      ]
      particles.forEach(p => {
        const alpha = 0.03 + Math.sin(frame * 0.015 + p.phase) * 0.02
        const y = H * p.y + Math.sin(frame * 0.008 + p.phase) * 8
        ctx.fillStyle = `rgba(0,255,204,${alpha})`
        ctx.font = '9px monospace'
        ctx.fillText('ALL AMERICAN MARKETPLACE', W * p.x, y)
      })

      // Bottom brand bar
      const barAlpha = 0.04 + Math.sin(frame * 0.03) * 0.02
      ctx.fillStyle = `rgba(0,255,204,${barAlpha})`
      ctx.font = 'bold 8px monospace'
      ctx.letterSpacing = '3px'
      ctx.fillText('AMM OMNIVERSE · FAITH · FAMILY · LEGACY · tryamm.online · © 2026', 8, H - 6)

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return (
    <canvas ref={canvasRef} style={{ position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:55 }}/>
  )
}

// ── SHARE CARD WATERMARK (for exported share images) ─────────────────────────
export function HoloShareCard({ title, subtitle, emoji, color = '#00ffcc', onClose }: {
  title: string; subtitle: string; emoji: string; color?: string; onClose: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dataUrl, setDataUrl] = useState<string|null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = 1200; canvas.height = 630
    const ctx = canvas.getContext('2d')!
    const W = 1200, H = 630

    // Background
    ctx.fillStyle = '#020212'
    ctx.fillRect(0, 0, W, H)

    // Grid overlay
    ctx.strokeStyle = 'rgba(0,255,204,0.06)'
    ctx.lineWidth = 0.5
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 20, H); ctx.stroke() }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

    // Radial glow
    const grd = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 400)
    grd.addColorStop(0, `${color}15`)
    grd.addColorStop(1, 'transparent')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, W, H)

    // Border
    ctx.strokeStyle = `${color}44`
    ctx.lineWidth = 2
    ctx.strokeRect(20, 20, W-40, H-40)

    // Inner border glow
    ctx.strokeStyle = `${color}22`
    ctx.lineWidth = 1
    ctx.strokeRect(26, 26, W-52, H-52)

    // Corner triangles
    const corners = [[20,20],[W-20,20],[20,H-20],[W-20,H-20]]
    corners.forEach(([cx,cy]) => {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + (cx < W/2 ? 40 : -40), cy)
      ctx.lineTo(cx, cy + (cy < H/2 ? 40 : -40))
      ctx.closePath()
      ctx.fill()
    })

    // Emoji
    ctx.font = '120px serif'
    ctx.textAlign = 'center'
    ctx.fillText(emoji, W/2, H/2 - 60)

    // Title
    ctx.fillStyle = color
    ctx.font = 'bold 56px monospace'
    ctx.letterSpacing = '4px'
    ctx.fillText(title, W/2, H/2 + 60)

    // Subtitle
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '28px monospace'
    ctx.fillText(subtitle, W/2, H/2 + 110)

    // Holographic diagonal watermark
    ctx.save()
    ctx.translate(W/2, H/2)
    ctx.rotate(-35 * Math.PI / 180)
    ctx.fillStyle = 'rgba(0,255,204,0.04)'
    ctx.font = '14px monospace'
    for (let i = -10; i < 10; i++) {
      ctx.fillText('AMM OMNIVERSE · ALL AMERICAN MARKETPLACE LLC · tryamm.online', i * 300 - 600, i * 60)
    }
    ctx.restore()

    // Top brand
    ctx.fillStyle = 'rgba(0,255,204,0.5)'
    ctx.font = 'bold 18px monospace'
    ctx.textAlign = 'left'
    ctx.fillText('🌐 AMM OMNIVERSE', 40, 56)
    ctx.fillStyle = 'rgba(0,255,204,0.3)'
    ctx.font = '14px monospace'
    ctx.fillText('ALL AMERICAN MARKETPLACE LLC · FAITH · FAMILY · LEGACY', 40, 76)

    // Bottom bar
    ctx.fillStyle = `${color}22`
    ctx.fillRect(0, H-60, W, 60)
    ctx.fillStyle = 'rgba(0,255,204,0.6)'
    ctx.font = 'bold 16px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('tryamm.online  ·  © 2026 All American Marketplace LLC  ·  Cary, IL', W/2, H-28)
    ctx.fillStyle = 'rgba(0,255,204,0.3)'
    ctx.font = '12px monospace'
    ctx.fillText('FAITH · FAMILY · TALENT · LEGACY  ·  BUILT ON EL SATURN CHAIN', W/2, H-10)

    // AMM logo mark bottom right
    ctx.fillStyle = color
    ctx.font = 'bold 24px monospace'
    ctx.textAlign = 'right'
    ctx.fillText('◈ AMM', W-40, H-30)

    setDataUrl(canvas.toDataURL('image/png'))
  }, [title, subtitle, emoji, color])

  const download = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `amm-share-${title.replace(/\s+/g,'-').toLowerCase()}.png`
    a.click()
  }

  return (
    <div style={{ background:'#020212',padding:16,borderRadius:12,border:'1px solid #00ffcc22' }}>
      <canvas ref={canvasRef} style={{ width:'100%',borderRadius:8,display:'block',marginBottom:10 }}/>
      <div style={{ display:'flex',gap:8 }}>
        <button onClick={download} style={{ flex:1,background:'rgba(0,255,204,.15)',border:'1px solid #00ffcc',color:'#00ffcc',borderRadius:8,padding:'10px',cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:12 }}>
          ⬇ DOWNLOAD SHARE IMAGE
        </button>
        <button onClick={onClose} style={{ background:'#09091c',border:'1px solid #333',color:'#555',borderRadius:8,padding:'10px 14px',cursor:'pointer',fontFamily:'monospace',fontSize:12 }}>
          ✕
        </button>
      </div>
      <div style={{ marginTop:8,fontSize:10,color:'#333',textAlign:'center' }}>
        1200×630px · Perfect for Facebook, Twitter, LinkedIn, WhatsApp preview images
      </div>
    </div>
  )
}

// ── WATERMARK MANAGER (for in-app use) ───────────────────────────────────────
export function HoloWatermarkManager({ onClose }: { onClose: () => void }) {
  const [showPreview, setShowPreview] = useState(false)
  const [shareTitle, setShareTitle] = useState('AMM Omniverse')
  const [shareSubtitle, setShareSubtitle] = useState('Faith Creator Metaverse')
  const [shareEmoji, setShareEmoji] = useState('🌐')
  const [shareColor, setShareColor] = useState('#00ffcc')
  const [activeMode, setActiveMode] = useState<'corner'|'diagonal'|'animated'|'card'>('corner')

  const PRESETS = [
    { label:'City View',    emoji:'🏙️', color:'#00ffcc', title:'AMM City',     subtitle:'3D Open World Metaverse' },
    { label:'Card Battle',  emoji:'🃏', color:'#ffd700', title:'Duel Realms',   subtitle:'100 Original Cards' },
    { label:'Drama Box',    emoji:'🎬', color:'#ff66cc', title:'Drama Box',     subtitle:'Faith Short Drama Series' },
    { label:'Music',        emoji:'🎵', color:'#00ccff', title:'Set Apart Music',subtitle:'Earn $0.018/stream' },
    { label:'Holoverse',    emoji:'🌐', color:'#8800ff', title:'Holoverse',     subtitle:'HoloGPT · Delivery · RideShare' },
    { label:'Live Stream',  emoji:'📡', color:'#ff4400', title:'AMM Live',      subtitle:'Going Live Now' },
  ]

  return (
    <div style={{ width:'100%',height:'100%',background:'#020212',fontFamily:'monospace',color:'#ccc',display:'flex',flexDirection:'column' }}>
      <div style={{ padding:'10px 14px',borderBottom:'1px solid #1a1a3e',background:'#09091d',display:'flex',alignItems:'center',gap:10 }}>
        <button onClick={onClose} style={{ background:'none',border:'1px solid #333',color:'#555',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>← BACK</button>
        <span style={{ color:'#00ffcc',fontWeight:900,fontSize:13 }}>◈ HOLOGRAPHIC WATERMARK</span>
      </div>

      <div style={{ flex:1,overflowY:'auto',padding:14 }}>
        {/* Mode selector */}
        <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>WATERMARK MODE</div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginBottom:16 }}>
          {[
            { id:'corner'   as const, label:'Corner',   desc:'Always-on subtle', emoji:'◈' },
            { id:'diagonal' as const, label:'Diagonal', desc:'Screenshot proof',  emoji:'⟋' },
            { id:'animated' as const, label:'Animated', desc:'Live / video',      emoji:'✦' },
            { id:'card'     as const, label:'Card',     desc:'Share image',       emoji:'🖼' },
          ].map(m=>(
            <button key={m.id} onClick={()=>setActiveMode(m.id)}
              style={{ background:activeMode===m.id?'rgba(0,255,204,.12)':'#09091c',border:`1px solid ${activeMode===m.id?'#00ffcc':'#222'}`,color:activeMode===m.id?'#00ffcc':'#666',borderRadius:8,padding:'10px 6px',cursor:'pointer',fontFamily:'monospace',textAlign:'center' }}>
              <div style={{ fontSize:18,marginBottom:4 }}>{m.emoji}</div>
              <div style={{ fontSize:10,fontWeight:700 }}>{m.label}</div>
              <div style={{ fontSize:8,color:'#444',marginTop:2 }}>{m.desc}</div>
            </button>
          ))}
        </div>

        {/* Corner watermark preview */}
        {activeMode==='corner'&&(
          <div>
            <div style={{ background:'#09091c',border:'1px solid #1a1a3e',borderRadius:12,padding:16,marginBottom:14,position:'relative',minHeight:120 }}>
              <div style={{ color:'#888',fontSize:11 }}>Screen content appears here...</div>
              <HoloWatermarkCorner animated={true}/>
            </div>
            <div style={{ color:'#888',fontSize:11,lineHeight:1.7 }}>
              ✓ Appears on every screen in the app<br/>
              ✓ Pulses gently every 2 seconds<br/>
              ✓ Extremely subtle — doesn't block content<br/>
              ✓ Always present on mobile and desktop
            </div>
          </div>
        )}

        {/* Diagonal watermark preview */}
        {activeMode==='diagonal'&&(
          <div>
            <div style={{ background:'#09091c',border:'1px solid #1a1a3e',borderRadius:12,padding:16,marginBottom:14,position:'relative',minHeight:160,overflow:'hidden' }}>
              <div style={{ color:'#888',fontSize:11,lineHeight:2 }}>
                Screenshot content here...<br/>
                Creator data here...<br/>
                Game results here...
              </div>
              <HoloWatermarkDiagonal opacity={0.15} text="AMM OMNIVERSE · tryamm.online · © 2026"/>
            </div>
            <div style={{ color:'#888',fontSize:11,lineHeight:1.7 }}>
              ✓ Protects screenshots shared without credit<br/>
              ✓ Diagonal pattern across entire screen<br/>
              ✓ Text repeats: "AMM OMNIVERSE · tryamm.online · © 2026"<br/>
              ✓ Subtle enough to read content through it
            </div>
          </div>
        )}

        {/* Animated watermark */}
        {activeMode==='animated'&&(
          <div>
            <div style={{ background:'#020212',border:'1px solid #00ffcc22',borderRadius:12,overflow:'hidden',marginBottom:14,position:'relative',height:200 }}>
              <div style={{ padding:14,color:'#888',fontSize:11 }}>Live stream or video content...</div>
              <HoloWatermarkAnimated/>
            </div>
            <div style={{ color:'#888',fontSize:11,lineHeight:1.7 }}>
              ✓ Animated scan line moves across screen<br/>
              ✓ Floating "ALL AMERICAN MARKETPLACE" text particles<br/>
              ✓ Corner marks on all 4 corners<br/>
              ✓ Bottom brand bar with copyright<br/>
              ✓ Designed for live streams and video recordings
            </div>
          </div>
        )}

        {/* Share card */}
        {activeMode==='card'&&(
          <div>
            <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>QUICK PRESETS</div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:14 }}>
              {PRESETS.map(p=>(
                <button key={p.label} onClick={()=>{setShareTitle(p.title);setShareSubtitle(p.subtitle);setShareEmoji(p.emoji);setShareColor(p.color)}}
                  style={{ background:`${p.color}08`,border:`1px solid ${p.color}33`,color:p.color,borderRadius:8,padding:'8px 5px',cursor:'pointer',fontFamily:'monospace',fontSize:9,fontWeight:700,textAlign:'center' }}>
                  <div style={{ fontSize:18,marginBottom:4 }}>{p.emoji}</div>
                  {p.label}
                </button>
              ))}
            </div>

            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8 }}>
              <input value={shareEmoji} onChange={e=>setShareEmoji(e.target.value)} placeholder="Emoji"
                style={{ background:'#09091c',border:'1px solid #333',color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:16,textAlign:'center' }}/>
              <input value={shareColor} onChange={e=>setShareColor(e.target.value)} placeholder="#00ffcc"
                style={{ background:'#09091c',border:`1px solid ${shareColor}`,color:shareColor,borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:12 }}/>
            </div>
            <input value={shareTitle} onChange={e=>setShareTitle(e.target.value)} placeholder="Card title"
              style={{ width:'100%',background:'#09091c',border:'1px solid #333',color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:12,marginBottom:8,boxSizing:'border-box' as const }}/>
            <input value={shareSubtitle} onChange={e=>setShareSubtitle(e.target.value)} placeholder="Card subtitle"
              style={{ width:'100%',background:'#09091c',border:'1px solid #333',color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:12,marginBottom:12,boxSizing:'border-box' as const }}/>

            {!showPreview ? (
              <button onClick={()=>setShowPreview(true)} style={{ width:'100%',background:'rgba(0,255,204,.15)',border:'2px solid #00ffcc',color:'#00ffcc',borderRadius:10,padding:13,cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:14 }}>
                ◈ GENERATE SHARE CARD
              </button>
            ) : (
              <HoloShareCard title={shareTitle} subtitle={shareSubtitle} emoji={shareEmoji} color={shareColor} onClose={()=>setShowPreview(false)}/>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
