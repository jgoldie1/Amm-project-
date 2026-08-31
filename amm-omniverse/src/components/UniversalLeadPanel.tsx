import type { ReactNode } from 'react'

export type LeadAction={label:string;href?:string;onClick?:()=>void;primary?:boolean}

export default function UniversalLeadPanel({eyebrow='TAKE THE NEXT STEP',title,copy,actions,children}:{eyebrow?:string;title:string;copy:string;actions:LeadAction[];children?:ReactNode}){
  return <section style={{marginTop:30,padding:'clamp(20px,4vw,34px)',border:'1px solid #31516a',borderRadius:24,background:'linear-gradient(145deg,#07131eee,#0e0b14ee)',boxShadow:'0 20px 70px #0008'}}>
    <div style={{fontSize:10,color:'#4FE3FF',fontWeight:950,letterSpacing:3}}>{eyebrow}</div>
    <h2 style={{fontSize:'clamp(28px,5vw,48px)',lineHeight:1.04,margin:'8px 0 10px'}}>{title}</h2>
    <p style={{maxWidth:760,color:'#a9b9c9',fontSize:14,lineHeight:1.65,margin:0}}>{copy}</p>
    <div style={{display:'flex',gap:9,flexWrap:'wrap',marginTop:18}}>{actions.map(a=>a.href?<a key={a.label} href={a.href} style={{...btn,...(a.primary?primaryBtn:{})}}>{a.label}</a>:<button key={a.label} type="button" onClick={a.onClick} style={{...btn,...(a.primary?primaryBtn:{})}}>{a.label}</button>)}</div>
    {children?<div style={{marginTop:16}}>{children}</div>:null}
  </section>
}
const btn:React.CSSProperties={display:'inline-flex',alignItems:'center',justifyContent:'center',minHeight:44,padding:'11px 15px',border:'1px solid #3b5368',borderRadius:12,background:'#0d1722',color:'#fff',fontWeight:900,textDecoration:'none',cursor:'pointer'}
const primaryBtn:React.CSSProperties={border:0,background:'linear-gradient(135deg,#4FE3FF,#78FFB4)',color:'#041016'}
