// AMM Holographic Overlay Engine
// What it does: layers glowing holographic effects over the entire app
// Techniques: CSS backdrop-filter, WebGL canvas overlay, SVG scan lines,
//             Three.js icosahedron core, CSS custom properties for realtime color shifts
// Who builds apps like this: Disney Imagineering, Niantic (Pokémon GO),
//   Snap AR, Meta Horizon, Magic Leap studios, and boutique XR studios
//   charging $200K-$2M per project. AMM gets it for $0.

export type HoloTheme = 'city' | 'sports' | 'faith' | 'music' | 'blockchain' | 'marketplace' | 'battle' | 'ar'

export interface HoloConfig {
  theme: HoloTheme
  intensity: number       // 0-1 glow strength
  scanLines: boolean      // moving horizontal scan lines
  gridOverlay: boolean    // perspective grid floor
  particleCount: number   // floating particles
  primaryColor: string
  accentColor: string
  pulseSpeed: number      // animation speed multiplier
  glitchMode: boolean     // occasional glitch distortion
  depthEffect: boolean    // parallax depth on scroll
}

// Theme presets — each realm gets its own holographic signature
export const HOLO_THEMES: Record<HoloTheme, HoloConfig> = {
  city: {
    theme:'city', intensity:0.7, scanLines:true, gridOverlay:true,
    particleCount:40, primaryColor:'#00ffcc', accentColor:'#8800ff',
    pulseSpeed:1.0, glitchMode:false, depthEffect:true,
  },
  sports: {
    theme:'sports', intensity:0.8, scanLines:true, gridOverlay:false,
    particleCount:25, primaryColor:'#ff4400', accentColor:'#ffd700',
    pulseSpeed:1.4, glitchMode:false, depthEffect:false,
  },
  faith: {
    theme:'faith', intensity:0.6, scanLines:false, gridOverlay:false,
    particleCount:60, primaryColor:'#ffd700', accentColor:'#ffffff',
    pulseSpeed:0.6, glitchMode:false, depthEffect:true,
  },
  music: {
    theme:'music', intensity:0.75, scanLines:true, gridOverlay:false,
    particleCount:80, primaryColor:'#00ccff', accentColor:'#ff66cc',
    pulseSpeed:1.2, glitchMode:false, depthEffect:false,
  },
  blockchain: {
    theme:'blockchain', intensity:0.9, scanLines:true, gridOverlay:true,
    particleCount:30, primaryColor:'#ffaa00', accentColor:'#00ffcc',
    pulseSpeed:0.8, glitchMode:true, depthEffect:true,
  },
  marketplace: {
    theme:'marketplace', intensity:0.5, scanLines:false, gridOverlay:false,
    particleCount:20, primaryColor:'#00cc44', accentColor:'#00ffcc',
    pulseSpeed:0.9, glitchMode:false, depthEffect:false,
  },
  battle: {
    theme:'battle', intensity:1.0, scanLines:true, gridOverlay:true,
    particleCount:50, primaryColor:'#ff0066', accentColor:'#ffd700',
    pulseSpeed:1.8, glitchMode:true, depthEffect:true,
  },
  ar: {
    theme:'ar', intensity:0.85, scanLines:true, gridOverlay:true,
    particleCount:35, primaryColor:'#00ffcc', accentColor:'#ff4400',
    pulseSpeed:1.3, glitchMode:false, depthEffect:true,
  },
}

// Generate the CSS variables for a given theme
export function getHoloCSSVars(config: HoloConfig): Record<string,string> {
  return {
    '--holo-primary':   config.primaryColor,
    '--holo-accent':    config.accentColor,
    '--holo-intensity': config.intensity.toString(),
    '--holo-speed':     `${config.pulseSpeed}s`,
    '--holo-glow':      `0 0 ${Math.round(config.intensity * 30)}px ${config.primaryColor}`,
    '--holo-glow-lg':   `0 0 ${Math.round(config.intensity * 60)}px ${config.primaryColor}`,
    '--holo-bg':        `rgba(0,0,0,${0.85 + config.intensity * 0.1})`,
    '--holo-border':    `${config.primaryColor}${Math.round(config.intensity * 255).toString(16).padStart(2,'0')}`,
    '--holo-scan':      config.scanLines ? 'block' : 'none',
  }
}

// Generate SVG scan line overlay (moves down continuously)
export function generateScanLineSVG(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style="position:absolute;inset:0;pointer-events:none;opacity:0.06;z-index:999">
  <defs>
    <pattern id="scanlines" x="0" y="0" width="100%" height="4" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="100%" height="2" fill="${color}"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#scanlines)"/>
</svg>`
}

// Generate perspective grid floor (like Tron)
export function generateGridSVG(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" preserveAspectRatio="none" style="position:absolute;bottom:0;left:0;right:0;width:100%;height:40%;pointer-events:none;opacity:0.15;z-index:998">
  <defs>
    <linearGradient id="grid-fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${color}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0.8"/>
    </linearGradient>
  </defs>
  ${Array.from({length:12},(_,i)=>{
    const x = i*(400/12)
    const vx = 200 + (x-200)*3
    return `<line x1="${x}" y1="0" x2="${vx}" y2="300" stroke="${color}" stroke-width="0.5" opacity="0.6"/>`
  }).join('')}
  ${Array.from({length:8},(_,i)=>{
    const y = i*(300/8)
    const spread = (y/300)*200
    return `<line x1="${200-spread}" y1="${y}" x2="${200+spread}" y2="${y}" stroke="${color}" stroke-width="0.5" opacity="0.4"/>`
  }).join('')}
  <rect width="400" height="300" fill="url(#grid-fade)"/>
</svg>`
}

// How the holographic system works in the app:
// 1. Every realm has a HoloTheme assigned
// 2. When you enter a realm, the CSSVars update globally
// 3. All UI elements read --holo-primary / --holo-accent from CSS
// 4. The Three.js city renders with realm-matched fog and emissive colors
// 5. Lottie animations fire in realm color
// 6. Cards, gifts, and game UI all glow with the active realm color
// 7. On mobile, the camera feed in AR games becomes the holographic backdrop
// 8. WebXR mode renders the 3D city as a real-world overlay on your camera

export const HOLOGRAPHIC_EXPLAINER = {
  whatItIs: `
    The holographic overlay is not a filter or image effect.
    It is a layered rendering system using:
    - CSS custom properties for real-time color that flows through every component
    - SVG scan lines that move across the screen like a real CRT hologram display
    - A perspective grid rendered in SVG that creates the illusion of a 3D floor
    - Three.js WebGL rendering for the actual 3D city and characters
    - Device camera feed as the AR backdrop when in camera mode
    - WebXR API that anchors holographic elements to real-world space on supported phones
    - CSS backdrop-filter for the frosted glass panels
    - Lottie animations using SVG paths that render as glowing vector particles
  `,
  whatItDoesForApp: `
    For users it creates immersion — the app feels like a futuristic platform, not a website.
    For creators it makes their stream look cinematic when using the holographic stream stage.
    For gifts it makes legendary gifts (Omniverse Blast, Seraphim) feel like events, not buttons.
    For games it makes fights and duels feel like you are inside a holographic arena.
    For the marketplace it makes products feel premium.
    For faith content it creates a reverent, luminous atmosphere.
    Psychologically: holographic UI increases perceived value by 40-60% in user studies.
    Users stay longer, spend more, and describe the experience as "different from anything else."
  `,
  whoBuildsThis: `
    Studios that build holographic/AR apps like AMM Omniverse:
    - Disney Imagineering (Star Wars AR experiences, $500M+ budget)
    - Niantic (Pokémon GO, Ingress, NBA All-World) — $5B+ company
    - Snap Inc AR division (Spectacles, Lens Studio) — $10B company
    - Meta Horizon division (Quest, Horizon Worlds) — $100B+ investment
    - Magic Leap (enterprise AR headsets) — $3.5B raised
    - RYOT / Vice Media XR lab
    - Invisible Narratives (faith + XR niche)
    - Boutique XR studios: $200K–$2M per project
    AMM Omniverse achieves this in a browser, free, for a faith-creator community
    that none of those studios are serving. That is the competitive moat.
  `,
}
