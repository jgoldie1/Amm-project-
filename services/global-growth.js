const crypto=require('crypto');
const REGIONS={
  africa:{countries:['NG','GH','KE','ZA','ET','UG','TZ','RW','ZM','CI','SN'],languages:['en','fr','sw','yo','ig','ha','am'],platforms:['whatsapp','facebook','instagram','tiktok','youtube','telegram','x']},
  eastAsia:{countries:['JP','KR','CN','TW','HK'],languages:['ja','ko','zh'],platforms:['line','kakaotalk','wechat','weibo','douyin','xiaohongshu','bilibili','youtube','tiktok']},
  southAsia:{countries:['IN','PK','BD','LK'],languages:['en','hi','bn','ur'],platforms:['whatsapp','youtube','instagram','facebook','telegram']},
  southeastAsia:{countries:['SG','MY','ID','PH','TH','VN'],languages:['en','id','ms','th','vi','tl'],platforms:['tiktok','youtube','facebook','instagram','line','whatsapp']},
  caribbean:{countries:['JM','TT','BB','BS','DO','HT','BZ','LC','AG'],languages:['en','es','fr','ht'],platforms:['instagram','facebook','tiktok','youtube','whatsapp']},
  europe:{countries:['GB','FR','DE','ES','IT','NL','PT','IE','PL','SE','NO','AT'],languages:['en','fr','de','es','it','nl','pt','pl','sv','no'],platforms:['instagram','tiktok','youtube','facebook','x','linkedin']},
  northAmerica:{countries:['US','CA','MX'],languages:['en','es','fr'],platforms:['facebook','instagram','threads','x','tiktok','youtube','snapchat','linkedin','reddit']}
};
const REWARDS=[
  {qualified:1,reward:'7-days-pro'},
  {qualified:5,reward:'30-days-pro'},
  {qualified:10,reward:'60-days-creator-elite'},
  {qualified:25,reward:'marketplace-store-upgrade'},
  {qualified:100,reward:'founder-ambassador'}
];
function clean(v,max=300){return String(v||'').replace(/\s+/g,' ').trim().slice(0,max);}
function code(prefix='REF'){return `${prefix}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;}
function referralLink({baseUrl='https://tryamm.online',referralCode,campaignId,locale='en',country='US'}={}){
  const c=clean(referralCode,64)||code();
  const u=new URL(`/r/${encodeURIComponent(c)}`,baseUrl);
  if(campaignId)u.searchParams.set('campaign',clean(campaignId,80));
  if(locale)u.searchParams.set('lang',clean(locale,10));
  if(country)u.searchParams.set('country',clean(country,2).toUpperCase());
  return {code:c,url:u.toString()};
}
function shareLinks({url,text='Join TryAMM',country='US'}={}){
  const region=Object.values(REGIONS).find(r=>r.countries.includes(String(country).toUpperCase()))||REGIONS.northAmerica;
  const encodedUrl=encodeURIComponent(url);const encodedText=encodeURIComponent(text);
  const templates={
    facebook:`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    x:`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    whatsapp:`https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    telegram:`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    linkedin:`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit:`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}`,
    email:`mailto:?subject=${encodedText}&body=${encodedText}%20${encodedUrl}`,
    sms:`sms:?body=${encodedText}%20${encodedUrl}`
  };
  return {region,links:Object.fromEntries(region.platforms.filter(p=>templates[p]).map(p=>[p,templates[p]])),nativeShare:{title:text,text,url}};
}
function fraudScore(input={}){
  let score=0;const reasons=[];
  if(input.sameDevice) {score+=30;reasons.push('same-device');}
  if(input.samePaymentInstrument){score+=35;reasons.push('same-payment-instrument');}
  if(Number(input.signupsPerHour)>10){score+=20;reasons.push('signup-velocity');}
  if(Number(input.conversionSeconds)<20){score+=10;reasons.push('impossibly-fast-conversion');}
  if(input.vpnOrProxy){score+=10;reasons.push('proxy-risk');}
  return {score:Math.min(score,100),status:score>=60?'review':score>=30?'watch':'clear',reasons};
}
function rewardFor(count=0){return [...REWARDS].reverse().find(r=>count>=r.qualified)||null;}
function campaign(input={}){
  return {id:code('CAMPAIGN'),name:clean(input.name)||'Untitled campaign',region:clean(input.region)||'global',country:clean(input.country,2).toUpperCase()||null,language:clean(input.language,10)||'en',platforms:Array.isArray(input.platforms)?input.platforms.slice(0,20):[],trialDays:[7,14,30,60].includes(Number(input.trialDays))?Number(input.trialDays):30,startsAt:input.startsAt||new Date().toISOString(),endsAt:input.endsAt||null,maxRedemptions:Number(input.maxRedemptions)||null,status:'draft',createdAt:new Date().toISOString()};
}
module.exports={REGIONS,REWARDS,referralLink,shareLinks,fraudScore,rewardFor,campaign};
