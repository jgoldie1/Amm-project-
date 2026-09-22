const canary = document.getElementById('tryamm-bootstrap-canary')

const showBootstrapFailure = (error: unknown) => {
  console.error('[TRYAMM] Application bootstrap failed before React mount.', error)
  if (!canary) return
  canary.textContent = 'TRYAMM startup failed. Please refresh to retry.'
  canary.setAttribute('data-tryamm-bootstrap', 'failed')
  canary.setAttribute('data-tryamm-error', error instanceof Error ? error.name : 'unknown')
}

if (canary) canary.setAttribute('data-tryamm-bootstrap', 'loading')

import('./main')
  .then(() => {
    canary?.setAttribute('data-tryamm-bootstrap', 'module-loaded')
  })
  .catch(showBootstrapFailure)
