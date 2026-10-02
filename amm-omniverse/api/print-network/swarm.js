import {json} from '../_lib/supabase-admin.js'
import {requireUser} from '../_lib/security.js'
import {createPrintSwarm,printSwarmDashboard,acceptPrintSwarmOffer,PRINT_SWARM_POLICY} from '../_lib/print-swarm.js'

export default async function handler(req,res){
  const user=await requireUser(req,res)
  if(!user)return
  try{
    if(req.method==='GET'){
      const dashboard=await printSwarmDashboard(user)
      return json(res,200,{ok:true,schema:'tryamm.print-swarm.v1',policy:PRINT_SWARM_POLICY,...dashboard})
    }
    if(req.method==='POST'){
      const body=req.body&&typeof req.body==='object'?req.body:{}
      const action=String(body.action||'')
      if(action==='create'){
        const result=await createPrintSwarm(user,body)
        return json(res,201,{ok:true,action,...result})
      }
      if(action==='accept'){
        const assignment=await acceptPrintSwarmOffer(user,body.assignmentId)
        return json(res,200,{ok:true,action,assignment})
      }
      return json(res,400,{error:'unsupported_print_swarm_action'})
    }
    res.setHeader('Allow','GET, POST')
    return json(res,405,{error:'method_not_allowed'})
  }catch(error){
    return json(res,error.status||500,{error:error.code||'print_swarm_failed',message:error.message})
  }
}
