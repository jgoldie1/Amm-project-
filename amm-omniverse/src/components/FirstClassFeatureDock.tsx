const items=[
  {label:'🎮 STREETVERSE',path:'/streetverse',tone:'#4FE3FF'},
  {label:'🎬 CREATE REEL',path:'/reel-creator',tone:'#E8B944'},
  {label:'🛡 JACOBIE VISION',path:'/jacobie-vision',tone:'#53ddff'},
  {label:'✦ HOLOGPT',path:'/hologpt',tone:'#b89cff'},
] as const

export default function FirstClassFeatureDock(){
  const open=(path:string)=>{
    const navigate=(window as any).__tryammNavigate
    if(typeof navigate==='function')navigate(path)
    else window.location.hash=path
  }

  return <nav aria-label="TRYAMM quick launch" style={{position:'fixed',left:'50%',bottom:12,transform:'translateX(-50%)',zIndex:9500,width:'min(96vw,760px)',display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:6,padding:6,border:'1px solid #314358',borderRadius:18,background:'#030812e8',backdropFilter:'blur(14px)',boxShadow:'0 14px 40px #000a'}}>
    {items.map(item=><button key={item.path} type="button" onClick={()=>open(item.path)} style={{minHeight:48,border:`1px solid ${item.tone}66`,borderRadius:12,background:'#09131f',color:item.tone,fontSize:'clamp(8px,2.2vw,10px)',fontWeight:950,letterSpacing:.5,cursor:'pointer',padding:'7px 5px'}}>{item.label}</button>)}
  </nav>
}
