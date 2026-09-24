(()=>{
  if(!location.pathname.startsWith('/streetverse'))return
  const KEY='tryamm.streetverse.global-world.v1'
  const regions={
    chicago:{label:'Chicago • Urban',biome:'urban',marine:false,savanna:false,apex:false,yacht:false,climate:'continental-city'},
    greatLakes:{label:'Great Lakes • Yacht',biome:'freshwater-coast',marine:false,savanna:false,apex:false,yacht:true,climate:'lake'},
    caribbean:{label:'Caribbean • Islands',biome:'tropical-coast',marine:true,savanna:false,apex:false,yacht:true,climate:'tropical'},
    mediterranean:{label:'Mediterranean • Yacht',biome:'mediterranean-coast',marine:true,savanna:false,apex:false,yacht:true,climate:'mediterranean'},
    westAfrica:{label:'West Africa • Coast',biome:'tropical-coast',marine:true,savanna:false,apex:false,yacht:true,climate:'tropical'},
    eastAfrica:{label:'East Africa • Savanna',biome:'savanna',marine:false,savanna:true,apex:true,yacht:false,climate:'savanna'},
    amazon:{label:'Amazon • Rainforest',biome:'rainforest',marine:false,savanna:false,apex:false,yacht:false,climate:'rainforest'},
    pacific:{label:'Pacific • Islands',biome:'island-ocean',marine:true,savanna:false,apex:false,yacht:true,climate:'tropical-ocean'},
    arctic:{label:'Arctic • Expedition',biome:'polar',marine:true,savanna:false,apex:false,yacht:true,climate:'polar'},
    openOcean:{label:'Open Ocean • Yacht',biome:'open-ocean',marine:true,savanna:false,apex:false,yacht:true,climate:'ocean'}
  }
  let current=localStorage.getItem(KEY)||'chicago';if(!regions[current])current='chicago'
  let mounted=false,lastSource='manual',weatherState=null,weatherDestination=null,weatherLocations=[]
  const css=`
  #sv-world-open{position:absolute;left:12px;top:158px;z-index:30500;min-height:44px;padding:0 11px;border-radius:12px;border:1px solid #7bdfff;background:#071426e8;color:#fff;font:900 10px/1 system-ui;box-shadow:0 6px 18px #0008;pointer-events:auto}
  #sv-world-panel{position:absolute;left:10px;right:10px;bottom:12px;z-index:30600;display:none;max-height:56%;overflow:auto;border-radius:14px;border:1px solid #7bdfff;background:#04101df4;color:#fff;padding:10px;box-shadow:0 10px 30px #000c;pointer-events:auto;font-family:system-ui,sans-serif}
  #sv-world-panel[data-open="true"]{display:block}
  #sv-world-panel h3{margin:0 0 4px;color:#a8efff;font-size:14px}#sv-world-panel p{margin:0 0 8px;color:#d5f6ff;font-size:10px;line-height:1.35}
  #sv-world-panel .grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}
  #sv-world-panel button{min-height:44px;border-radius:10px;border:1px solid #5ccae5;background:#092238;color:#fff;font:800 9px/1.2 system-ui;padding:6px}
  #sv-world-panel .close{float:right;min-width:44px}.sv-world-status{margin-top:8px;padding:7px;border-radius:8px;background:#071a2b;border:1px solid #397a94;color:#d8f7ff;font:800 9px/1.25 system-ui}
  #sv-yacht{position:absolute;left:50%;bottom:1%;transform:translateX(-50%);z-index:4;display:none;width:58%;height:15%;border-radius:60% 60% 18% 18%;background:linear-gradient(180deg,#f3fbff,#96cadd 62%,#18384a);box-shadow:0 8px 18px #000a;pointer-events:none}
  #sv-yacht:before{content:'TRYAMM YACHT';position:absolute;left:22%;right:22%;top:19%;height:25%;border-radius:8px 8px 2px 2px;background:#163b50;color:#c7f4ff;font:900 7px/2.4 system-ui;text-align:center;border:1px solid #82dfff}
  #sv-yacht:after{content:'⚓';position:absolute;right:9%;bottom:8%;font-size:15px}
  body[data-sv-yacht="true"] #sv-yacht{display:block}
  body[data-sv-marine="false"] #sv-marine{display:none!important}
  body[data-sv-savanna="false"] #sv-savanna{display:none!important}
  body[data-sv-apex="false"] #sv-apex-wildlife{display:none!important}
  body[data-sv-biome="open-ocean"] [data-streetverse-html-city="true"] main,
  body[data-sv-biome="island-ocean"] [data-streetverse-html-city="true"] main{background-image:linear-gradient(#12385833,#0a466655)!important}
  #sv-weather-fx{position:absolute;inset:0;z-index:3;pointer-events:none;display:none}
  #sv-weather-chip{position:absolute;left:12px;top:207px;z-index:30500;max-width:72%;padding:7px 9px;border-radius:999px;border:1px solid #7bdfff88;background:#04101de8;color:#dffaff;font:900 9px/1.2 system-ui;pointer-events:none}
  body[data-sv-weather="rain"] #sv-weather-fx,body[data-sv-weather="storm"] #sv-weather-fx{display:block;background:repeating-linear-gradient(108deg,transparent 0 14px,#bcecff55 15px 16px,transparent 17px 31px);background-size:180px 180px;animation:sv-rain .42s linear infinite}
  body[data-sv-weather="snow"] #sv-weather-fx{display:block;background-image:radial-gradient(circle,#fff 0 2px,transparent 2.5px),radial-gradient(circle,#eaf8ff 0 1.5px,transparent 2px);background-size:36px 44px,55px 62px;animation:sv-snow 5s linear infinite}
  body[data-sv-weather="fog"] #sv-weather-fx{display:block;background:linear-gradient(#bdc8cedd,#87949bbb);backdrop-filter:blur(2px)}
  body[data-sv-weather="clouds"] [data-streetverse-html-city="true"] main{filter:saturate(.78) brightness(.78)}
  body[data-sv-weather="storm"] [data-streetverse-html-city="true"] main{filter:saturate(.7) brightness(.55)}
  @keyframes sv-rain{to{background-position:-28px 180px}}@keyframes sv-snow{to{background-position:18px 180px,-24px 220px}}
  .sv-weather-search-wrap{margin-top:10px;padding-top:9px;border-top:1px solid #2b5b70}
  .sv-weather-search-title{font:900 10px/1.2 system-ui;color:#9ceeff;margin-bottom:6px}
  #sv-weather-city-search{width:100%;box-sizing:border-box;min-height:42px;border-radius:10px;border:1px solid #5ccae5;background:#061725;color:#fff;padding:8px 10px;font:800 11px system-ui}
  #sv-weather-city-results{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:7px}
  #sv-weather-city-results button{min-height:46px;text-align:left}
  .sv-weather-city-empty{grid-column:1/-1;padding:8px;border-radius:8px;background:#071a2b;color:#b9d6e3;font:700 9px/1.3 system-ui}
  #sv-world-panel button:focus,#sv-world-open:focus,#sv-weather-city-search:focus{outline:3px solid #fff;outline-offset:2px}
  `
  function emit(){
    const r=regions[current]
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-global-region',{detail:{regionId:current,...r,source:'virtual-game-world',selectionSource:lastSource,gps:lastSource==='gps'}}))
  }
  function apply(){
    const r=regions[current]
    document.body.dataset.svRegion=current;document.body.dataset.svBiome=r.biome;document.body.dataset.svMarine=String(r.marine);document.body.dataset.svSavanna=String(r.savanna);document.body.dataset.svApex=String(r.apex);document.body.dataset.svYacht=String(r.yacht)
    localStorage.setItem(KEY,current);emit()
  }
  function mount(){
    if(mounted)return
    const htmlCity=document.querySelector('[data-streetverse-html-city="true"]')
    const worldRoot=htmlCity||document.querySelector('[data-streetverse-world-root="true"]')||document.querySelector('[role="dialog"][aria-label^="StreetVerse"]')
    if(!worldRoot)return
    const main=worldRoot.querySelector('main')||worldRoot
    mounted=true
    const style=document.createElement('style');style.id='sv-global-world-style';style.textContent=css;document.head.appendChild(style)
    const open=document.createElement('button');open.id='sv-world-open';open.type='button';open.textContent='🌍 WORLD';open.setAttribute('aria-controls','sv-world-panel');open.setAttribute('aria-expanded','false')
    const panel=document.createElement('section');panel.id='sv-world-panel';panel.dataset.open='false';panel.setAttribute('aria-label','StreetVerse global world travel')
    panel.innerHTML=`<button class="close" type="button" aria-label="Close world travel">✕</button><h3>STREETVERSE GLOBAL WORLD</h3><p>Virtual travel across cities, coasts, islands, ocean and wildlife reserves. Manual travel works without GPS; optional GPS controls can suggest the nearest game region.</p><div class="grid">${Object.entries(regions).map(([id,r])=>`<button type="button" data-region="${id}">${r.yacht?'🛥️ ':r.savanna?'🌍 ':'📍 '}${r.label}</button>`).join('')}</div><div class="sv-weather-search-wrap"><div class="sv-weather-search-title">GLOBAL WEATHER CITY</div><input id="sv-weather-city-search" type="search" inputmode="search" autocomplete="off" placeholder="Search approved city or country" aria-label="Search global weather cities"/><div id="sv-weather-city-results" aria-live="polite"></div></div><div class="sv-world-status" aria-live="polite"></div>`
    const yacht=document.createElement('div');yacht.id='sv-yacht';yacht.setAttribute('aria-hidden','true');const weatherFx=document.createElement('div');weatherFx.id='sv-weather-fx';weatherFx.setAttribute('aria-hidden','true');const weatherChip=document.createElement('div');weatherChip.id='sv-weather-chip';weatherChip.setAttribute('aria-live','polite');weatherChip.textContent='WEATHER • CONNECTING'
    const setOpen=v=>{panel.dataset.open=String(v);open.setAttribute('aria-expanded',String(v))}
    const status=panel.querySelector('.sv-world-status')
    function updateStatus(){const r=regions[current];const destination=weatherDestination?' • weather '+weatherDestination.label:'';status.textContent=`Current world: ${r.label} • biome ${r.biome}${r.yacht?' • yacht available':''}${lastSource==='gps'?' • GPS selected':''}${destination}.`}
    function syncWorld(){updateStatus();apply()}
    open.addEventListener('click',()=>setOpen(panel.dataset.open!=='true'));panel.querySelector('.close')?.addEventListener('click',()=>setOpen(false))
    panel.querySelectorAll('[data-region]').forEach(btn=>btn.addEventListener('click',()=>{current=btn.dataset.region;lastSource='manual';weatherDestination=null;syncWorld();setOpen(false)}))
    const search=panel.querySelector('#sv-weather-city-search'),cityResults=panel.querySelector('#sv-weather-city-results')
    const featured=['lagos','abuja','newYork','london','tokyo','sydney','toronto','saoPaulo','dubai','nairobi','paris','singapore']
    function renderWeatherCities(query=''){
      if(!cityResults)return
      cityResults.replaceChildren()
      const q=String(query||'').trim().toLowerCase()
      const ordered=[...weatherLocations].sort((a,b)=>{const ai=featured.indexOf(a.id),bi=featured.indexOf(b.id);if(!q&&ai!==bi){if(ai<0)return 1;if(bi<0)return -1;return ai-bi}return String(a.label).localeCompare(String(b.label))})
      const matches=ordered.filter(item=>item.kind==='city'&&(!q||[item.label,item.country,item.continent].some(value=>String(value||'').toLowerCase().includes(q)))).slice(0,14)
      if(!matches.length){const empty=document.createElement('div');empty.className='sv-weather-city-empty';empty.textContent=weatherLocations.length?'No approved city matches that search.':'City weather catalog is loading…';cityResults.appendChild(empty);return}
      matches.forEach(item=>{const button=document.createElement('button');button.type='button';button.dataset.weatherLocation=item.id;button.textContent='🌦️ '+item.label+' • '+item.country;button.addEventListener('click',()=>{weatherDestination={id:item.id,label:item.label};weatherChip.textContent='WEATHER • '+item.label+' • CONNECTING';updateStatus();window.dispatchEvent(new CustomEvent('tryamm:streetverse-weather-destination',{detail:{id:item.id,label:item.label,scope:'global',country:item.country,continent:item.continent}}));setOpen(false)});cityResults.appendChild(button)})
    }
    search?.addEventListener('input',()=>renderWeatherCities(search.value))
    fetch('/api/intelligence/global-weather?action=status',{headers:{accept:'application/json'}}).then(response=>response.json()).then(payload=>{weatherLocations=Array.isArray(payload?.locations)?payload.locations:[];renderWeatherCities(search?.value||'')}).catch(()=>{weatherLocations=[];renderWeatherCities(search?.value||'')})
    renderWeatherCities()
    if(htmlCity)main.append(weatherFx,yacht);main.append(open,weatherChip,panel);syncWorld()
    const onWeather=event=>{const d=event.detail||{};weatherState=d;weatherDestination=d.regionId&&d.regionId!==current?{id:String(d.regionId),label:String(d.regionLabel||d.regionId)}:null;const temp=d.temperature===null||d.temperature===undefined?'--':Math.round(Number(d.temperature))+'°';weatherChip.textContent='WEATHER • '+String(d.regionLabel||regions[current].label)+' • '+String((document.body.dataset.svWeather||'unavailable').toUpperCase())+' • '+temp+(d.current&&!d.simulated&&!d.unavailable?' • LIVE':' • GATED');updateStatus()};addEventListener('tryamm:streetverse-weather-state',onWeather);window.StreetVerseGlobalWorld={regions:JSON.parse(JSON.stringify(regions)),current:()=>({id:current,...regions[current],selectionSource:lastSource}),travel:(id,source='manual')=>{if(!regions[id])return false;current=id;lastSource=source==='gps'?'gps':'manual';weatherDestination=null;syncWorld();return true},weatherLocations:()=>weatherLocations.map(({id,label,scope,kind,country,continent})=>({id,label,scope,kind,country,continent}))}
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-global-world-ready',{detail:{regions:Object.keys(regions),current,source:'virtual-game-world',gpsOptional:true,yachtRegions:Object.entries(regions).filter(([,r])=>r.yacht).map(([id])=>id)}}))
  }
  const observer=new MutationObserver(mount);observer.observe(document.documentElement,{subtree:true,childList:true});mount()
  addEventListener('pagehide',()=>observer.disconnect(),{once:true})
})()
