import * as THREE from 'three'

/**
 * Cheap, unlit grounding shadows for the mobile StreetVerse world.
 * No shadow maps, render targets, external assets or per-frame allocations.
 * Call updateGroundContactShadow once per frame after the actor moves.
 */
export type GroundContactShadow = {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  update: (x: number, z: number, height?: number, visible?: boolean) => void
  dispose: () => void
}

export function createGroundContactShadow(
  scene: THREE.Scene,
  options: {radius?: number; opacity?: number; y?: number} = {},
): GroundContactShadow {
  const radius = Math.max(0.2, options.radius ?? 0.85)
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('StreetVerse contact shadow: canvas 2D context unavailable')
  const gradient = ctx.createRadialGradient(32, 32, 3, 32, 32, 31)
  gradient.addColorStop(0, 'rgba(0,0,0,0.65)')
  gradient.addColorStop(0.55, 'rgba(0,0,0,0.30)')
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const geometry = new THREE.PlaneGeometry(radius * 2, radius * 2)
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    opacity: THREE.MathUtils.clamp(options.opacity ?? 0.52, 0, 1),
    polygonOffset: true,
    polygonOffsetFactor: -1,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = 'streetverse-v8-ground-contact-shadow'
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = options.y ?? 0.035
  mesh.renderOrder = 2
  mesh.frustumCulled = true
  scene.add(mesh)
  return {
    mesh,
    update(x, z, height = 0, visible = true) {
      mesh.position.x = x
      mesh.position.z = z
      mesh.visible = visible && Number.isFinite(x) && Number.isFinite(z)
      // A small falloff when the character is airborne prevents a floating dark disc.
      material.opacity = THREE.MathUtils.clamp((options.opacity ?? 0.52) / (1 + Math.max(0, height) * 0.9), 0, 1)
    },
    dispose() {
      scene.remove(mesh)
      geometry.dispose()
      material.dispose()
      texture.dispose()
    },
  }
}
