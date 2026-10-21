import {rest} from '../_lib/studio.js';
import {UUID} from '../_lib/ai-cafe-executor.js';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='GET')return res.status(405).send('Method not allowed');
 if(!UUID.test(req.query?.id||''))return res.status(404).send('Website not found');
 try{
  const rows=await rest('studio_orders',{query:{id:`eq.${req.query.id}`,state:'eq.published',select:'published_html',limit:1}});
  if(!rows[0]?.published_html)return res.status(404).send('Website not published');
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.setHeader('Content-Security-Policy',"sandbox; default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
  return res.status(200).send(rows[0].published_html);
 }catch{return res.status(503).send('Website temporarily unavailable')}
}
