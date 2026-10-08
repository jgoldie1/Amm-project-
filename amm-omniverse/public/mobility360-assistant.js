/* Stubbs Mobility 360 — accessible local catalog guide.
   No AI provider required; no orders, private medical details or diagnostic advice.
   The full HoloGPT app remains a separate optional TRYAMM route. */
(function () {
  'use strict';
  if (document.getElementById('mobility360-assistant-root')) return;
  const catalog = Array.isArray(window.__mobility360PreviewCatalog) ? window.__mobility360PreviewCatalog : [];
  const root = document.createElement('div');
  root.id = 'mobility360-assistant-root';
  root.innerHTML = [
    '<button class="m360-ai-launch" type="button" id="m360-ai-launch" aria-haspopup="dialog" aria-expanded="false" aria-controls="m360-ai-dialog">✦ Ask Stubbs AI</button>',
    '<div class="m360-ai-overlay" id="m360-ai-overlay" hidden>',
      '<section class="m360-ai-dialog" role="dialog" aria-modal="true" aria-labelledby="m360-ai-title" id="m360-ai-dialog">',
        '<header class="m360-ai-head"><div><div class="m360-ai-eyebrow">HOLOGPT • POWERED BY STUBBS AI</div><h2 id="m360-ai-title">Mobility 360 Shopping Guide</h2><span class="m360-ai-sub">Local catalog assistance • No account required</span></div>',
          '<button type="button" class="m360-ai-close" id="m360-ai-close" aria-label="Close shopping guide">✕</button></header>',
        '<div class="m360-ai-body">',
          '<p class="m360-ai-note">I can explain this store and suggest categories from its <strong>51 proposed products</strong>. I cannot diagnose conditions, choose medical treatment, verify prices, or place orders. Nothing in the preview is approved for sale.</p>',
          '<div class="m360-ai-examples" aria-label="Common questions">',
            '<button type="button" data-question="Help with one-handed everyday tasks">One-handed living</button>',
            '<button type="button" data-question="What could help caregivers?">Caregiver essentials</button>',
            '<button type="button" data-question="Can I buy anything yet?">Prices and ordering</button>',
            '<button type="button" data-question="What about foot-drop braces and stimulation?">Advanced devices</button>',
          '</div>',
          '<div class="m360-ai-chat" id="m360-ai-chat" role="log" aria-live="polite" aria-relevant="additions text"><p class="m360-ai-message m360-ai-assistant">Hello! Tell me which everyday task you want to make easier. I can point to relevant product ideas, free guides, or planned demo videos.</p></div>',
        '</div>',
        '<form class="m360-ai-form" id="m360-ai-form"><label for="m360-ai-input">Your question</label>',
          '<div class="m360-ai-input-row"><input id="m360-ai-input" type="text" maxlength="220" autocomplete="off" placeholder="Example: easier dressing with one hand">',
          '<button type="submit" class="m360-ai-send">Ask</button></div>',
          '<div class="m360-ai-tools"><button id="m360-ai-mic" type="button" hidden>🎙 Voice input</button><button id="m360-ai-read" type="button">🔊 Read answer</button></div>',
          '<p class="m360-ai-privacy">No diagnosis required. This local guide does not send your question to our AI server or save a chat history. Optional voice recognition may use your browser’s speech provider; avoid sharing private medical details.</p>',
          '<div class="m360-ai-full"><a href="/?open=hologpt&amp;context=mobility360">Open full HoloGPT in TRYAMM ↗</a><a href="/mobility360-learn.html">Free guides + demo plans ↗</a></div>',
        '</form>',
      '</section>',
    '</div>'
  ].join('');
  document.body.append(root);

  const launcher = root.querySelector('#m360-ai-launch');
  const overlay = root.querySelector('#m360-ai-overlay');
  const closer = root.querySelector('#m360-ai-close');
  const chat = root.querySelector('#m360-ai-chat');
  const input = root.querySelector('#m360-ai-input');
  const form = root.querySelector('#m360-ai-form');
  const microphone = root.querySelector('#m360-ai-mic');
  const read = root.querySelector('#m360-ai-read');
  let previousFocus = null;
  let lastAnswer = '';
  let listening = false;
  const safeCategories = ['Daily Living', 'Dressing', 'Kitchen', 'Bath & Bedroom', 'Vision & Hearing', 'Communication', 'Neuro & Sensory', 'Wheelchair & Travel', 'Caregiving'];
  function show(open) {
    if (open) {
      previousFocus = document.activeElement;
      overlay.hidden = false;
      launcher.setAttribute('aria-expanded', 'true');
      input.focus();
    } else {
      overlay.hidden = true;
      launcher.setAttribute('aria-expanded', 'false');
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
      else launcher.focus();
    }
  }
  launcher.addEventListener('click', () => show(true));
  closer.addEventListener('click', () => show(false));
  overlay.addEventListener('click', event => { if (event.target === overlay) show(false); });
  overlay.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); show(false); }
    if (event.key !== 'Tab') return;
    const controls = Array.from(overlay.querySelectorAll('a[href],button:not([disabled]):not([hidden]),input:not([disabled])')).filter(el => el.getClientRects().length > 0);
    if (!controls.length) return;
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  function addMessage(who, message) {
    const p = document.createElement('p');
    p.className = 'm360-ai-message ' + (who === 'user' ? 'm360-ai-user' : 'm360-ai-assistant');
    p.textContent = message;
    chat.append(p);
    chat.scrollTop = chat.scrollHeight;
    if (who === 'assistant') lastAnswer = message;
  }
  function findMatches(categories, words) {
    return catalog.filter(p => {
      if (p.gate === 'clinical') return false;
      const categoryMatch = categories.includes(p.category);
      const text = (String(p.name || '') + ' ' + String(p.description || '')).toLowerCase();
      return categoryMatch || words.some(w => text.includes(w));
    }).slice(0, 5).map(p => p.name);
  }
  function describeList(prefix, categories, words) {
    const matches = findMatches(categories, words);
    return prefix + (matches.length ? '\n\nIdeas in the preview: ' + matches.join(' • ') + '.' : '\n\nSee our growing catalog for product ideas.') +
      '\n\nThese are unverified product concepts, not personalized recommendations or items ready to order. Compare the actual product dimensions, safety instructions and returns after a supplier is approved.';
  }
  function answer(question) {
    const q = question.trim().toLowerCase().slice(0, 220);
    if (!q) return 'Tell me an everyday task you would like help with, such as getting dressed, preparing food or reaching objects.';
    if (/emergency|stroke symptoms|sudden weakness|chest pain|can't breathe|cannot breathe/.test(q))
      return 'This shopping guide cannot help with emergencies. If someone may be having a stroke, has new sudden weakness, chest pain or severe breathing difficulty, call 911 or your local emergency number now.';
    if (/price|cost|shipping|buy|order|cart|checkout|pay|cheapest|discount|money|stock|availability/.test(q))
      return 'The Mobility 360 site currently has 51 product ideas, but zero approved items available for checkout. We cannot quote final prices, shipping dates, savings or inventory until suppliers and fulfillment are verified. The first $100 is a proposed, unspent sample budget.';
    if (/foot.?drop|afo|electrical|stimulat|exoskeleton|robotic|rehab|medical|therapy|recover|paraly|diagnos|cure/.test(q))
      return 'Braces, electrical stimulation, powered gloves and walking exoskeletons may need individualized fit, clinical review and U.S. regulatory checks. I cannot say which device is appropriate for your condition or promise improved movement. Ask a qualified rehabilitation clinician about suitability. The store is not selling these devices.';
    if (/supplier|wholesale|distribut|resell|vendor|disability.?owned|sell my product|affiliate|ambassador|franchise|business/.test(q))
      return 'Mobility 360 plans a disability-owned seller section, vendor sourcing, affiliate creators and institutional purchasing. Applications, commissions and payments are not live yet. Suppliers need product verification, media rights, warranty/returns and shipping documentation. See the Learn + Watch page for planned programs.';
    if (/video|watch|demo|tutorial|captions|learn|lesson|teach|live shopping/.test(q))
      return 'Free comparison guides and four demonstration video plans are available under Learn + Watch. Actual product videos have not been filmed or authorized. We will add captions, transcripts and real demonstrations when the matching products are verified. LIVE shopping is planned, not active.';
    if (/one.hand|hand|button|zip|dress|shoelace|sock|finger|grab|reach/.test(q))
      return describeList('For dressing, reaching and one-handed everyday tasks, compare grip size, reach, fit and how easy each product is to handle.', ['Dressing', 'Daily Living'], ['button','reacher','sock','one-hand','lace']);
    if (/caregiver|senior|bed|bath|shower|toilet|transfer|home safety/.test(q))
      return describeList('For caregivers and home routines, begin with product dimensions, instructions, room layout and return terms. Transfers and fall-risk equipment deserve qualified help.', ['Caregiving', 'Bath & Bedroom'], ['shower','bed','chair','bath']);
    if (/vision|blind|hearing|deaf|communicat|speech|talk|caption|tactile|sensory|autis|neuro/.test(q))
      return describeList('The catalog also covers practical visual, hearing, communication and sensory-access ideas.', ['Vision & Hearing', 'Communication', 'Neuro & Sensory'], ['tactile','speech','caption']);
    if (/kitchen|cook|jar|food|utensil|plate|cup|cutting/.test(q))
      return describeList('For kitchen independence, check food-safe materials, stabilizing features, cleaning and pinch/cut risks.', ['Kitchen'], ['jar','utensil','plate','cup','cutting']);
    if (/wheelchair|walker|cane|travel|ride|mobility|walk/.test(q))
      return describeList('For mobility and travel accessories, compare compatibility and stability; never substitute consumer accessories for professional fitting.', ['Wheelchair & Travel'], ['wheelchair','travel','cane']);
    return 'I can help navigate the proposed product catalog, everyday living aids, caregiver resources, demo plans and supplier programs. Try “one-handed dressing”, “kitchen tools”, “caregiver essentials”, or “are prices verified?” For detailed conversation, you can open full HoloGPT in TRYAMM if its AI provider is available.';
  }
  function ask(question) {
    const clean = String(question || '').trim().slice(0, 220);
    if (!clean) return;
    addMessage('user', clean);
    addMessage('assistant', answer(clean));
    input.value = '';
  }
  form.addEventListener('submit', event => { event.preventDefault(); ask(input.value); });
  root.querySelectorAll('[data-question]').forEach(button => button.addEventListener('click', () => ask(button.getAttribute('data-question'))));
  read.addEventListener('click', () => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      addMessage('assistant', 'Speech playback is unavailable in this browser. You can read the response above.');
      return;
    }
    window.speechSynthesis.cancel();
    if (lastAnswer) {
      const utterance = new SpeechSynthesisUtterance(lastAnswer);
      utterance.lang = 'en-US'; utterance.rate = 0.93;
      window.speechSynthesis.speak(utterance);
    }
  });
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (typeof Recognition === 'function') {
    microphone.hidden = false;
    microphone.addEventListener('click', () => {
      if (listening) return;
      const recognition = new Recognition();
      recognition.lang = 'en-US'; recognition.interimResults = false; recognition.maxAlternatives = 1;
      listening = true; microphone.disabled = true;
      recognition.onresult = e => { const spoken = e.results && e.results[0] && e.results[0][0] && e.results[0][0].transcript; if (spoken) input.value = String(spoken).slice(0, 220); };
      recognition.onerror = () => { addMessage('assistant', 'Voice recognition did not complete. You can still type or use the suggested questions.'); };
      recognition.onend = () => { listening = false; microphone.disabled = false; input.focus(); };
      try { recognition.start(); } catch (_) { listening = false; microphone.disabled = false; }
    });
  }
})();
