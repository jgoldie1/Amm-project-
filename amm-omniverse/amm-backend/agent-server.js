require('dotenv').config()
const express=require('express')
const cors=require('cors')
const {createClient}=require('@supabase/supabase-js')
const {createAgentRouter}=require('./routes/agents')

if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_KEY) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY are required')

const app=express()
const supabase=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_KEY)
app.disable('x-powered-by')
app.use(cors({origin:['https://tryamm.online','https://www.tryamm.online','https://amm-omniverse.vercel.app','http://localhost:5173',process.env.FRONTEND_URL].filter(Boolean),credentials:true}))
app.use(express.json({limit:'1mb'}))
app.get('/health',(_req,res)=>res.json({ok:true,service:'quantumverse-agents',openaiConfigured:Boolean(process.env.OPENAI_API_KEY),ts:Date.now()}))
app.use('/api/agents',createAgentRouter({supabase}))

const PORT=process.env.AGENT_PORT||process.env.PORT||4100
app.listen(PORT,()=>console.log(`Quantumverse agent service running on ${PORT}`))
