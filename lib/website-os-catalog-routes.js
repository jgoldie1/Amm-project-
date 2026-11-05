'use strict';
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const url=pathToFileURL(path.join(__dirname,'..','scripts','tryamm-generate-starter-templates.mjs')).href;
let pending;
function getGenerator(){if(!pending)pending=import(url);return pending}
module.exports=function registerWebsiteOsCatalog({app}){
  app.get('/api/website-os/templates',async(_req,res,next)=>{
    try{
      const {verticals}=await getGenerator();
      const templates=verticals.map(([id,name,action,lead,description])=>({
        id,name,action,leadType:lead,description,
        state:'preview-only',purchasable:false,
        previewUrl:'/api/website-os/templates/'+encodeURIComponent(id)+'/preview'
      }));
      res.json({ok:true,source:'original-tryamm-starter-generator',generatorCount:templates.length,verifiedFinished500:false,target:500,templates});
    }catch(error){next(error)}
  });
  app.get('/api/website-os/templates/:id/preview',async(req,res,next)=>{
    try{
      const {verticals,render}=await getGenerator();
      const item=verticals.find(row=>row[0]===req.params.id);
      if(!item)return res.status(404).type('text/plain').send('Template not found');
      res.setHeader('Cache-Control','public, max-age=300');
      res.setHeader('Content-Security-Policy',"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'");
      res.type('html').send(render(item));
    }catch(error){next(error)}
  });
};
