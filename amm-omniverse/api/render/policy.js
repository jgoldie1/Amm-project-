const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||0))

function choosePolicy(input={}){
  const capability=String(input.capabilityClass||'standard').slice(0,64)
  const fps=clamp(input.fps??60,0,240)
  const rtt=clamp(input.rttMs??0,0,5000)
  const mobile=Boolean(input.mobile)
  const webgpu=Boolean(input.webgpu)
  const constrained=Boolean(input.constrained)

  if(constrained){
    return {tier:'safe',renderScale:.7,targetFps:30,reconstruction:'spatial',frameGeneration:false,sceneBudget:{npc:18,vehicles:12,foliage:220,particles:80},transport:rtt>180?'edge':'local',capabilityClass:capability}
  }
  if(fps<38){
    return {tier:'balanced',renderScale:.72,targetFps:45,reconstruction:'temporal',frameGeneration:false,sceneBudget:{npc:36,vehicles:24,foliage:520,particles:180},transport:rtt>160?'edge':'local',capabilityClass:capability}
  }
  if(webgpu&&!mobile&&fps>=57){
    return {tier:'ultra',renderScale:.9,targetFps:60,reconstruction:'temporal',frameGeneration:false,sceneBudget:{npc:96,vehicles:64,foliage:1800,particles:700},transport:rtt<70?'local':'edge',capabilityClass:capability}
  }
  return {tier:fps>=52?'high':'balanced',renderScale:fps>=52?.82:.76,targetFps:fps>=52?60:50,reconstruction:'temporal',frameGeneration:false,sceneBudget:{npc:fps>=52?64:44,vehicles:fps>=52?42:30,foliage:fps>=52?1100:700,particles:fps>=52?420:260},transport:rtt>150?'edge':'local',capabilityClass:capability}
}

export default async function handler(req,res){
  if(!['GET','POST'].includes(req.method||''))return res.status(405).json({ok:false,error:'method_not_allowed'})
  const input=req.method==='POST'?(req.body||{}):(req.query||{})
  const policy=choosePolicy(input)
  res.setHeader('Cache-Control','no-store')
  res.setHeader('Content-Type','application/json')
  return res.status(200).json({ok:true,service:'TRYAMM Adaptive Render Fabric',policy,authority:{renderOnly:true,gameplay:false,economy:false},privacy:{storesRawTelemetry:false},version:'arf-v1'})
}
