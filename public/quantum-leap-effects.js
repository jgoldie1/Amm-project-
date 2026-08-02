(function(global){
  'use strict';

  function ensureStyles(){
    if(document.getElementById('tryamm-quantum-leap-styles')) return;
    const style=document.createElement('style');
    style.id='tryamm-quantum-leap-styles';
    style.textContent=`
      #tryamm-quantum-leap{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;pointer-events:none;opacity:0;transition:opacity .25s ease;background:radial-gradient(circle at center,rgba(255,255,255,.96) 0 2%,rgba(111,61,255,.78) 8%,rgba(4,8,24,.96) 52%,#000 100%);overflow:hidden;color:white;text-align:center;font:600 1rem/1.4 system-ui,sans-serif}
      #tryamm-quantum-leap[data-active="true"]{opacity:1}
      #tryamm-quantum-leap::before,#tryamm-quantum-leap::after{content:"";position:absolute;width:22vmin;height:22vmin;border:3px solid rgba(255,255,255,.8);border-radius:50%;box-shadow:0 0 2rem rgba(145,107,255,.9),inset 0 0 2rem rgba(75,220,255,.7);animation:tryamm-ring 1.2s linear infinite}
      #tryamm-quantum-leap::after{width:48vmin;height:48vmin;animation-direction:reverse;animation-duration:2s;opacity:.55}
      #tryamm-quantum-leap .message{position:relative;z-index:2;padding:1rem 1.25rem;border-radius:1rem;background:rgba(0,0,0,.38);backdrop-filter:blur(8px)}
      @keyframes tryamm-ring{to{transform:rotate(360deg) scale(1.08)}}
      @media (prefers-reduced-motion:reduce){#tryamm-quantum-leap{transition:none}#tryamm-quantum-leap::before,#tryamm-quantum-leap::after{animation:none}}
    `;
    document.head.appendChild(style);
  }

  function createOverlay(){
    ensureStyles();
    let overlay=document.getElementById('tryamm-quantum-leap');
    if(overlay) return overlay;
    overlay=document.createElement('section');
    overlay.id='tryamm-quantum-leap';
    overlay.dataset.active='false';
    overlay.setAttribute('role','status');
    overlay.setAttribute('aria-live','polite');
    overlay.setAttribute('aria-atomic','true');
    overlay.innerHTML='<div class="message">Quantum corridor standing by</div>';
    document.body.appendChild(overlay);
    return overlay;
  }

  function createQuantumLeapEffects(options={}){
    const overlay=options.overlay||createOverlay();
    const message=overlay.querySelector('.message');
    const reducedMotion=global.matchMedia&&global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const announce=text=>{message.textContent=text;};
    const delay=ms=>new Promise(resolve=>setTimeout(resolve,reducedMotion?Math.min(ms,50):ms));

    return {
      async beforeTransition({fromSlug,toSlug}={}){
        announce(`Opening quantum corridor from ${fromSlug||'current world'} to ${toSlug||'destination'}`);
        overlay.dataset.active='true';
        await delay(options.enterMs||350);
      },
      async afterDispose(){
        announce('Previous world released. Streaming destination.');
        await delay(options.streamMs||250);
      },
      async afterMount({toSlug}={}){
        announce(`${toSlug||'Destination'} stabilized`);
        await delay(options.exitMs||450);
        overlay.dataset.active='false';
      },
      async fail(error){
        announce(`Quantum corridor closed: ${error&&error.message?error.message:'transition failed'}`);
        await delay(700);
        overlay.dataset.active='false';
      },
      dispose(){overlay.remove();}
    };
  }

  global.TryAMMQuantumLeapEffects={create:createQuantumLeapEffects};
})(window);
