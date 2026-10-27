/**
 * Stubbs AI Café Content Factory.
 * Original deterministic planning core. No social API, models, media rendering,
 * payment authority or unsupervised posting. 30-business campaigns stay isolated.
 */
export const CONTENT_STAGES=['research','script','video','thumbnail','posting','analytics'];
const MEDIA=['reel','carousel','post','thread','newsletter'];
export function createContentCampaign(input){
 if(!input||typeof input!=='object')throw Error('invalid_campaign');
 const {businessId,brief,rightsApproved=false,platforms=[],contentFormats=['reel']}=input;
 if(typeof businessId!=='string'||!/^[A-Za-z0-9_-]{1,80}$/.test(businessId))throw Error('invalid_business');
 if(typeof brief!=='string'||!brief.trim()||brief.length>2000)throw Error('invalid_brief');
 if(!Array.isArray(platforms)||platforms.length>6||platforms.some(p=>!['instagram','facebook','tiktok','youtube','website'].includes(p)))throw Error('invalid_platforms');
 if(!Array.isArray(contentFormats)||!contentFormats.length||contentFormats.some(x=>!MEDIA.includes(x)))throw Error('invalid_formats');
 const id='tryamm-'+businessId;
 return {id,businessId,brief:brief.trim(),rightsApproved,platforms:[...new Set(platforms)],
  contentFormats:[...new Set(contentFormats)],status:'draft',postsScheduled:false,postsPublished:false,
  stages:CONTENT_STAGES.map(stage=>({stage,status:'pending',evidence:[],humanApproved:false}))};
}
export function evaluateContentRelease(campaign){
 const errors=[];
 if(!campaign.rightsApproved)errors.push('rights_not_approved');
 if(!campaign.platforms.length)errors.push('no_platforms');
 for(const stage of campaign.stages){
  if(stage.status!=='verified'||!stage.evidence.length)errors.push('unverified_'+stage.stage);
  if(stage.stage==='posting'&&!stage.humanApproved)errors.push('posting_requires_approval');
 }
 return {approved:errors.length===0,errors,action:errors.length?'review':'ready_for_explicit_scheduling'};
}
export const CONTENT_FACTORY_LIMITS=Object.freeze({automaticPosting:false,automaticPurchases:false,crossBusinessSharing:false,requiresModeration:true});
