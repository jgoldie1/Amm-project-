import {useEffect,useRef} from 'react'
import {computeTransitMotion} from '../runtime/StreetVerseTransitMotionAndMedia'
import type {StreetVerseTransitMode} from '../runtime/StreetVerseTransitDisplayRuntime'
type Props={mode:StreetVerseTransitMode;speedMps:number;occupancy:number;reduceMotion?:boolean}
/** Responsive canvas animation. Scenery scrolls independently from seated riders. */
export default function StreetVerseTransitMotionPreview({mode,speedMps,occupancy,reduceMotion=false}:Props){
 const canvas=useRef<HTMLCanvasElement|null>(null)
 useEffect(()=>{
  const node=canvas.current;if(!node)return
  const ctx=node.getContext('2d');if(!ctx)return
  let raf=0
  const start=performance.now()
  const render=(now:number)=>{
   const w=node.width,h=node.height,t=(now-start)/1000
   const speed=reduceMotion?0:speedMps
   const m=computeTransitMotion(mode,t,speed)
   ctx.clearRect(0,0,w,h)
   const gradient=ctx.createLinearGradient(0,0,0,h)
   gradient.addColorStop(0,mode==='plane'?'#264d79':'#183248')
   gradient.addColorStop(1,'#091924')
   ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h)
   // Side window: moving skyline/buildings/terminal markers.
   ctx.fillStyle='#274858';ctx.fillRect(0,24,w,85)
   const step=mode==='airport-walkway'?66:58
   const shift=(m.travelM*4)%step
   for(let i=-1;i<Math.ceil(w/step)+2;i++){
    const x=i*step-shift
    const y=mode==='plane'?48:36+((i*13)%3)*9
    ctx.fillStyle=mode==='plane'?'#9bd1e8':'#426779'
    ctx.fillRect(x,y,36,75)
    ctx.fillStyle='#b8ddeb'
    for(let r=0;r<3;r++)ctx.fillRect(x+7,y+10+r*18,8,8)
   }
   ctx.save();ctx.translate(w/2,h/2);ctx.rotate(m.swayDeg*Math.PI/180);ctx.translate(-w/2,-h/2)
   ctx.fillStyle='#0b2332';ctx.fillRect(0,114,w,h-114)
   ctx.fillStyle='#547184';ctx.fillRect(20,123,w-40,9)
   const count=Math.min(6,Math.max(0,occupancy))
   const cols=3
   for(let n=0;n<count;n++){
    const x=52+(n%cols)*(w-104)/Math.max(1,cols-1)
    const y=151+Math.floor(n/cols)*52+m.heaveM*28
    ctx.fillStyle='#29495e';ctx.fillRect(x-20,y+9,40,38)
    ctx.fillStyle=['#8f6347','#b58058','#6d4939'][n%3]
    ctx.beginPath();ctx.ellipse(x+Math.sin(t*.8+n)*1.1,y-1,11,13,0,0,Math.PI*2);ctx.fill()
    ctx.fillStyle=['#2e769a','#825e8f','#53856c'][n%3]
    ctx.fillRect(x-15,y+12,30,28)
    ctx.strokeStyle='#b9cad7';ctx.lineWidth=3
    ctx.beginPath();ctx.moveTo(x-12,y+18);ctx.lineTo(x+12,y+38);ctx.stroke()
   }
   ctx.restore()
   ctx.fillStyle='#a9e9ff';ctx.font='bold 11px sans-serif';ctx.fillText('STREETVERSE • SIMULATED MOTION',12,17)
   ctx.fillStyle='#c6d5dc';ctx.font='11px sans-serif';ctx.fillText(speed>0?'TRAVELING • SCENERY MOVING':'STOPPED • PASSENGERS SEATED',12,h-10)
   if(!reduceMotion)raf=requestAnimationFrame(render)
  }
  raf=requestAnimationFrame(render)
  return()=>cancelAnimationFrame(raf)
 },[mode,speedMps,occupancy,reduceMotion])
 return <canvas ref={canvas} width={520} height={270} aria-label="Animated illustrative view of moving scenery and seated passengers. Not real 3D vehicle gameplay." style={{display:'block',width:'100%',height:'auto',borderRadius:12,border:'1px solid #47758c',marginTop:12}}/>
}
