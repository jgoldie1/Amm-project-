import {json} from '../_lib/supabase-admin.js';
import {ORACLE_PROVIDER_CATALOG,providerCatalogSummary} from '../_lib/oracle-provider-catalog.js';

export default async function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET');
    return json(res,405,{error:'method_not_allowed'});
  }
  return json(res,200,{
    ok:true,
    oracle:'TRYAMM StreetVerse Global Oracle',
    summary:providerCatalogSummary(),
    providers:ORACLE_PROVIDER_CATALOG,
    activationPolicy:{
      automaticActivation:false,
      requiresSourceReview:true,
      requiresServerConfiguration:true,
      requiresVerificationWorkflow:true,
      livePublicationAuthority:false
    }
  });
}
