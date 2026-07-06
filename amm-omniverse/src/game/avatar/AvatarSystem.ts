// Avatar Face System
// Scan your face via camera OR upload 1-3 photos → face is detected and
// mapped onto your 3D avatar as a canvas texture mask
// Uses face-api.js for real face landmark detection
// Falls back to color-sampled portrait when no face detected

export interface FaceData {
  photoUrls: string[]          // up to 3 uploaded photos
  primaryUrl: string | null    // best shot used for avatar
  skinColor: string            // hex sampled from face
  hairColor: string            // hex sampled from hair region
  faceShape: 'oval' | 'round' | 'square' | 'heart'
  gender: 'male' | 'female' | 'neutral'
  landmarks: FaceLandmarks | null
  textureCanvas: HTMLCanvasElement | null  // ready to use as THREE.CanvasTexture
}

export interface FaceLandmarks {
  leftEye: [number, number]
  rightEye: [number, number]
  nose: [number, number]
  mouth: [number, number]
  jawLeft: [number, number]
  jawRight: [number, number]
  faceBox: { x: number; y: number; w: number; h: number }
}

export type AvatarSpecies =
  | 'human_male' | 'human_female'
  | 'lion' | 'eagle' | 'wolf' | 'bear' | 'tiger' | 'panther'
  | 'horse' | 'elephant' | 'gorilla' | 'owl'
  | 'dragon' | 'phoenix' | 'anubis' | 'seraphim'

export interface AvatarConfig {
  species: AvatarSpecies
  faceData: FaceData | null
  name: string
  role: string
  skinOverride?: string
}

// ── Face Detection ─────────────────────────────────────────────────────────

let faceApiLoaded = false

async function loadFaceApi(): Promise<boolean> {
  if (faceApiLoaded) return true
  try {
    // face-api.js loads TensorFlow models; use lightweight TinyFaceDetector
    const faceapi = await import('face-api.js')
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
    await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models')
    faceApiLoaded = true
    return true
  } catch {
    return false // Falls back to color sampling only
  }
}

export async function detectFaceFromImage(imgEl: HTMLImageElement): Promise<FaceLandmarks | null> {
  try {
    const loaded = await loadFaceApi()
    if (!loaded) return null
    const faceapi = await import('face-api.js')
    const result = await faceapi
      .detectSingleFace(imgEl, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true)
    if (!result) return null

    const pts = result.landmarks.positions
    return {
      leftEye:  [pts[36].x, pts[36].y],
      rightEye: [pts[45].x, pts[45].y],
      nose:     [pts[30].x, pts[30].y],
      mouth:    [pts[48].x, pts[48].y],
      jawLeft:  [pts[0].x,  pts[0].y],
      jawRight: [pts[16].x, pts[16].y],
      faceBox: {
        x: result.detection.box.x,
        y: result.detection.box.y,
        w: result.detection.box.width,
        h: result.detection.box.height,
      }
    }
  } catch {
    return null
  }
}

// ── Color Sampling ──────────────────────────────────────────────────────────

export function sampleFaceColors(imgEl: HTMLImageElement, landmarks: FaceLandmarks | null): { skin: string; hair: string } {
  const canvas = document.createElement('canvas')
  canvas.width = imgEl.naturalWidth || imgEl.width
  canvas.height = imgEl.naturalHeight || imgEl.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(imgEl, 0, 0)

  let skinX = canvas.width / 2
  let skinY = canvas.height * 0.5
  let hairX = canvas.width / 2
  let hairY = canvas.height * 0.15

  if (landmarks) {
    skinX = landmarks.nose[0]
    skinY = landmarks.nose[1]
    hairX = landmarks.faceBox.x + landmarks.faceBox.w / 2
    hairY = landmarks.faceBox.y - 10
  }

  const skinPx = ctx.getImageData(Math.round(skinX), Math.round(skinY), 1, 1).data
  const hairPx = ctx.getImageData(Math.round(hairX), Math.round(hairY), 1, 1).data

  return {
    skin: `#${skinPx[0].toString(16).padStart(2,'0')}${skinPx[1].toString(16).padStart(2,'0')}${skinPx[2].toString(16).padStart(2,'0')}`,
    hair: `#${hairPx[0].toString(16).padStart(2,'0')}${hairPx[1].toString(16).padStart(2,'0')}${hairPx[2].toString(16).padStart(2,'0')}`,
  }
}

// ── Generate Avatar Texture Canvas ─────────────────────────────────────────
// Creates a canvas that CharacterBuilder uses as THREE.CanvasTexture for the head

export function generateAvatarTexture(cfg: AvatarConfig): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  const fd = cfg.faceData
  const skin = fd?.skinColor ?? speciesSkinColor(cfg.species)
  const hair = fd?.hairColor ?? speciesHairColor(cfg.species)

  // Base face/head shape
  ctx.fillStyle = skin
  ctx.beginPath()

  if (isAnimal(cfg.species)) {
    drawAnimalFace(ctx, cfg.species)
  } else {
    // Human oval face
    ctx.ellipse(128, 140, 90, 110, 0, 0, Math.PI * 2)
    ctx.fill()

    // Forehead / hair
    ctx.fillStyle = hair
    ctx.ellipse(128, 70, 90, 70, 0, 0, Math.PI, true)
    ctx.fill()

    // Eyes
    ctx.fillStyle = '#ffffff'
    ctx.beginPath(); ctx.ellipse(90, 120, 18, 12, 0, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(166, 120, 18, 12, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#2244aa'
    ctx.beginPath(); ctx.arc(90, 120, 9, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(166, 120, 9, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#111'
    ctx.beginPath(); ctx.arc(90, 120, 5, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(166, 120, 5, 0, Math.PI * 2); ctx.fill()

    // Nose
    ctx.strokeStyle = darken(skin, 30)
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(128, 130); ctx.lineTo(118, 158); ctx.lineTo(138, 158); ctx.stroke()

    // Mouth
    ctx.fillStyle = cfg.faceData?.gender === 'female' ? '#cc4466' : '#884433'
    ctx.beginPath(); ctx.ellipse(128, 178, 25, 8, 0, 0, Math.PI); ctx.fill()

    // Ears
    ctx.fillStyle = skin
    ctx.beginPath(); ctx.ellipse(38, 140, 14, 20, 0, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(218, 140, 14, 20, 0, 0, Math.PI * 2); ctx.fill()

    // If photo provided — blend it over the template face
    if (fd?.primaryUrl) {
      const img = new Image()
      img.src = fd.primaryUrl
      // Draw photo face only if it's already loaded
      if (img.complete && img.naturalWidth > 0) {
        const box = fd.landmarks?.faceBox
        if (box) {
          ctx.save()
          ctx.beginPath()
          ctx.ellipse(128, 140, 90, 110, 0, 0, Math.PI * 2)
          ctx.clip()
          ctx.drawImage(img, box.x, box.y, box.w, box.h, 38, 50, 180, 180)
          ctx.restore()
        }
      }
    }

    // Eyelashes for female
    if (fd?.gender === 'female') {
      ctx.strokeStyle = '#111'
      ctx.lineWidth = 2
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath(); ctx.moveTo(90 + i * 4, 108); ctx.lineTo(88 + i * 4, 100); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(166 + i * 4, 108); ctx.lineTo(164 + i * 4, 100); ctx.stroke()
      }
    }
  }

  // Species badge watermark
  ctx.fillStyle = 'rgba(0,255,204,0.15)'
  ctx.font = 'bold 11px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(cfg.species.toUpperCase(), 128, 248)

  return canvas
}

function drawAnimalFace(ctx: CanvasRenderingContext2D, species: AvatarSpecies) {
  const profiles: Record<string, () => void> = {
    lion: () => {
      // Mane
      ctx.fillStyle = '#8B4513'
      ctx.beginPath(); ctx.arc(128, 128, 110, 0, Math.PI * 2); ctx.fill()
      // Face
      ctx.fillStyle = '#DEB887'
      ctx.beginPath(); ctx.arc(128, 128, 80, 0, Math.PI * 2); ctx.fill()
      // Eyes
      ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.ellipse(95,105,16,12,0,0,Math.PI*2); ctx.fill()
      ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.ellipse(161,105,16,12,0,0,Math.PI*2); ctx.fill()
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(95,105,7,0,Math.PI*2); ctx.fill()
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(161,105,7,0,Math.PI*2); ctx.fill()
      // Nose
      ctx.fillStyle = '#cc4444'; ctx.beginPath(); ctx.arc(128,145,14,0,Math.PI*2); ctx.fill()
      // Whiskers
      ctx.strokeStyle='#ddd'; ctx.lineWidth=1.5
      for(const [x1,y1,x2,y2] of [[75,145,15,140],[60,155,15,155],[75,165,15,170],[181,145,245,140],[241,155,245,155],[181,165,245,170]]) { ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke() }
    },
    eagle: () => {
      ctx.fillStyle = '#4a3000'; ctx.beginPath(); ctx.arc(128,128,100,0,Math.PI*2); ctx.fill()
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(128,128,60,0,Math.PI*2); ctx.fill()
      ctx.fillStyle = '#FFD700'; ctx.beginPath()
      ctx.moveTo(128,145); ctx.lineTo(108,175); ctx.lineTo(128,165); ctx.lineTo(148,175); ctx.closePath(); ctx.fill()
      ctx.fillStyle='#FFD700'; ctx.beginPath(); ctx.ellipse(90,100,20,15,0,0,Math.PI*2); ctx.fill()
      ctx.fillStyle='#FFD700'; ctx.beginPath(); ctx.ellipse(166,100,20,15,0,0,Math.PI*2); ctx.fill()
      ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(90,100,9,0,Math.PI*2); ctx.fill()
      ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(166,100,9,0,Math.PI*2); ctx.fill()
    },
    wolf: () => {
      ctx.fillStyle='#555577'; ctx.beginPath(); ctx.arc(128,128,100,0,Math.PI*2); ctx.fill()
      // Ears
      ctx.beginPath(); ctx.moveTo(70,60); ctx.lineTo(50,10); ctx.lineTo(110,50); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(186,60); ctx.lineTo(206,10); ctx.lineTo(146,50); ctx.closePath(); ctx.fill()
      ctx.fillStyle='#ffcccc'; ctx.beginPath(); ctx.moveTo(78,58); ctx.lineTo(62,20); ctx.lineTo(105,52); ctx.closePath(); ctx.fill()
      ctx.fillStyle='#aaaacc'; ctx.beginPath(); ctx.ellipse(128,148,50,40,0,0,Math.PI*2); ctx.fill()
      ctx.fillStyle='#ddddff'; ctx.beginPath(); ctx.ellipse(90,108,16,18,0,0,Math.PI*2); ctx.fill()
      ctx.fillStyle='#ddddff'; ctx.beginPath(); ctx.ellipse(166,108,16,18,0,0,Math.PI*2); ctx.fill()
      ctx.fillStyle='#222266'; ctx.beginPath(); ctx.arc(90,108,9,0,Math.PI*2); ctx.fill()
      ctx.fillStyle='#222266'; ctx.beginPath(); ctx.arc(166,108,9,0,Math.PI*2); ctx.fill()
      ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(128,158,10,0,Math.PI*2); ctx.fill()
    },
    dragon: () => {
      ctx.fillStyle='#003300'; ctx.beginPath(); ctx.arc(128,128,105,0,Math.PI*2); ctx.fill()
      // Horns
      ctx.fillStyle='#001100'
      ctx.beginPath(); ctx.moveTo(90,50); ctx.lineTo(70,0); ctx.lineTo(108,40); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(166,50); ctx.lineTo(186,0); ctx.lineTo(148,40); ctx.closePath(); ctx.fill()
      ctx.fillStyle='#00ff44'; ctx.beginPath(); ctx.ellipse(90,115,20,14,0,0,Math.PI*2); ctx.fill()
      ctx.fillStyle='#00ff44'; ctx.beginPath(); ctx.ellipse(166,115,20,14,0,0,Math.PI*2); ctx.fill()
      ctx.fillStyle='#ff4400'; ctx.beginPath(); ctx.arc(90,115,8,0,Math.PI*2); ctx.fill()
      ctx.fillStyle='#ff4400'; ctx.beginPath(); ctx.arc(166,115,8,0,Math.PI*2); ctx.fill()
      ctx.fillStyle='#00aa22'; ctx.beginPath(); ctx.ellipse(128,175,35,12,0,0,Math.PI*2); ctx.fill()
      // Scales hint
      ctx.strokeStyle='#005500'; ctx.lineWidth=1
      for(let r=60;r<105;r+=15) for(let a=0;a<Math.PI*2;a+=0.4) {
        ctx.beginPath(); ctx.arc(128+r*Math.cos(a),128+r*Math.sin(a),5,0,Math.PI*2); ctx.stroke()
      }
    },
  }
  const draw = profiles[species] ?? profiles['lion']
  draw()
}

function isAnimal(s: AvatarSpecies): boolean {
  return !s.startsWith('human') && s !== 'seraphim'
}

function speciesSkinColor(s: AvatarSpecies): string {
  const map: Partial<Record<AvatarSpecies, string>> = {
    human_male: '#7a4728', human_female: '#c68642',
    lion: '#DEB887', eagle: '#4a3000', wolf: '#555577',
    bear: '#6B4226', tiger: '#FF6600', panther: '#1a1a1a',
    horse: '#8B4513', elephant: '#888888', gorilla: '#222222',
    owl: '#8B6914', dragon: '#003300', phoenix: '#ff4400',
    anubis: '#2a1a00', seraphim: '#fffacd',
  }
  return map[s] ?? '#7a4728'
}

function speciesHairColor(s: AvatarSpecies): string {
  const map: Partial<Record<AvatarSpecies, string>> = {
    human_male: '#1a0a00', human_female: '#3d1a00',
    lion: '#8B4513', wolf: '#333355', bear: '#3d1500',
  }
  return map[s] ?? '#1a0a00'
}

function darken(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1,3),16) - amount)
  const g = Math.max(0, parseInt(hex.slice(3,5),16) - amount)
  const b = Math.max(0, parseInt(hex.slice(5,7),16) - amount)
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`
}

// ── Species Catalog ─────────────────────────────────────────────────────────
// Full catalog of playable avatar species

export const SPECIES_CATALOG: Array<{
  id: AvatarSpecies
  label: string
  emoji: string
  category: 'human' | 'beast' | 'mythic' | 'divine'
  desc: string
  bonus: string
}> = [
  // Human
  { id: 'human_male',   label: 'Human (Male)',   emoji: '👨🏿', category: 'human',  desc: 'Full articulated character, face mask support', bonus: 'Balanced stats' },
  { id: 'human_female', label: 'Human (Female)', emoji: '👩🏿', category: 'human',  desc: 'Full articulated character, face mask support', bonus: '+10% marketplace earnings' },
  // Beasts
  { id: 'lion',      label: 'Lion',      emoji: '🦁', category: 'beast',  desc: 'Mane, amber eyes, whiskers', bonus: '+25% combat power' },
  { id: 'eagle',     label: 'Eagle',     emoji: '🦅', category: 'beast',  desc: 'Feathered, golden beak', bonus: '+30% speed, aerial view' },
  { id: 'wolf',      label: 'Wolf',      emoji: '🐺', category: 'beast',  desc: 'Pack bonuses, howl emote', bonus: '+20% team XP' },
  { id: 'bear',      label: 'Bear',      emoji: '🐻', category: 'beast',  desc: 'Massive build, roar emote', bonus: '+35% health' },
  { id: 'tiger',     label: 'Tiger',     emoji: '🐯', category: 'beast',  desc: 'Stripes, stealth bonus', bonus: '+20% stealth missions' },
  { id: 'panther',   label: 'Panther',   emoji: '🐆', category: 'beast',  desc: 'Jet black, night vision', bonus: 'Invisible at night' },
  { id: 'horse',     label: 'Horse',     emoji: '🐴', category: 'beast',  desc: 'Four-legged speed build', bonus: '2× vehicle speed' },
  { id: 'elephant',  label: 'Elephant',  emoji: '🐘', category: 'beast',  desc: 'Massive, unbreakable', bonus: 'Immune to wanted level' },
  { id: 'gorilla',   label: 'Gorilla',   emoji: '🦍', category: 'beast',  desc: 'Knuckle walk, chest pound', bonus: '+40% melee damage' },
  { id: 'owl',       label: 'Owl',       emoji: '🦉', category: 'beast',  desc: 'Wisdom aura, 360° vision', bonus: '+50% XP on all missions' },
  // Mythic
  { id: 'dragon',    label: 'Dragon',    emoji: '🐉', category: 'mythic', desc: 'Scales, horns, fire breath', bonus: 'Fire immunity + flight' },
  { id: 'phoenix',   label: 'Phoenix',   emoji: '🔥', category: 'mythic', desc: 'Flame feathers, rebirth', bonus: 'Respawn with full health' },
  { id: 'anubis',    label: 'Anubis',    emoji: '⚖️', category: 'mythic', desc: 'Jackal head, staff, scales', bonus: '+100% faith realm XP' },
  // Divine
  { id: 'seraphim',  label: 'Seraphim',  emoji: '👼', category: 'divine', desc: '6 wings, crown of light, glow', bonus: 'Immune to all penalties' },
]
