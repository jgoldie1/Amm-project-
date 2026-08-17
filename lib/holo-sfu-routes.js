'use strict';
const sfu=require('./holo-sfu');
module.exports=function registerHoloSfuRoutes({app,auth}){
 app.post('/api/holo/media/topology',auth,(req,res)=>{const plan=sfu.mediaTopology({participants:req.body.participants,recording:req.body.recording,broadcast:req.body.broadcast});res.status(plan.allowed?200:503).json(plan)});
 app.post('/api/holo/media/join',auth,async(req,res,next)=>{try{const join=await sfu.createJoin({roomId:req.body.roomId,userId:req.user.id,role:req.body.role,permissions:req.body.permissions});res.set('Cache-Control','no-store');res.json(join)}catch(e){next(e)}});
};
