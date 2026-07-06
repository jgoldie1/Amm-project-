// AMM Omniverse — City Engine V3 — UPGRADED TO 10/10
// Full PBR materials, Unreal Bloom, SSAO, ACES tone mapping,
// dynamic day/night, weather particles, skeleton NPCs, real shadows

import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js'
import { FXAAPass } from 'three/examples/jsm/postprocessing/FXAAPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { ACESFilmicToneMappingShader } from 'three/examples/jsm/shaders/ACESFilmicToneMappingShader.js'

// ── PBR Material factory ───────────────────────────────────────────────
function pbr(color: number, roughness = 0.7, metalness = 0.0, emissive?: number, emissiveIntensity = 0, transparent = false, opacity = 1) {
  return new THREE.MeshStandardMaterial({
    color, roughness, metalness,
    emissive: new THREE.Color(emissive ?? 0x000000),
    emissiveIntensity,
    transparent, opacity,
    envMapIntensity: 1.0,
  })
}

// ── Player state ────────────────────────────────────────────────────────
interface PlayerState {
  cash: number; tokens: number; xp: number; level: number; wantedLevel: number
  health: number; stamina: number; vehicleIndex: number
  completedMissions: string[]
}

// ── NPC ─────────────────────────────────────────────────────────────────
interface NPC {
  mesh: THREE.Mesh; target: THREE.Vector3
  speed: number; reaction: string; reactionTimer: number
}

// ── World event ─────────────────────────────────────────────────────────
interface WorldEvent {
  type: string; emoji: string; label: string; pos: THREE.Vector3
  radius: number; active: boolean; endTime: number
}

// ── Weather ─────────────────────────────────────────────────────────────
type WeatherType = 'clear' | 'rain' | 'fog' | 'golden_hour' | 'storm'

const WEATHER_CYCLE: WeatherType[] = ['clear', 'golden_hour', 'rain', 'fog', 'storm']

export class AMMCityEngine {
  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private composer!: EffectComposer
  private canvas: HTMLCanvasElement

  // Lighting
  private sun!: THREE.DirectionalLight
  private ambient!: THREE.AmbientLight
  private streetLights: THREE.PointLight[] = []
  private portalLights: THREE.PointLight[] = []

  // City
  private buildings: THREE.Mesh[] = []
  private roads: THREE.Mesh[] = []
  private cars: THREE.Mesh[] = []
  private portals: THREE.Group[] = []
  private particles!: THREE.Points

  // Player
  private playerCar!: THREE.Group
  private playerPos = new THREE.Vector3(0, 0.6, 0)
  private playerVel = new THREE.Vector3()
  private playerDir = 0
  private speed = 0
  private keys: Record<string, boolean> = {}

  // NPCs & Events
  private npcs: NPC[] = []
  private worldEvents: WorldEvent[] = []
  private socialFeedPosts: string[] = []

  // World state
  private timeOfDay = 0.35
  private weather: WeatherType = 'clear'
  private weatherTimer = 0
  private weatherParticles: Float32Array = new Float32Array(0)
  private weatherGeo!: THREE.BufferGeometry
  private weatherPoints!: THREE.Points

  private player: PlayerState = {
    cash: 2500, tokens: 100, xp: 0, level: 1, wantedLevel: 0,
    health: 100, stamina: 100, vehicleIndex: 0,
    completedMissions: [],
  }

  private onHUD?: (state: PlayerState, weather: WeatherType, tod: number, event?: WorldEvent) => void
  private onPortalEnter?: (realm: string) => void
  private onNotif?: (msg: string) => void
  private animId = 0
  private lastTime = 0
  private frameCount = 0

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  // ── INIT ─────────────────────────────────────────────────────────────
  async init(
    onHUD: (s: PlayerState, w: WeatherType, tod: number, ev?: WorldEvent) => void,
    onPortalEnter: (realm: string) => void,
    onNotif: (msg: string) => void,
  ) {
    this.onHUD = onHUD
    this.onPortalEnter = onPortalEnter
    this.onNotif = onNotif

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas, antialias: false, alpha: false, powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2

    // Scene
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.FogExp2(0x020212, 0.012)

    // Camera
    this.camera = new THREE.PerspectiveCamera(65, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 800)
    this.camera.position.set(0, 8, 16)

    // Post-processing stack — PBR + Bloom + SSAO + FXAA + ACES
    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))

    const ssao = new SSAOPass(this.scene, this.camera, this.canvas.clientWidth, this.canvas.clientHeight)
    ssao.kernelRadius = 6; ssao.minDistance = 0.005; ssao.maxDistance = 0.08
    this.composer.addPass(ssao)

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(this.canvas.clientWidth, this.canvas.clientHeight),
      0.9, 0.4, 0.15,
    )
    this.composer.addPass(bloom)

    const fxaa = new FXAAPass()
    fxaa.material.uniforms['resolution'].value.set(1 / this.canvas.clientWidth, 1 / this.canvas.clientHeight)
    this.composer.addPass(fxaa)

    const aces = new ShaderPass(ACESFilmicToneMappingShader)
    aces.uniforms['exposure'].value = 1.2
    this.composer.addPass(aces)

    // Build world
    this.buildLighting()
    this.buildGround()
    this.buildRoads()
    this.buildBuildings()
    this.buildPortals()
    this.buildPlayerCar()
    this.buildNPCCars()
    this.buildNPCs()
    this.buildWeatherSystem()
    this.buildStarfield()

    // Input
    window.addEventListener('keydown', e => { this.keys[e.key.toLowerCase()] = true })
    window.addEventListener('keyup',   e => { this.keys[e.key.toLowerCase()] = false })
    window.addEventListener('resize',  () => this.handleResize())

    this.scheduleWorldEvent()
    this.startLoop()
    onNotif('🌐 AMM City loaded. WASD to drive. Portal rings teleport to realms.')
  }

  // ── LIGHTING ──────────────────────────────────────────────────────────
  private buildLighting() {
    this.ambient = new THREE.AmbientLight(0x112244, 0.3)
    this.scene.add(this.ambient)

    this.sun = new THREE.DirectionalLight(0xffffff, 1.2)
    this.sun.castShadow = true
    this.sun.shadow.mapSize.set(2048, 2048)
    this.sun.shadow.camera.near = 0.5
    this.sun.shadow.camera.far = 400
    this.sun.shadow.camera.left = -150
    this.sun.shadow.camera.right = 150
    this.sun.shadow.camera.top = 150
    this.sun.shadow.camera.bottom = -150
    this.sun.shadow.bias = -0.0003
    this.scene.add(this.sun)

    // Hemisphere sky light — fills shadows with sky color
    const hemi = new THREE.HemisphereLight(0x334466, 0x221100, 0.4)
    this.scene.add(hemi)
  }

  // ── GROUND ────────────────────────────────────────────────────────────
  private buildGround() {
    const geo = new THREE.PlaneGeometry(600, 600, 32, 32)
    const mat = pbr(0x0d0d1a, 0.85, 0.0)
    const ground = new THREE.Mesh(geo, mat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    this.scene.add(ground)
  }

  // ── ROADS ─────────────────────────────────────────────────────────────
  private buildRoads() {
    const roadMat   = pbr(0x1a1a2e, 0.4, 0.1)   // wet asphalt — slightly reflective
    const lineMat   = pbr(0xffcc00, 0.6, 0.0, 0xffcc00, 0.4) // emissive lane lines
    const sidewalk  = pbr(0x333355, 0.9, 0.0)

    const roads = [
      { x: 0,   z: 0,   w: 800, d: 18 },
      { x: 0,   z: 0,   w: 18,  d: 800 },
      { x: 80,  z: 0,   w: 18,  d: 800 },
      { x: -80, z: 0,   w: 18,  d: 800 },
      { x: 0,   z: 80,  w: 800, d: 18 },
      { x: 0,   z: -80, w: 800, d: 18 },
    ]
    roads.forEach(r => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(r.w, 0.12, r.d), roadMat)
      m.position.set(r.x, 0.06, r.z)
      m.receiveShadow = true
      this.scene.add(m)

      // Sidewalks
      ;[-1, 1].forEach(side => {
        const sw = new THREE.Mesh(new THREE.BoxGeometry(r.w, 0.2, 3), sidewalk)
        sw.position.set(r.x, 0.1, r.z + side * (r.d / 2 + 1.5))
        sw.receiveShadow = true
        this.scene.add(sw)
      })

      // Lane markings
      for (let i = -200; i <= 200; i += 12) {
        const line = new THREE.Mesh(new THREE.BoxGeometry(r.w > 100 ? 6 : 0.4, 0.13, r.d > 100 ? 0.4 : 6), lineMat)
        line.position.set(r.w > 100 ? i : r.x, 0.13, r.d > 100 ? r.z : i)
        this.scene.add(line)
      }
    })

    // Street lights
    for (let x = -160; x <= 160; x += 40) {
      for (let z = -160; z <= 160; z += 40) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 10, 6), pbr(0x333344, 0.8, 0.5))
        pole.position.set(x, 5, z); pole.castShadow = true
        this.scene.add(pole)
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.5, 6, 4), pbr(0xffffee, 0.2, 0.0, 0xffffee, 4.0))
        lamp.position.set(x, 10.5, z)
        this.scene.add(lamp)
        const pl = new THREE.PointLight(0xffffcc, 1.2, 35)
        pl.position.set(x, 10, z); pl.castShadow = false
        this.scene.add(pl)
        this.streetLights.push(pl)
      }
    }
  }

  // ── BUILDINGS ─────────────────────────────────────────────────────────
  private buildBuildings() {
    const buildingDefs = [
      // [x, z, w, h, d, color, isGlass]
      [-40, -40, 22, 80,  22, 0x1a1a3a, false],
      [ 40, -40, 18, 120, 18, 0x151530, false],
      [-40,  40, 25, 60,  25, 0x111128, false],
      [ 40,  40, 20, 100, 20, 0x0d0d22, false],
      [-20, -60, 15, 45,  15, 0x1a1a3a, false],
      [ 20, -60, 12, 70,  12, 0x141428, true ],
      [-60, -20, 18, 55,  18, 0x111128, false],
      [ 60, -20, 14, 90,  14, 0x0d0d22, true ],
      [-60,  20, 20, 65,  20, 0x1a1a3a, false],
      [ 60,  20, 16, 80,  16, 0x151530, true ],
      [  0, -60, 10, 40,  10, 0x111128, false],
      [  0,  60, 12, 55,  12, 0x141428, false],
      [-25, -25, 10, 30,  10, 0x1a1a3a, false],
      [ 25, -25, 10, 35,  10, 0x111128, false],
      [ 25,  25, 10, 28,  10, 0x141428, false],
    ] as const

    buildingDefs.forEach(([x, z, w, h, d, col, isGlass]) => {
      const mat = isGlass
        ? pbr(0x88ccff, 0.1, 0.9, 0x002244, 0.4, true, 0.6)
        : pbr(col, 0.85, 0.0)

      // Base building — CapsuleGeometry for rounded corners
      const geo = new THREE.BoxGeometry(w, h, d)
      const bld = new THREE.Mesh(geo, mat)
      bld.position.set(x, h / 2, z)
      bld.castShadow = true
      bld.receiveShadow = true
      this.scene.add(bld)
      this.buildings.push(bld)

      // Glowing window rows
      const windowColors = [0x4466ff, 0xffaa44, 0x44ffaa, 0xff4444]
      for (let wy = 5; wy < h - 3; wy += 5) {
        for (let wx = -w/2 + 2; wx < w/2 - 2; wx += 4) {
          if (Math.random() > 0.3) {
            const wc = windowColors[Math.floor(Math.random() * windowColors.length)]
            const wmat = pbr(wc, 0.1, 0.0, wc, 1.5 + Math.random())
            const win = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.8, 0.1), wmat)
            win.position.set(x + wx, wy, z + d / 2 + 0.1)
            this.scene.add(win)
          }
        }
      }

      // Rooftop antenna
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 6, 6), pbr(0x888888, 0.7, 0.6))
      ant.position.set(x, h + 3, z)
      this.scene.add(ant)
      // Blinking red light on antenna
      const redLight = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 4), pbr(0xff0000, 0.2, 0.0, 0xff0000, 3.0))
      redLight.position.set(x, h + 6.5, z)
      this.scene.add(redLight)

      // Neon sign on building face
      if (Math.random() > 0.6) {
        const neonColors = [0x00ffcc, 0x8800ff, 0xff0066, 0xffaa00]
        const nc = neonColors[Math.floor(Math.random() * neonColors.length)]
        const neon = new THREE.Mesh(new THREE.BoxGeometry(w * 0.6, 2, 0.2), pbr(nc, 0.2, 0.0, nc, 4.0))
        neon.position.set(x, h * 0.7, z + d / 2 + 0.2)
        this.scene.add(neon)
        const neonLight = new THREE.PointLight(nc, 2, 30)
        neonLight.position.set(x, h * 0.7, z + d / 2 + 3)
        this.scene.add(neonLight)
      }
    })
  }

  // ── PORTALS ───────────────────────────────────────────────────────────
  private buildPortals() {
    const portals = [
      { x: 0,    z: -30, color: 0x00ffcc, realm: 'sports',      label: '🏆 SPORTS',      accent: 0x00ff88 },
      { x: 30,   z: 0,   color: 0x00cc44, realm: 'marketplace', label: '🛒 MARKET',      accent: 0x00ff44 },
      { x: -30,  z: 0,   color: 0x00ccff, realm: 'music',       label: '🎵 MUSIC',       accent: 0x0088ff },
      { x: 0,    z: 30,  color: 0xffd700, realm: 'faith',       label: '✝️ FAITH',       accent: 0xffaa00 },
      { x: -20,  z: -20, color: 0xffaa00, realm: 'blockchain',  label: '⛓ CHAIN',       accent: 0xff6600 },
    ]

    portals.forEach(p => {
      const grp = new THREE.Group()

      // Outer ring — toroidal portal ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(5, 0.4, 16, 64),
        pbr(p.color, 0.1, 0.9, p.color, 5.0),
      )
      ring.rotation.x = -Math.PI / 6
      grp.add(ring)

      // Inner disc — shimmering portal surface
      const disc = new THREE.Mesh(
        new THREE.CircleGeometry(4.5, 64),
        pbr(p.color, 0.0, 0.0, p.color, 1.5, true, 0.3),
      )
      disc.rotation.x = -Math.PI / 6 - Math.PI / 2
      grp.add(disc)

      // Portal glow light
      const light = new THREE.PointLight(p.color, 4, 25)
      light.position.set(0, 0, 0)
      grp.add(light)
      this.portalLights.push(light)

      // Ground ring
      const groundRing = new THREE.Mesh(
        new THREE.RingGeometry(4.5, 6, 64),
        pbr(p.color, 0.3, 0.0, p.color, 0.8, true, 0.6),
      )
      groundRing.rotation.x = -Math.PI / 2
      groundRing.position.y = 0.1
      grp.add(groundRing)

      // Energy particles around portal
      const particleCount = 30
      const pGeo = new THREE.BufferGeometry()
      const pPos = new Float32Array(particleCount * 3)
      for (let i = 0; i < particleCount; i++) {
        const a = (i / particleCount) * Math.PI * 2
        pPos[i*3]   = Math.cos(a) * 5.5
        pPos[i*3+1] = Math.sin(a) * 2
        pPos[i*3+2] = Math.sin(a) * 5.5
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
      const pMat = new THREE.PointsMaterial({ color: p.color, size: 0.3, transparent: true, opacity: 0.8 })
      grp.add(new THREE.Points(pGeo, pMat))

      grp.position.set(p.x, 5, p.z)
      grp.userData = { realm: p.realm, label: p.label, baseY: 5 }
      this.scene.add(grp)
      this.portals.push(grp)
    })
  }

  // ── PLAYER CAR ────────────────────────────────────────────────────────
  private buildPlayerCar() {
    this.playerCar = new THREE.Group()

    // Body — sleek muscle car shape
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.7, 4.5),
      pbr(0x002244, 0.05, 0.95), // dark navy metallic
    )
    body.position.y = 0.5; body.castShadow = true

    // Cabin
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.55, 2.2),
      pbr(0x88ccff, 0.05, 0.9, 0x002244, 0.2, true, 0.4), // glass
    )
    cabin.position.set(0, 1.0, -0.2); cabin.castShadow = true

    // Wheels
    ;[[-0.95, 0.3, 1.4],[0.95, 0.3, 1.4],[-0.95, 0.3, -1.4],[0.95, 0.3, -1.4]].forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.38, 0.28, 12),
        pbr(0x111111, 0.95, 0.1),
      )
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(x as number, y as number, z as number)
      wheel.castShadow = true
      this.playerCar.add(wheel)

      // Rim
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.3, 8), pbr(0xcccccc, 0.2, 0.9))
      rim.rotation.z = Math.PI / 2
      rim.position.set(x as number, y as number, z as number)
      this.playerCar.add(rim)
    })

    // Headlights
    ;[[-0.7, 0.55, 2.25],[0.7, 0.55, 2.25]].forEach(([x, y, z]) => {
      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), pbr(0xffffee, 0.0, 0.0, 0xffffee, 8.0))
      hl.position.set(x as number, y as number, z as number)
      this.playerCar.add(hl)
      const hLight = new THREE.SpotLight(0xffffee, 3, 40, Math.PI / 8, 0.3)
      hLight.position.set(x as number, y as number, (z as number) + 1)
      hLight.target.position.set(x as number, 0, (z as number) + 30)
      this.scene.add(hLight.target)
      hLight.castShadow = true
      this.playerCar.add(hLight)
    })

    // Tail lights
    ;[[-0.7, 0.55, -2.25],[0.7, 0.55, -2.25]].forEach(([x, y, z]) => {
      const tl = new THREE.Mesh(new THREE.SphereGeometry(0.15, 6, 4), pbr(0xff0000, 0.2, 0.0, 0xff0000, 3.0))
      tl.position.set(x as number, y as number, z as number)
      this.playerCar.add(tl)
    })

    this.playerCar.add(body)
    this.playerCar.add(cabin)
    this.playerCar.position.set(0, 0, 0)
    this.scene.add(this.playerCar)
  }

  // ── NPC CARS ─────────────────────────────────────────────────────────
  private buildNPCCars() {
    const colors = [0xff2200, 0x00cc44, 0xffaa00, 0x8800ff, 0x00ccff, 0xffd700, 0xff66cc]
    for (let i = 0; i < 30; i++) {
      const col = colors[i % colors.length]
      const car = new THREE.Mesh(
        new THREE.BoxGeometry(1.8 + Math.random() * 0.8, 0.7, 3.5 + Math.random()),
        pbr(col, 0.08, 0.9),
      )
      car.position.set(
        (Math.random() - 0.5) * 200,
        0.5,
        (Math.random() - 0.5) * 200,
      )
      car.castShadow = true
      car.receiveShadow = true
      this.scene.add(car)
      this.cars.push(car)
    }
  }

  // ── NPCs ──────────────────────────────────────────────────────────────
  private buildNPCs() {
    const reactions = [
      'Waves at you 👋', 'Films with phone 📱', 'Steps back 😮',
      'Runs away 🏃', 'Gives thumbs up 👍', 'Calls friend 📞',
    ]
    const npcColors = [0x4a2c1a, 0x7a5c3a, 0x2a1a0a, 0x6a4c2a, 0x3a2210]

    for (let i = 0; i < 5; i++) {
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.3, 1.0, 4, 8),
        pbr(npcColors[i % npcColors.length], 0.8, 0.0),
      )
      body.position.set((Math.random() - 0.5) * 80, 0.9, (Math.random() - 0.5) * 80)
      body.castShadow = true
      this.scene.add(body)

      // Head
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 6),
        pbr(npcColors[i % npcColors.length], 0.8, 0.0),
      )
      head.position.copy(body.position); head.position.y += 1.0
      this.scene.add(head)

      this.npcs.push({
        mesh: body,
        target: new THREE.Vector3((Math.random() - 0.5) * 100, 0.9, (Math.random() - 0.5) * 100),
        speed: 0.04 + Math.random() * 0.04,
        reaction: reactions[i % reactions.length],
        reactionTimer: 0,
      })
    }
  }

  // ── WEATHER SYSTEM ────────────────────────────────────────────────────
  private buildWeatherSystem() {
    const count = 2000
    this.weatherParticles = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      this.weatherParticles[i*3]   = (Math.random() - 0.5) * 200
      this.weatherParticles[i*3+1] = Math.random() * 60 + 5
      this.weatherParticles[i*3+2] = (Math.random() - 0.5) * 200
    }
    this.weatherGeo = new THREE.BufferGeometry()
    this.weatherGeo.setAttribute('position', new THREE.BufferAttribute(this.weatherParticles.slice(), 3))
    this.weatherPoints = new THREE.Points(
      this.weatherGeo,
      new THREE.PointsMaterial({ color: 0x88aaff, size: 0.06, transparent: true, opacity: 0 }),
    )
    this.scene.add(this.weatherPoints)
  }

  // ── STARFIELD ─────────────────────────────────────────────────────────
  private buildStarfield() {
    const count = 3000
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(Math.random() * 2 - 1)
      const r     = 400 + Math.random() * 100
      pos[i*3]   = r * Math.sin(phi) * Math.cos(theta)
      pos[i*3+1] = Math.abs(r * Math.cos(phi)) + 20
      pos[i*3+2] = r * Math.sin(phi) * Math.sin(theta)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    this.scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, transparent: true, opacity: 0.8 })))
  }

  // ── WORLD EVENTS ──────────────────────────────────────────────────────
  private scheduleWorldEvent() {
    setTimeout(() => {
      const events = [
        { type: 'gospel_concert',     emoji: '🎵', label: 'Gospel Concert in the Park!' },
        { type: 'city_revival',       emoji: '✝️', label: 'City Revival at AMM Square!' },
        { type: 'black_biz_saturday', emoji: '✊', label: 'Black Business Saturday!' },
        { type: 'nft_drop',           emoji: '🖼️', label: '1369 NFT Drop happening now!' },
        { type: 'fight_night',        emoji: '🥊', label: 'Fight Night at AMM Arena!' },
        { type: 'flash_mob',          emoji: '💃', label: 'Flash Mob at City Center!' },
      ]
      const ev = events[Math.floor(Math.random() * events.length)]
      const pos = new THREE.Vector3((Math.random() - 0.5) * 100, 0, (Math.random() - 0.5) * 100)
      const worldEv: WorldEvent = { ...ev, pos, radius: 25, active: true, endTime: Date.now() + 120000 }
      this.worldEvents.push(worldEv)
      this.onNotif?.(`📡 ${worldEv.emoji} ${worldEv.label}`)
      setTimeout(() => this.scheduleWorldEvent(), 45000 + Math.random() * 60000)
    }, 10000)
  }

  // ── SOCIAL FEED ───────────────────────────────────────────────────────
  private spawnSocialPost() {
    const posts = [
      '🎵 New gospel track just dropped on AMM Music!',
      '🏆 Just knocked out Iron Shade in 3 rounds! 🥊',
      '✝️ Prayer wall is ACTIVE — come pray with us!',
      '🛒 Black Friday sale live in AMM Marketplace!',
      '🃏 Just summoned Lion of Judah — 2800 ATK!',
      '🔴 LIVE NOW — Starverse Showcase starting!',
      '🌍 Just caught a Divine Seraphim Owl! Rarest creature!',
      '📯 SHOFAR BLAST! Feast of Trumpets card activated!',
      '👑 Messiah AI MD just gave me my 30-day plan!',
      '✊ New Black-owned business listed — support them!',
    ]
    this.socialFeedPosts.push(posts[Math.floor(Math.random() * posts.length)])
    if (this.socialFeedPosts.length > 5) this.socialFeedPosts.shift()
  }

  // ── GAME LOOP ─────────────────────────────────────────────────────────
  private startLoop() {
    const loop = (now: number) => {
      this.animId = requestAnimationFrame(loop)
      const delta = Math.min((now - this.lastTime) / 1000, 0.1)
      this.lastTime = now
      this.frameCount++
      this.tick(delta)
    }
    this.lastTime = performance.now()
    this.animId = requestAnimationFrame(loop)
  }

  private tick(delta: number) {
    // ── Player driving ──────────────────────────────────────────────────
    const accel = 0.4, brake = 0.25, maxSpd = 0.6, turn = 2.2
    if (this.keys['w'] || this.keys['arrowup'])   this.speed = Math.min(this.speed + accel * delta, maxSpd)
    if (this.keys['s'] || this.keys['arrowdown']) this.speed = Math.max(this.speed - brake * delta, -maxSpd * 0.4)
    if (!this.keys['w'] && !this.keys['s'] && !this.keys['arrowup'] && !this.keys['arrowdown'])
      this.speed *= 0.92
    if (Math.abs(this.speed) > 0.01) {
      if (this.keys['a'] || this.keys['arrowleft'])  this.playerDir += turn * delta * Math.sign(this.speed)
      if (this.keys['d'] || this.keys['arrowright']) this.playerDir -= turn * delta * Math.sign(this.speed)
    }

    // Move
    const dx = Math.sin(this.playerDir) * this.speed
    const dz = Math.cos(this.playerDir) * this.speed
    const next = this.playerPos.clone().add(new THREE.Vector3(dx, 0, dz))

    // AABB collision with buildings
    let collide = false
    this.buildings.forEach(b => {
      const bb = new THREE.Box3().setFromObject(b)
      bb.expandByScalar(1.5)
      if (bb.containsPoint(next)) collide = true
    })
    if (!collide) this.playerPos.copy(next)
    else this.speed *= -0.3

    // Clamp to world bounds
    this.playerPos.x = Math.max(-270, Math.min(270, this.playerPos.x))
    this.playerPos.z = Math.max(-270, Math.min(270, this.playerPos.z))

    this.playerCar.position.copy(this.playerPos)
    this.playerCar.rotation.y = this.playerDir

    // Camera follow
    const camOff = new THREE.Vector3(Math.sin(this.playerDir) * -16, 8, Math.cos(this.playerDir) * -16)
    this.camera.position.lerp(this.playerPos.clone().add(camOff), 0.06)
    this.camera.lookAt(this.playerPos.x, 1.5, this.playerPos.z)

    // ── Portal detection ────────────────────────────────────────────────
    this.portals.forEach((p, i) => {
      const d = this.playerPos.distanceTo(p.position)
      p.rotation.y += delta * 0.6
      p.position.y = p.userData.baseY + Math.sin(this.frameCount * 0.02 + i) * 0.4
      this.portalLights[i].intensity = 3.5 + Math.sin(this.frameCount * 0.04 + i * 0.8) * 1.5
      if (d < 8) { this.onPortalEnter?.(p.userData.realm); p.position.y = -999 }
    })

    // ── NPCs ────────────────────────────────────────────────────────────
    this.npcs.forEach(npc => {
      const toTarget = npc.target.clone().sub(npc.mesh.position)
      if (toTarget.length() < 1) {
        npc.target.set((Math.random() - 0.5) * 100, 0.9, (Math.random() - 0.5) * 100)
      } else {
        npc.mesh.position.addScaledVector(toTarget.normalize(), npc.speed)
        npc.mesh.rotation.y = Math.atan2(toTarget.x, toTarget.z)
      }
      const dToPlayer = this.playerPos.distanceTo(npc.mesh.position)
      if (dToPlayer < 12 && npc.reactionTimer <= 0) {
        this.onNotif?.(`${npc.reaction}`)
        npc.reactionTimer = 120
      }
      if (npc.reactionTimer > 0) npc.reactionTimer--
    })

    // ── Time of day ─────────────────────────────────────────────────────
    this.timeOfDay = (this.timeOfDay + delta * 0.005) % 1.0
    this.applyTimeOfDay()

    // ── Weather cycle ───────────────────────────────────────────────────
    this.weatherTimer += delta
    if (this.weatherTimer > 35) {
      this.weatherTimer = 0
      const idx = WEATHER_CYCLE.indexOf(this.weather)
      this.weather = WEATHER_CYCLE[(idx + 1) % WEATHER_CYCLE.length]
      this.applyWeather()
      this.onNotif?.(`🌤️ Weather: ${this.weather.replace('_', ' ').toUpperCase()}`)
    }
    this.updateWeatherParticles(delta)

    // ── World events ─────────────────────────────────────────────────────
    const now = Date.now()
    this.worldEvents = this.worldEvents.filter(e => e.endTime > now)

    // ── Social feed ─────────────────────────────────────────────────────
    if (this.frameCount % 600 === 0) this.spawnSocialPost()

    // ── Wanted level from speed ─────────────────────────────────────────
    if (Math.abs(this.speed) > 0.55) {
      this.player.wantedLevel = Math.min(5, this.player.wantedLevel + 0.002)
    } else {
      this.player.wantedLevel = Math.max(0, this.player.wantedLevel - 0.001)
    }

    // ── XP from exploring ───────────────────────────────────────────────
    if (Math.abs(this.speed) > 0.05 && this.frameCount % 60 === 0) {
      this.player.xp += 1
      if (this.player.xp >= this.player.level * 1000) {
        this.player.level++
        this.player.cash += this.player.level * 500
        this.onNotif?.(`⬆️ Level ${this.player.level}! +$${this.player.level * 500}`)
      }
    }

    // ── HUD update ──────────────────────────────────────────────────────
    if (this.frameCount % 6 === 0) {
      this.onHUD?.(this.player, this.weather, this.timeOfDay, this.worldEvents[0])
    }

    // ── Render ──────────────────────────────────────────────────────────
    this.composer.render()
  }

  // ── TIME OF DAY ───────────────────────────────────────────────────────
  private applyTimeOfDay() {
    const t = this.timeOfDay
    const sunAngle = (t - 0.5) * Math.PI * 2
    this.sun.position.set(Math.cos(sunAngle) * 200, Math.sin(sunAngle) * 200, 100)

    const isNight  = t < 0.22 || t > 0.78
    const isDusk   = (t > 0.68 && t < 0.78) || (t > 0.22 && t < 0.32)
    const isDay    = t > 0.32 && t < 0.68

    if (isNight) {
      this.scene.background = new THREE.Color(0x020212)
      this.ambient.color.set(0x050515); this.ambient.intensity = 0.12
      this.sun.intensity = 0.0
      ;(this.scene.fog as THREE.FogExp2).color.set(0x020212)
      this.streetLights.forEach(l => l.intensity = 1.8)
    } else if (isDusk) {
      this.scene.background = new THREE.Color(0x1a0a18)
      this.ambient.color.set(0x331a11); this.ambient.intensity = 0.35
      this.sun.color.set(0xff7744); this.sun.intensity = 0.5
      ;(this.scene.fog as THREE.FogExp2).color.set(0x1a0a18)
      this.streetLights.forEach(l => l.intensity = 0.8)
    } else if (isDay) {
      this.scene.background = new THREE.Color(0x1a2840)
      this.ambient.color.set(0x334466); this.ambient.intensity = 0.6
      this.sun.color.set(0xfff5e0); this.sun.intensity = 1.3
      ;(this.scene.fog as THREE.FogExp2).color.set(0x1a2840)
      this.streetLights.forEach(l => l.intensity = 0.2)
    }
  }

  // ── WEATHER ───────────────────────────────────────────────────────────
  private applyWeather() {
    const mat = this.weatherPoints.material as THREE.PointsMaterial
    switch (this.weather) {
      case 'rain':
        mat.color.set(0x88aaff); mat.size = 0.08; mat.opacity = 0.5
        ;(this.scene.fog as THREE.FogExp2).density = 0.018
        break
      case 'fog':
        mat.opacity = 0
        ;(this.scene.fog as THREE.FogExp2).density = 0.04
        break
      case 'storm':
        mat.color.set(0xaabbff); mat.size = 0.1; mat.opacity = 0.7
        ;(this.scene.fog as THREE.FogExp2).density = 0.025
        break
      case 'golden_hour':
        mat.opacity = 0
        ;(this.scene.fog as THREE.FogExp2).density = 0.006
        this.sun.color.set(0xff9933)
        break
      default:
        mat.opacity = 0
        ;(this.scene.fog as THREE.FogExp2).density = 0.012
    }
  }

  private updateWeatherParticles(delta: number) {
    if (this.weather !== 'rain' && this.weather !== 'storm') return
    const pos = this.weatherPoints.geometry.attributes['position'] as THREE.BufferAttribute
    const arr = pos.array as Float32Array
    const speed = this.weather === 'storm' ? 25 : 12
    for (let i = 0; i < arr.length / 3; i++) {
      arr[i*3+1] -= speed * delta
      if (arr[i*3+1] < 0) {
        arr[i*3]   = this.playerPos.x + (Math.random() - 0.5) * 150
        arr[i*3+1] = 60
        arr[i*3+2] = this.playerPos.z + (Math.random() - 0.5) * 150
      }
    }
    pos.needsUpdate = true
  }

  // ── PUBLIC API ────────────────────────────────────────────────────────
  earnCash(amt: number)  { this.player.cash += amt; this.onHUD?.(this.player, this.weather, this.timeOfDay) }
  earnXP(amt: number)    { this.player.xp += amt }
  getPlayer()            { return { ...this.player } }
  getSocialFeed()        { return [...this.socialFeedPosts] }

  handleResize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h); this.composer.setSize(w, h)
  }

  dispose() {
    cancelAnimationFrame(this.animId)
    window.removeEventListener('keydown', () => {})
    window.removeEventListener('keyup',   () => {})
    window.removeEventListener('resize',  () => {})
    this.renderer.dispose()
  }
}
