const LIMITS={name:100,audience:240,headline:180,description:1200,bestFor:700,benefit:900,includes:1000}
export const CUSTOM_TEMPLATE_ID=/^custom-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
export function hasTemplateAuthority(user,configuredIds=process.env.TRYAMM_TEMPLATE_OWNER_USER_IDS||''){
 if(user?.id&&String(configuredIds).split(',').map(x=>x.trim()).filter(Boolean).includes(user.id))return true
 const roles=[user?.app_metadata?.role,...(Array.isArray(user?.app_metadata?.roles)?user.app_metadata.roles:[])]
 return roles.some(role=>['template-admin','founder','superadmin','platform-admin'].includes(String(role||'').toLowerCase()))
}
export function validateTemplateListing(input){
 const fail=error=>({ok:false,error})
 if(!input||typeof input!=='object'||Array.isArray(input))return fail('A template listing is required.')
 const data={id:input.id}
 if(typeof data.id!=='string'||!CUSTOM_TEMPLATE_ID.test(data.id))return fail('Create a new listing with a valid template ID.')
 for(const [key,max] of Object.entries(LIMITS)){
  if(typeof input[key]!=='string'||input[key].trim().length<3||input[key].length>max)return fail(`${key} must contain 3–${max} characters.`)
  data[key]=input[key].trim()
 }
 if(!Number.isSafeInteger(input.priceCents)||input.priceCents<100||input.priceCents>99900)return fail('Set a USD template price from $1 to $999, with at most two decimal places.')
 data.priceCents=input.priceCents
 const demo=input.demo
 if(!demo||!['shop','booking','inquiry'].includes(demo.type)||!/^#[0-9a-f]{6}$/i.test(demo.tone||''))return fail('Choose a demo type and a six-digit brand color.')
 if(typeof demo.brand!=='string'||demo.brand.trim().length<3||demo.brand.length>100||typeof demo.tagline!=='string'||demo.tagline.trim().length<3||demo.tagline.length>180)return fail('Add a demo brand and headline.')
 if(!Array.isArray(demo.items)||demo.items.length<1||demo.items.length>6)return fail('Add 1–6 sample services or products.')
 const items=[]
 for(const item of demo.items){
  if(!Array.isArray(item)||item.length!==2||typeof item[0]!=='string'||item[0].trim().length<2||item[0].length>100||typeof item[1]!=='number'||!Number.isFinite(item[1])||item[1]<0||item[1]>10000||Math.abs(item[1]*100-Math.round(item[1]*100))>0.00001)return fail('Each demo item needs a name and a sample price from $0 to $10,000 with at most two decimals.')
  items.push([item[0].trim(),item[1]])
 }
 if(new Set(items.map(x=>x[0].toLowerCase())).size!==items.length)return fail('Give each demo item a different name.')
 data.demo={brand:demo.brand.trim(),tagline:demo.tagline.trim(),type:demo.type,tone:demo.tone,items}
 return {ok:true,data}
}
export function publicTemplate(row){
 const result=validateTemplateListing({...row.data,id:row.id})
 if(!result.ok)return null
 return {...result.data,revision:row.revision}
}
