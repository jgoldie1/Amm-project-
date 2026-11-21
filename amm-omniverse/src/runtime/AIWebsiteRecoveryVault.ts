// Portable TRYAMM website-builder recovery format.
// Client-safe data only; do not put access tokens, payments, or provider keys here.
export const SITE_VAULT_SCHEMA='tryamm.website.vault.v1' as const;
export const PARENT_THEME_ID='tryamm-business-parent-v1' as const;
export const CHILD_THEME_PRESETS={
 electric:{accent:'#38bdf8',background:'#091827',font:'system'},
 royal:{accent:'#a78bfa',background:'#170e2b',font:'system'},
 gold:{accent:'#d4a64a',background:'#201508',font:'serif'},
 clean:{accent:'#334155',background:'#ffffff',font:'system'}
} as const;
export type ThemePreset=keyof typeof CHILD_THEME_PRESETS;
export type ChildTheme={parentId:typeof PARENT_THEME_ID;preset:ThemePreset;label:string;overrides:{accent:string;background:string;font:'system'|'serif'}};
export type SiteOwnership='subscription'|'buyout'|'exported';
export type BusinessSite={
 id:string;name:string;industry:string;city:string;status:'draft'|'preview'|'published';
 ownership:SiteOwnership;domain?:string;pages:string[];features:string[];
 commerce:boolean;booking:boolean;creator:boolean;analytics:boolean;accessibility:boolean;localization:boolean;
 createdAt:string;childTheme?:ChildTheme
};
export type TrashEntry={site:BusinessSite;deletedAt:string};
export type VersionEntry={site:BusinessSite;reason:string;savedAt:string};
export type SiteVault={schema:typeof SITE_VAULT_SCHEMA;sites:BusinessSite[];trash:TrashEntry[];versions:VersionEntry[];updatedAt:string};
const record=(x:unknown):x is Record<string,unknown>=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const str=(x:unknown,fallback:string,max=180)=>typeof x==='string'?x.slice(0,max):fallback;
const bool=(x:unknown,fallback:boolean)=>typeof x==='boolean'?x:fallback;
const strings=(x:unknown,fallback:string[])=>Array.isArray(x)?x.filter((v):v is string=>typeof v==='string').slice(0,35).map(s=>s.slice(0,90)):fallback;
const ownership=(x:unknown):SiteOwnership=>x==='buyout'||x==='exported'?x:'subscription';
const siteStatus=(x:unknown):BusinessSite['status']=>x==='preview'||x==='published'?x:'draft';
const themeKey=(x:unknown):ThemePreset=>typeof x==='string'&&Object.prototype.hasOwnProperty.call(CHILD_THEME_PRESETS,x)?x as ThemePreset:'electric';
const now=()=>new Date().toISOString();
const copy=<T>(x:T):T=>JSON.parse(JSON.stringify(x)) as T;

export function childTheme(preset:unknown):ChildTheme{
 const key=themeKey(preset),base=CHILD_THEME_PRESETS[key];
 return {parentId:PARENT_THEME_ID,preset:key,label:key[0].toUpperCase()+key.slice(1)+' Child Theme',
  overrides:{accent:base.accent,background:base.background,font:base.font}};
}
export function sanitizeSite(x:unknown):BusinessSite{
 if(!record(x)||typeof x.id!=='string'||x.id.length<1||x.id.length>120)throw new Error('invalid_site_id');
 const theme=record(x.childTheme)&&x.childTheme.parentId===PARENT_THEME_ID?childTheme(x.childTheme.preset):undefined;
 const rawDomain=typeof x.domain==='string'?x.domain.slice(0,253):undefined;
 return {id:x.id,name:str(x.name,'Untitled Site'),industry:str(x.industry,'general'),city:str(x.city,'Global'),
  status:siteStatus(x.status),ownership:ownership(x.ownership),
  ...(rawDomain?{domain:rawDomain}:{}),
  pages:strings(x.pages,['Home','About','Services','Contact']),features:strings(x.features,[]),
  commerce:bool(x.commerce,false),booking:bool(x.booking,false),creator:bool(x.creator,false),
  analytics:bool(x.analytics,false),accessibility:bool(x.accessibility,true),
  localization:bool(x.localization,false),createdAt:str(x.createdAt,now(),48),
  ...(theme?{childTheme:theme}:{})};
}
export function emptyVault():SiteVault{return {schema:SITE_VAULT_SCHEMA,sites:[],trash:[],versions:[],updatedAt:now()}}
export function parseVault(input:unknown):SiteVault{
 const x=typeof input==='string'?JSON.parse(input) as unknown:input;
 if(!record(x)||x.schema!==SITE_VAULT_SCHEMA||!Array.isArray(x.sites)||!Array.isArray(x.trash)||!Array.isArray(x.versions)||
  x.sites.length>250||x.trash.length>200||x.versions.length>250)throw new Error('invalid_vault');
 const sites=x.sites.map(sanitizeSite),ids=sites.map(s=>s.id);
 if(new Set(ids).size!==ids.length)throw new Error('duplicate_site');
 const trash=x.trash.map((row:unknown)=>{
  if(!record(row))throw new Error('invalid_trash');
  return {site:sanitizeSite(row.site),deletedAt:str(row.deletedAt,now(),48)}
 });
 const versions=x.versions.map((row:unknown)=>{
  if(!record(row))throw new Error('invalid_versions');
  return {site:sanitizeSite(row.site),reason:str(row.reason,'saved'),savedAt:str(row.savedAt,now(),48)}
 });
 return {schema:SITE_VAULT_SCHEMA,sites,trash,versions,updatedAt:str(x.updatedAt,now(),48)};
}
function change(v:SiteVault,patch:Partial<SiteVault>):SiteVault{
 return {...v,...patch,updatedAt:now()};
}
function version(v:SiteVault,site:BusinessSite,reason:string):VersionEntry[]{
 return [{site:copy(site),reason,savedAt:now()},...v.versions].slice(0,160);
}
export function createSite(v:SiteVault,input:{name:string;industry:string;city:string}):SiteVault{
 if(v.sites.length>=200)throw new Error('site_limit');
 const id='site-'+(globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2));
 const site:BusinessSite={id,name:str(input.name,'My Business'),industry:str(input.industry,'general'),
  city:str(input.city,'Global'),status:'draft',ownership:'subscription',
  pages:['Home','About','Services','Shop','Book','Contact'],
  features:['responsive storefront','SEO metadata','contact/lead capture','analytics','accessibility','multilingual','custom branding','HoloGPT-ready','StreetVerse business portal'],
  commerce:true,booking:true,creator:true,analytics:true,accessibility:true,localization:true,createdAt:now(),
  childTheme:childTheme('electric')};
 return change(v,{sites:[...v.sites,site]});
}
export function changeSite(v:SiteVault,id:string,reason:string,patch:Partial<BusinessSite>):SiteVault{
 const current=v.sites.find(s=>s.id===id);
 if(!current)throw new Error('site_not_found');
 const next=sanitizeSite({...current,...patch,id:current.id,createdAt:current.createdAt});
 return change(v,{sites:v.sites.map(s=>s.id===id?next:s),versions:version(v,current,reason)});
}
export function applyChildTheme(v:SiteVault,id:string,preset:ThemePreset):SiteVault{
 return changeSite(v,id,'before_child_theme_change',{childTheme:childTheme(preset)});
}
export function softDeleteSite(v:SiteVault,id:string):SiteVault{
 const target=v.sites.find(s=>s.id===id);
 if(!target)throw new Error('site_not_found');
 return change(v,{sites:v.sites.filter(s=>s.id!==id),
  trash:[{site:copy(target),deletedAt:now()},...v.trash].slice(0,100),
  versions:version(v,target,'before_soft_delete')});
}
export function restoreFromTrash(v:SiteVault,id:string):SiteVault{
 const found=v.trash.find(e=>e.site.id===id);
 if(!found)throw new Error('trash_not_found');
 if(v.sites.some(s=>s.id===id))throw new Error('site_already_exists');
 return change(v,{sites:[...v.sites,copy(found.site)],trash:v.trash.filter(e=>e.site.id!==id)});
}
export function restoreVersion(v:SiteVault,index:number):SiteVault{
 const found=v.versions[index];
 if(!found)throw new Error('version_not_found');
 const current=v.sites.find(s=>s.id===found.site.id);
 return change(v,{sites:[...v.sites.filter(s=>s.id!==found.site.id),copy(found.site)],
  versions:current?version(v,current,'before_version_restore'):v.versions});
}
export function mergeImportedVault(v:SiteVault,raw:unknown):SiteVault{
 const incoming=parseVault(raw);
 if(v.sites.length+incoming.sites.length>250)throw new Error('site_limit');
 const existing=new Set(v.sites.map(x=>x.id));
 const newlyRestored=incoming.sites.filter(s=>!existing.has(s.id));
 return change(v,{sites:[...v.sites,...newlyRestored],
  trash:[...v.trash,...incoming.trash].slice(0,100),
  versions:[...v.versions,...incoming.versions].slice(0,160)});
}
