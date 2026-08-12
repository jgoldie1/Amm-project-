const express=require('express')
const {analyzeCommunication,shouldProtectSpend}=require('../lib/omnishield360')

function createOmniShieldRouter(){
  const router=express.Router()

  router.post('/analyze',(req,res)=>{
    const result=analyzeCommunication(req.body||{})
    res.json({product:'OmniShield 360',...result})
  })

  router.post('/spend-check',(req,res)=>{
    const result=shouldProtectSpend(req.body||{})
    res.status(result.allow?200:202).json({product:'OmniShield 360',...result})
  })

  router.get('/capabilities',(_req,res)=>res.json({
    product:'OmniShield 360',
    capabilities:[
      'caller identity/reputation scoring','robocall and callback abuse screening','scam-language risk signals',
      'synthetic-voice/deepfake risk input','human-first screening','family/caregiver protection','employee harassment escalation',
      'telecom spend guard','verified-business calling','privacy-preserving audit signals'
    ],
    principle:'No single detector is treated as proof. Multiple signals determine routing, warning, verification, or quarantine.'
  }))

  return router
}

module.exports={createOmniShieldRouter}
