import {useEffect,useRef,useState} from 'react'

type P={onClose:()=>void}
type Actor={x:number;y:number;vx:number;vy:number;kind:'car'|'person'|'animal'}
const W=900,H=620

export default function StreetVerseSafeWorld({onClose}:P){
  const canvasRef=useRef<HTMLCanvasElement|null>(null)
  const keys=useRef({u:false,d:false,l:false,r:false})
  const player=useRef({x:W/2,y:H/2})
  const [message,setMessage]=useState('Mobile Safe Mode active — StreetVerse is playable while full 3D recovers.')

  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return
    const ctx=canvas.getContext('2d');if(!ctx){setMessage('StreetVerse renderer unavailable on this browser.');return}
    const actors:Actor[]=[]
    for(let i=0;i<12;i++)actors.push({x:60+i*68,y:118+(i%3)*145,vx:i%2?0.7:-0.6,vy:0,kind:'car'})
    for(let i=0;i<18;i++)actors.push({x:45+(i*83)%800,y:55+(i*97)%520,vx:0,vy:0,kind:'person'})
    for(let i=0;i<8;i++)actors.push({x:90+(i*101)%760,y:80+(i*71)%470,vx:0,vy:0,kind:'animal'})
    let raf=0,last=performance.now()
    const draw=()=>{
      const now=performance.now(),dt=Math.min(2,(now-last)/16.67);last=now
      const p=player.current,s=3.5*dt
      if(keys.current.u)p.y-=s;if(keys.current.d)p.y+=s;if(keys.current.l)p.x-=s;if(keys.current.r)p.x+=s
      p.x=Math.max(18,Math.min(W-18,p.x));p.y=Math.max(18,Math.min(H-18,p.y))
      ctx.fillStyle='#07111d';ctx.fillRect(0,0,W,H)
      ctx.fillStyle='#18232e';for(let y=80;y<H;y+=145)ctx.fillRect(0,y,W,42);for(let x=110;x<W;x+=180)ctx.fillRect(x,0,46,H)
      ctx.fillStyle='#223b55';for(let x=18;x<W;x+=180)for(let y=14;y<H;y+=145){ctx.fillRect(x,y,76,54);ctx.fillStyle='#54c7ff';for(let wx=x+9;wx<x+70;wx+=16)for(let wy=y+9;wy<y+48;wy+=15)ctx.fillRect(wx,wy,6,6);ctx.fillStyle='#223b55'}
      for(let i=0;i<28;i++){const x=42+(i*113)%840,y=48+(i*79)%540;ctx.fillStyle='#385f34';ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#6b4931';ctx.fillRect(x-2,y+8,4,11)}
      actors.forEach((a,i)=>{if(a.kind==='car'){a.x+=a.vx*dt;if(a.x<-30)a.x=W+30;if(a.x>W+30)a.x=-30;ctx.fillStyle=i%2?'#4fe3ff':'#ff6fae';ctx.fillRect(a.x-11,a.y-6,22,12);ctx.fillStyle='#101820';ctx.fillRect(a.x-5,a.y-4,10,8)}else if(a.kind==='person'){ctx.fillStyle='#f0b38c';ctx.beginPath();ctx.arc(a.x,a.y-5,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#a68bff';ctx.fillRect(a.x-4,a.y,8,13)}else{ctx.fillStyle='#c9935d';ctx.fillRect(a.x-7,a.y-3,14,8);ctx.fillRect(a.x+5,a.y-7,6,6)}})
      ctx.fillStyle='#ffd75c';ctx.beginPath();ctx.arc(p.x,p.y,11,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#4fe3ff';ctx.lineWidth=3;ctx.stroke()
      ctx.fillStyle='rgba(2,7,14,.78)';ctx.fillRect(10,10,310,62);ctx.fillStyle='#fff';ctx.font='bold 14px system-ui';ctx.fillText('STREETVERSE • CHICAGO LIVING WORLD',20,32);ctx.font='12px system-ui';ctx.fillStyle='#b9d4e8';ctx.fillText('Cars • buildings • trees • people • animals',20,52)
      raf=requestAnimationFrame(draw)
    }
    const down=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(k==='w'||k==='arrowup')keys.current.u=true;if(k==='s'||k==='arrowdown')keys.current.d=true;if(k==='a'||k==='arrowleft')keys.current.l=true;if(k==='d'||k==='arrowright')keys.current.r=true}
    const up=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(k==='w'||k==='arrowup')keys.current.u=false;if(k==='s'||k==='arrowdown')keys.current.d=false;if(k==='a'||k==='arrowleft')keys.current.l=false;if(k==='d'||k==='arrowright')keys.current.r=false}
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);draw()
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)}
  },[])

  const set=(k:keyof typeof keys.current,v:boolean)=>()=>{keys.current[k]=v}
  return <div style={{position:'fixed',inset:0,zIndex:17000,background:'#02050a',color:'#fff',display:'grid',gridTemplateRows:'auto 1fr auto',fontFamily:'system-ui,sans-serif'}}>
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background:'#07101b',borderBottom:'1px solid #27455c'}}><div><b>StreetVerse</b><div style={{fontSize:11,color:'#7fe6ff'}}>{message}</div></div><button onClick={onClose} aria-label="Close StreetVerse" style={{width:44,height:44,borderRadius:12,border:'1px solid #38576f',background:'#101c28',color:'#fff',fontSize:24}}>×</button></header>
    <main style={{minHeight:0,overflow:'hidden',display:'grid',placeItems:'center'}}><canvas ref={canvasRef} width={W} height={H} style={{width:'100%',height:'100%',objectFit:'contain',touchAction:'none'}}/></main>
    <footer style={{display:'grid',gridTemplateColumns:'56px 56px 56px',justifyContent:'center',gap:6,padding:8,background:'#07101b'}}><span/><Pad t="▲" d={set('u',true)} u={set('u',false)}/><span/><Pad t="◀" d={set('l',true)} u={set('l',false)}/><Pad t="▼" d={set('d',true)} u={set('d',false)}/><Pad t="▶" d={set('r',true)} u={set('r',false)}/></footer>
  </div>
}
function Pad({t,d,u}:{t:string;d:()=>void;u:()=>void}){return <button onPointerDown={d} onPointerUp={u} onPointerCancel={u} onPointerLeave={u} style={{height:46,borderRadius:12,border:'1px solid #45667d',background:'#102031',color:'#fff',fontSize:18,fontWeight:900,touchAction:'none'}}>{t}</button>}
