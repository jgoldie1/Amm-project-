export type BusinessProgramTag=
  |'small-business'
  |'minority-owned'
  |'women-owned'
  |'veteran-owned'
  |'disability-owned'
  |'local-business'
  |'student-owned'

export type BusinessProgramClaim={
  tag:BusinessProgramTag
  source:'owner-declared'|'program-import'|'certifier'
  verification:'unverified'|'pending'|'verified'
  provider?:string
  referenceId?:string
}

export type BusinessLensQrPayload={
  schema:'tryamm.business-passport.qr.v1'
  passportId?:string
  businessId?:string
  storeId?:string
  inviteCode?:string
  referralScoutId?:string
  destination?:string
}

declare global{
  interface Window{
    __TRYAMM_BUSINESS_LENS__?:{
      version:string
      parseQr:(raw:string)=>BusinessLensQrPayload|null
      openQr:(raw:string)=>boolean
      discover:(detail:Record<string,unknown>)=>void
    }
  }
}

const clean=(v:unknown,max=180)=>String(v??'').replace(/[<>]/g,'').slice(0,max)

export function parseBusinessPassportQr(raw:string):BusinessLensQrPayload|null{
  const value=String(raw||'').trim()
  if(!value)return null

  try{
    if(value.startsWith('{')){
      const data=JSON.parse(value)
      if(data?.schema!=='tryamm.business-passport.qr.v1')return null
      return{
        schema:'tryamm.business-passport.qr.v1',
        passportId:clean(data.passportId),
        businessId:clean(data.businessId),
        storeId:clean(data.storeId),
        inviteCode:clean(data.inviteCode),
        referralScoutId:clean(data.referralScoutId),
        destination:clean(data.destination),
      }
    }

    const url=new URL(value,location.origin)
    const isTryamm=url.hostname===location.hostname||/tryamm/i.test(url.hostname)||url.protocol==='tryamm:'
    if(!isTryamm)return null
    const p=url.searchParams
    return{
      schema:'tryamm.business-passport.qr.v1',
      passportId:clean(p.get('passportId')||p.get('passport')),
      businessId:clean(p.get('businessId')||p.get('business')),
      storeId:clean(p.get('storeId')||p.get('store')),
      inviteCode:clean(p.get('invite')||p.get('code')),
      referralScoutId:clean(p.get('scout')||p.get('ref')),
      destination:clean(url.pathname),
    }
  }catch{return null}
}

export function installBusinessDiscoveryLensRuntime(){
  if(typeof window==='undefined')return()=>{}
  if(window.__TRYAMM_BUSINESS_LENS__)return()=>{}

  const discover=(detail:Record<string,unknown>)=>{
    window.dispatchEvent(new CustomEvent('tryamm:business-lens-discovery',{detail:{
      ...detail,
      source:'quantum-holo-business-lens',
      ownerConsentRequired:true,
      merchantVerificationRequired:true,
      noDemographicInference:true,
      minorityStatusMustBeOwnerDeclaredOrProgramVerified:true,
    }}))
  }

  const openQr=(raw:string)=>{
    const payload=parseBusinessPassportQr(raw)
    if(!payload)return false
    window.dispatchEvent(new CustomEvent('tryamm:business-passport-qr-open',{detail:payload}))
    discover(payload as unknown as Record<string,unknown>)
    return true
  }

  window.__TRYAMM_BUSINESS_LENS__={version:'1.0.0',parseQr:parseBusinessPassportQr,openQr,discover}
  window.dispatchEvent(new CustomEvent('tryamm:business-lens-ready',{detail:{
    version:'1.0.0',
    qrPassport:true,
    scanToTwin:true,
    smallBusinessPrograms:true,
    minorityBusinessPrograms:true,
    demographicInference:false,
  }}))

  return()=>{delete window.__TRYAMM_BUSINESS_LENS__}
}
