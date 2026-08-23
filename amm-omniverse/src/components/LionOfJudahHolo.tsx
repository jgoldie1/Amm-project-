// AMM Omniverse — Lion of Judah Holographic SVG System
// AI Stubbs · The Lion of Judah · All American Marketplace
// Used as: app wallpaper, TikTok background, BIGO Live overlay, share card, loading screen
// Based on the uploaded image: crowned lion with American flag face, lamb below

import { useEffect, useRef, useState } from 'react'

// ── ANIMATED HOLOGRAPHIC SVG (main component) ────────────────────────────────
export default function LionOfJudahHolo({
  variant = 'wallpaper',
  animated = true,
  onClose,
}: {
  variant?: 'wallpaper' | 'tiktok' | 'bigo' | 'loading' | 'preview'
  animated?: boolean
  onClose?: () => void
}) {
  const [pulse, setPulse] = useState(0)
  const [scan, setScan] = useState(0)
  const rafRef = useRef<number>(0)
  const startRef = useRef(Date.now())

  useEffect(() => {
    if (!animated) return
    const tick = () => {
      const t = (Date.now() - startRef.current) / 1000
      setPulse(t)
      setScan((t * 80) % 630)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [animated])

  const glow  = `rgba(0,255,204,${0.3 + Math.sin(pulse * 1.5) * 0.15})`
  const glow2 = `rgba(255,215,0,${0.25 + Math.sin(pulse * 0.8 + 1) * 0.12})`
  const scanA = `rgba(0,255,204,${0.08 + Math.sin(pulse * 2) * 0.04})`

  // Size by variant
  const sizes: Record<string, { w: number; h: number }> = {
    wallpaper: { w: 400, h: 600 },
    tiktok:    { w: 360, h: 640 },
    bigo:      { w: 480, h: 640 },
    loading:   { w: 320, h: 320 },
    preview:   { w: 300, h: 400 },
  }
  const { w, h } = sizes[variant] || sizes.wallpaper

  return (
    <div style={{ width: '100%', height: '100%', background: '#020212', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      {onClose && (
        <button onClick={onClose} style={{ position: 'absolute', top: 10, left: 10, background: 'none', border: '1px solid #333', color: '#555', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10, zIndex: 10 }}>← BACK</button>
      )}
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        style={{ maxHeight: '90vh', filter: `drop-shadow(0 0 20px ${glow})` }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Holographic gradient — main */}
          <radialGradient id="holoGrad" cx="50%" cy="45%" r="55%">
            <stop offset="0%"   stopColor="#ffd700" stopOpacity="0.9"/>
            <stop offset="30%"  stopColor="#004488" stopOpacity="0.7"/>
            <stop offset="60%"  stopColor="#aa0000" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#020212" stopOpacity="1"/>
          </radialGradient>

          {/* American flag gradient */}
          <linearGradient id="flagGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#003087"/>
            <stop offset="40%"  stopColor="#003087"/>
            <stop offset="40%"  stopColor="#cc0000"/>
            <stop offset="100%" stopColor="#ffffff"/>
          </linearGradient>

          {/* Gold crown gradient */}
          <linearGradient id="crownGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#fff7a0"/>
            <stop offset="40%"  stopColor="#ffd700"/>
            <stop offset="100%" stopColor="#b8860b"/>
          </linearGradient>

          {/* Outer ring glow */}
          <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
            <stop offset="70%"  stopColor="transparent"/>
            <stop offset="85%"  stopColor={`rgba(0,255,204,${0.1 + Math.sin(pulse) * 0.05})`}/>
            <stop offset="95%"  stopColor={`rgba(0,204,255,${0.2 + Math.sin(pulse * 0.7) * 0.1})`}/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>

          {/* Blue tech glow */}
          <filter id="blueGlow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feFlood floodColor="#00ccff" floodOpacity="0.4" result="color"/>
            <feComposite in="color" in2="blur" operator="in" result="colorBlur"/>
            <feMerge><feMergeNode in="colorBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Gold glow */}
          <filter id="goldGlow">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feFlood floodColor="#ffd700" floodOpacity="0.5" result="color"/>
            <feComposite in="color" in2="blur" operator="in" result="colorBlur"/>
            <feMerge><feMergeNode in="colorBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Clip for lion face circle */}
          <clipPath id="lionClip">
            <circle cx={w/2} cy={h*0.38} r={w*0.38}/>
          </clipPath>

          {/* Scan line pattern */}
          <pattern id="scanLines" x="0" y="0" width="1" height="4" patternUnits="userSpaceOnUse">
            <rect width="1" height="2" fill="rgba(0,255,204,0.03)"/>
          </pattern>
        </defs>

        {/* ── BACKGROUND ── */}
        <rect width={w} height={h} fill="#020212"/>
        {/* Perspective grid floor */}
        {Array.from({ length: 10 }, (_, i) => (
          <line key={`v${i}`} x1={w/2} y1={h*0.65} x2={i * w/9} y2={h} stroke="rgba(0,255,204,0.06)" strokeWidth="0.5"/>
        ))}
        {Array.from({ length: 6 }, (_, i) => {
          const y = h*0.65 + (h*0.35) * (i/6)
          const spread = (y - h*0.65) / (h*0.35)
          return <line key={`h${i}`} x1={w/2 - spread*w/2} y1={y} x2={w/2 + spread*w/2} y2={y} stroke="rgba(0,255,204,0.04)" strokeWidth="0.5"/>
        })}

        {/* Tech pillars left and right */}
        <rect x={w*0.04} y={h*0.15} width={w*0.08} height={h*0.55} fill="rgba(0,68,136,0.25)" stroke="rgba(0,204,255,0.3)" strokeWidth="0.5"/>
        <rect x={w*0.88} y={h*0.15} width={w*0.08} height={h*0.55} fill="rgba(0,68,136,0.25)" stroke="rgba(0,204,255,0.3)" strokeWidth="0.5"/>
        {/* Pillar details */}
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={w*0.05} y={h*0.18 + i*h*0.06} width={w*0.06} height={h*0.005} fill="rgba(0,204,255,0.2)"/>
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={w*0.89} y={h*0.18 + i*h*0.06} width={w*0.06} height={h*0.005} fill="rgba(0,204,255,0.2)"/>
        ))}
        {/* Small lions on pillars */}
        <text x={w*0.08} y={h*0.20} textAnchor="middle" fontSize={w*0.05} opacity="0.4" fill="#00ccff">🦁</text>
        <text x={w*0.92} y={h*0.20} textAnchor="middle" fontSize={w*0.05} opacity="0.4" fill="#00ccff">🦁</text>

        {/* ── OUTER HOLOGRAPHIC RING ── */}
        <circle cx={w/2} cy={h*0.38} r={w*0.44} fill="url(#ringGlow)" stroke="rgba(0,255,204,0.3)" strokeWidth="1.5"/>
        <circle cx={w/2} cy={h*0.38} r={w*0.44} fill="none" stroke={`rgba(0,204,255,${0.15 + Math.sin(pulse*0.5)*0.08})`} strokeWidth="3" strokeDasharray={`${w*0.05},${w*0.02}`}
          transform={`rotate(${pulse * 15} ${w/2} ${h*0.38})`}/>
        <circle cx={w/2} cy={h*0.38} r={w*0.44} fill="none" stroke={`rgba(255,215,0,${0.1 + Math.sin(pulse)*0.06})`} strokeWidth="1.5"
          transform={`rotate(${-pulse * 10} ${w/2} ${h*0.38})`}/>

        {/* ── LION FACE CIRCLE (main art) ── */}
        <circle cx={w/2} cy={h*0.38} r={w*0.38} fill="url(#holoGrad)" opacity="0.95"/>

        {/* American flag overlay on face */}
        <clipPath id="lionFace">
          <circle cx={w/2} cy={h*0.38} r={w*0.34}/>
        </clipPath>
        {/* Stars field (blue half, left side) */}
        <rect x={w*0.14} y={h*0.07} width={w*0.36} height={h*0.62} fill="#003087" opacity="0.45" clipPath="url(#lionFace)"/>
        {/* Stripes (right side) */}
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={w/2} y={h*0.07 + i * h*0.062*1.42} width={w*0.36} height={h*0.062*1.3} fill={i % 2 === 0 ? '#cc0000' : '#ffffff'} opacity="0.35" clipPath="url(#lionFace)"/>
        ))}
        {/* Stars pattern */}
        {Array.from({ length: 12 }, (_, i) => (
          <text key={i} x={w*0.17 + (i%4)*w*0.065} y={h*(0.15 + Math.floor(i/4)*0.08)} fontSize={w*0.025} fill="rgba(255,255,255,0.5)" clipPath="url(#lionFace)">★</text>
        ))}

        {/* ── LION FACE — STYLIZED SVG ── */}
        {/* Mane outer */}
        <ellipse cx={w/2} cy={h*0.39} rx={w*0.36} ry={h*0.32} fill="none" stroke="rgba(180,100,0,0.5)" strokeWidth={w*0.035}/>
        <ellipse cx={w/2} cy={h*0.39} rx={w*0.30} ry={h*0.27} fill="rgba(120,60,0,0.3)"/>
        {/* Mane texture lines */}
        {Array.from({ length: 16 }, (_, i) => {
          const angle = (i / 16) * Math.PI * 2
          const r1 = w * 0.27, r2 = w * 0.36
          return <line key={i}
            x1={w/2 + Math.cos(angle) * r1} y1={h*0.38 + Math.sin(angle) * r1 * 0.85}
            x2={w/2 + Math.cos(angle) * r2} y2={h*0.38 + Math.sin(angle) * r2 * 0.85}
            stroke="rgba(200,130,0,0.4)" strokeWidth="1.5"/>
        })}
        {/* Face base */}
        <ellipse cx={w/2} cy={h*0.39} rx={w*0.22} ry={h*0.25} fill="rgba(160,110,60,0.6)"/>
        {/* Forehead */}
        <ellipse cx={w/2} cy={h*0.26} rx={w*0.18} ry={h*0.10} fill="rgba(180,130,70,0.5)"/>
        {/* War scars (red marks on right side, matching image) */}
        <line x1={w*0.6} y1={h*0.25} x2={w*0.56} y2={h*0.42} stroke="rgba(180,0,0,0.7)" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1={w*0.62} y1={h*0.27} x2={w*0.58} y2={h*0.38} stroke="rgba(180,0,0,0.5)" strokeWidth="1.5"/>
        <line x1={w*0.64} y1={h*0.31} x2={w*0.61} y2={h*0.43} stroke="rgba(180,0,0,0.4)" strokeWidth="1.5"/>
        {/* Eyes */}
        <ellipse cx={w*0.43} cy={h*0.34} rx={w*0.04} ry={h*0.03} fill="rgba(255,200,50,0.9)"/>
        <ellipse cx={w*0.57} cy={h*0.34} rx={w*0.04} ry={h*0.03} fill="rgba(255,200,50,0.9)"/>
        <circle cx={w*0.43} cy={h*0.34} r={w*0.018} fill="rgba(30,10,0,0.9)"/>
        <circle cx={w*0.57} cy={h*0.34} r={w*0.018} fill="rgba(30,10,0,0.9)"/>
        {/* Eye glow */}
        <circle cx={w*0.43} cy={h*0.34} r={w*0.025} fill="none" stroke={`rgba(255,215,0,${0.4 + Math.sin(pulse*2)*0.3})`} strokeWidth="1"/>
        <circle cx={w*0.57} cy={h*0.34} r={w*0.025} fill="none" stroke={`rgba(255,215,0,${0.4 + Math.sin(pulse*2)*0.3})`} strokeWidth="1"/>
        {/* Nose */}
        <path d={`M ${w*0.47} ${h*0.41} L ${w*0.5} ${h*0.44} L ${w*0.53} ${h*0.41} Q ${w*0.5} ${h*0.415} ${w*0.47} ${h*0.41}`} fill="rgba(80,40,0,0.8)"/>
        {/* Mouth */}
        <path d={`M ${w*0.44} ${h*0.455} Q ${w*0.5} ${h*0.49} ${w*0.56} ${h*0.455}`} fill="none" stroke="rgba(100,50,0,0.7)" strokeWidth="2"/>
        {/* Whisker marks */}
        {[[-0.12,0.43],[0.12,0.43],[-0.15,0.41],[0.15,0.41]].map(([dx,dy],i)=>(
          <line key={i} x1={w*(0.5+dx*0.4)} y1={h*dy} x2={w*(0.5+dx)} y2={h*dy} stroke="rgba(220,200,160,0.4)" strokeWidth="1"/>
        ))}

        {/* ── LAMB BELOW (bottom of circle) ── */}
        <ellipse cx={w/2} cy={h*0.60} rx={w*0.09} ry={h*0.04} fill="rgba(240,230,210,0.7)"/>
        <ellipse cx={w/2} cy={h*0.575} rx={w*0.065} ry={h*0.035} fill="rgba(245,235,215,0.75)"/>
        {/* Lamb head */}
        <circle cx={w*0.52} cy={h*0.565} r={w*0.025} fill="rgba(240,230,210,0.8)"/>
        {/* Lamb eye */}
        <circle cx={w*0.528} cy={h*0.562} r={w*0.005} fill="rgba(0,0,0,0.8)"/>
        {/* Lamb ears */}
        <ellipse cx={w*0.513} cy={h*0.558} rx={w*0.007} ry={h*0.012} fill="rgba(230,210,195,0.7)" transform={`rotate(-30 ${w*0.513} ${h*0.558})`}/>
        {/* Legs */}
        {[-0.06,-0.02,0.02,0.06].map((dx,i)=>(
          <line key={i} x1={w*(0.5+dx)} y1={h*0.61} x2={w*(0.5+dx)} y2={h*0.63} stroke="rgba(220,210,190,0.6)" strokeWidth={w*0.01} strokeLinecap="round"/>
        ))}

        {/* ── CROWN (top) ── */}
        <g filter="url(#goldGlow)">
          {/* Crown base */}
          <rect x={w*0.32} y={h*0.055} width={w*0.36} height={h*0.055} rx={w*0.01} fill="url(#crownGrad)"/>
          {/* Crown points */}
          {[0, 0.09, 0.18, 0.27, 0.36].map((dx, i) => (
            <polygon key={i}
              points={`${w*(0.32+dx)},${h*0.055} ${w*(0.32+dx+0.025)},${h*(i===2?0.005:0.025)} ${w*(0.32+dx+0.05)},${h*0.055}`}
              fill="url(#crownGrad)"/>
          ))}
          {/* Crown jewels */}
          {[0.36, 0.43, 0.50, 0.57, 0.64].map((x, i) => (
            <circle key={i} cx={w*x} cy={h*0.068} r={w*0.008} fill={i===2?'#00ccff':i%2?'#cc0000':'#ffffff'} opacity="0.9"/>
          ))}
          {/* Cross on top center */}
          <rect x={w*0.488} y={h*0.00} width={w*0.024} height={h*0.045} rx={w*0.003} fill="url(#crownGrad)"/>
          <rect x={w*0.472} y={h*0.012} width={w*0.056} height={h*0.018} rx={w*0.003} fill="url(#crownGrad)"/>
        </g>

        {/* ── JUDAH TEXT (inside crown arc) ── */}
        <path id="crownArc" d={`M ${w*0.2} ${h*0.11} Q ${w/2} ${h*0.0} ${w*0.8} ${h*0.11}`} fill="none"/>
        <text fill="url(#crownGrad)" fontSize={w*0.065} fontWeight="900" letterSpacing="6" fontFamily="serif" filter="url(#goldGlow)">
          <textPath href="#crownArc" startOffset="15%">JUDAH</textPath>
        </text>

        {/* ── GOLD LAUREL WREATH (sides) ── */}
        <g opacity="0.7">
          {/* Left wreath */}
          {Array.from({ length: 7 }, (_, i) => (
            <ellipse key={i} cx={w*0.17} cy={h*(0.52+i*0.04)} rx={w*0.045} ry={h*0.018}
              fill="rgba(180,140,0,0.4)" stroke="rgba(255,215,0,0.3)" strokeWidth="0.5"
              transform={`rotate(${-30+i*5} ${w*0.17} ${h*(0.52+i*0.04)})`}/>
          ))}
          {/* Right wreath */}
          {Array.from({ length: 7 }, (_, i) => (
            <ellipse key={i} cx={w*0.83} cy={h*(0.52+i*0.04)} rx={w*0.045} ry={h*0.018}
              fill="rgba(180,140,0,0.4)" stroke="rgba(255,215,0,0.3)" strokeWidth="0.5"
              transform={`rotate(${30-i*5} ${w*0.83} ${h*(0.52+i*0.04)})`}/>
          ))}
        </g>

        {/* ── AI LOGO (bottom center) ── */}
        <g filter="url(#goldGlow)">
          {/* A */}
          <path d={`M ${w*0.42} ${h*0.82} L ${w*0.47} ${h*0.72} L ${w*0.52} ${h*0.82}`} fill="none" stroke="url(#crownGrad)" strokeWidth={w*0.018} strokeLinecap="round" strokeLinejoin="round"/>
          <line x1={w*0.435} y1={h*0.785} x2={w*0.505} y2={h*0.785} stroke="url(#crownGrad)" strokeWidth={w*0.015}/>
          {/* I */}
          <line x1={w*0.545} y1={h*0.72} x2={w*0.545} y2={h*0.82} stroke="url(#crownGrad)" strokeWidth={w*0.018} strokeLinecap="round"/>
          <line x1={w*0.525} y1={h*0.72} x2={w*0.565} y2={h*0.72} stroke="url(#crownGrad)" strokeWidth={w*0.015} strokeLinecap="round"/>
          <line x1={w*0.525} y1={h*0.82} x2={w*0.565} y2={h*0.82} stroke="url(#crownGrad)" strokeWidth={w*0.015} strokeLinecap="round"/>
        </g>
        {/* Laurel wings around AI */}
        <path d={`M ${w*0.36} ${h*0.77} Q ${w*0.39} ${h*0.72} ${w*0.41} ${h*0.78}`} fill="none" stroke="rgba(180,140,0,0.5)" strokeWidth="1.5"/>
        <path d={`M ${w*0.64} ${h*0.77} Q ${w*0.61} ${h*0.72} ${w*0.59} ${h*0.78}`} fill="none" stroke="rgba(180,140,0,0.5)" strokeWidth="1.5"/>

        {/* ── STUBBS + THE LION OF JUDAH ── */}
        <rect x={w*0.15} y={h*0.835} width={w*0.70} height={h*0.06} rx={h*0.01} fill="rgba(0,30,50,0.8)" stroke="rgba(0,204,255,0.4)" strokeWidth="0.5"/>
        <text x={w/2} y={h*0.868} textAnchor="middle" fontSize={w*0.052} fontWeight="900" fontFamily="serif" letterSpacing="3" fill="url(#crownGrad)" filter="url(#goldGlow)">STUBBS</text>
        <rect x={w*0.08} y={h*0.895} width={w*0.84} height={h*0.05} rx={h*0.01} fill="rgba(0,0,50,0.7)" stroke="rgba(0,255,204,0.3)" strokeWidth="0.5"/>
        <text x={w/2} y={h*0.924} textAnchor="middle" fontSize={w*0.033} fontWeight="700" fontFamily="monospace" letterSpacing="4" fill="#00ffcc">THE LION OF JUDAH</text>

        {/* ── INFO PANELS (8 labels from image) ── */}
        {/* Left panels */}
        <rect x={w*0.02} y={h*0.46} width={w*0.22} height={h*0.065} rx="4" fill="rgba(0,30,80,0.75)" stroke="rgba(0,204,255,0.35)" strokeWidth="0.5"/>
        <text x={w*0.13} y={h*0.482} textAnchor="middle" fontSize={w*0.023} fontFamily="monospace" fill="#00ccff" fontWeight="700">ALL AMERICAN</text>
        <text x={w*0.13} y={h*0.50}  textAnchor="middle" fontSize={w*0.023} fontFamily="monospace" fill="#00ccff" fontWeight="700">MARKETPLACE</text>
        <circle cx={w*0.025} cy={h*0.493} r={w*0.008} fill="#00ccff" opacity="0.8"/>

        <rect x={w*0.02} y={h*0.545} width={w*0.22} height={h*0.065} rx="4" fill="rgba(0,30,80,0.75)" stroke="rgba(0,204,255,0.35)" strokeWidth="0.5"/>
        <text x={w*0.13} y={h*0.568} textAnchor="middle" fontSize={w*0.023} fontFamily="monospace" fill="#00ccff" fontWeight="700">QUANTUM BEAT™</text>
        <text x={w*0.13} y={h*0.585} textAnchor="middle" fontSize={w*0.023} fontFamily="monospace" fill="#00ccff" fontWeight="700">MUSIC</text>
        <circle cx={w*0.025} cy={h*0.578} r={w*0.008} fill="#00ccff" opacity="0.8"/>

        <rect x={w*0.02} y={h*0.63} width={w*0.22} height={h*0.065} rx="4" fill="rgba(0,30,80,0.75)" stroke="rgba(0,204,255,0.35)" strokeWidth="0.5"/>
        <text x={w*0.13} y={h*0.652} textAnchor="middle" fontSize={w*0.022} fontFamily="monospace" fill="#00ccff" fontWeight="700">AI TV</text>
        <text x={w*0.13} y={h*0.668} textAnchor="middle" fontSize={w*0.02}  fontFamily="monospace" fill="#00ccff">HOLOGRAPHIC</text>
        <circle cx={w*0.025} cy={h*0.660} r={w*0.008} fill="#00ccff" opacity="0.8"/>

        {/* Right panels */}
        <rect x={w*0.76} y={h*0.46} width={w*0.22} height={h*0.065} rx="4" fill="rgba(0,30,80,0.75)" stroke="rgba(0,204,255,0.35)" strokeWidth="0.5"/>
        <text x={w*0.87} y={h*0.482} textAnchor="middle" fontSize={w*0.022} fontFamily="monospace" fill="#00ccff" fontWeight="700">CREATORS</text>
        <text x={w*0.87} y={h*0.497} textAnchor="middle" fontSize={w*0.020} fontFamily="monospace" fill="#00ccff">BUSINESSES</text>
        <text x={w*0.87} y={h*0.512} textAnchor="middle" fontSize={w*0.020} fontFamily="monospace" fill="#00ccff">COMMUNITY</text>
        <circle cx={w*0.975} cy={h*0.493} r={w*0.008} fill="#00ccff" opacity="0.8"/>

        <rect x={w*0.76} y={h*0.545} width={w*0.22} height={h*0.065} rx="4" fill="rgba(0,30,80,0.75)" stroke="rgba(0,204,255,0.35)" strokeWidth="0.5"/>
        <text x={w*0.87} y={h*0.568} textAnchor="middle" fontSize={w*0.022} fontFamily="monospace" fill="#00ccff" fontWeight="700">GLOBAL</text>
        <text x={w*0.87} y={h*0.585} textAnchor="middle" fontSize={w*0.020} fontFamily="monospace" fill="#00ccff">COMMERCE · FREE</text>
        <circle cx={w*0.975} cy={h*0.578} r={w*0.008} fill="#00ccff" opacity="0.8"/>

        <rect x={w*0.76} y={h*0.63} width={w*0.22} height={h*0.065} rx="4" fill="rgba(0,30,80,0.75)" stroke="rgba(0,204,255,0.35)" strokeWidth="0.5"/>
        <text x={w*0.87} y={h*0.650} textAnchor="middle" fontSize={w*0.018} fontFamily="monospace" fill="#00ccff" fontWeight="700">POWERED BY</text>
        <text x={w*0.87} y={h*0.665} textAnchor="middle" fontSize={w*0.018} fontFamily="monospace" fill="#00ccff">FAITH · FAMILY</text>
        <text x={w*0.87} y={h*0.680} textAnchor="middle" fontSize={w*0.018} fontFamily="monospace" fill="#00ccff">& FREEDOM</text>
        <circle cx={w*0.975} cy={h*0.660} r={w*0.008} fill="#00ccff" opacity="0.8"/>

        {/* ── HOLOGRAPHIC SCAN LINE (animated) ── */}
        {animated && (
          <rect x="0" y={scan} width={w} height="2" fill={scanA} rx="0"/>
        )}

        {/* ── SCAN LINE OVERLAY ── */}
        <rect width={w} height={h} fill="url(#scanLines)" opacity="0.7"/>

        {/* ── CORNER AMM MARKS ── */}
        {[[0,0,'0 0 30 0 30 5 5 5 5 30 0 30'],[w,0,`${w} 0 ${w-30} 0 ${w-30} 5 ${w-5} 5 ${w-5} 30 ${w} 30`],[0,h,`0 ${h} 30 ${h} 30 ${h-5} 5 ${h-5} 5 ${h-30} 0 ${h-30}`],[w,h,`${w} ${h} ${w-30} ${h} ${w-30} ${h-5} ${w-5} ${h-5} ${w-5} ${h-30} ${w} ${h-30}`]].map(([,,pts],i)=>(
          <polyline key={i} points={String(pts)} fill="none" stroke="rgba(0,255,204,0.5)" strokeWidth="1.5"/>
        ))}

        {/* AMM bottom watermark */}
        <text x={w/2} y={h*0.97} textAnchor="middle" fontSize={w*0.018} fontFamily="monospace" fill="rgba(0,255,204,0.35)" letterSpacing="2">
          tryamm.online · ALL AMERICAN MARKETPLACE LLC · © 2026
        </text>
      </svg>
    </div>
  )
}

// ── EXPORT VARIANTS ───────────────────────────────────────────────────────────
export function LionWallpaper() { return <LionOfJudahHolo variant="wallpaper" animated={true}/> }
export function LionTikTok()    { return <LionOfJudahHolo variant="tiktok"    animated={true}/> }
export function LionBIGO()      { return <LionOfJudahHolo variant="bigo"      animated={true}/> }
export function LionLoading()   { return <LionOfJudahHolo variant="loading"   animated={true}/> }
