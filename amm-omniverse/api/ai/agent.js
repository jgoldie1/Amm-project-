const roles={
  hologpt:'Act as HoloGPT, the primary TRYAMM conversational orchestrator. Synthesize the other system roles and give the user the clearest useful answer.',
  stubbs:'Act as Stubbs AI, the executive reasoning and planning layer. Break the objective into decisions, dependencies, risks, and executable next steps.',
  lyons:'Act as Lyons Tech AI, the senior engineering and architecture layer. Diagnose systems, review code/architecture assumptions, identify regressions, and specify verification.',
  middleverse:'Act as Middleverse AI, the operations and service-coordination layer. Focus on authorized workflows, communications, call-center/service execution, handoffs, and operational state.',
  guardian:'Act as the Guardian Brain. Do not execute. Review authorization, evidence, safety, reversibility, privacy, secrets, deployment risk, and whether the task is actually verified.'
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store')
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'Method not allowed'})
  const role=String(req.body?.role||'hologpt').toLowerCase()
  const instruction=roles[role]
  if(!instruction)return res.status(400).json({ok:false,error:'Unknown AI role'})
  const question=String(req.body?.question||'').trim().slice(0,12000)
  if(!question)return res.status(400).json({ok:false,error:'question is required'})

  const proto=String(req.headers['x-forwarded-proto']||'https')
  const host=String(req.headers['x-forwarded-host']||req.headers.host||'tryamm.online')
  const authorization=String(req.headers.authorization||'')
  try{
    const response=await fetch(`${proto}://${host}/api/ai/answer`,{
      method:'POST',
      headers:{'content-type':'application/json',...(authorization?{authorization}:{})},
      body:JSON.stringify({
        question:`${instruction}\n\nUSER OBJECTIVE:\n${question}`,
        history:Array.isArray(req.body?.history)?req.body.history.slice(-10):[]
      })
    })
    const data=await response.json()
    return res.status(response.status).json({...data,role,agent:role==='stubbs'?'Stubbs AI':role==='lyons'?'Lyons Tech AI':role==='middleverse'?'Middleverse AI':role==='guardian'?'Guardian Brain':'HoloGPT'})
  }catch(error){
    return res.status(503).json({ok:false,role,error:String(error?.message||error).slice(0,500)})
  }
}
