const crypto=require('crypto');
const PLATFORMS={
  tiktok:{formats:['9:16 short video','live clip'],hooks:['first-2-second visual hook','caption CTA'],share:'native-share'},
  instagram:{formats:['reel','story','carousel'],hooks:['saveable tip','collab post'],share:'native-share'},
  youtube:{formats:['short','video','live','community post'],hooks:['thumbnail promise','retention chapters'],share:'url'},
  facebook:{formats:['reel','group post','live','page post'],hooks:['community question','local relevance'],share:'url'},
  x:{formats:['short post','thread','video'],hooks:['strong point of view','reply prompt'],share:'url'},
  threads:{formats:['post','reply chain'],hooks:['conversation starter','creator story'],share:'native-share'},
  linkedin:{formats:['post','article','video'],hooks:['business result','case study'],share:'url'},
  snapchat:{formats:['spotlight','story'],hooks:['fast visual reveal','creator challenge'],share:'native-share'},
  pinterest:{formats:['pin','idea pin'],hooks:['searchable title','evergreen visual'],share:'url'},
  reddit:{formats:['discussion','AMA','video'],hooks:['community-specific value','transparent founder story'],share:'url'},
  discord:{formats:['announcement','event','stage','forum'],hooks:['exclusive access','community mission'],share:'webhook'},
  whatsapp:{formats:['status','channel','direct share'],hooks:['trusted referral','limited real offer'],share:'url'},
  telegram:{formats:['channel post','story','group'],hooks:['instant update','shareable media'],share:'url'},
  line:{formats:['official account post','message'],hooks:['localized creative','sticker/visual'],share:'native-share'},
  kakaotalk:{formats:['channel post','message'],hooks:['localized creator benefit','event reminder'],share:'native-share'},
  wechat:{formats:['official account','channels','mini program share'],hooks:['localized utility','community commerce'],share:'approved-sdk'},
  weibo:{formats:['post','video','topic'],hooks:['localized trend','creator showcase'],share:'approved-sdk'},
  douyin:{formats:['short video','live'],hooks:['fast visual hook','localized trend'],share:'approved-sdk'},
  bilibili:{formats:['video','dynamic post','live'],hooks:['deep fandom value','series format'],share:'approved-sdk'}
};
function campaign(input={}){const id=input.id||`viral_${crypto.randomUUID()}`;const platforms=(input.platforms||Object.keys(PLATFORMS)).filter(p=>PLATFORMS[p]);return{id,name:String(input.name||'TryAMM Growth Campaign'),goal:input.goal||'qualified-signups',audience:input.audience||'creators and marketplace businesses',region:input.region||'global',language:input.language||'en',platforms,offer:input.offer||'30-day creator trial',truthfulScarcity:Boolean(input.truthfulScarcity),referralCode:input.referralCode||'FOUNDER',variants:Math.max(2,Math.min(Number(input.variants)||3,8)),status:'draft',createdAt:new Date().toISOString()};}
function contentMatrix(c){return c.platforms.map(platform=>({platform,...PLATFORMS[platform],cta:`Join TryAMM with ${c.referralCode}`,tracking:['campaign','platform','country','language','creativeVariant'],requirements:['platform policy compliance','licensed media','human approval','no fake engagement']}));}
function score(metrics={}){const views=Math.max(1,Number(metrics.views)||1);const shares=Number(metrics.shares)||0,saves=Number(metrics.saves)||0,comments=Number(metrics.comments)||0,clicks=Number(metrics.clicks)||0,signups=Number(metrics.signups)||0,paid=Number(metrics.paid)||0;const engagement=(shares*4+saves*3+comments*2)/views;const ctr=clicks/views;const signupRate=signups/Math.max(1,clicks);const paidRate=paid/Math.max(1,signups);const viralCoefficient=Number(metrics.invitesPerUser||0)*Number(metrics.inviteConversion||0);return{engagementRate:+engagement.toFixed(4),clickThroughRate:+ctr.toFixed(4),signupRate:+signupRate.toFixed(4),paidConversionRate:+paidRate.toFixed(4),viralCoefficient:+viralCoefficient.toFixed(3),signal:viralCoefficient>1?'self-propagating':viralCoefficient>=.5?'promising':'needs-iteration',guaranteedViral:false};}
function zapierEvent(type,payload={}){return{id:`zap_${crypto.randomUUID()}`,type,occurredAt:new Date().toISOString(),payload,signatureRequired:true,idempotencyKey:payload.idempotencyKey||crypto.createHash('sha256').update(`${type}:${JSON.stringify(payload)}`).digest('hex')};}
module.exports={PLATFORMS,campaign,contentMatrix,score,zapierEvent};