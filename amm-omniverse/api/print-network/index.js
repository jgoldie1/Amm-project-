import {json} from '../_lib/supabase-admin.js'
import {requireUser} from '../_lib/security.js'
import {
  printNetworkDashboard,
  applyPrintOperator,
  updatePrintOperatorAvailability,
  registerPrintPrinter,
  submitPrinterQualificationSample,
  qualifyPrintPrinter,
  updatePrintPrinterAvailability,
  certifyPrintOperator,
  createPrintRequest,
  reviewPrintRequest,
  linkVerifiedCommercePayment,
  claimPrintJob,
  advanceOwnPrintJob,
  reviewPrintQa,
  confirmPrintDeliveryAndLedger,
  PRINT_NETWORK_POLICY,
} from '../_lib/print-network.js'

export default async function handler(req,res){
  const user=await requireUser(req,res)
  if(!user)return
  try{
    if(req.method==='GET'){
      const dashboard=await printNetworkDashboard(user)
      return json(res,200,{ok:true,schema:'tryamm.print-network.v1',policy:PRINT_NETWORK_POLICY,...dashboard})
    }
    if(req.method==='POST'){
      const body=req.body&&typeof req.body==='object'?req.body:{}
      const action=String(body.action||'')
      if(action==='apply'){
        const operator=await applyPrintOperator(user,body)
        return json(res,200,{ok:true,action,operator})
      }
      if(action==='availability'){
        const operator=await updatePrintOperatorAvailability(user,body.availability)
        return json(res,200,{ok:true,action,operator})
      }
      if(action==='register-printer'){
        const printer=await registerPrintPrinter(user,body)
        return json(res,201,{ok:true,action,printer,message:'Printer registered. It cannot accept paid work until its sample/calibration evidence is reviewed and it becomes TRYAMM-qualified.'})
      }
      if(action==='submit-printer-sample'){
        const printer=await submitPrinterQualificationSample(user,body)
        return json(res,200,{ok:true,action,printer})
      }
      if(action==='printer-availability'){
        const printer=await updatePrintPrinterAvailability(user,body)
        return json(res,200,{ok:true,action,printer})
      }
      if(action==='request'){
        const job=await createPrintRequest(user,body)
        return json(res,201,{ok:true,action,job,message:'Print request created. It is not released to operators until payment, rights and safety checks are verified.'})
      }
      if(action==='claim'){
        const job=await claimPrintJob(user,body.jobId,body.printerId)
        return json(res,200,{ok:true,action,job,message:'Job accepted only after certified-operator + qualified-compatible-printer checks passed.'})
      }
      if(action==='advance'){
        const job=await advanceOwnPrintJob(user,body)
        return json(res,200,{ok:true,action,job})
      }
      if(action==='certify-operator'){
        const operator=await certifyPrintOperator(user,body)
        return json(res,200,{ok:true,action,operator})
      }
      if(action==='qualify-printer'){
        const printer=await qualifyPrintPrinter(user,body)
        return json(res,200,{ok:true,action,printer,externalCertificationImplied:false})
      }
      if(action==='review-job'){
        const job=await reviewPrintRequest(user,body)
        return json(res,200,{ok:true,action,job})
      }
      if(action==='link-paid-order'){
        const job=await linkVerifiedCommercePayment(user,body)
        return json(res,200,{ok:true,action,job})
      }
      if(action==='review-qa'){
        const job=await reviewPrintQa(user,body)
        return json(res,200,{ok:true,action,job})
      }
      if(action==='confirm-delivery'){
        const result=await confirmPrintDeliveryAndLedger(user,body)
        return json(res,200,{ok:true,action,...result,actualPayoutTransferred:false})
      }
      return json(res,400,{error:'unsupported_print_network_action'})
    }
    res.setHeader('Allow','GET, POST')
    return json(res,405,{error:'method_not_allowed'})
  }catch(error){
    return json(res,error.status||500,{error:error.code||'print_network_failed',message:error.message})
  }
}
