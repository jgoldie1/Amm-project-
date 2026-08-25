import fs from 'node:fs'
import path from 'node:path'

const sourceRoot=process.env.TRYAMM_ASSET_SOURCE_ROOT
if(!sourceRoot){
  console.error('Set TRYAMM_ASSET_SOURCE_ROOT to the extracted tryamm-assets-staging directory.')
  process.exit(1)
}

const repoRoot=path.resolve(import.meta.dirname,'..')
const destRoot=path.join(repoRoot,'public','assets','streetverse','recovered')
const kenney=path.join(sourceRoot,'assets','third-party','kenney-platformer-kit','Models','GLB format')
const universal=path.join(sourceRoot,'assets','third-party','universal-animation-library','Universal Animation Library[Standard]','Unreal-Godot')

const recovered=[
  ['character-oobi.glb','characters/player-recovered.glb'],
  ['character-oodi.glb','npcs/citizen-a-recovered.glb'],
  ['coin-gold.glb','props/coin-gold.glb'],
  ['crate.glb','props/crate.glb'],
  ['door-open.glb','props/door-open.glb'],
  ['flag.glb','props/finish-flag.glb'],
  ['flowers.glb','environment/flowers.glb'],
  ['grass.glb','environment/grass.glb'],
  ['rocks.glb','environment/rocks.glb'],
  ['tree.glb','environment/tree.glb'],
  ['tree-pine.glb','environment/tree-pine.glb'],
  ['key.glb','props/key.glb'],
  ['chest.glb','props/chest.glb'],
  ['platform.glb','props/platform.glb']
]

function copy(from,to){
  if(!fs.existsSync(from)){
    console.warn('missing',from)
    return false
  }
  fs.mkdirSync(path.dirname(to),{recursive:true})
  fs.copyFileSync(from,to)
  console.log('recovered',path.relative(repoRoot,to))
  return true
}

let count=0
for(const [src,dst] of recovered){
  if(copy(path.join(kenney,src),path.join(destRoot,dst)))count++
}
for(const file of ['UAL1_Standard.glb','UAL1_Standard_RM.glb']){
  if(copy(path.join(universal,file),path.join(destRoot,'animations',file)))count++
}

const licenseSource=path.join(sourceRoot,'assets','third-party','kenney-platformer-kit','License.txt')
copy(licenseSource,path.join(destRoot,'licenses','kenney-platformer-kit-license.txt'))
const animationLicense=path.join(sourceRoot,'assets','third-party','universal-animation-library','Universal Animation Library[Standard]','License.txt')
copy(animationLicense,path.join(destRoot,'licenses','universal-animation-library-license.txt'))

console.log(`StreetVerse recovery complete: ${count} production files copied without modifying the original archive.`)
