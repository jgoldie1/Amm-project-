'use strict';
const crypto=require('node:crypto');
const supabase=require('./supabase-rest');
const TABLE='website_brand_projects';
const CATEGORIES=new Set(['free','preview','experience','digital-twin']);
const safeText=(x,n)=>String(x??'').trim().slice(0,n);
function validateProject(input={}){
 const businessName=safeText(input.businessName,120);
 if(!businessName)throw Object.assign(new Error('Business name required'),{status:400});
 const templateId=safeText(input.templateId,80);
 if(!/^[a-z0-9-]{1,80}$/.test(templateId))throw Object.assign(new Error('Valid catalog template required'),{status:400});
 const color=safeText(input.color,7);
 if(!/^#[0-9a-fA-F]{6}$/.test(color))throw Object.assign(new Error('Color must be a six-digit hex value'),{status:400});
 const packageId=safeText(input.packageId||'free',30);
 if(!CATEGORIES.has(packageId))throw Object.assign(new Error('Invalid package'),{status:400});
 return {businessName,templateId,color,packageId,headline:safeText(input.headline,180),
   description:safeText(input.description,800),contactEmail:safeText(input.contactEmail,200),
   logoText:safeText(input.logoText,35),revision:Number.isSafeInteger(input.revision)?input.revision:0};
}
function requireStorage(){if(!supabase.configured())throw Object.assign(new Error('Secure project storage not configured; download a local preview instead'),{status:503})}
function publicProject(row){return {id:row.id,revision:row.revision,brand:row.brand,createdAt:row.created_at,updatedAt:row.updated_at,status:row.status}}
function rowBrand(data){return {businessName:data.businessName,templateId:data.templateId,color:data.color,packageId:data.packageId,headline:data.headline,description:data.description,contactEmail:data.contactEmail,logoText:data.logoText}}
async function listProjects(ownerId){
 requireStorage();const rows=await supabase.select(TABLE,'owner_id=eq.'+encodeURIComponent(ownerId)+'&select=*&order=updated_at.desc&limit=100');
 return (rows||[]).map(publicProject);
}
async function createProject(ownerId,input){
 requireStorage();const data=validateProject(input);
 const rows=await supabase.insert(TABLE,{id:crypto.randomUUID(),owner_id:ownerId,revision:0,brand:rowBrand(data),status:'draft'});
 return publicProject(rows[0]);
}
async function getProject(ownerId,id){
 requireStorage();if(!/^[0-9a-f-]{36}$/i.test(id))return null;
 const rows=await supabase.select(TABLE,'id=eq.'+encodeURIComponent(id)+'&owner_id=eq.'+encodeURIComponent(ownerId)+'&select=*&limit=1');
 return rows?.[0]?publicProject(rows[0]):null;
}
async function updateProject(ownerId,id,input){
 requireStorage();const data=validateProject(input);
 const current=await getProject(ownerId,id);
 if(!current)throw Object.assign(new Error('Project not found'),{status:404});
 if(data.revision!==current.revision)throw Object.assign(new Error('Project changed on another device; reload'),{status:409});
 if(current.status!=='draft')throw Object.assign(new Error('Submitted project is locked; create a new version'),{status:409});
 const rows=await supabase.update(TABLE,'id=eq.'+encodeURIComponent(id)+'&owner_id=eq.'+encodeURIComponent(ownerId)+'&revision=eq.'+current.revision,{brand:rowBrand(data),revision:current.revision+1,updated_at:new Date().toISOString()});
 if(!rows?.length)throw Object.assign(new Error('Project update conflict'),{status:409});
 return publicProject(rows[0]);
}
async function submitProject(ownerId,id){
 requireStorage();const current=await getProject(ownerId,id);
 if(!current)throw Object.assign(new Error('Project not found'),{status:404});
 if(current.status!=='draft')throw Object.assign(new Error('Project already submitted'),{status:409});
 const rows=await supabase.update(TABLE,'id=eq.'+encodeURIComponent(id)+'&owner_id=eq.'+encodeURIComponent(ownerId)+'&revision=eq.'+current.revision,{status:'review-requested',revision:current.revision+1,updated_at:new Date().toISOString()});
 if(!rows?.length)throw Object.assign(new Error('Project changed on another device'),{status:409});
 return publicProject(rows[0]);
}
module.exports={validateProject,publicProject,listProjects,createProject,getProject,updateProject,submitProject};
