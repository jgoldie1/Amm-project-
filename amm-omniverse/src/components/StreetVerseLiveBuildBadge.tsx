export default function StreetVerseLiveBuildBadge(){
  return <div aria-label="StreetVerse live build status" style={{position:'fixed',left:12,top:'max(12px,env(safe-area-inset-top))',zIndex:16999,maxWidth:'min(92vw,420px)',padding:'10px 12px',borderRadius:14,background:'linear-gradient(135deg,rgba(2,18,28,.94),rgba(17,7,28,.94))',border:'1px solid rgba(98,232,255,.65)',boxShadow:'0 10px 34px rgba(0,0,0,.55),0 0 22px rgba(79,227,255,.12)',color:'#fff',fontFamily:'system-ui,sans-serif',pointerEvents:'none'}}>
    <div style={{display:'flex',alignItems:'center',gap:7,fontSize:10,fontWeight:950,letterSpacing:1.4,color:'#82efff'}}><span style={{width:8,height:8,borderRadius:99,background:'#72ffb0',boxShadow:'0 0 12px #72ffb0'}}/> STREETVERSE V5 • LIVE BUILD</div>
    <div style={{marginTop:5,fontSize:11,fontWeight:850,lineHeight:1.45}}>NATIVE POWERSPORTS • POLICE/EMS/FIRE • RESPONDER NPCs • PURSUITS • ROADBLOCKS • SERVER XP</div>
    <div style={{marginTop:3,fontSize:9,color:'#9db6c2'}}>Cache shell refreshed • main-world runtime active</div>
  </div>
}
