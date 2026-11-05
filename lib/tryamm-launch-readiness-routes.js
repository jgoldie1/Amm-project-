'use strict';
const fs=require('node:fs'),path=require('node:path');
const {auditRelease}=require('./tryamm-release-certification');
function readManifest(root,relative){
 // Only reads local evidence paths controlled by deployment config; never modifies existing inventory.
 const full=path.resolve(root,relative);
 if(!full.startsWith(path.resolve(root)+path.sep))throw new Error('Manifest must be inside repository');
 try{
  const json=JSON.parse(fs.readFileSync(full,'utf8'));
  return Array.isArray(json)?json:Array.isArray(json.sites)?json.sites:Array.isArray(json.websites)?json.websites:Array.isArray(json.entries)?json.entries:[];
 }catch(error){if(error.code==='ENOENT')return [];throw error}
}
function loadStatus(root=path.resolve(__dirname,'..')){
 const sites=readManifest(root,process.env.TRYAMM_SITE_INVENTORY_PATH||'data/first-30-website-inventory.json');
 let evidence={};
 const full=path.resolve(root,process.env.TRYAMM_RELEASE_EVIDENCE_PATH||'data/tryamm-11-of-11-evidence.json');
 if(!full.startsWith(path.resolve(root)+path.sep))throw Error('Evidence file must be inside repository');
 try{evidence=JSON.parse(fs.readFileSync(full,'utf8'))}catch(error){if(error.code!=='ENOENT')throw error}
 return auditRelease({sites,evidence});
}
module.exports=function registerTryammReadiness({app,auth}){
 function owner(req,res,next){if(req.user.role!=='admin')return res.status(403).json({error:'Owner only'});next()}
 app.get('/api/launch-11-of-11',auth,owner,(_req,res,next)=>{try{res.json(loadStatus())}catch(error){next(error)}});
};
module.exports.loadStatus=loadStatus;
