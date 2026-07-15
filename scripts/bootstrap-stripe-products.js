const Stripe=require('stripe');

async function main(){
  const key=process.env.STRIPE_SECRET_KEY;
  if(!key) throw new Error('STRIPE_SECRET_KEY is required.');
  const stripe=new Stripe(key);
  const currency=String(process.env.STRIPE_DEFAULT_CURRENCY||'usd').toLowerCase();
  const creatorMonthly=Number(process.env.STRIPE_CREATOR_MONTHLY_MINOR||1499);
  const eliteMonthly=Number(process.env.STRIPE_ELITE_MONTHLY_MINOR||2999);
  const studioMonthly=Number(process.env.STRIPE_STUDIO_MONTHLY_MINOR||5999);
  const tokenPack=Number(process.env.STRIPE_TOKEN_PACK_MINOR||499);
  const specs=[
    {key:'creator',name:'TryAMM Creator Pro',description:'Creator publishing, analytics, livestreaming and monetization tools.',mode:'recurring',amount:creatorMonthly},
    {key:'elite',name:'TryAMM Creator Elite',description:'Advanced creator, translation, AI and multistreaming features.',mode:'recurring',amount:eliteMonthly},
    {key:'studio',name:'TryAMM Creator Studio+',description:'Quantum Vocal Studio, AI coach, AI engineer and production tools.',mode:'recurring',amount:studioMonthly},
    {key:'tokens',name:'TryAMM Token Pack',description:'One-time TryAMM token pack.',mode:'one_time',amount:tokenPack}
  ];
  const output={};
  for(const spec of specs){
    const product=await stripe.products.create({name:spec.name,description:spec.description,metadata:{tryammKey:spec.key}});
    const price=await stripe.prices.create({product:product.id,currency,unit_amount:spec.amount,...(spec.mode==='recurring'?{recurring:{interval:'month'}}:{})});
    output[spec.key]={productId:product.id,priceId:price.id,amountMinor:spec.amount,currency,mode:spec.mode};
  }
  console.log(JSON.stringify(output,null,2));
}

main().catch(error=>{console.error(error);process.exit(1);});
