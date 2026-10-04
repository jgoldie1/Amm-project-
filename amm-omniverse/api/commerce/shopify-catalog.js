import {requireUser} from '../_lib/security.js'

const domain=()=>String(process.env.SHOPIFY_STORE_DOMAIN||'').replace(/^https?:\/\//,'').replace(/\/$/,'')
const token=()=>String(process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN||'')
const version=()=>String(process.env.SHOPIFY_API_VERSION||'').trim()

export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'})
 const user=await requireUser(req,res);if(!user)return
 if(!domain()||!token()||!version())return res.status(503).json({error:'Shopify connection is not configured',live:false})

 const query=`query TryammProducts($first:Int!){products(first:$first){nodes{id handle title description featuredImage{url altText} variants(first:20){nodes{id sku price{amount currencyCode} availableForSale quantityAvailable}}}}}`
 const response=await fetch('https://'+domain()+'/api/'+version()+'/graphql.json',{
  method:'POST',
  headers:{'content-type':'application/json','X-Shopify-Storefront-Access-Token':token()},
  body:JSON.stringify({query,variables:{first:Math.min(50,Math.max(1,Number(req.query?.limit)||25))}})
 })
 const data=await response.json().catch(()=>({}))
 if(!response.ok||data.errors)return res.status(502).json({error:'Shopify catalog sync failed',details:data.errors||null})
 const products=(data?.data?.products?.nodes||[]).map(p=>({
  source:'shopify',
  externalId:p.id,
  handle:p.handle,
  title:p.title,
  description:p.description,
  image:p.featuredImage?.url||null,
  variants:(p.variants?.nodes||[]).map(v=>({externalId:v.id,sku:v.sku||'',price:Number(v.price?.amount||0),currency:v.price?.currencyCode||'',available:Boolean(v.availableForSale),quantity:v.quantityAvailable??null}))
 }))
 return res.status(200).json({ok:true,source:'shopify',count:products.length,products})
}
