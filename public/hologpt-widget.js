'use strict';
(()=>{
  if(window.__tryammHoloGPTLoaded)return;window.__tryammHoloGPTLoaded=true;
  const token=()=>localStorage.getItem('tryamm_token')||'';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const root=document.createElement('div');root.id='hologptWidgetRoot';
  root.innerHTML=`<button id="hologptFab" class="hologpt-fab" type="button" aria-haspopup="dialog" aria-controls="hologptPanel">HoloGPT</button><section id="hologptPanel" class="hologpt-panel" hidden role="dialog" aria-modal="false" aria-label="HoloGPT assistant"><header><div><strong>HoloGPT</strong><span id="hologptStatus">Checking intelligence…</span></div><button id="hologptClose" type="button" aria-label="Close HoloGPT">×</button></header><div id="hologptProgress" aria-live="polite" style="font-size:11px;letter-spacing:.08em;padding:6px 12px;min-height:16px"></div><div id="hologptMessages" class="hologpt-messages"><article class="hologpt-ai"><b>HoloGPT</b><p>I’m connected to TRYAMM. I can answer, route you through the platform, and recover from provider failures instead of silently stalling.</p></article></div><form id="hologptForm"><label class="sr-only" for="hologptInput">Message HoloGPT</label><textarea id="hologptInput" rows="3" maxlength="12000" placeholder="Ask HoloGPT or say: open StreetVerse…"></textarea><button id="hologptSend" type="submit">Send</button></form><p id="hologptHint" class="hologpt-hint"></p></section>`;
  document.body.append(root);
  const panel=root.querySelector('#hologptPanel'),fab=root.querySelector('#hologptFab'),close=root.querySelector('#hologptClose'),form=root.querySelector('#hologptForm'),input=root.querySelector('#hologptInput'),send=root.querySelector('#hologptSend'),messages=root.querySelector('#hologptMessages'),statusEl=root.querySelector('#hologptStatus'),hint=root.querySelector('#hologptHint'),progress=root.querySelector('#hologptProgress');
  const sessionId=crypto?.randomUUID?.()||`hs_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const CHECKPOINT_KEY='tryamm_hologpt_checkpoint_v1';

  function add(kind,text,meta=''){const a=document.createElement('article');a.className=kind==='user'?'hologpt-user':'hologpt-ai';a.innerHTML=`<b>${kind==='user'?'You':'HoloGPT'}</b><p>${esc(text).replace(/\n/g,'<br>')}</p>${meta?`<small>${esc(meta)}</small>`:''}`;messages.append(a);messages.scrollTop=messages.scrollHeight;}
  function stage(text){progress.textContent=text||'';window.dispatchEvent(new CustomEvent('tryamm:hologpt-progress',{detail:{stage:text,sessionId,time:Date.now()}}));}
  function checkpoint(data){try{sessionStorage.setItem(CHECKPOINT_KEY,JSON.stringify({sessionId,time:Date.now(),page:location.pathname,...data}))}catch{}}
  function clearCheckpoint(){try{sessionStorage.removeItem(CHECKPOINT_KEY)}catch{}}
  function readCheckpoint(){try{return JSON.parse(sessionStorage.getItem(CHECKPOINT_KEY)||'null')}catch{return null}}

  function localAction(text){
    const q=String(text||'').trim().toLowerCase();
    const map=[
      [/\b(open|go to|launch|start)\b.*\b(live|livestream)\b/,'open-live','Opening TRYAMM LIVE'],
      [/\b(open|go to|launch|enter)\b.*\bstreetverse\b/,'open-streetverse','Opening StreetVerse'],
      [/\b(open|go to|launch|enter)\b.*\b(gameverse|games)\b/,'open-games','Opening GameVerse'],
      [/\b(open|go to|launch)\b.*\b(reels|media|studio)\b/,'open-media','Opening Creator Media'],
      [/\b(open|go to|launch)\b.*\b(access|accessibility)\b/,'open-access','Opening accessibility controls'],
      [/\b(open|go to|launch)\b.*\b(security|guardian)\b/,'open-security','Opening Security Center'],
      [/\b(open|go to|launch)\b.*\b(family|legacy)\b/,'open-family','Opening Family Legacy'],
      [/\b(open|go to|launch)\b.*\b(omniverse|holoverse)\b/,'open-omniverse','Opening Omniverse']
    ];
    for(const [pattern,action,label] of map)if(pattern.test(q))return {action,label};
    return null;
  }

  function executeLocalAction(match){
    const jarvis=window.__jarvis;
    const ok=jarvis&&typeof jarvis.execute==='function'?jarvis.execute({action:match.action,payload:{source:'hologpt'}}):false;
    if(!ok){
      window.dispatchEvent(new CustomEvent('tryamm:jarvis-command',{detail:{action:match.action,payload:{source:'hologpt'}}}));
      const fallback={
        'open-live':'/live',
        'open-streetverse':'/streetverse',
        'open-games':'/?open=gameverse',
        'open-media':'/?open=media',
        'open-access':'/accessibility',
        'open-security':'/guardian',
        'open-family':'/?open=family',
        'open-omniverse':'/?open=omniverse'
      }[match.action];
      if(fallback)setTimeout(()=>{window.location.href=fallback},120);
    }
    add('ai',`${match.label}. I handled this as a local TRYAMM action, so it did not wait on a cloud model.`,'Action-first · local route');
    stage('COMPLETE');
    checkpoint({status:'complete',action:match.action});
    clearCheckpoint();
    return true;
  }

  async function health(){try{const r=await fetch('/api/hologpt/health',{cache:'no-store'}),d=await r.json();if(!r.ok)throw new Error(d.error||'health failed');const race=d.orchestration==='hedged-model-race'?' · Race Router':'';statusEl.textContent=d.intelligentProviderConfigured?`Online · ${d.provider}${race}`:'Recovery mode · local tools available';statusEl.dataset.ready=d.intelligentProviderConfigured?'true':'false';}catch{statusEl.textContent='Recovery mode';statusEl.dataset.ready='false';}}

  async function ask(text,{retry=false}={}){
    const auth=token();
    if(!auth){add('ai','Sign in to TRYAMM first so HoloGPT can use authenticated memory and account services.','Authentication required');hint.innerHTML='<a href="/">Go to TRYAMM home to sign in</a>';return;}
    const checkpointId=crypto?.randomUUID?.()||`hcp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    checkpoint({checkpointId,status:'running',message:text.slice(0,12000),retry});
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),50000);
    const timers=[
      setTimeout(()=>stage('ROUTING · choosing the best available brain'),350),
      setTimeout(()=>stage('RACING MODELS · hedging against a slow provider'),1600),
      setTimeout(()=>stage('VERIFYING · keeping the first valid completion'),4500),
      setTimeout(()=>stage('RECOVERY · provider is slow, failover remains active'),9000)
    ];
    try{
      stage(retry?'RESUMING · checkpoint restored':'UNDERSTANDING');
      const r=await fetch('/api/hologpt/chat',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${auth}`},body:JSON.stringify({message:text,page:location.pathname,sessionId,checkpointId,resume:retry}),signal:controller.signal});
      const d=await r.json();if(!r.ok)throw new Error(d.error||'HoloGPT request failed');
      const orch=d.orchestration||{};
      const latency=Number(orch.totalLatencyMs)||0;
      const meta=[d.provider,d.degraded?'degraded':null,orch.mode,latency?`${latency}ms`:null,d.memorySaved?'memory saved':null].filter(Boolean).join(' · ');
      add('ai',d.answer,meta);
      statusEl.textContent=d.degraded?`Recovery mode · ${d.provider}`:`Online · ${d.provider}`;
      stage('COMPLETE');
      hint.textContent='';
      checkpoint({checkpointId,status:'complete'});
      clearCheckpoint();
    }catch(error){
      checkpoint({checkpointId,status:'interrupted',message:text.slice(0,12000),error:String(error?.message||error).slice(0,240)});
      if(!retry){
        stage('RECOVERY · retrying from checkpoint');
        await new Promise(resolve=>setTimeout(resolve,650));
        return ask(text,{retry:true});
      }
      const msg=error?.name==='AbortError'?'The request exceeded the recovery window. Your task checkpoint is still available for another retry.':`I could not complete that request after automatic failover: ${error.message}`;
      add('ai',msg,'Never-Stall recovery stopped safely');
      stage('CHECKPOINT SAVED');
      hint.textContent='Your last request can be resumed without retyping it.';
    }finally{
      clearTimeout(timeout);timers.forEach(clearTimeout);send.disabled=false;
    }
  }

  fab.addEventListener('click',()=>{panel.hidden=false;fab.hidden=true;health();const cp=readCheckpoint();if(cp?.status==='interrupted'&&cp.message){hint.textContent='Interrupted task found. Tap Send with an empty box to resume it.';}setTimeout(()=>input.focus(),0)});
  close.addEventListener('click',()=>{panel.hidden=true;fab.hidden=false});
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    let text=input.value.trim();
    if(!text){const cp=readCheckpoint();if(cp?.status==='interrupted'&&cp.message)text=cp.message;else return;}
    const action=localAction(text);
    add('user',text);input.value='';send.disabled=true;hint.textContent='';
    if(action){executeLocalAction(action);send.disabled=false;return;}
    await ask(text,{retry:Boolean(readCheckpoint()?.status==='interrupted')});
  });
  health();
})();
