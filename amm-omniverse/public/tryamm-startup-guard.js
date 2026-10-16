// Deliberately a classic script: recovery must work even if an app module fails
// to parse or download. Never replace an app that has already mounted.
(function () {
  var timer;
  function offerRecovery() {
    var canary = document.getElementById('tryamm-bootstrap-canary');
    if (!canary || !canary.isConnected || document.getElementById('tryamm-startup-recovery')) return;
    canary.style.display = 'flex';
    canary.style.flexDirection = 'column';
    canary.style.justifyContent = 'center';
    canary.style.gap = '18px';
    canary.textContent = 'TRYAMM is taking longer than expected to open.';
    var actions = document.createElement('div');
    actions.id = 'tryamm-startup-recovery';
    actions.style.cssText = 'display:grid;gap:12px;max-width:340px;width:100%';
    function link(label, href) {
      var item = document.createElement('a');
      item.textContent = label;
      item.href = href;
      item.style.cssText = 'display:block;padding:16px;border:2px solid #61dcf5;border-radius:14px;color:#fff;background:#102432;text-decoration:none;font:700 17px system-ui;text-align:center';
      actions.appendChild(item);
    }
    var retry = new URL(location.href);
    retry.searchParams.set('startup_retry', String(Date.now()));
    link('Retry opening TRYAMM', retry.href);
    link('Open lightweight city', '/streetverse-safe.html');
    link('Return to homepage', '/');
    canary.appendChild(actions);
  }
  function start() { timer = window.setTimeout(offerRecovery, 12000); }
  // Do not wait for DOMContentLoaded: a stalled module may delay that event.
  start();
  window.addEventListener('pagehide', function () { window.clearTimeout(timer); });
})();
