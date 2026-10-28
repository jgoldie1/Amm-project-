/**
 * StreetVerse realistic asset staging loader.
 * This is additive and never replaces the existing city scene on failure.
 * Ship licensed .glb/.gltf assets under public/streetverse/real-assets/.
 */
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export type RealAssetId = 'circle-park-courtyard' | 'circle-park-gate' | 'bj-avatar' | 'starter-sedan' | 'taylor-street'
export type RealAssetEntry = {
  id: RealAssetId
  url: string
  kind: 'environment' | 'character' | 'vehicle'
  license: string
  source: string
  position: [number, number, number]
  scale: number
  maximumBytes: number
}
export type RealAssetReport = { loaded: string[]; skipped: string[]; failed: string[] }
const ALLOWED_PREFIX = '/streetverse/real-assets/'
export const realAssetManifest: RealAssetEntry[] = [
  { id:'circle-park-courtyard',url:'/streetverse/real-assets/circle-park-courtyard.glb',kind:'environment',license:'PENDING',source:'',position:[0,0,0],scale:1,maximumBytes:12_000_000 },
  { id:'circle-park-gate',url:'/streetverse/real-assets/circle-park-gate.glb',kind:'environment',license:'PENDING',source:'',position:[8,0,-6],scale:1,maximumBytes:4_000_000 },
  { id:'bj-avatar',url:'/streetverse/real-assets/bj-avatar.glb',kind:'character',license:'PENDING',source:'',position:[0,0,4],scale:1,maximumBytes:8_000_000 },
  { id:'starter-sedan',url:'/streetverse/real-assets/starter-sedan.glb',kind:'vehicle',license:'PENDING',source:'',position:[5,0,3],scale:1,maximumBytes:8_000_000 },
  { id:'taylor-street',url:'/streetverse/real-assets/taylor-street.glb',kind:'environment',license:'PENDING',source:'',position:[0,0,-35],scale:1,maximumBytes:12_000_000 },
]
export function isApprovedRealAsset(asset: RealAssetEntry): boolean {
  return asset.url.startsWith(ALLOWED_PREFIX)
    && !asset.url.includes('..')
    && /\.glb$/i.test(asset.url)
    && !!asset.source.trim()
    && !['PENDING','UNKNOWN','UNLICENSED'].includes(asset.license.trim().toUpperCase())
    && Number.isFinite(asset.scale) && asset.scale > 0
    && asset.maximumBytes > 0 && asset.maximumBytes <= 15_000_000
    && asset.position.every(Number.isFinite)
}
/**
 * Activates only reviewed manifest entries. Asset loading failure leaves the
 * existing Three.js scene intact, with no changes to navigation, mission or save state.
 * Caller owns the returned group and must remove it during route cleanup.
 */
export async function stageRealAssets(
  scene: THREE.Scene,
  entries: RealAssetEntry[] = realAssetManifest,
  options: { signal?: AbortSignal; enabled?: boolean } = {},
): Promise<{ group: THREE.Group; report: RealAssetReport; dispose: () => void }> {
  const group = new THREE.Group()
  group.name = 'streetverse-reviewed-real-assets'
  const report: RealAssetReport = {loaded:[],skipped:[],failed:[]}
  const loader = new GLTFLoader()
  if (options.enabled !== true) return {group,report,dispose:()=>{}}
  scene.add(group)
  for (const asset of entries) {
    if (options.signal?.aborted) break
    if (!isApprovedRealAsset(asset)) { report.skipped.push(asset.id); continue }
    try {
      // HEAD verifies missing/oversize assets without forcing a large mobile download.
      const response = await fetch(asset.url,{method:'HEAD',signal:options.signal,cache:'no-store'})
      const size = Number(response.headers.get('content-length'))
      if (!response.ok || !Number.isFinite(size) || size <= 0 || size > asset.maximumBytes) {
        report.skipped.push(asset.id); continue
      }
      const gltf = await loader.loadAsync(asset.url)
      if (options.signal?.aborted) break
      const object = gltf.scene
      object.name = 'real-asset:' + asset.id
      object.position.set(...asset.position)
      object.scale.setScalar(asset.scale)
      object.traverse(child=>{
        if (child instanceof THREE.Mesh) {
          child.castShadow = asset.kind !== 'environment'
          child.receiveShadow = true
        }
      })
      group.add(object)
      report.loaded.push(asset.id)
    } catch {
      if (options.signal?.aborted) break
      report.failed.push(asset.id)
    }
  }
  return {group,report,dispose:()=>{
    group.removeFromParent()
    group.traverse(object=>{
      if (!(object instanceof THREE.Mesh)) return
      object.geometry?.dispose()
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      for (const material of materials) {
        if (!material) continue
        for (const key of ['map','normalMap','roughnessMap','metalnessMap','emissiveMap','aoMap'] as const) {
          const texture = (material as THREE.MeshStandardMaterial)[key]
          if (texture instanceof THREE.Texture) texture.dispose()
        }
        material.dispose()
      }
    })
  }}
}
