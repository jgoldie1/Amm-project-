require('dotenv').config()
const app=require('./agent-app')
const PORT=process.env.AGENT_PORT||process.env.PORT||4100
app.listen(PORT,()=>console.log(`Quantumverse agent service running on ${PORT}`))
