(()=>{
  if(!location.pathname.startsWith('/live'))return
  const params=new URLSearchParams(location.search)
  const clean=v=>String(v??'').replace(/[<>]/g,'').slice(0,300)
  const season={
    world:clean(params.get('world')||''),
    month:clean(params.get('month')||''),
    event:clean(params.get('event')||''),
    mode:clean(params.get('mode')||''),
    source:clean(params.get('source')||'')
  }
  const hasSeason=Boolean(season.world||season.month||season.event||season.mode)
  const state={messages:[],pending:new Map(),gifts:[],pk:null,panel:[],season}
  const root=document.createElement('aside')
  root.setAttribute('aria-label','TRYAMM LIVE event fabric')
  root.style.cssText='position:fixed;right:12px;bottom:12px;z-index:2147482500;width:min(360px,calc(100vw - 24px));max-height:52vh;overflow:auto;background:rgba(4,9,20,.96);border:1px solid rgba(92,226,255,.45);border-radius:16px;color:#fff;font:13px/1.35 system-ui,sans-serif;box-shadow:0 18px 60px #0009'
  const seasonLabel=hasSeason?`${season.world||'WORLD SEASON'}${season.month?` • ${season.month}`:''}${season.event?` • ${season.event}`:''}${season.mode?` • ${season.mode}`:''}`:'Waiting for authoritative LIVE events'
  root.innerHTML=`<div style="padding:12px 13px;border-bottom:1px solid #ffffff18"><b>TRYAMM LIVE • EVENT FABRIC</b><div id="tlb-status" style="font-size:11px;color:#8fe8ff;margin-top:3px">${seasonLabel}</div></div><div id="tlb-feed" aria-live="polite" style="padding:10px 12px;max-height:210px;overflow:auto"><div style="opacity:.6">No verified room events yet.</div></div><div id="tlb-pk" style="display:none;padding:8px 12px;border-top:1px solid #ffffff14"></div><div id="tlb-panel" style="display:none;padding:8px 12px;border-top:1px solid #ffffff14"></div><form id="tlb-form" style="display:flex;gap:7px;padding:10px 12px;border-top:1px solid #ffffff18"><input id="tlb-input" aria-label="LIVE chat message" maxlength="300" placeholder="Chat — sends only after server acceptance" style="min-width:0;flex:1;padding:10px;border-radius:10px;border:1px solid #ffffff24;background:#091326;color:#fff"><button style="border:1px solid #4fe3ff88;background:#0b2b3c;color:#fff;border-radius:10px;padding:0 12px;font-weight:800">SEND</button></form><div style="padding:0 12px 11px;font-size:10px;color:#9aa7ba">Gifts and PK scores shown here do not create spendable/withdrawable value unless verified by the server ledger.</div>`
  document.body.appendChild(root)
  const feed=root.querySelector('#tlb-feed'),status=root.querySelector('#tlb-status'),pk=root.querySelector('#tlb-pk'),panel=root.querySelector('#tlb-panel'),form=root.querySelector('#tlb-form'),input=root.querySelector('#tlb-input')
  const redraw=()=>{
    const rows=[...state.messages.slice(-20),...state.gifts.slice(-8)].sort((a,b)=>a.at-b.at)
    feed.innerHTML=rows.length?rows.map(x=>x.kind==='gift'?`<div style="margin:5px 0;padding:6px 8px;border-radius:9px;background:#271b08"><b>🎁 ${clean(x.gift)}</b> from ${clean(x.sender)} <span style="color:#ffd86b">VERIFIED</span></div>`:`<div style="margin:5px 0"><b style="color:#79e7ff">${clean(x.user)}</b>: ${clean(x.text)}</div>`).join(''):'<div style="opacity:.6">No verified room events yet.</div>'
    if(state.pk){pk.style.display='block';pk.innerHTML=`<b>PK • VERIFIED SCORE</b><div style="display:flex;justify-content:space-between;margin-top:5px"><span>${clean(state.pk.aLabel||'A')}: ${Number(state.pk.a||0).toLocaleString()}</span><span>${clean(state.pk.bLabel||'B')}: ${Number(state.pk.b||0).toLocaleString()}</span></div>`}else pk.style.display='none'
    if(state.panel.length){panel.style.display='block';panel.innerHTML=`<b>HOLDING ROOM</b>${state.panel.slice(-6).map(p=>`<div style="margin-top:4px">${clean(p.name||p.user||'Guest')} • ${clean(p.status||'pending')}</div>`).join('')}`}else panel.style.display='none'
  }
  const acceptAuthority=d=>d&&['server','service','ledger'].includes(String(d.authority||'').toLowerCase())
  addEventListener('tryamm:live-chat-accepted',e=>{const d=e.detail||{};if(!acceptAuthority(d))return;state.pending.delete(d.requestId);state.messages.push({kind:'chat',user:d.user||'Guest',text:d.text||'',at:Date.now()});status.textContent='Chat connected • server acknowledged';redraw()})
  addEventListener('tryamm:live-chat-rejected',e=>{const d=e.detail||{};state.pending.delete(d.requestId);status.textContent=`Chat not sent${d.reason?`: ${clean(d.reason)}`:''}`})
  addEventListener('tryamm:live-gift-verified',e=>{const d=e.detail||{};if(!acceptAuthority(d)||!d.transactionId)return;state.gifts.push({kind:'gift',gift:d.giftName||d.gift||'Gift',sender:d.sender||'Viewer',transactionId:d.transactionId,at:Date.now()});status.textContent='Verified gift event received';redraw()})
  addEventListener('tryamm:live-pk-score-authoritative',e=>{const d=e.detail||{};if(!acceptAuthority(d))return;state.pk=d;redraw()})
  addEventListener('tryamm:live-panel-state-authoritative',e=>{const d=e.detail||{};if(!acceptAuthority(d))return;state.panel=Array.isArray(d.requests)?d.requests:[];redraw()})
  form.addEventListener('submit',e=>{e.preventDefault();const text=clean(input.value).trim();if(!text)return;const requestId=`chat-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;state.pending.set(requestId,{text,at:Date.now()});status.textContent='Sending chat • waiting for server acceptance';dispatchEvent(new CustomEvent('tryamm:live-chat-submit',{detail:{requestId,text,source:'live-production-bridge',season}}));input.value='';setTimeout(()=>{if(state.pending.has(requestId)){state.pending.delete(requestId);status.textContent='Chat backend did not acknowledge this message; it was not published.'}},10000)})
  window.__TRYAMM_LIVE_SEASON__=Object.freeze({...season})
  window.tryammLiveBridge={version:'2',season:Object.freeze({...season}),receive:(type,detail={})=>dispatchEvent(new CustomEvent(type,{detail}))}
  dispatchEvent(new CustomEvent('tryamm:live-production-bridge-ready',{detail:{authorityRequired:true,serverAckChat:true,verifiedGifts:true,authoritativePK:true,holdingRoom:true,seasonContext:season}}))
})()
