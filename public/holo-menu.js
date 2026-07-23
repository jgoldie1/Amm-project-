(function(){
  const DEFAULT_ITEMS=[
    ['Home','/'],['Free TV','/free-tv-creator.html'],['Reality','/free-tv-creator.html?category=reality'],['News','/news.html'],['GameVerse','/gameverse'],['Music','/music'],['Marketplace','/marketplace'],['Holo5DX','/holo5dx.html'],['Creator Studio','/free-tv-creator.html']
  ];
  function build(items=DEFAULT_ITEMS){
    const nav=document.createElement('nav');nav.setAttribute('aria-label','TryAMM Holo Menu');nav.className='tryamm-holo-menu';
    Object.assign(nav.style,{position:'fixed',left:'50%',bottom:'16px',transform:'translateX(-50%)',zIndex:'9999',display:'flex',gap:'8px',maxWidth:'94vw',overflowX:'auto',padding:'10px',borderRadius:'18px',background:'rgba(10,15,28,.9)',backdropFilter:'blur(12px)',border:'1px solid rgba(255,255,255,.16)',boxShadow:'0 10px 40px rgba(0,0,0,.35)'});
    for(const [label,href] of items){const a=document.createElement('a');a.href=href;a.textContent=label;Object.assign(a.style,{color:'#fff',textDecoration:'none',whiteSpace:'nowrap',padding:'10px 12px',borderRadius:'12px',background:'rgba(255,255,255,.08)',fontFamily:'Arial,sans-serif',fontSize:'14px'});a.onfocus=()=>a.style.outline='2px solid #9fd3ff';a.onblur=()=>a.style.outline='none';nav.appendChild(a)}
    document.body.appendChild(nav);return nav;
  }
  async function init(){try{const r=await fetch('/api/holo-menu');if(r.ok){const d=await r.json();const items=(d.sections||[]).filter(x=>!x.requiresAgeGate).map(x=>[x.label,x.href]);return build(items)}}catch(e){}return build()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.TryAMMHoloMenu={init,build};
})();
