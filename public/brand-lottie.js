import lottie from 'lottie-web';

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

function mountBrandHologram(root) {
  if (!root || root.dataset.lottieMounted === 'true') return;
  root.dataset.lottieMounted = 'true';

  const image = root.querySelector('[data-brand-image]');
  const overlay = document.createElement('div');
  overlay.className = 'brand-lottie-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  root.prepend(overlay);

  if (REDUCED_MOTION.matches) {
    root.classList.add('brand-reduced-motion');
    return;
  }

  const animation = lottie.loadAnimation({
    container: overlay,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '/brand-hologram.json',
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid meet',
      progressiveLoad: true,
      hideOnTransparent: true
    }
  });

  animation.setSpeed(Number(root.dataset.lottieSpeed || 0.8));
  root.brandAnimation = animation;

  root.addEventListener('pointerenter', () => animation.setSpeed(1.35));
  root.addEventListener('pointerleave', () => animation.setSpeed(0.8));
  root.addEventListener('focusin', () => animation.setSpeed(1.35));
  root.addEventListener('focusout', () => animation.setSpeed(0.8));

  if (image) {
    image.addEventListener('load', () => root.classList.add('brand-image-ready'), { once: true });
  }
}

function mountAll() {
  document.querySelectorAll('[data-brand-hologram]').forEach(mountBrandHologram);
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', mountAll, { once: true })
  : mountAll();

window.TryAMMBrandLottie = { mount: mountBrandHologram, mountAll };
