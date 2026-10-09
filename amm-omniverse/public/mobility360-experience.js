/* Stubbs Mobility 360 • mobile-friendly preview sharing.
   Only public product IDs are used in URLs; no diagnoses, purchases or user tracking. */
(function () {
  'use strict';
  const productList = Array.isArray(window.__mobility360PreviewCatalog) ? window.__mobility360PreviewCatalog : [];
  const byId = new Map(productList.map(p => [p.id, p]));
  const status = document.getElementById('shareStatus');
  const preview = 'Product concept only — price and availability have not been approved.';
  let pendingNotice = '';
  function displayStatus(message) {
    pendingNotice = message;
    if (status) status.textContent = message;
  }
  function productURL(id) {
    const url = new URL('/mobility360.html', window.location.origin);
    if (byId.has(id)) url.searchParams.set('product', id);
    return url.toString();
  }
  async function shareProduct(id) {
    const item = byId.get(id);
    if (!item) return;
    await shareLink({
      title: item.name + ' | Stubbs Mobility 360',
      text: item.name + ' — ' + preview,
      url: productURL(id)
    });
  }
  async function shareSite() {
    await shareLink({
      title: 'Stubbs Mobility 360 — Accessible Living',
      text: 'Browse accessible independent-living product ideas and free guides. Preview only; purchasing is not open.',
      url: productURL('')
    });
  }
  async function shareLink(payload) {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(payload);
        displayStatus('Share option completed.');
        return;
      } catch (error) {
        if (error && error.name === 'AbortError') return;
      }
    }
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(payload.url);
        displayStatus('Link copied. You can paste it into a message.');
        return;
      } catch (_) {}
    }
    displayStatus('Copy the link in the popup to share it with someone.');
    window.prompt('Copy this public preview link:', payload.url);
  }
  document.querySelectorAll('[data-share-site]').forEach(button => {
    button.addEventListener('click', () => { void shareSite(); });
  });
  window.Mobility360ShareProduct = shareProduct;
  window.Mobility360ShareSite = shareSite;
  window.Mobility360ProductURL = productURL;
  const productId = new URLSearchParams(window.location.search).get('product');
  if (productId && byId.has(productId) && typeof window.Mobility360OpenProduct === 'function') {
    window.Mobility360OpenProduct(productId);
  } else if (productId) {
    displayStatus('That product link is not in our current preview. You can still browse the full catalog.');
  }
})();