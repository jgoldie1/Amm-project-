import {json} from '../_lib/supabase-admin.js'
import {requireUser} from '../_lib/security.js'
import {
  listTwelveDRndRecords,
  createTwelveDRndRecord,
  updateTwelveDRndRecord,
  approveTwelveDRndPublication,
  returnTwelveDRndToPrivate,
  TWELVE_D_PRIVATE_RND_POLICY,
} from '../_lib/twelve-d-rnd-vault.js'

export default async function handler(req,res){
  const user=await requireUser(req,res)
  if(!user)return
  try{
    if(req.method==='GET'){
      const records=await listTwelveDRndRecords(user,{limit:req.query?.limit})
      return json(res,200,{ok:true,schema:'tryamm.12d.rnd.private.v1',policy:TWELVE_D_PRIVATE_RND_POLICY,records})
    }
    if(req.method==='POST'){
      const body=req.body&&typeof req.body==='object'?req.body:{}
      const action=String(body.action||'create')
      if(action==='create'){
        const record=await createTwelveDRndRecord(user,body)
        return json(res,201,{ok:true,schema:'tryamm.12d.rnd.private.v1',action,record})
      }
      if(action==='update'){
        const record=await updateTwelveDRndRecord(user,body)
        return json(res,200,{ok:true,schema:'tryamm.12d.rnd.private.v1',action,record})
      }
      if(action==='approve-publication'){
        const record=await approveTwelveDRndPublication(user,body)
        return json(res,200,{ok:true,schema:'tryamm.12d.rnd.private.v1',action,record,publiclyExposed:false})
      }
      if(action==='return-private'){
        const record=await returnTwelveDRndToPrivate(user,body.id)
        return json(res,200,{ok:true,schema:'tryamm.12d.rnd.private.v1',action,record})
      }
      return json(res,400,{error:'unsupported_12d_rnd_action'})
    }
    res.setHeader('Allow','GET, POST')
    return json(res,405,{error:'method_not_allowed'})
  }catch(error){
    return json(res,error.status||500,{error:error.code||'12d_rnd_vault_failed',message:error.message})
  }
}
