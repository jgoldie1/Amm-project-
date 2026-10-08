/* Stubbs Mobility 360: compare product IDEAS only. No verified pricing, orders or medical advice. */
(function(){
 'use strict';
 const data=Array.isArray(window.__mobility360PreviewCatalog)?window.__mobility360PreviewCatalog:[];
 const byId=new Map(data.map(p=>[p.id,p]));
 const chosen=new Set();
 const root=document.getElementById('comparePanel');
 const empty=document.getElementById('compareEmpty');
 const summary=document.getElementById('compareSummary');
 const grid=document.getElementById('compareGrid');
 const clear=document.getElementById('compareClear');
 if(!root || !empty || !summary || !grid || !clear) return;
 const labels={sample:'First sample candidate — not purchased',review:'Supplier, safety and fulfillment review pending',clinical:'Clinical and regulatory review required'};
 const questions={
  'Daily Living':'Grip comfort, safe object weight, reach length and handling instructions.',
  'Dressing':'Handle size, fastener compatibility, fit, sharp edges and comfort.',
  'Kitchen':'Food-safe materials, compatible utensils, secure grip and cleaning.',
  'Bath & Bedroom':'Weight capacity, stability, installation and professional fitting.',
  'Vision & Hearing':'Accessible controls, actual audio/visual specifications and compatibility.',
  'Communication':'Language options, portability, accessible controls and instructions.',
  'Neuro & Sensory':'Materials, sensory preferences, cleaning and user choice.',
  'Wheelchair & Travel':'Device compatibility, safe attachment, stability and mobility clearance.',
  'Caregiving':'Cleaning, fit, safety instructions and return/warranty arrangements.',
  'Rehab Technology':'Exact model regulatory status, professional oversight, fit and clinical evidence.'
 };
 function paintButtons(){
  document.querySelectorAll('button[data-compare-id]').forEach(b=>{
   const active=chosen.has(b.dataset.compareId);
   b.setAttribute('aria-pressed',String(active));
   b.textContent=active?'✓ Remove from comparison':'+ Compare item';
   b.disabled=!active&&chosen.size>=3;
   b.setAttribute('aria-label',(active?'Remove ':'Compare ')+(byId.get(b.dataset.compareId)?.name||'item'));
  });
 }
 function line(label,value){
  const item=document.createElement('p');item.className='compare-line';
  const strong=document.createElement('strong');strong.textContent=label+': ';
  item.append(strong,document.createTextNode(value));return item;
 }
 function draw(){
  const items=Array.from(chosen).map(id=>byId.get(id)).filter(Boolean);
  summary.textContent=items.length+' of 3 product ideas selected. No verified sale prices, stock or orders.';
  empty.hidden=items.length!==0;root.classList.toggle('compare-active',items.length>0);
  grid.replaceChildren();
  for(const p of items){
   const card=document.createElement('article');card.className='compare-card';
   const heading=document.createElement('h3');heading.textContent=p.name;
   card.append(heading,line('Department',p.category),line('Review status',labels[p.gate]||'Unverified'),
     line('Supplier claims', 'Not independently verified'),
     line('Purchase price', 'Not available — supplier quote pending'),
     line('Questions to ask',questions[p.category]||'Confirm dimensions, safety, warranty and intended use.'));
   const remove=document.createElement('button');remove.type='button';remove.className='compare-remove';
   remove.textContent='Remove '+p.name;remove.addEventListener('click',()=>toggle(p.id));card.append(remove);
   if(p.gate==='clinical')card.append(line('Extra care','Requires specific regulatory and, when appropriate, qualified clinical review. Not a medical recommendation.'));
   grid.append(card);
  }
  paintButtons();
 }
 function toggle(id){
  if(!byId.has(id))return;
  if(chosen.has(id))chosen.delete(id);
  else if(chosen.size<3)chosen.add(id);
  draw();
 }
 clear.addEventListener('click',()=>{chosen.clear();draw()});
 window.Mobility360Compare={toggle,refresh:paintButtons};
 draw();
})();