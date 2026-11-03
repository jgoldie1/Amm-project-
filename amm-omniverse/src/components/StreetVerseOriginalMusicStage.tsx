import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {STREETVERSE_ORIGINAL_GENRE_LINEUP,STREETVERSE_MUSIC_GENRES} from '../data/StreetVerseOmniCastProduction'
import {loadStreetVerseMeshyBJHero,type StreetVerseMeshyBJHeroHandle} from '../runtime/StreetVerseMeshyBJHeroRuntime'

const PER_PAGE=8
type Performer={id:string;name:string;genre:string;object:THREE.Group}
type Controls={up:boolean;down:boolean;left:boolean;right:boolean}
const palette=[0x66d7ff,0xffcd73,0xc5a2ff,0x6ae6a1,0xf29cbb,0x9fc8ff,0xf1ad78,0xcce278]
function styleMaterial(color:number){return new THREE.MeshStandardMaterial({color,roughness:.78,metalness:.04})}
function makeFictionalPerformer(name:string,genre:string,id:string,index:number){
 const root=new THREE.Group();root.name='streetverse-original-performer-'+id
 root.userData={id,name,genre,fictional:true,noCelebrityLikeness:true,originalMusicOnly:true}
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.32,.92,3,6),styleMaterial(palette[index%palette.length]));torso.position.y=1.30;root.add(torso)
 const head=new THREE.Mesh(new THREE.SphereGeometry(.29,8,6),styleMaterial([0x8e6450,0xad805d,0xbe9c7b,0x916951][index%4]));head.position.y=2.31;root.add(head)
 for(const side of [-1,1]){
  const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.1,.55,3,5),styleMaterial(palette[index%palette.length]));arm.position.set(side*.44,1.43,0);root.add(arm)
  const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.58,3,5),styleMaterial(0x26334e));leg.position.set(side*.18,.52,0);root.add(leg)
 }
 const marker=new THREE.Mesh(new THREE.RingGeometry(.48,.65,14),new THREE.MeshBasicMaterial({color:palette[index%palette.length],side:THREE.DoubleSide}));marker.rotation.x=-Math.PI/2;marker.position.y=.025;root.add(marker)
 return root
}
function disposeMeshes(root:THREE.Object3D){
 root.traverse(object=>{if(!(object instanceof THREE.Mesh))return;object.geometry.dispose();for(const material of Array.isArray(object.material)?object.material:[object.material])material.dispose()})
}
export default function StreetVerseOriginalMusicStage({onClose}:{onClose:()=>void}){
 const mount=useRef<HTMLDivElement|null>(null)
 const player=useRef<THREE.Group|null>(null)
 const stageGroup=useRef<THREE.Group|null>(null)
 const stagePerformers=useRef<Performer[]>([])
 const controls=useRef<Controls>({up:false,down:false,left:false,right:false})
 const [page,setPage]=useState(0)
 const [notice,setNotice]=useState('Visit an original performer, then choose an original or cleared music project.')
 const [bjStatus,setBJStatus]=useState('Loading owner-approved BJ V15, with the existing owned-model fallback.')
 const [activeGenre,setActiveGenre]=useState<string|null>(null)
 const [renderStatus,setRenderStatus]=useState('Initializing WebGL stage')
 const maxPage=Math.ceil(STREETVERSE_ORIGINAL_GENRE_LINEUP.length/PER_PAGE)-1
 useEffect(()=>{
  const root=mount.current;if(!root)return
  let renderer:THREE.WebGLRenderer
  try{renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'low-power'})}catch{
   setRenderStatus('3D unavailable on this browser. The accessible genre cards remain available.');return
  }
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x0a1223)
  const camera=new THREE.PerspectiveCamera(58,1,.1,200)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.25));renderer.outputColorSpace=THREE.SRGBColorSpace
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15
  root.appendChild(renderer.domElement)
  scene.add(new THREE.HemisphereLight(0xbedfff,0x363045,2))
  const sun=new THREE.DirectionalLight(0xffeccd,2.5);sun.position.set(12,18,15);scene.add(sun)
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(70,58),styleMaterial(0x193a36));ground.rotation.x=-Math.PI/2;scene.add(ground)
  const platform=new THREE.Mesh(new THREE.BoxGeometry(51,.7,8),styleMaterial(0x34395b));platform.position.set(0,.30,-6);scene.add(platform)
  const characterRoot=new THREE.Group();characterRoot.position.set(0,0,11);scene.add(characterRoot);player.current=characterRoot
  const bjFallback=new THREE.Group();bjFallback.name='bj-owner-character-placeholder'
  const chest=new THREE.Mesh(new THREE.CapsuleGeometry(.42,1.12,4,8),styleMaterial(0x4b2e94));chest.position.y=1.45;bjFallback.add(chest)
  const head=new THREE.Mesh(new THREE.SphereGeometry(.35,12,9),styleMaterial(0x966b50));head.position.y=2.56;bjFallback.add(head)
  characterRoot.add(bjFallback)
  const performersGroup=new THREE.Group();scene.add(performersGroup);stageGroup.current=performersGroup
  let cancelled=false,avatar:StreetVerseMeshyBJHeroHandle|null=null
  void loadStreetVerseMeshyBJHero().then(loaded=>{
   if(!loaded)return setBJStatus('The original BJ model was unavailable. Safe placeholder remains.')
   if(cancelled){loaded.dispose();return}
   avatar=loaded;characterRoot.add(loaded.object);bjFallback.visible=false
   const version=loaded.object.userData.bjV15RealGlbPreview?'V15':loaded.object.userData.bjOwnedArticulatedV3?'owned animated V3':'existing compatible fallback'
   setBJStatus('BJ '+version+' loaded into the music-stage scene • '+loaded.clips.length+' clips')
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-music-stage-bj-mounted',{detail:{version,clipCount:loaded.clips.length}}))
  }).catch(()=>setBJStatus('BJ model could not load. Safe placeholder remains.'))
  const down=(e:KeyboardEvent)=>{if(['INPUT','TEXTAREA','SELECT'].includes((e.target as HTMLElement)?.tagName||''))return
   const key=e.key.toLowerCase()
   if(['w','arrowup','s','arrowdown','a','arrowleft','d','arrowright'].includes(key))e.preventDefault()
   if(key==='e'){e.preventDefault();interact()}
   if(['w','arrowup'].includes(key))controls.current.up=true
   if(['s','arrowdown'].includes(key))controls.current.down=true
   if(['a','arrowleft'].includes(key))controls.current.left=true
   if(['d','arrowright'].includes(key))controls.current.right=true
  }
  const up=(e:KeyboardEvent)=>{const k=e.key.toLowerCase()
   if(['w','arrowup'].includes(k))controls.current.up=false
   if(['s','arrowdown'].includes(k))controls.current.down=false
   if(['a','arrowleft'].includes(k))controls.current.left=false
   if(['d','arrowright'].includes(k))controls.current.right=false
  }
  window.addEventListener('keydown',down);window.addEventListener('keyup',up)
  const resize=()=>{const width=Math.max(320,root.clientWidth),height=Math.max(320,root.clientHeight);camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false)}
  window.addEventListener('resize',resize);resize();setRenderStatus('3D original-performer stage active')
  let raf=0,previous=performance.now();const clock=()=>{const now=performance.now(),dt=Math.min(.05,Math.max(0,(now-previous)/1000));previous=now
   const input=controls.current,dx=Number(input.right)-Number(input.left),dz=Number(input.down)-Number(input.up),moving=Math.abs(dx)+Math.abs(dz)>0
   if(moving){const length=Math.hypot(dx,dz)||1;characterRoot.position.x=THREE.MathUtils.clamp(characterRoot.position.x+dx/length*6.8*dt,-31,31);characterRoot.position.z=THREE.MathUtils.clamp(characterRoot.position.z+dz/length*6.8*dt,-22,24);characterRoot.rotation.y=Math.atan2(dx,dz)}
   avatar?.tick(now,{moving,running:false,seated:false})
   const target=new THREE.Vector3(characterRoot.position.x+2,7,characterRoot.position.z+14)
   camera.position.lerp(target,Math.min(1,5*dt));camera.lookAt(characterRoot.position.x,1.6,characterRoot.position.z-5)
   renderer.render(scene,camera);raf=window.requestAnimationFrame(clock)
  };raf=window.requestAnimationFrame(clock)
  return()=>{cancelled=true;controls.current={up:false,down:false,left:false,right:false};window.cancelAnimationFrame(raf);window.removeEventListener('resize',resize);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)
   avatar?.dispose();player.current=null;stageGroup.current=null;stagePerformers.current=[]
   scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();for(const material of Array.isArray(o.material)?o.material:[o.material])material.dispose()}})
   renderer.dispose();renderer.domElement.remove()
  }
 },[])
 useEffect(()=>{
  const group=stageGroup.current;if(!group)return
  for(const actor of [...group.children]){group.remove(actor);disposeMeshes(actor)}
  stagePerformers.current=[]
  STREETVERSE_ORIGINAL_GENRE_LINEUP.slice(page*PER_PAGE,(page+1)*PER_PAGE).forEach((artist,index)=>{
   const object=makeFictionalPerformer(artist.name,artist.genre,artist.id,index+page*PER_PAGE)
   object.position.set(-21+(index%PER_PAGE)*6,0,-6)
   group.add(object)
   stagePerformers.current.push({id:artist.id,name:artist.name,genre:artist.genre,object})
  })
 },[page])
 const interact=()=>{
  const root=player.current
  if(!root){setNotice('3D scene is not ready. Choose an artist card instead.');return}
  const nearest=stagePerformers.current.map(a=>({actor:a,d:root.position.distanceTo(a.object.position)})).sort((a,b)=>a.d-b.d)[0]
  if(!nearest||nearest.d>9){setNotice('Approach one of the eight current stage artists or select a genre card.');return}
  const {actor}=nearest;setActiveGenre(actor.genre)
  setNotice(actor.name+' • '+actor.genre+': begin an original beat, verse, song, studio scene, Reel or Holo stage show.')
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-original-music-stage',{detail:{
   performer:actor.name,performerId:actor.id,genre:actor.genre,fictional:true,
   musicRights:'original-or-cleared-only',celebrityImpersonation:false,
  }}))
 }
 const selectArtist=(index:number)=>{
  const artist=STREETVERSE_ORIGINAL_GENRE_LINEUP[index]
  if(!artist)return
  setPage(Math.floor(index/PER_PAGE));setActiveGenre(artist.genre)
  player.current?.position.set(-21+(index%PER_PAGE)*6,0,0)
  setNotice('Now visiting '+artist.name+' • '+artist.genre+'. Press INTERACT to choose a new original music scene.')
 }
 const press=(key:keyof Controls,value:boolean)=>{controls.current[key]=value}
 return <div role="dialog" aria-modal="true" aria-label="StreetVerse original music stage" style={{position:'fixed',inset:0,zIndex:17050,background:'#080d1d',color:'#f6f8ff',overflowY:'auto',fontFamily:'system-ui,sans-serif',padding:12}}>
  <div style={{maxWidth:1120,margin:'0 auto'}}>
   <header style={{display:'flex',gap:12,justifyContent:'space-between',alignItems:'center',flexWrap:'wrap'}}>
    <div><div style={{fontSize:11,color:'#af9bea',fontWeight:900}}>STREETVERSE ORIGINAL CREATIVE EXPRESSION</div><h2 style={{margin:'5px 0'}}>MusicVerse • All {STREETVERSE_MUSIC_GENRES.length} Genres</h2><div style={{fontSize:12,color:'#b8c2dc'}}>Meet 8 original fictional performers per scene • BJ Stubbs is the player</div></div>
    <button onClick={onClose} style={buttonStyle}>Return to Meet the Stubbs</button>
   </header>
   <p style={{fontSize:12,color:'#b8c2dc'}}>{renderStatus} • {bjStatus}</p>
   <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr)',gap:10}}>
    <div style={{position:'relative',border:'1px solid #4b5c86',borderRadius:16,overflow:'hidden',background:'#131d2f'}}>
     <div ref={mount} style={{height:'min(55vh,520px)',minHeight:330}}/>
     <div style={{position:'absolute',left:8,bottom:8,display:'grid',gridTemplateColumns:'repeat(3,48px)',gap:3}}>
      <span/><Pad label="▲" down={()=>press('up',true)} up={()=>press('up',false)}/><span/>
      <Pad label="◀" down={()=>press('left',true)} up={()=>press('left',false)}/>
      <Pad label="▼" down={()=>press('down',true)} up={()=>press('down',false)}/>
      <Pad label="▶" down={()=>press('right',true)} up={()=>press('right',false)}/>
     </div>
     <button onClick={interact} style={{...buttonStyle,position:'absolute',right:8,bottom:8,minHeight:46}}>INTERACT / E</button>
    </div>
    <div role="status" aria-live="polite" style={{padding:12,border:'1px solid #485b7c',background:'#121d34',borderRadius:12}}>{notice}</div>
    <div style={{display:'flex',gap:9,alignItems:'center',flexWrap:'wrap'}}>
     <button disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))} style={buttonStyle}>Previous performers</button>
     <strong>Stage {page+1} of {maxPage+1}</strong>
     <button disabled={page>=maxPage} onClick={()=>setPage(p=>Math.min(maxPage,p+1))} style={buttonStyle}>Next performers</button>
     <button style={buttonStyle} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'streetverse-original-music-stage',genre:activeGenre||'hip-hop',title:'Original StreetVerse Studio Project',originalMusicOnly:true}}))}>Open Creator / 64-Track Studio</button>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:7,maxHeight:275,overflowY:'auto'}}>
     {STREETVERSE_ORIGINAL_GENRE_LINEUP.map((artist,i)=><button key={artist.id} onClick={()=>selectArtist(i)} style={{...buttonStyle,textAlign:'left',fontSize:11,background:activeGenre===artist.genre?'#44336c':'#15243a'}}><strong>{artist.name}</strong><div style={{marginTop:4,color:'#cbd5ee'}}>{artist.genre}</div></button>)}
    </div>
    <p style={{fontSize:11,color:'#acb9d5'}}>All these performers are fictionalized original characters. This is a working prototype stage, not 46 verified photorealistic GLBs, licensed songs, celebrity voice clones, artist endorsements or a public deployment. Family and real-artist history remain in the existing roster and mission systems.</p>
   </div>
  </div>
 </div>
}
const buttonStyle:React.CSSProperties={minHeight:42,padding:'9px 12px',color:'#fff',fontWeight:850,border:'1px solid #6e7caa',borderRadius:10,background:'#213251',cursor:'pointer'}
function Pad({label,down,up}:{label:string;down:()=>void;up:()=>void}){return <button style={{...buttonStyle,width:48,height:48,touchAction:'none',fontSize:19}} onPointerDown={e=>{e.preventDefault();down()}} onPointerUp={up} onPointerCancel={up} onPointerLeave={up}>{label}</button>}
