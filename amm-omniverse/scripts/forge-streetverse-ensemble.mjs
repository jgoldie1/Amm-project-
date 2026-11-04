/**
 * Offline 3D scene-stand-in forge for StreetVerse.
 * Reads existing game-owned registries; exports valid, tiny glTF 2.0 GLBs.
 * Generates NEUTRAL, ORIGINAL STYLIZED avatars, not photographic reproductions.
 * No network, paid APIs, private image access or celebrity face/voice cloning.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {fileURLToPath} from 'node:url'
const here=path.dirname(fileURLToPath(import.meta.url))
const app=path.resolve(here,'..')
const output=path.resolve(app,'..','artifacts','streetverse-omni-cast')
const read=p=>fs.readFileSync(path.join(app,p),'utf8')
const family=read('src/game/characters/meetTheStubbsFamilyFriends.ts')
const global=read('src/data/StreetVerseGlobalCharacterRegistry.ts')
const original=read('src/data/StreetVerseOmniCastProduction.ts')
const namedPerformers=read('src/data/StreetVerseOriginalMusicCast.ts')
const setApartPerformers=read('src/data/StreetVerseSetApartMusicNetwork.ts')
const legacy=read('src/data/ChicagoMusicLegacyMissionRegistry.ts')
const matches=(text,re)=>[...text.matchAll(re)].map(m=>({id:m[1],name:m[2]}))
const familyPeople=matches(family,/id:'([^']+)',displayName:'([^']+)'/g)
const globalPeople=matches(global,/id:'([^']+)',displayName:'([^']+)'/g)
const artists=matches(legacy,/id:'([^']+)',displayName:'([^']+)'/g)
const legacyOriginalPerformers=[...original.matchAll(/\{id:"([^"]+)",name:"([^"]+)",genre:"([^"]+)"\}/g)].map(m=>({id:m[1],name:m[2],genre:m[3]}))
const aliases=original.match(/const GENRE_ALIASES:Record<string,string>=\{([\s\S]*?)\n\}/)
if(!aliases)throw Error('Missing original-performer genre aliases')
const genreAliases=Object.fromEntries([...aliases[1].matchAll(/'([^']+)':'([^']+)'/g)].map(m=>[m[1],m[2]]))
const namedOriginalPerformers=[...namedPerformers.matchAll(/\{id:"([^"]+)",displayName:"([^"]+)",genre:"([^"]+)"/g)]
 .map(m=>({id:m[1],name:m[2],genre:genreAliases[m[3]]||m[3]}))
const setApartOriginalPerformers=[...setApartPerformers.matchAll(/\{id:"([^"]+)",name:"([^"]+)",genre:"([^"]+)"/g)]
 .map(m=>({id:m[1],name:m[2],genre:m[3]}))
const seededPerformers=[...legacyOriginalPerformers,...namedOriginalPerformers,...setApartOriginalPerformers]
const genreMatch=original.match(/export const STREETVERSE_MUSIC_GENRES=\[(.*?)\] as const/)
if(!genreMatch)throw Error('Missing genre production lanes')
const genres=JSON.parse('['+genreMatch[1]+']')
if(new Set(genres).size!==genres.length)throw Error('Duplicate genre lanes')
if(new Set(seededPerformers.map(a=>a.id)).size!==seededPerformers.length)throw Error('Duplicate original musician IDs')
const seededGenreNames=new Set(seededPerformers.map(person=>person.genre))
for(const person of seededPerformers)if(!genres.includes(person.genre))throw Error('Unregistered music genre '+person.genre)
const extraStagePerformers=genres.filter(genre=>!seededGenreNames.has(genre)).map((genre,index)=>({
 id:'original-genre-'+genre.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
 name:'Fictional '+genre+' Stage Creator '+String(index+1).padStart(2,'0'),
 genre,
}))
const performerPeople=[...seededPerformers,...extraStagePerformers]
if(new Set(performerPeople.map(person=>person.id)).size!==performerPeople.length)throw Error('Duplicate output performer IDs')
if(new Set(performerPeople.map(person=>person.genre)).size!==genres.length)throw Error('Not one original musician per genre')
if(familyPeople.length<29||globalPeople.length<23||artists.length<33||performerPeople.length<12||genres.length<40)throw Error('Source registry incomplete')
const characters=[
 ...familyPeople.filter(x=>x.id!=='bj-stubbs').map(x=>({...x,lane:'family',rights:'neutral-stand-in-only'})),
 ...Array.from({length:10},(_,i)=>({id:'social-creator-'+String(i+1).padStart(2,'0'),name:'Social Creator '+String(i+1).padStart(2,'0'),lane:'family',rights:'neutral-stand-in-only'})),
 ...globalPeople.map(x=>({...x,lane:'global',rights:'original-fictional'})),
 ...performerPeople.map(x=>({...x,lane:'original-performer',rights:'original-fictional'})),
]
const seen=new Set()
for(const a of characters){a.file='SV_STYLIZED_'+a.lane.toUpperCase().replaceAll('-','_')+'_'+a.id.replace(/[^a-z0-9_-]/gi,'_')+'.glb';if(seen.has(a.file))throw Error('Duplicate output '+a.file);seen.add(a.file)}
function hash(value){let h=2166136261;for(const c of value){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function rgb(hex){return [(hex>>16&255)/255,(hex>>8&255)/255,(hex&255)/255,1]}
const palette=[0x315d9c,0x6f438f,0x148676,0xb76e3a,0x634d9d,0x9c465b,0x3c7b65,0x8d783b,0x364f82,0xa65375]
function forge(entry){
 const primary=palette[hash(entry.id)%palette.length],secondary=palette[hash(entry.id+'pants')%palette.length]
 const skin=entry.lane==='family'?0x9299a6:0xb4adb2 // neutral mannequin shades, never observed skin tones
 const mats=[skin,primary,secondary,0x1a2440,0x363b45,0xc2b48d].map((color,i)=>({
  name:['NeutralUnmatchedFace','OriginalOutfit','OriginalPants','OriginalShoes','OriginalHairOrHat','Accent'][i],
  pbrMetallicRoughness:{baseColorFactor:rgb(color),metallicFactor:0,roughnessFactor:0.92},doubleSided:true
 }))
 const chunks=[],views=[],accessors=[];let offset=0
 function append(data,target){
  const b=Buffer.isBuffer(data)?data:Buffer.from(data.buffer,data.byteOffset,data.byteLength)
  const padded=(4-offset%4)%4;if(padded){chunks.push(Buffer.alloc(padded));offset+=padded}
  const index=views.length;views.push({buffer:0,byteOffset:offset,byteLength:b.byteLength,...(target?{target}:{})})
  chunks.push(b);offset+=b.byteLength;return index
 }
 function accessor(data,componentType,type,count,min,max,target){
  const v=append(data,target),idx=accessors.length
  accessors.push({bufferView:v,componentType,count,type,...(min?{min}:{}),...(max?{max}:{})})
  return idx
 }
 // Six faces with independent normals for basic mobile-friendly lighting.
 const faces=[
  [[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5],[0,0,1]],
  [[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5],[0,0,-1]],
  [[.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5],[1,0,0]],
  [[-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5],[-1,0,0]],
  [[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5],[0,1,0]],
  [[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5],[0,-1,0]]
 ]
 const positions=[],normals=[],indices=[]
 faces.forEach((face,f)=>{for(let i=0;i<4;i++){positions.push(...face[i]);normals.push(...face[4])}const base=f*4;indices.push(base,base+1,base+2,base,base+2,base+3)})
 const pos=accessor(new Float32Array(positions),5126,'VEC3',24,[-.5,-.5,-.5],[.5,.5,.5],34962)
 const norm=accessor(new Float32Array(normals),5126,'VEC3',24,null,null,34962)
 const ind=accessor(new Uint16Array(indices),5123,'SCALAR',36,[0],[23],34963)
 const meshes=mats.map((m,i)=>({name:m.name,primitives:[{attributes:{POSITION:pos,NORMAL:norm},indices:ind,material:i,mode:4}]}))
 const nodes=[{name:'StreetVerse_Original_Stylized_Avatar',children:[],extras:{neutralStandIn:true,sourceLane:entry.lane,notRecognizableLikeness:true}}]
 function addNode(name,translation,scale,mesh,parent=0){const i=nodes.length;nodes.push({name,translation,scale,...(mesh!==undefined?{mesh}:{}),children:[]});nodes[parent].children.push(i);return i}
 const torso=addNode('Torso',[0,1.18,0],[.52,.65,.28],1)
 const head=addNode('Head',[0,1.69,0],[.28,.32,.26],0)
 const hair=addNode('Stylized_Hair',[0,1.94,0],[.33,.11,.29],4)
 const leftArm=addNode('Left_Arm_Pivot',[-.37,1.47,0],[1,1,1],undefined)
 const rightArm=addNode('Right_Arm_Pivot',[.37,1.47,0],[1,1,1],undefined)
 const leftLeg=addNode('Left_Leg_Pivot',[-.14,.82,0],[1,1,1],undefined)
 const rightLeg=addNode('Right_Leg_Pivot',[.14,.82,0],[1,1,1],undefined)
 addNode('Left_Arm',[0,-.32,0],[.19,.63,.22],0,leftArm)
 addNode('Right_Arm',[0,-.32,0],[.19,.63,.22],0,rightArm)
 addNode('Left_Leg',[0,-.39,0],[.23,.78,.26],2,leftLeg)
 addNode('Right_Leg',[0,-.39,0],[.23,.78,.26],2,rightLeg)
 addNode('Left_Shoe',[0,-.78,.075],[.29,.18,.42],3,leftLeg)
 addNode('Right_Shoe',[0,-.78,.075],[.29,.18,.42],3,rightLeg)
 const t=[0,.25,.5,.75,1],time=accessor(new Float32Array(t),5126,'SCALAR',5,[0],[1])
 function quatX(angle){return [Math.sin(angle/2),0,0,Math.cos(angle/2)]}
 function quatY(angle){return [0,Math.sin(angle/2),0,Math.cos(angle/2)]}
 function animation(name,lane){
  const channels=[],samplers=[]
  for(const [node,amplitudes,axis] of lane){
   const samples=amplitudes.flatMap(angle=>axis==='Y'?quatY(angle):quatX(angle))
   const out=accessor(new Float32Array(samples),5126,'VEC4',5)
   const sampler=samplers.length;samplers.push({input:time,output:out,interpolation:'LINEAR'})
   channels.push({sampler,target:{node,path:'rotation'}})
  }
  return {name,samplers,channels}
 }
 const animations=[
  animation('SV_Idle',[[head,[0,.03,0,-.03,0],'Y']]),
  animation('SV_Walk',[
   [leftArm,[0,.4,0,-.4,0],'X'],[rightArm,[0,-.4,0,.4,0],'X'],
   [leftLeg,[0,-.3,0,.3,0],'X'],[rightLeg,[0,.3,0,-.3,0],'X']
  ]),
  animation('SV_Run',[
   [leftArm,[0,.78,0,-.78,0],'X'],[rightArm,[0,-.78,0,.78,0],'X'],
   [leftLeg,[0,-.62,0,.62,0],'X'],[rightLeg,[0,.62,0,-.62,0],'X']
  ]),
  animation('SV_Driving_Arms',[
   [leftArm,[-.65,-.72,-.68,-.63,-.65],'X'],
   [rightArm,[-.65,-.63,-.68,-.72,-.65],'X']
  ]),
  animation('SV_Talk',[[head,[0,.035,0,-.035,0],'Y']]),
  animation('SV_Nod',[[head,[0,.15,0,-.12,0],'X']]),
  animation('SV_Dance',[
   [leftArm,[0,-.9,.2,-.9,0],'X'],[rightArm,[0,.9,-.2,.9,0],'X'],
   [head,[0,.18,0,-.18,0],'Y']
  ])
 ]
 const binary=Buffer.concat(chunks)
 const gltf={asset:{version:'2.0',generator:'TRYAMM StreetVerse free offline stylized ensemble forge'},scene:0,
  scenes:[{nodes:[0]}],nodes,meshes,materials:mats,bufferViews:views,accessors,buffers:[{byteLength:binary.length}],
  animations,extras:{characterId:entry.id,displayName:entry.name,lane:entry.lane,rights:entry.rights,sourceGenerator:'TRYAMM-Original-Character-Studio',originalGeometry:true,noExternalCharacterAssets:true,likenessCertified:false,prototype:true}}
 let json=Buffer.from(JSON.stringify(gltf)),jsonPad=(4-json.length%4)%4
 json=Buffer.concat([json,Buffer.alloc(jsonPad,0x20)])
 const binPad=(4-binary.length%4)%4,fullBin=Buffer.concat([binary,Buffer.alloc(binPad)])
 const glb=Buffer.alloc(12+8+json.length+8+fullBin.length)
 glb.writeUInt32LE(0x46546c67,0);glb.writeUInt32LE(2,4);glb.writeUInt32LE(glb.length,8)
 glb.writeUInt32LE(json.length,12);glb.writeUInt32LE(0x4e4f534a,16);json.copy(glb,20)
 const at=20+json.length
 glb.writeUInt32LE(fullBin.length,at);glb.writeUInt32LE(0x004e4942,at+4);fullBin.copy(glb,at+8)
 return glb
}
fs.mkdirSync(output,{recursive:true})
const entries=[]
for(const character of characters){
 const b=forge(character),hashSum=crypto.createHash('sha256').update(b).digest('hex')
 fs.writeFileSync(path.join(output,character.file),b)
 entries.push({...character,bytes:b.length,sha256:hashSum,meshCount:6,animations:['SV_Idle','SV_Walk','SV_Run','SV_Driving_Arms','SV_Talk','SV_Nod','SV_Dance'],visualVerified:false,identityMatched:false,sourceLicense:'TRYAMM original procedural geometry (verify any later imported inputs)'})
}
const manifest={schema:'tryamm.streetverse.original-ensemble-stubs.v1',createdAt:new Date().toISOString(),
  program:'Meet the Stubbs / Global Cast / Original Music Stars',
  policy:'Original, neutral, genre-inspired fictional geometry. Not a clone of any artist or other real person.',
  playablePrototypeModels:entries.length,registeredFamily:familyPeople.length+10,globalFictional:globalPeople.length,
  originalPerformers:performerPeople.length,originalNamedMusicians:namedOriginalPerformers.length,setApartNamedMusicians:setApartOriginalPerformers.length,artistHistoryNames:artists.map(x=>x.name),
  artistHistoryModelsGenerated:0,musicGenreLanes:genres,musicRecordingsGenerated:0,
  likenessCertification:'none',ownerApprovedBJSeparate:true,originalOutputOwnership:'TRYAMM original generated source and geometry; imported model, photo or music rights require separate proof',entries}
fs.writeFileSync(path.join(output,'ensemble-manifest.json'),JSON.stringify(manifest,null,2))
fs.writeFileSync(path.join(output,'START_HERE.txt'),'StreetVerse original stylized cast stand-ins. BJ V15 is separate. No artist clone/voice/recording included. Not device certified. Use GLTFLoader; queue review before publishing. \n')
console.log(JSON.stringify({generated:entries.length,bytes:entries.reduce((s,e)=>s+e.bytes,0),family:manifest.registeredFamily,global:manifest.globalFictional,fictionalMusicians:manifest.originalPerformers,genreLanes:genres.length,artistLikenessModels:0,artifactPath:output}))
