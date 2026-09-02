import * as THREE from 'three'

let installed=false
let active=false

function emit(name:string,detail:any={}){window.dispatchEvent(new CustomEvent(name,{detail}))}

function makeLabel(text:string,color='#72e5ff'){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128
  const ctx=canvas.getContext('2d')!;ctx.clearRect(0,0,512,128);ctx.fillStyle='rgba(3,11,21,.88)';ctx.fillRect(0,0,512,128)
  ctx.strokeStyle=color;ctx.lineWidth=5;ctx.strokeRect(4,4,504,120);ctx.fillStyle='#fff';ctx.font='700 34px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64)
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace
  const mat=new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false});const sprite=new THREE.Sprite(mat);sprite.scale.set(4,1,1);return sprite
}

function addPortal(scene:THREE.Scene,label:string,x:number,z:number,color:number,eventName:string){
  const g=new THREE.Group();g.position.set(x,0,z);g.userData={eventName,label,interactive:true}
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.45,.16,16,48),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1.8,metalness:.35,roughness:.2}));ring.position.y=1.8;g.add(ring)
  const core=new THREE.Mesh(new THREE.CircleGeometry(1.2,40),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.18,side:THREE.DoubleSide}));core.position.y=1.8;g.add(core)
  const tag=makeLabel(label);tag.position.set(0,3.75,0);g.add(tag);scene.add(g);return g
}

async function startImmersive(mode:'immersive-vr'|'immersive-ar'='immersive-vr'){
  if(active)return
  const xr=(navigator as any).xr
  if(!xr?.requestSession){emit('tryamm:meta-quest-error',{reason:'WebXR is unavailable in this browser.'});return}
  active=true
  let session:any=null,renderer:THREE.WebGLRenderer|null=null,root:HTMLDivElement|null=null
  try{
    session=await xr.requestSession(mode,{requiredFeatures:['local-floor'],optionalFeatures:['bounded-floor','hand-tracking']})
    root=document.createElement('div');root.id='tryamm-quest-immersive-root';Object.assign(root.style,{position:'fixed',inset:'0',zIndex:'2147483600',background:'#02050b'});document.body.appendChild(root)
    const scene=new THREE.Scene();scene.background=new THREE.Color(0x020711);scene.fog=new THREE.FogExp2(0x071322,.018)
    const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.05,250);camera.position.set(0,1.65,0)
    const rig=new THREE.Group();scene.add(rig);rig.add(camera)
    renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance',alpha:mode==='immersive-ar'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.xr.enabled=true;root.appendChild(renderer.domElement)
    await renderer.xr.setSession(session)

    scene.add(new THREE.HemisphereLight(0x9edfff,0x141021,2.4));const key=new THREE.DirectionalLight(0xffffff,2.2);key.position.set(8,14,5);scene.add(key)
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x101a26,roughness:.92,metalness:.05}));floor.rotation.x=-Math.PI/2;scene.add(floor)
    for(let i=-4;i<=4;i++)for(let j=-4;j<=4;j++){if(Math.abs(i)<2&&Math.abs(j)<2)continue;const h=2+Math.random()*8;const b=new THREE.Mesh(new THREE.BoxGeometry(3,h,3),new THREE.MeshStandardMaterial({color:0x172b3c,emissive:0x06111e,emissiveIntensity:.4,roughness:.72}));b.position.set(i*6,h/2,j*6);scene.add(b)}
    const plaza=makeLabel('STREETVERSE • QUEST IMMERSIVE');plaza.position.set(0,4,-5);scene.add(plaza)
    const portals=[
      addPortal(scene,'PROPERTYVERSE',-7,-10,0x5bf3b3,'tryamm:propertyverse-open'),
      addPortal(scene,'SPACEVERSE',0,-13,0x72e5ff,'tryamm:spaceverse-open'),
      addPortal(scene,'TIME MACHINE',7,-10,0xa68bff,'tryamm:chrono-open'),
      addPortal(scene,'OMNI CONNECT',0,10,0xff6fae,'tryamm:omni-connect-open')
    ]
    const ball=new THREE.Mesh(new THREE.SphereGeometry(.24,24,16),new THREE.MeshStandardMaterial({color:0xd86c20,roughness:.62}));ball.position.set(2,1,-4);scene.add(ball)
    const hoop=new THREE.Mesh(new THREE.TorusGeometry(.42,.055,10,28),new THREE.MeshStandardMaterial({color:0xff6a24,emissive:0xff3b00,emissiveIntensity:.8}));hoop.rotation.x=Math.PI/2;hoop.position.set(2,3.05,-7);scene.add(hoop)

    const controllers=[renderer.xr.getController(0),renderer.xr.getController(1)];controllers.forEach((c,index)=>{rig.add(c);const ray=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,-5)]),new THREE.LineBasicMaterial({color:index?0xff6fae:0x72e5ff}));c.add(ray);c.addEventListener('selectstart',()=>{const raycaster=new THREE.Raycaster();const origin=new THREE.Vector3(),dir=new THREE.Vector3(0,0,-1);c.getWorldPosition(origin);dir.applyQuaternion(c.getWorldQuaternion(new THREE.Quaternion())).normalize();raycaster.set(origin,dir);const hits=raycaster.intersectObjects(portals,true);if(hits[0]){let obj:any=hits[0].object;while(obj&&!obj.userData?.interactive)obj=obj.parent;if(obj?.userData?.eventName)emit(obj.userData.eventName,{source:'quest-immersive',label:obj.userData.label})}else{emit('tryamm:quest-action',{index,action:'select'});emit('tryamm:basketball-shot',{source:'quest-controller',controller:index})}});c.addEventListener('squeezestart',()=>emit('tryamm:quest-action',{index,action:'grip'}))})

    const hands=[renderer.xr.getHand(0),renderer.xr.getHand(1)];hands.forEach((h,index)=>{rig.add(h);h.addEventListener('pinchstart',()=>emit('tryamm:quest-hand',{index,gesture:'pinchstart'}));h.addEventListener('pinchend',()=>emit('tryamm:quest-hand',{index,gesture:'pinchend'}))})

    let snapReady=true
    const clock=new THREE.Clock()
    renderer.setAnimationLoop(()=>{
      const dt=Math.min(clock.getDelta(),.05)
      const xrCamera=renderer!.xr.getCamera(camera);const q=new THREE.Quaternion();xrCamera.getWorldQuaternion(q);const forward=new THREE.Vector3(0,0,-1).applyQuaternion(q);forward.y=0;forward.normalize();const right=new THREE.Vector3(1,0,0).applyQuaternion(q);right.y=0;right.normalize()
      for(const c of controllers){const source=(c as any).userData?.inputSource || (c as any).inputSource;const gp=source?.gamepad;if(!gp)continue;const ax=gp.axes||[];const x=Number(ax[2]??ax[0]??0),y=Number(ax[3]??ax[1]??0);if(Math.abs(y)>.18)rig.position.addScaledVector(forward,-y*dt*3.2);if(Math.abs(x)>.18)rig.position.addScaledVector(right,x*dt*3.2)}
      const sessionSources=session.inputSources||[];for(const src of sessionSources){const gp=src.gamepad;if(!gp)continue;const ax=gp.axes||[];const turn=Number(ax[2]??ax[0]??0);if(Math.abs(turn)>.75&&snapReady){rig.rotateY(-Math.sign(turn)*Math.PI/6);snapReady=false;setTimeout(()=>snapReady=true,260)}}
      ball.rotation.x+=dt*1.6;ball.rotation.z+=dt*.8
      portals.forEach((p,i)=>{p.rotation.y=Math.sin(performance.now()*.0005+i)*.08})
      renderer!.render(scene,camera)
    })
    emit('tryamm:meta-quest-session-start',{mode,source:'streetverse-quest-immersive',features:['true-webxr-session','threejs-xr-renderer','controller-rays','smooth-locomotion','snap-turn','hand-pinch-events','world-portals','basketball-action-routing']})
    emit('tryamm:accessibility-announce',{text:'StreetVerse immersive Quest mode started.'})

    const end=()=>{renderer?.setAnimationLoop(null);renderer?.dispose();root?.remove();active=false;emit('tryamm:meta-quest-session-end',{mode,source:'streetverse-quest-immersive'})}
    session.addEventListener('end',end,{once:true})
  }catch(error:any){active=false;renderer?.setAnimationLoop(null);renderer?.dispose();root?.remove();emit('tryamm:meta-quest-error',{reason:error?.message||String(error),mode})}
}

export function installStreetVerseQuestImmersiveRuntime(){
  if(installed||typeof window==='undefined')return;installed=true
  window.addEventListener('tryamm:meta-quest-request-immersive',(event:Event)=>{const mode=(event as CustomEvent<any>).detail?.mode==='immersive-ar'?'immersive-ar':'immersive-vr';void startImmersive(mode)})
  window.addEventListener('tryamm:metaquest-enter-vr',()=>void startImmersive('immersive-vr'))
  window.addEventListener('tryamm:metaquest-enter-ar',()=>void startImmersive('immersive-ar'))
  queueMicrotask(()=>emit('tryamm:quest-immersive-runtime-ready',{trueWebXR:true,rendererBinding:true,controllerInput:true,handEvents:true,locomotion:true,portals:true}))
}
