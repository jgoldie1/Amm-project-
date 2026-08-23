import * as THREE from 'three'

export type CharacterRole = 'cop' | 'creator' | 'pastor' | 'merchant' | 'athlete' | 'gangster' | 'player'
export type CharacterSkin = 'dark_brown' | 'brown' | 'tan' | 'light'

export interface CharacterConfig {
  role: CharacterRole
  name: string
  skin?: CharacterSkin
  shirtColor?: number
  pantsColor?: number
  shoeColor?: number
}

// Full articulated humanoid — torso, head, arms, hands, legs, feet
// Proportioned like Mixamo base mesh (1.75m tall)
export function buildCharacter(cfg: CharacterConfig): THREE.Group {
  const root = new THREE.Group()
  root.name = `char_${cfg.name}`

  const skinTones: Record<CharacterSkin, number> = {
    dark_brown: 0x3d1f0a,
    brown:      0x7a4728,
    tan:        0xc68642,
    light:      0xf1c27d,
  }
  const skin = skinTones[cfg.skin ?? 'brown']

  // Role-based default outfits
  const outfits: Record<CharacterRole, { shirt: number; pants: number; shoes: number }> = {
    cop:      { shirt: 0x1a3a6e, pants: 0x0d1f3c, shoes: 0x111111 },
    creator:  { shirt: 0xff6600, pants: 0x222222, shoes: 0xffffff },
    pastor:   { shirt: 0xffffff, pants: 0x111111, shoes: 0x222222 },
    merchant: { shirt: 0x006633, pants: 0x333300, shoes: 0x553300 },
    athlete:  { shirt: 0xff2200, pants: 0x111111, shoes: 0xff2200 },
    gangster: { shirt: 0x111111, pants: 0x111111, shoes: 0x222222 },
    player:   { shirt: 0x00ccff, pants: 0x001133, shoes: 0xffffff },
  }
  const outfit = outfits[cfg.role]
  const shirtCol  = cfg.shirtColor ?? outfit.shirt
  const pantsCol  = cfg.pantsColor ?? outfit.pants
  const shoeCol   = cfg.shoeColor  ?? outfit.shoes

  const skinMat  = new THREE.MeshLambertMaterial({ color: skin })
  const shirtMat = new THREE.MeshLambertMaterial({ color: shirtCol })
  const pantsMat = new THREE.MeshLambertMaterial({ color: pantsCol })
  const shoesMat = new THREE.MeshLambertMaterial({ color: shoeCol })
  const hairMat  = new THREE.MeshLambertMaterial({ color: 0x1a0a00 })
  const eyeMat   = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 })

  // ── TORSO ──────────────────────────────────────────────────────────────
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.55, 0.22), shirtMat)
  torso.position.y = 1.05
  torso.castShadow = true
  root.add(torso)

  // Chest detail (pocket / logo strip)
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.005), new THREE.MeshBasicMaterial({ color: 0xffffff }))
  chest.position.set(-0.1, 0.06, 0.112)
  torso.add(chest)

  // ── HEAD ───────────────────────────────────────────────────────────────
  const headGroup = new THREE.Group()
  headGroup.position.y = 1.48
  root.add(headGroup)

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), skinMat)
  head.scale.set(1, 1.1, 0.95)
  head.castShadow = true
  headGroup.add(head)

  // Ears
  ;[-1, 1].forEach(side => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), skinMat)
    ear.position.set(side * 0.19, 0, 0)
    headGroup.add(ear)
  })

  // Eyes
  ;[-1, 1].forEach(side => {
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), eyeMat)
    eyeWhite.position.set(side * 0.07, 0.03, 0.15)
    headGroup.add(eyeWhite)
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.022, 5, 5), pupilMat)
    pupil.position.set(side * 0.07, 0.03, 0.185)
    headGroup.add(pupil)
  })

  // Nose
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.04, 0.04), skinMat)
  nose.position.set(0, -0.02, 0.17)
  headGroup.add(nose)

  // Mouth
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.015, 0.005), new THREE.MeshBasicMaterial({ color: 0x6b2d2d }))
  mouth.position.set(0, -0.07, 0.17)
  headGroup.add(mouth)

  // Hair (role-based style)
  if (cfg.role !== 'cop') {
    const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.185, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), hairMat)
    hairTop.position.y = 0.04
    headGroup.add(hairTop)
  }

  // Cop hat
  if (cfg.role === 'cop') {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 12), new THREE.MeshLambertMaterial({ color: 0x0d1f3c }))
    brim.position.y = 0.14
    headGroup.add(brim)
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.14, 12), new THREE.MeshLambertMaterial({ color: 0x0d1f3c }))
    cap.position.y = 0.24
    headGroup.add(cap)
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.01), new THREE.MeshBasicMaterial({ color: 0xffd700 }))
    badge.position.set(0, 0.22, 0.17)
    headGroup.add(badge)
  }

  // Pastor collar
  if (cfg.role === 'pastor') {
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.01), new THREE.MeshBasicMaterial({ color: 0xffffff }))
    collar.position.set(0, -0.22, 0.115)
    torso.add(collar)
  }

  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.07, 0.1, 8), skinMat)
  neck.position.y = 1.335
  root.add(neck)

  // ── ARMS ───────────────────────────────────────────────────────────────
  ;[-1, 1].forEach(side => {
    const shoulder = new THREE.Group()
    shoulder.position.set(side * 0.27, 1.2, 0)
    root.add(shoulder)

    // Upper arm
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.28, 8), shirtMat)
    upperArm.position.y = -0.14
    shoulder.add(upperArm)

    // Elbow joint
    const elbow = new THREE.Group()
    elbow.position.y = -0.28
    shoulder.add(elbow)

    // Forearm
    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.26, 8), skinMat)
    forearm.position.y = -0.13
    elbow.add(forearm)

    // Hand
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.1, 0.05), skinMat)
    hand.position.y = -0.31
    shoulder.add(hand)

    // Fingers hint
    ;[0, 1, 2, 3].forEach(fi => {
      const finger = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.06, 0.018), skinMat)
      finger.position.set((fi - 1.5) * 0.022, -0.38, 0)
      shoulder.add(finger)
    })

    // Store shoulder ref for animation
    ;(shoulder as any)._side = side
    ;(shoulder as any)._isArm = true
    root.userData[`arm_${side > 0 ? 'R' : 'L'}`] = shoulder
  })

  // ── HIPS ───────────────────────────────────────────────────────────────
  const hips = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.2), pantsMat)
  hips.position.y = 0.72
  root.add(hips)

  // Belt
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.04, 0.21), new THREE.MeshLambertMaterial({ color: 0x333311 }))
  belt.position.y = 0.82
  root.add(belt)

  // ── LEGS ───────────────────────────────────────────────────────────────
  ;[-1, 1].forEach(side => {
    const legGroup = new THREE.Group()
    legGroup.position.set(side * 0.115, 0.62, 0)
    root.add(legGroup)

    // Thigh
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.078, 0.3, 8), pantsMat)
    thigh.position.y = -0.15
    legGroup.add(thigh)

    // Knee
    const knee = new THREE.Group()
    knee.position.y = -0.3
    legGroup.add(knee)

    // Shin
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.065, 0.28, 8), pantsMat)
    shin.position.y = -0.14
    knee.add(shin)

    // Ankle sock hint
    const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.063, 0.06, 8), new THREE.MeshLambertMaterial({ color: 0xffffff }))
    sock.position.y = -0.61
    legGroup.add(sock)

    // Shoe
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.22), shoesMat)
    shoe.position.set(side * 0, -0.68, 0.04)
    legGroup.add(shoe)
    // Sole
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.015, 0.22), new THREE.MeshLambertMaterial({ color: 0xffffff }))
    sole.position.set(0, -0.038, 0)
    shoe.add(sole)

    legGroup.userData._isLeg = true
    legGroup.userData._side = side
    root.userData[`leg_${side > 0 ? 'R' : 'L'}`] = legGroup
  })

  // ── NAME PLATE ─────────────────────────────────────────────────────────
  const canvas = document.createElement('canvas')
  canvas.width = 256; canvas.height = 56
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'rgba(0,0,0,0.7)'
  ctx.roundRect(0, 0, 256, 56, 8)
  ctx.fill()
  ctx.fillStyle = roleColor(cfg.role)
  ctx.font = 'bold 18px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(cfg.name, 128, 22)
  ctx.fillStyle = '#aaaaaa'
  ctx.font = '13px Arial'
  ctx.fillText(`[${cfg.role.toUpperCase()}]`, 128, 42)
  const tex = new THREE.CanvasTexture(canvas)
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 0.4),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
  )
  plate.position.y = 2.1
  plate.name = 'nameplate'
  root.add(plate)

  // ── ROLE ACCESSORIES ───────────────────────────────────────────────────
  if (cfg.role === 'creator') {
    // Headphones
    const hpBand = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.02, 6, 16, Math.PI), new THREE.MeshLambertMaterial({ color: 0x111111 }))
    hpBand.position.set(0, 1.62, 0)
    hpBand.rotation.z = Math.PI
    root.add(hpBand)
    ;[-1, 1].forEach(s => {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 10), new THREE.MeshLambertMaterial({ color: 0xff6600 }))
      cup.rotation.z = Math.PI / 2
      cup.position.set(s * 0.2, 1.48, 0)
      root.add(cup)
    })
  }

  if (cfg.role === 'pastor') {
    // Bible prop
    const bible = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.03), new THREE.MeshLambertMaterial({ color: 0x4a1a00 }))
    bible.position.set(0.22, 0.88, 0.1)
    root.add(bible)
    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.005), new THREE.MeshBasicMaterial({ color: 0xffd700 }))
    cross.position.set(0, 0.04, 0.02)
    bible.add(cross)
    const cross2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.005), new THREE.MeshBasicMaterial({ color: 0xffd700 }))
    cross2.position.set(0, 0.04, 0.02)
    bible.add(cross2)
  }

  if (cfg.role === 'athlete') {
    // Basketball
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), new THREE.MeshLambertMaterial({ color: 0xff6600 }))
    ball.position.set(0.3, 0.78, 0.1)
    root.add(ball)
    // Lines on ball
    const line1 = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.007, 4, 16), new THREE.MeshBasicMaterial({ color: 0x222222 }))
    line1.position.set(0.3, 0.78, 0.1)
    root.add(line1)
  }

  if (cfg.role === 'cop') {
    // Radio on belt
    const radio = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.03), new THREE.MeshLambertMaterial({ color: 0x111111 }))
    radio.position.set(-0.24, 0.76, 0.1)
    root.add(radio)
  }

  if (cfg.role === 'merchant') {
    // Briefcase
    const bcase = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.07), new THREE.MeshLambertMaterial({ color: 0x553300 }))
    bcase.position.set(0.34, 0.74, 0.05)
    root.add(bcase)
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.01, 4, 10, Math.PI), new THREE.MeshLambertMaterial({ color: 0x333300 }))
    handle.position.set(0.34, 0.84, 0.05)
    root.add(handle)
  }

  // Shadow caster
  root.traverse(obj => { if (obj instanceof THREE.Mesh) { obj.castShadow = true; obj.receiveShadow = false } })
  root.userData.isCharacter = true
  root.userData.role = cfg.role
  root.userData.animPhase = Math.random() * Math.PI * 2 // random walk phase

  return root
}

// Animate character — walk cycle using stored userData references
export function animateCharacter(char: THREE.Group, t: number, walking: boolean) {
  const armL = char.userData.arm_L as THREE.Group | undefined
  const armR = char.userData.arm_R as THREE.Group | undefined
  const legL = char.userData.leg_L as THREE.Group | undefined
  const legR = char.userData.leg_R as THREE.Group | undefined
  const phase = char.userData.animPhase as number ?? 0

  if (walking) {
    const swing = Math.sin(t * 4 + phase) * 0.35
    if (armL) armL.rotation.x =  swing
    if (armR) armR.rotation.x = -swing
    if (legL) legL.rotation.x = -swing * 0.8
    if (legR) legR.rotation.x =  swing * 0.8
  } else {
    // Idle breath + subtle sway
    const breath = Math.sin(t * 1.5 + phase) * 0.015
    if (armL) { armL.rotation.x = THREE.MathUtils.lerp(armL.rotation.x, breath * 0.3, 0.05) }
    if (armR) { armR.rotation.x = THREE.MathUtils.lerp(armR.rotation.x, -breath * 0.3, 0.05) }
    if (legL) { legL.rotation.x = THREE.MathUtils.lerp(legL.rotation.x, 0, 0.05) }
    if (legR) { legR.rotation.x = THREE.MathUtils.lerp(legR.rotation.x, 0, 0.05) }
    // Chest breath
    char.position.y = Math.sin(t * 1.2 + phase) * 0.012
  }

  // Nameplate always faces camera direction (handled in CityEngine)
}

function roleColor(role: CharacterRole): string {
  const colors: Record<CharacterRole, string> = {
    cop:      '#4488ff',
    creator:  '#ff6600',
    pastor:   '#ffffff',
    merchant: '#00cc44',
    athlete:  '#ff2200',
    gangster: '#888888',
    player:   '#00ffcc',
  }
  return colors[role] ?? '#ffffff'
}
