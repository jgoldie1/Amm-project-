const crypto=require('crypto');

const ASSET_TYPES=['lottie','image','icon','audio','music-loop','video-overlay','font-reference','three-model','unity-prefab','unreal-asset','godot-scene','shader','ui-component','template'];
const LICENSES=['original','commissioned','commercial-license','open-source','public-domain','provider-license','restricted'];

function normalizeTags(tags=[]){return [...new Set((Array.isArray(tags)?tags:[]).map(v=>String(v).trim().toLowerCase()).filter(Boolean))].slice(0,40);}
function fingerprint(input){return crypto.createHash('sha256').update(String(input||'')).digest('hex');}
function createAsset(input={}){
  const type=ASSET_TYPES.includes(input.type)?input.type:'template';
  const license=LICENSES.includes(input.license)?input.license:'restricted';
  const sourceUrl=input.sourceUrl?String(input.sourceUrl):null;
  const storagePath=input.storagePath?String(input.storagePath):null;
  if(!input.name)throw new Error('Asset name is required.');
  if(!sourceUrl&&!storagePath)throw new Error('Provide a source URL or storage path.');
  return {
    id:input.id||crypto.randomUUID(),name:String(input.name).slice(0,160),type,category:String(input.category||'general').slice(0,80),
    sourceUrl,storagePath,previewUrl:input.previewUrl?String(input.previewUrl):null,license,licenseUrl:input.licenseUrl?String(input.licenseUrl):null,
    attribution:String(input.attribution||'').slice(0,500),creator:String(input.creator||'').slice(0,160),tags:normalizeTags(input.tags),
    version:String(input.version||'1.0.0'),status:['draft','approved','blocked','archived'].includes(input.status)?input.status:'draft',
    reusable:Boolean(input.reusable!==false),commercialUse:Boolean(input.commercialUse),derivativesAllowed:Boolean(input.derivativesAllowed),
    engineTargets:Array.isArray(input.engineTargets)?input.engineTargets.slice(0,12):['web'],
    fingerprint:fingerprint(`${sourceUrl||storagePath}|${input.name}|${input.version||'1.0.0'}`),
    metadata:input.metadata&&typeof input.metadata==='object'?input.metadata:{},createdAt:new Date().toISOString()
  };
}
function canPublish(asset){
  const reasons=[];
  if(asset.status!=='approved')reasons.push('asset-not-approved');
  if(asset.license==='restricted')reasons.push('restricted-license');
  if(!asset.commercialUse)reasons.push('commercial-use-not-confirmed');
  if(['commercial-license','provider-license','open-source'].includes(asset.license)&&!asset.licenseUrl)reasons.push('missing-license-reference');
  if(asset.attribution===''&&['open-source','provider-license'].includes(asset.license))reasons.push('missing-attribution');
  return {allowed:reasons.length===0,reasons};
}
function lottiePreset({name='Holo Pulse',colors=['#66e3ff','#9b7bff'],speed=1,loop=true}={}){
  return {name,type:'lottie-preset',player:'lottie-web',speed:Number(speed)||1,loop:Boolean(loop),renderer:'svg',rendererSettings:{progressiveLoad:true,preserveAspectRatio:'xMidYMid meet'},theme:{colors},reducedMotion:{enabled:true,mode:'poster-frame'}};
}
function searchAssets(assets=[],query='',filters={}){
  const terms=String(query).toLowerCase().split(/\s+/).filter(Boolean);
  return assets.filter(asset=>{
    if(filters.type&&asset.type!==filters.type)return false;
    if(filters.status&&asset.status!==filters.status)return false;
    if(filters.license&&asset.license!==filters.license)return false;
    const haystack=`${asset.name} ${asset.category} ${(asset.tags||[]).join(' ')} ${asset.creator}`.toLowerCase();
    return terms.every(term=>haystack.includes(term));
  }).sort((a,b)=>String(b.updated_at||b.createdAt).localeCompare(String(a.updated_at||a.createdAt)));
}
module.exports={ASSET_TYPES,LICENSES,createAsset,canPublish,lottiePreset,searchAssets,fingerprint};