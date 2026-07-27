'use strict';
(() => {
  const productCards = document.querySelector('#productCards');
  const productDialog = document.querySelector('#productDialog');
  const productDetail = document.querySelector('#productDetail');
  const toast = (message) => {
    const el = document.querySelector('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    window.setTimeout(() => el.classList.remove('show'), 2600);
  };
  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  let products = [];

  function showProduct(slug) {
    const product = products.find((item) => item.slug === slug);
    if (!product || !productDetail || !productDialog) return;
    const launchItems = (product.launchFeatures || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    const phaseTwoItems = (product.phaseTwo || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    productDetail.innerHTML = `
      <div class="product-detail-icon" aria-hidden="true">${escapeHtml(product.icon)}</div>
      <p class="eyebrow">${escapeHtml(product.status)}</p>
      <h2>${escapeHtml(product.name)}</h2>
      <p>${escapeHtml(product.summary)}</p>
      <h3>Two-week launch scope</h3>
      <ul>${launchItems}</ul>
      <h3>Phase two</h3>
      <ul>${phaseTwoItems}</ul>
      <div class="actions">
        <button type="button" data-interest="${escapeHtml(product.slug)}">Join the interest list</button>
        <a class="button ghost" href="#live" data-close-product>Connect through TryAMM</a>
      </div>`;
    productDialog.showModal();
    productDetail.querySelector('[data-interest]')?.addEventListener('click', () => {
      toast(`${product.name} intake will connect to the launch database.`);
      productDialog.close();
    });
    productDetail.querySelector('[data-close-product]')?.addEventListener('click', () => productDialog.close());
  }

  async function loadProducts() {
    if (!productCards) return;
    try {
      const response = await fetch('/data/products.json');
      if (!response.ok) throw new Error('Product registry unavailable');
      const data = await response.json();
      products = data.products || [];
      productCards.innerHTML = products.map((product) => `
        <article class="product-card">
          <div class="product-icon" aria-hidden="true">${escapeHtml(product.icon)}</div>
          <div>
            <span class="status-pill">${escapeHtml(product.status)}</span>
            <h3>${escapeHtml(product.name)}</h3>
            <p>${escapeHtml(product.summary)}</p>
            <small>${escapeHtml(product.owner)}</small>
          </div>
          <button type="button" data-product="${escapeHtml(product.slug)}">View platform</button>
        </article>`).join('');
      productCards.querySelectorAll('[data-product]').forEach((button) => {
        button.addEventListener('click', () => showProduct(button.dataset.product));
      });
    } catch (error) {
      productCards.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
    }
  }

  loadProducts();
})();
