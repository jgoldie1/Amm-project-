'use strict';

module.exports=function registerHoloIceRoutes({app,auth}){
  app.get('/api/holo/runtime/ice',auth,(_req,res)=>{
    const iceServers=[];
    const stunUrl=String(process.env.HOLO_STUN_URL||'stun:stun.l.google.com:19302').trim();
    if(stunUrl)iceServers.push({urls:stunUrl});
    const turnUrl=String(process.env.HOLO_TURN_URL||'').trim();
    const username=String(process.env.HOLO_TURN_USERNAME||'').trim();
    const credential=String(process.env.HOLO_TURN_CREDENTIAL||'').trim();
    if(turnUrl&&username&&credential)iceServers.push({urls:turnUrl,username,credential});
    res.set('Cache-Control','no-store');
    res.json({iceServers,turnConfigured:Boolean(turnUrl&&username&&credential),note:'TURN credentials returned here are session transport credentials; use short-lived credentials in production.'});
  });
};
