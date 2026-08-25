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

const planned=[
  ...recovered.map(([src,dst])=>({from:path.join(kenney,src),to:path.join(destRoot,dst)})),
  ...['UAL1_Standard.glb','UAL1_Standard_RM.glb'].map(file=>({from:path.join(universal,file),to:path.join(destRoot,'animations',file)})),
  {from:path.join(sourceRoot,'assets','third-party','kenney-platformer-kit','License.txt'),to:path.join(destRoot,'licenses','kenney-platformer-kit-license.txt')},
  {from:path.join(sourceRoot,'assets','third-party','universal-animation-library','Universal Animation Library[Standard]','License.txt'),to:path.join(destRoot,'licenses','universal-animation-library-license.txt')}
]

const missing=planned.filter(item=>!fs.existsSync(item.from))
if(missing.length){
  console.error(`StreetVerse recovery aborted: ${missing.length} required source file(s) are missing.`)
  for(const item of missing)console.error('missing',item.from)
  process.exit(1)
}

const stageRoot=`${destRoot}.stage-${process.pid}`
fs.rmSync(stageRoot,{recursive:true,force:true})

try{
  for(const item of planned){
    const relative=path.relative(destRoot,item.to)
    const staged=path.join(stageRoot,relative)
    fs.mkdirSync(path.dirname(staged),{recursive:true})
    fs.copyFileSync(item.from,staged)
    console.log('staged',relative)
  }

  const backupRoot=`${destRoot}.backup-${process.pid}`
  if(fs.existsSync(destRoot))fs.renameSync(destRoot,backupRoot)
  try{
    fs.renameSync(stageRoot,destRoot)
    fs.rmSync(backupRoot,{recursive:true,force:true})
  }catch(error){
    fs.rmSync(destRoot,{recursive:true,force:true})
    if(fs.existsSync(backupRoot))fs.renameSync(backupRoot,destRoot)
    throw error
  }
}catch(error){
  fs.rmSync(stageRoot,{recursive:true,force:true})
  console.error('StreetVerse recovery failed; existing recovered assets were preserved.')
  console.error(error)
  process.exit(1)
}

console.log(`StreetVerse recovery complete: ${planned.length} required files copied atomically without modifying the original archive.`)
