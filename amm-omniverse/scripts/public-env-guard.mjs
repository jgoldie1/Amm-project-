export function isPrivilegedSupabaseCredential(value){
 if(typeof value!=='string')return false
 if(value.startsWith('sb_secret_'))return true
 try{const parts=value.split('.');if(parts.length!==3)return false;const claims=JSON.parse(Buffer.from(parts[1],'base64url').toString('utf8'));return ['service_role','supabase_admin'].includes(claims.role)}catch{return false}
}
export function assertSafePublicEnv(env){
 const unsafe=Object.entries(env).filter(([name,value])=>/^(VITE_|NEXT_PUBLIC_|PUBLIC_)/.test(name)&&isPrivilegedSupabaseCredential(value)).map(([name])=>name)
 if(unsafe.length)throw new Error('Refusing browser build: server-only Supabase credentials are configured in '+unsafe.join(', ')+'. Replace them with publishable keys. Credential values are intentionally omitted.')
}
