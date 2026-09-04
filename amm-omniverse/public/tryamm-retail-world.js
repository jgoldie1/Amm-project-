(()=>{
  if(!location.pathname.startsWith('/streetverse'))return
  const VERSION='20260903-retail-world-v1'
  const stores=[
    {id:'bodega',name:'Neighborhood Bodega',icon:'🏪',type:'bodega',categories:['snacks','drinks','pantry','fresh basics','household','local products']},
    {id:'mom-pop',name:'Mom & Pop Market',icon:'🛍️',type:'independent-market',categories:['grocery','household','local brands','beauty','produce']},
    {id:'yahavah',name:'YAHAVAH Grocery',icon:'🛒',type:'grocery',categories:['grocery','local beef','poultry','eggs','dairy','produce','pantry']},
    {id:'butcher',name:'Local Butcher & Farm Market',icon:'🥩',type:'local-food-market',categories:['beef','poultry','pork','lamb','goat','eggs','dairy']},
    {id:'beauty',name:'All American Beauty Supply',icon:'💇🏾‍♀️',type:'beauty-supply',categories:['hair','wigs','braiding','lashes','makeup','nails','barber']},
    {id:'telecom',name:'Holo Fon / Telecom Store',icon:'📱',type:'telecom',categories:['phones','esim','accessories','connectivity']},
    {id:'fashion',name:'All American Fashion Store',icon:'👕',type:'fashion',categories:['clothing','shoes','accessories','creator merch']},
    {id:'electronics',name:'All American Electronics',icon:'💻',type:'electronics',categories:['computers','audio','gaming','accessories']},
    {id:'furniture',name:'Home & Furniture Store',icon:'🛋️',type:'home',categories:['furniture','decor','home','appliances']},
    {id:'hardware',name:'Hardware & Home Improvement',icon:'🛠️',type:'hardware',categories:['tools','hardware','home improvement','building supplies']},
    {id:'auto',name:'Auto Parts & Accessories',icon:'🚗',type:'automotive',categories:['auto parts','car care','accessories','ev']},
    {id:'books',name:'Kingdoms Press Bookstore',icon:'📚',type:'bookstore',categories:['books','ebooks','audio','education']},
    {id:'pets',name:'Pet & Animal Supply',icon:'🐕',type:'pet-supply',categories:['pet food','pet care','toys','accessories']},
    {id:'discount',name:'Value / Dollar Store',icon:'💵',type:'discount',categories:['household','snacks','personal care','school supplies']},
    {id:'creator',name:'Creator Storefront',icon:'✨',type:'creator-store',categories:['merch','digital','fashion','music','art']}
  ]
  const css=`
  #sv-retail-open{position:fixed;left:12px;bottom:74px;z-index:22110;min-height:44px;padding:0 12px;border-radius:999px;border:1px solid #7ee3ff;background:#071a26ee;color:#fff;font:900 10px/1 system-ui;box-shadow:0 8px 24px #000a}
  #sv-retail{position:fixed;left:10px;right:10px;bottom:128px;z-index:22120;display:none;max-height:66vh;overflow:auto;border-radius:18px;border:1px solid #61cfe8;background:#051018f7;color:#fff;padding:12px;box-shadow:0 18px 55px #000d;font-family:system-ui,sans-serif}
  #sv-retail[data-open="true"]{display:block}.top{display:flex;align-items:center;justify-content:space-between;gap:8px}.top h2{margin:0;font-size:15px;color:#bcefff}.top small{color:#9fc5d1}
  #sv-retail button{min-height:44px;border:1px solid #4b9eb4;border-radius:10px;background:#0a2230;color:#fff;font-weight:900;padding:7px 9px}#sv-retail button:focus,#sv-retail-open:focus{outline:3px solid #fff;outline-offset:2px}
  .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}.store{text-align:left;padding:9px;border-radius:12px;border:1px solid #365a68;background:#0a1921;min-height:105px}.store .icon{font-size:25px;display:block}.store small{display:block;color:#bad3dc;margin-top:5px;line-height:1.3}.status{margin-top:8px;padding:8px;border-radius:9px;background:#0d1c23;border:1px solid #34515e;font-size:9px;color:#d9f4ff}.truth{margin-top:8px;padding:8px;border-radius:9px;background:#211a08;border:1px solid #8a6d2c;color:#ffe0a2;font-size:9px;line-height:1.35}@media(max-width:390px){.grid{grid-template-columns:1fr}}
  `
  function mount(){
    if(document.getElementById('sv-retail-open'))return
    const style=document.createElement('style');style.id='sv-retail-style';style.textContent=css;document.head.appendChild(style)
    const open=document.createElement('button');open.id='sv-retail-open';open.type='button';open.textContent='🏪 STORES';open.setAttribute('aria-controls','sv-retail');open.setAttribute('aria-expanded','false')
    const panel=document.createElement('section');panel.id='sv-retail';panel.dataset.open='false';panel.setAttribute('aria-label','StreetVerse store network')
    panel.innerHTML=`<div class="top"><div><h2>STREETVERSE STORE NETWORK</h2><small>Neighborhood stores + global retail</small></div><button class="close" type="button">CLOSE</button></div><div class="grid">${stores.map(s=>`<button class="store" type="button" data-store="${s.id}"><span class="icon">${s.icon}</span><b>${s.name}</b><small>${s.categories.join(' • ')}</small></button>`).join('')}</div><div class="status" aria-live="polite">Choose a store. The same virtual inventory and checkout rails can serve each location.</div><div class="truth">Store selection does not create inventory or activate a merchant, carrier or payment provider. Real checkout stays behind verified SKU, seller and fulfillment gates.</div>`
    const status=panel.querySelector('.status')
    const setOpen=v=>{panel.dataset.open=String(v);open.setAttribute('aria-expanded',String(v))}
    open.addEventListener('click',()=>setOpen(true));panel.querySelector('.close').addEventListener('click',()=>setOpen(false))
    panel.querySelectorAll('[data-store]').forEach(btn=>btn.addEventListener('click',()=>{
      const store=stores.find(s=>s.id===btn.dataset.store);if(!store)return
      status.textContent=`Entering ${store.name}. Walk-in shopping uses the shared pick-up / inspect / label / basket / checkout engine.`
      window.dispatchEvent(new CustomEvent('tryamm:retail-store-selected',{detail:{...store,version:VERSION}}))
      window.TRYAMMImmersiveStore?.open?.()
      setOpen(false)
    }))
    document.body.append(open,panel)
    window.TRYAMMRetailWorld={version:VERSION,stores:JSON.parse(JSON.stringify(stores)),open:()=>setOpen(true),select:id=>{const store=stores.find(s=>s.id===id);if(!store)return false;window.dispatchEvent(new CustomEvent('tryamm:retail-store-selected',{detail:{...store,version:VERSION}}));window.TRYAMMImmersiveStore?.open?.();return true}}
    window.dispatchEvent(new CustomEvent('tryamm:retail-world-ready',{detail:{version:VERSION,stores:stores.map(s=>s.id),features:['mom-and-pop','bodega','grocery','farm-market','beauty','telecom','fashion','electronics','furniture','hardware','auto','bookstore','pet-supply','discount','creator-store']}}))
  }
  mount()
})()
