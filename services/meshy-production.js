const crypto=require('crypto');
const meshy=require('./meshy');

const TARGETS=['web','mobile','unity','unreal','godot','webxr','vr','mr','marketplace'];
const ASSET_TYPES=['character','npc','creature','vehicle','weapon','prop','building','environment','outfit','shoe','accessory','collectible','arena'];

function id(prefix){return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;}
function clean(value,max=4000){return String(value||'').replace(/\s+/g,' ').trim().slice(0,max);}
function clamp(value,min,max){return Math.max(min,Math.min(max,Number(value)||0));}

function createAssetBrief(input={}){
  const type=ASSET_TYPES.includes(input.assetType)?input.assetType:'prop';
  const targets=(Array.isArray(input.targets)?input.targets:['web','mobile']).filter(v=>TARGETS.includes(v));
  const prompt=clean(input.prompt);
  if(!prompt)throw new Error('Asset prompt is required.');
  return {
    id:id('asset'),name:clean(input.name,160)||'Untitled asset',assetType:type,prompt,
    negativePrompt:clean(input.negativePrompt||'broken geometry, extra limbs, unreadable topology, low detail, trademarked logo, copyrighted character'),
    artStyle:clean(input.artStyle,80)||'realistic',targets:[...new Set(targets)],gameIds:Array.isArray(input.gameIds)?input.gameIds.map(String).slice(0,11):[],
    qualityTier:['mobile','standard','cinematic'].includes(input.qualityTier)?input.qualityTier:'standard',
    originalIpRequired:true,licenseStatus:'creator-owned-or-approved',status:'brief',createdAt:new Date().toISOString()
  };
}

function optimizationProfile(brief){
  const mobile=brief.targets.includes('mobile')||brief.targets.includes('web');
  return {
    lods:mobile?[0,1,2,3]:[0,1,2],
    triangleBudgets:mobile?{lod0:60000,lod1:30000,lod2:12000,lod3:4000}:{lod0:180000,lod1:90000,lod2:30000},
    textures:mobile?{maxResolution:2048,formats:['webp','ktx2']}:{maxResolution:4096,formats:['png','ktx2']},
    meshCompression:['draco','meshopt'],textureCompression:['basis-universal'],
    collision:brief.assetType==='environment'?'simplified-mesh':'primitive-or-convex',
    animation:brief.assetType==='character'||brief.assetType==='npc'||brief.assetType==='creature'?{rigRequired:true,rootMotion:true,retargetableSkeleton:true}:{rigRequired:false},
    accessibility:{silhouetteReadable:true,colorIndependentSignals:true,reducedMotionVariant:true}
  };
}

async function startPipeline(input={}){
  const brief=createAssetBrief(input);
  const task=await meshy.createTextTo3D({prompt:`Original TryAMM ${brief.assetType}: ${brief.prompt}. Production-ready silhouette, clean topology, ${brief.artStyle} style.`,artStyle:brief.artStyle});
  return {
    pipelineId:id('meshy_pipeline'),brief,providerTask:task,optimization:optimizationProfile(brief),
    stages:[
      {name:'concept-approval',status:'required'},
      {name:'preview-generation',status:task.status||'PENDING'},
      {name:'human-review',status:'blocked'},
      {name:'refine-texture',status:'blocked'},
      {name:'retopology-lod',status:'blocked'},
      {name:'rig-animation',status:brief.assetType.match(/character|npc|creature/)?'blocked':'not-required'},
      {name:'collision-physics',status:'blocked'},
      {name:'engine-export',status:'blocked'},
      {name:'qa-license',status:'blocked'}
    ],
    status:'GENERATING',createdAt:new Date().toISOString()
  };
}

function qualityScore(input={}){
  const metrics={
    silhouette:clamp(input.silhouette,0,100),topology:clamp(input.topology,0,100),textures:clamp(input.textures,0,100),
    animation:clamp(input.animation??100,0,100),performance:clamp(input.performance,0,100),collision:clamp(input.collision,0,100),
    originality:clamp(input.originality,0,100),accessibility:clamp(input.accessibility,0,100)
  };
  const weights={silhouette:.12,topology:.18,textures:.15,animation:.12,performance:.18,collision:.08,originality:.1,accessibility:.07};
  const score=Object.entries(metrics).reduce((sum,[key,value])=>sum+value*weights[key],0);
  return {score:Number(score.toFixed(1)),pass:score>=80&&metrics.originality>=90&&metrics.performance>=75,metrics};
}

function exportManifest({assetId,urls={},targets=[]}={}){
  return {
    assetId,canonicalFormat:'glb',sourceUrls:urls,
    exports:{
      web:{format:'glb',compression:['draco','ktx2']},
      unity:{format:'fbx-or-glb',coordinateSystem:'y-up',materials:'pbr'},
      unreal:{format:'fbx-or-glb',coordinateSystem:'z-up',materials:'pbr'},
      godot:{format:'glb',coordinateSystem:'y-up',materials:'pbr'},
      xr:{format:'glb',metersPerUnit:1,anchors:true}
    },
    requestedTargets:targets.filter(v=>TARGETS.includes(v)),requiresHumanApproval:true
  };
}

module.exports={TARGETS,ASSET_TYPES,createAssetBrief,optimizationProfile,startPipeline,qualityScore,exportManifest};