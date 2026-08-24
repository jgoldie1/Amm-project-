import {useMemo,useState} from 'react'
import {getAccessToken} from '../services/supabaseClient'

const API=(import.meta as any).env?.VITE_API_URL??''

type Gift={id:string;label:string;icon:string;effect:string;suggested:number}
const GIFTS:Gift[]=[
  {id:'spark',label:'Spark',icon:'✦',effect:'Cyan particle burst',suggested:0},
  {id:'heart',label:'Holo Heart',icon:'♡',effect:'Floating heart ribbons',suggested:100},
  {id:'crown',label:'Crown Drop',icon:'♛',effect:'Gold crown halo',suggested:500},
  {id:'lion',label:'Judah Lion',icon:'🦁',effect:'Lion crest flare',suggested:1000},
  {id:'galaxy',label:'Galaxy',icon:'◎',effect:'Orbit rings + stars',suggested:2500},
  {id:'supernova',label:'Supernova',icon:'☀',effect:'Full-screen radial blast',suggested:5000},
  {id:'portal',label:'World Portal',icon:'◉',effect:'StreetVerse portal gate',suggested:10000},
  {id:'judah',label:'Judah Royal',icon:'♜',effect:'Cyan + gold royal sequence',suggested:25000},
]

type Props={recipientId?:string}

export default function HoloGiftEngine({recipientId='demo-host'}:Props){
  const [gift,setGift]=useState(GIFTS[0])
  const [amount,setAmount]=useState(gift.suggested)
  const [burst,setBurst]=useState(0)
  const [message,setMessage]=useState('Visual gifts are immediate. Cash tips require provider verification before they become payable.')
  const [busy,setBusy]=useState(false)
  const rings=useMemo(()=>Array.from({length:6}),[])

  async function send(){
    setBusy(true)
    try{
      const token=await getAccessToken()
      if(!token)throw new Error('Sign in before sending a gift or tip.')
      const response=await fetch(`${API}/api/gifts/intent`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({giftType:gift.id,recipientId,amountMinor:amount})})
      const data=await response.json().catch(()=>({}))
      if(!response.ok)throw new Error(data?.error||`Gift request failed (${response.status})`)
      setBurst(v=>v+1)
      window.dispatchEvent(new CustomEvent('tryamm:holo-gift',{detail:data.intent}))
      setMessage(amount>0?`${gift.label} effect fired. Tip is pending provider verification; no withdrawable cash was created.`:`${gift.label} visual effect fired.`)
    }catch(error){setMessage(error instanceof Error?error.message:'Gift failed.')}
    finally{setBusy(false)}
  }

  return <section style={{border:'1px solid #274459',borderRadius:20,background:'#07111de8',padding:14,position:'relative',overflow:'hidden'}}>
    {burst>0&&<div key={burst} aria-hidden="true" style={{position:'absolute',inset:0,pointerEvents:'none',display:'grid',placeItems:'center',animation:'tryammGiftFade 1.8s ease-out forwards'}}>
      <div style={{position:'relative',width:220,height:220,display:'grid',placeItems:'center'}}>{rings.map((_,i)=><span key={i} style={{position:'absolute',width:45+i*28,height:45+i*28,borderRadius:'50%',border:`${Math.max(1,4-i/2)}px solid ${i%2?'#e8b944':'#4fe3ff'}`,opacity:.8-i*.08,boxShadow:`0 0 ${20+i*8}px ${i%2?'#e8b94466':'#4fe3ff66'}`,animation:`tryammGiftRing ${.55+i*.09}s ease-out forwards`}}/>)}<span style={{fontSize:72,filter:'drop-shadow(0 0 18px #4fe3ff) drop-shadow(0 0 28px #e8b944)'}}>{gift.icon}</span></div>
    </div>}
    <style>{`@keyframes tryammGiftRing{from{transform:scale(.2);opacity:1}to{transform:scale(1.5);opacity:0}}@keyframes tryammGiftFade{0%,75%{opacity:1}100%{opacity:0}}`}</style>
    <div style={{fontSize:10,letterSpacing:2.5,color:'#4fe3ff',fontWeight:950}}>HOLO GIFT + TIP ENGINE</div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))',gap:7,marginTop:10}}>{GIFTS.map(item=><button key={item.id} onClick={()=>{setGift(item);setAmount(item.suggested)}} style={{padding:9,borderRadius:12,border:`1px solid ${gift.id===item.id?'#4fe3ff':'#26394b'}`,background:gift.id===item.id?'#0c2837':'#080d14',color:'#fff',cursor:'pointer'}}><div style={{fontSize:24}}>{item.icon}</div><div style={{fontSize:10,fontWeight:900}}>{item.label}</div><div style={{fontSize:8,color:'#899aa8',marginTop:3}}>{item.effect}</div></button>)}</div>
    <label style={{display:'block',marginTop:10,fontSize:9,color:'#9aabb8'}}>OPTIONAL TIP (USD cents)</label>
    <input type="number" min={0} max={100000} value={amount} onChange={e=>setAmount(Math.max(0,Math.floor(Number(e.target.value||0))))} style={{width:'100%',boxSizing:'border-box',marginTop:4,padding:10,borderRadius:10,border:'1px solid #294052',background:'#03070d',color:'#fff'}}/>
    <button onClick={send} disabled={busy} style={{width:'100%',marginTop:10,padding:12,borderRadius:12,border:'1px solid #4fe3ff88',background:'linear-gradient(135deg,#0c3343,#2a1f35)',color:'#fff',fontWeight:950,cursor:'pointer'}}>{busy?'SENDING…':`SEND ${gift.icon} ${gift.label}${amount?` + $${(amount/100).toFixed(2)} TIP`:''}`}</button>
    <div style={{fontSize:10,lineHeight:1.5,color:'#a7b6c2',marginTop:9}}>{message}</div>
  </section>
}
