export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 const url=process.env.LIVEKIT_URL||process.env.LIVEKIT_WS_URL||'';
 const key=process.env.LIVEKIT_API_KEY||'';
 const secret=process.env.LIVEKIT_API_SECRET||'';
 return res.status(200).json({configured:Boolean(url&&key&&secret),url:url||undefined});
}
