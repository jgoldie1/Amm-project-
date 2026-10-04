const canary = document.getElementById('tryamm-bootstrap-canary')

const showBootstrapFailure = (error: unknown) => {
  console.error('[TRYAMM] Application bootstrap failed before React mount.', error)
  if (!canary) return
  canary.textContent = 'TRYAMM startup failed. Please refresh to retry.'
  canary.setAttribute('data-tryamm-bootstrap', 'failed')
  canary.setAttribute('data-tryamm-error', error instanceof Error ? error.name : 'unknown')
}

if (canary) canary.setAttribute('data-tryamm-bootstrap', 'loading')

const appTarget=String(import.meta.env.VITE_APP_TARGET||'tryamm').trim().toLowerCase()
if(appTarget==='streetverse'&&typeof window!=='undefined'&&!window.location.pathname.startsWith('/streetverse')){
  const next='/streetverse'+window.location.search+window.location.hash
  window.history.replaceState({tryammAppTarget:'streetverse'},'',next)
}

import('./main')
  .then(() => {
    canary?.setAttribute('data-tryamm-bootstrap', 'module-loaded')
  })
  .catch(showBootstrapFailure)
