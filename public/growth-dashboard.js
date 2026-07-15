const $=id=>document.getElementById(id);
function headers(){const token=$('token').value.trim();return token?{Authorization:`Bearer ${token}`}:{}}
function metric(label,value){return `<article class="card"><div class="muted">${label}</div><div class="metric">${value}</div></article>`}
function safe(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function load(){
  $('status').textContent='Loading…';
  try{
    const response=await fetch('/api/memory/growth/dashboard',{headers:headers()});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||'Unable to load dashboard.');
    $('metrics').innerHTML=[
      metric('Campaigns',data.campaigns),metric('Referral links',data.links),metric('Events',data.events),
      metric('Qualified referrals',data.qualifiedReferrals),metric('Revenue',`${data.revenueMinor||0} minor units`),metric('Reward',data.reward?.label||data.reward?.reward||'None yet')
    ].join('');
    $('countries').innerHTML=Object.entries(data.byCountry||{}).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<tr><td>${safe(k)}</td><td>${v}</td></tr>`).join('')||'<tr><td colspan="2">No data</td></tr>';
    const platformCounts=Object.fromEntries(Object.entries(data.byPlatform||{}).map(([k,v])=>[k,Array.isArray(v)?v.length:Number(v)||0]));
    $('platforms').innerHTML=Object.entries(platformCounts).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<tr><td>${safe(k)}</td><td>${v}</td></tr>`).join('')||'<tr><td colspan="2">No data</td></tr>';
    $('status').textContent='Dashboard loaded.';
  }catch(error){$('status').textContent=error.message;}
}
async function share(){
  const params=new URLSearchParams({code:$('code').value,campaign:$('campaign').value,country:$('country').value,lang:$('lang').value,text:'Join me on TryAMM'});
  try{
    const response=await fetch(`/api/memory/growth/share-links?${params}`);
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||'Unable to generate links.');
    const links=Object.entries(data).filter(([,v])=>typeof v==='string'&&/^https?:/.test(v));
    $('shareResult').innerHTML=`<p><strong>Referral URL:</strong> <a href="${safe(data.url)}">${safe(data.url)}</a></p>`+links.map(([name,url])=>`<p><a target="_blank" rel="noopener" href="${safe(url)}">Share on ${safe(name)}</a></p>`).join('');
  }catch(error){$('shareResult').textContent=error.message;}
}
$('load').addEventListener('click',load);$('share').addEventListener('click',share);