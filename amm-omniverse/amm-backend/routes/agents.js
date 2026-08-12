const express=require('express')
const {QuantumAgentRuntime,AGENTS}=require('../agents/quantum-agent-runtime')

function bearer(req){ const h=String(req.headers.authorization||''); return h.startsWith('Bearer ')?h.slice(7):null }

function createAgentRouter({supabase}){
  const router=express.Router()
  const runtime=new QuantumAgentRuntime({supabase})

  async function requireUser(req,res,next){
    const token=bearer(req)
    if(!token) return res.status(401).json({error:'Authentication required'})
    const {data,error}=await supabase.auth.getUser(token)
    if(error||!data?.user) return res.status(401).json({error:'Invalid session'})
    req.user=data.user; next()
  }

  router.get('/health',(_req,res)=>res.json({ok:true,configured:runtime.isConfigured(),agents:Object.keys(AGENTS)}))

  router.post('/run',requireUser,async(req,res)=>{
    try{
      const task=String(req.body?.task||'').trim()
      if(!task) return res.status(400).json({error:'task is required'})
      if(task.length>12000) return res.status(413).json({error:'task is too large'})
      const result=await runtime.execute({
        userId:req.user.id,
        task,
        requestedAgent:req.body?.agent,
        context:req.body?.context||{},
        approved:Boolean(req.body?.approved),
      })
      res.status(result.status==='awaiting_approval'?202:200).json(result)
    }catch(err){ res.status(500).json({error:String(err.message||err)}) }
  })

  router.get('/runs',requireUser,async(req,res)=>{
    const {data,error}=await supabase.from('quantum_agent_runs').select('id,agent_key,task,status,model,response_id,created_at,completed_at,error_text').eq('user_id',req.user.id).order('created_at',{ascending:false}).limit(50)
    if(error) return res.status(500).json({error:'Could not load agent runs'})
    res.json({runs:data||[]})
  })

  return router
}
module.exports={createAgentRouter}
