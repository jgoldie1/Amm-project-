export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 return res.status(200).json({
  ok:true,
  service:'HoloGPT',
  providers:{
   openai:{configured:Boolean(process.env.OPENAI_API_KEY),model:process.env.OPENAI_MODEL||'gpt-5.6-luna'},
   anthropic:{configured:Boolean(process.env.ANTHROPIC_API_KEY),model:process.env.ANTHROPIC_MODEL||'claude-sonnet-4-5'},
   deepseek:{configured:Boolean(process.env.DEEPSEEK_API_KEY),model:process.env.DEEPSEEK_MODEL||'deepseek-chat'}
  },
  providerOrder:String(process.env.HOLOGPT_PROVIDER_ORDER||'openai,anthropic,deepseek').split(',').map(x=>x.trim()).filter(Boolean),
  note:'configured means a server-side credential exists; a successful authenticated answer request is still required for production proof.'
 });
}
