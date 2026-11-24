import * as THREE from 'three'

type Recorder = {startRaw:(ready:(blob:Blob)=>void)=>boolean;stop:()=>void}

export function installGreenvilleTour(mount:HTMLElement, recorder:Recorder){
 const points=(values:number[][])=>new THREE.CatmullRomCurve3(values.map(([x,y,z])=>new THREE.Vector3(x,y,z)))
 const route=points([[32,35,88],[21,12,72],[42,9,67],[48,22,44],[40,23,12],[29,10,-4],[24,28,-23]])
 const sights=points([[16,1,45],[11,1,58],[34,1,58],[23,6,33],[18,6,12],[18,2,1],[18,5,12]])
 const camera=new THREE.PerspectiveCamera(58,1,.1,320)
 const target=new THREE.Vector3()
 const panel=document.createElement('div')
 panel.style.cssText='position:absolute;top:max(8px,env(safe-area-inset-top));right:8px;z-index:80;display:flex;gap:4px;align-items:center;max-width:94%;flex-wrap:wrap;pointer-events:auto'
 const button=document.createElement('button')
 button.type='button'
 button.textContent='Film campus tour'
 const save=document.createElement('a')
 save.textContent='Save original'
 save.hidden=true
 for(const control of [button,save])control.style.cssText='box-sizing:border-box;min-height:44px;padding:10px;color:white;background:#143353;border:2px solid white;border-radius:8px;font:600 15px system-ui'
 const status=document.createElement('span')
 status.setAttribute('role','status')
 status.style.cssText='background:#143353;color:white;font:14px system-ui'
 panel.append(button,save,status);mount.append(panel)
 let started:number|null=null
 let recording=false
 let disposed=false
 let url=''
 const finish=()=>{
   started=null
   if(recording){recorder.stop();recording=false}
   button.textContent='Film campus tour'
 }
 button.onclick=()=>{
   if(started!==null){finish();return}
   started=performance.now()
   recording=recorder.startRaw(blob=>{
     recording=false
     if(disposed||!blob.size)return
     if(url)URL.revokeObjectURL(url)
     url=URL.createObjectURL(blob)
     save.href=url;save.download='Greenville-campus-tour.'+(blob.type.includes('mp4')?'mp4':'webm')
     save.hidden=false;status.textContent=''
   })
   button.textContent='Exit tour'
   status.textContent=recording?'Recording':'Preview only'
 }
 return {
   cameraFor(now:number,gameCamera:THREE.PerspectiveCamera){
     if(started===null)return gameCamera
     const t=Math.max(0,(now-started)/20000)
     if(t>=1){finish();return gameCamera}
     if(camera.aspect!==gameCamera.aspect){camera.aspect=gameCamera.aspect;camera.updateProjectionMatrix()}
     route.getPointAt(t,camera.position);sights.getPointAt(t,target);camera.lookAt(target)
     return camera
   },
   dispose(){
     disposed=true;finish();panel.remove()
     if(url)URL.revokeObjectURL(url)
   }
 }
}
