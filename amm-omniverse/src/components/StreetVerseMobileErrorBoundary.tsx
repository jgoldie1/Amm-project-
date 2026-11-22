import {Component,type ErrorInfo,type ReactNode} from 'react'

type Props={children:ReactNode;name?:string}
type State={failed:boolean;attempts:number}
export default class StreetVerseMobileErrorBoundary extends Component<Props,State>{
 state:State={failed:false,attempts:0}
 static getDerivedStateFromError():Partial<State>{return{failed:true}}
 componentDidCatch(error:Error,info:ErrorInfo){
  // Keep diagnostic details local only; never upload stack traces or gameplay data.
  const message=String(error?.message||'unknown').slice(0,180)
  console.error('[TRYAMM mobile renderer] recovered from UI crash',message,info.componentStack?.slice(0,300))
  try{window.dispatchEvent(new CustomEvent('tryamm:streetverse-renderer-failed',{detail:{source:'react-boundary',reason:'ui-render-error',message}}))}catch{}
 }
 private recover=()=>{
  try{localStorage.setItem('tryamm:streetverse:graphics-mode','lite')}catch{}
  this.setState(s=>({failed:false,attempts:s.attempts+1}))
 }
 render(){
  if(!this.state.failed)return <div key={this.state.attempts}>{this.props.children}</div>
  return <section role="alert" aria-label="StreetVerse mobile recovery" style={{minHeight:'100dvh',padding:'max(24px,env(safe-area-inset-top)) 18px 32px',display:'grid',alignContent:'center',gap:16,background:'#091c2b',color:'#fff',fontFamily:'system-ui,sans-serif'}}>
   <h1 style={{fontSize:27,margin:0}}>StreetVerse needs a graphics restart</h1>
   <p style={{fontSize:17,lineHeight:1.6}}>The mobile player or 3D world encountered an error. Your saved account and game files have not been intentionally deleted. Reopen with lower graphics settings.</p>
   <button style={{minHeight:64,borderRadius:14,fontSize:19,fontWeight:800,background:'#267456',color:'#fff',border:'2px solid #c1ebda'}} onClick={this.recover}>ONE PUSH · RESTART LIGHTWEIGHT GAME</button>
   <button style={{minHeight:58,borderRadius:14,fontSize:16,background:'#263e56',color:'#fff',border:'1px solid #8db1c8'}} onClick={()=>window.location.reload()}>RELOAD STREETVERSE PAGE</button>
   <button style={{minHeight:62,borderRadius:14,fontSize:17,fontWeight:800,background:'#58461c',color:'#fff',border:'1px solid #e1ca83'}} onClick={()=>window.location.assign('/streetverse?safe=1')}>OPEN SAFE MOBILE GAME (NO WEBGL)</button>
   <p style={{fontSize:13}}>If the lightweight mode still fails, share your phone model and the message shown here. The full production GLB character and device-specific GPU support are separate acceptance checks.</p>
  </section>
 }
}
