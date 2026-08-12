const crypto = require('crypto')

const DEFAULT_MODEL = process.env.OPENAI_AGENT_MODEL || 'gpt-5.6-terra'
const DEEP_MODEL = process.env.OPENAI_AGENT_DEEP_MODEL || 'gpt-5.6-sol'
const LOW_COST_MODEL = process.env.OPENAI_AGENT_LOW_COST_MODEL || 'gpt-5.6-luna'

const AGENTS = {
  coding: { model: DEEP_MODEL, instructions: 'Inspect existing code before proposing changes. Prefer integration over duplication. Produce patches, tests, rollback notes, and evidence. Never deploy directly to production.' },
  qa: { model: DEFAULT_MODEL, instructions: 'Design and evaluate builds, API tests, browser smoke tests, regression tests, accessibility checks, and age-lane tests. Separate written code from verified code.' },
  security: { model: DEEP_MODEL, instructions: 'Perform defensive review of authentication, authorization, RLS, secrets, injection, payments, youth privacy, rate limits, dependencies, and deployment risk. Escalate critical findings.' },
  deployment: { model: DEFAULT_MODEL, instructions: 'Prepare preview and staging deployment plans, inspect CI and health, verify environment requirements, and produce rollback plans. Production changes require explicit human approval.' },
  treasury: { model: DEFAULT_MODEL, instructions: 'Analyze ledger data, bills, fees, obligations and reserves conservatively. This agent is analysis-only and cannot execute payments, transfers, investments, or trades.' },
  world_builder: { model: DEFAULT_MODEL, instructions: 'Create original world, mission, NPC, business, education and simulation specifications compatible with the Quantum Force runtime. Do not copy protected game assets or stories.' },
  media: { model: DEFAULT_MODEL, instructions: 'Assist with original HoloDrama and Starverse scripts, production schedules, localization, rights metadata, advertising inventory and creator economics. Human producers make hiring and casting decisions.' },
  education: { model: DEFAULT_MODEL, instructions: 'Support Pre-K through lifelong learning, trades and higher education. Clearly distinguish internal certificates from accredited degrees and retain human educators for safeguarding.' },
  logistics: { model: LOW_COST_MODEL, instructions: 'Assist with simulated dispatch, routing, inventory, workforce training and operational planning.' },
  support: { model: LOW_COST_MODEL, instructions: 'Handle routine platform help, accessibility guidance and escalation. Never request passwords or secret API keys.' },
  monitoring: { model: LOW_COST_MODEL, instructions: 'Summarize errors, health signals, unusual costs and service degradation. Escalate critical incidents and recommend rollback when supported by evidence.' },
}

function chooseAgent(task='') {
  const t=task.toLowerCase()
  if (/security|auth|rls|secret|vulnerab|fraud/.test(t)) return 'security'
  if (/deploy|vercel|release|ci|staging/.test(t)) return 'deployment'
  if (/test|qa|regression|typecheck/.test(t)) return 'qa'
  if (/treasury|ledger|bill|tax|refund|royalt|revenue|reserve/.test(t)) return 'treasury'
  if (/world|mission|npc|game|quantumverse|level|city/.test(t)) return 'world_builder'
  if (/movie|drama|starverse|casting|production|episode|advertis/.test(t)) return 'media'
  if (/university|school|course|teacher|student|education/.test(t)) return 'education'
  if (/logistic|dispatch|warehouse|shipment|route/.test(t)) return 'logistics'
  if (/monitor|incident|error|uptime|latency/.test(t)) return 'monitoring'
  if (/support|customer|help desk|call center/.test(t)) return 'support'
  return 'coding'
}

function requiresApproval(task='') {
  return /production deploy|delete production|change payout|change bank|disable guardian|disable age|disable safety/i.test(task)
}

async function callResponsesAPI({model,instructions,input,maxOutputTokens}){
  const r=await fetch('https://api.openai.com/v1/responses',{
    method:'POST',
    headers:{
      'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type':'application/json',
    },
    body:JSON.stringify({model,instructions,input,max_output_tokens:maxOutputTokens}),
  })
  const body=await r.json().catch(()=>({}))
  if(!r.ok) throw new Error(body?.error?.message || `OpenAI request failed (${r.status})`)
  const output=(body.output||[]).flatMap(item=>item.content||[]).filter(c=>c.type==='output_text').map(c=>c.text||'').join('\n')
  return {id:body.id||null,outputText:output}
}

class QuantumAgentRuntime {
  constructor({supabase}) { this.supabase=supabase }
  isConfigured(){ return Boolean(process.env.OPENAI_API_KEY) }
  async log(row){ if(this.supabase){ try{ await this.supabase.from('quantum_agent_runs').insert(row) }catch(_){} } }
  async execute({userId,task,requestedAgent,context={},approved=false}){
    if(!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured on the server')
    if(!task||typeof task!=='string') throw new Error('task is required')
    const agentKey=requestedAgent&&AGENTS[requestedAgent]?requestedAgent:chooseAgent(task)
    const agent=AGENTS[agentKey]
    const runId=crypto.randomUUID()
    if(requiresApproval(task)&&!approved){
      await this.log({id:runId,user_id:userId,agent_key:agentKey,task,status:'awaiting_approval',input_context:context})
      return {runId,agent:agentKey,status:'awaiting_approval',approvalRequired:true}
    }
    await this.log({id:runId,user_id:userId,agent_key:agentKey,task,status:'running',input_context:context})
    try{
      const response=await callResponsesAPI({
        model:agent.model,
        instructions:`You are a supervised specialist inside TRYAMM Quantumverse. Reuse existing systems, minimize cost, require evidence, and never claim an action occurred unless verified. ${agent.instructions}`,
        input:`TASK:\n${task}\n\nCONTEXT:\n${JSON.stringify(context).slice(0,20000)}`,
        maxOutputTokens:Number(process.env.OPENAI_AGENT_MAX_OUTPUT_TOKENS||5000),
      })
      const output=response.outputText||''
      if(this.supabase) await this.supabase.from('quantum_agent_runs').update({status:'completed',output_text:output,model:agent.model,response_id:response.id,completed_at:new Date().toISOString()}).eq('id',runId)
      return {runId,agent:agentKey,model:agent.model,status:'completed',approvalRequired:false,output,responseId:response.id}
    }catch(error){
      if(this.supabase) await this.supabase.from('quantum_agent_runs').update({status:'failed',error_text:String(error.message||error).slice(0,2000),completed_at:new Date().toISOString()}).eq('id',runId)
      throw error
    }
  }
}

module.exports={QuantumAgentRuntime,AGENTS,chooseAgent,requiresApproval}
