export function hasSupportAuthority(user,configuredIds=process.env.TRYAMM_SUPPORT_OPERATOR_USER_IDS||''){
 const ids=String(configuredIds).split(',').map(x=>x.trim()).filter(Boolean)
 if(user?.id&&ids.includes(user.id))return true
 const roles=[user?.app_metadata?.role,...(Array.isArray(user?.app_metadata?.roles)?user.app_metadata.roles:[])]
 return roles.some(role=>['support','support-admin','admin','founder','superadmin','platform-admin'].includes(String(role||'').toLowerCase()))
}
