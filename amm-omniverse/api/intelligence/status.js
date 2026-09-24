import {json} from '../_lib/supabase-admin.js';
import {intelligenceProviderStatus} from '../_lib/intelligence-providers.js';
import {providerCatalogSummary} from '../_lib/oracle-provider-catalog.js';

export default async function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET');
    return json(res,405,{error:'method_not_allowed'});
  }
  return json(res,200,{
    ok:true,
    ...intelligenceProviderStatus(),
    catalog:providerCatalogSummary(),
    note:'Provider registration or configuration does not mean a live feed is active. Live data remains disabled until source, license, verification, privacy, retention and release gates are certified.'
  });
}
