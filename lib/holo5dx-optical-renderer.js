function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value))); }

function createCameraRig({ viewCount = 4, viewConeDegrees = 30, viewerDistanceMm = 600 } = {}) {
  const count = Math.max(1, Math.min(32, Math.floor(Number(viewCount) || 4)));
  const cone = clamp(viewConeDegrees || 30, 1, 180);
  const distance = Math.max(100, Number(viewerDistanceMm) || 600);
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.5 : i / (count - 1);
    return { index: i, yawDegrees: -cone / 2 + cone * t, viewerDistanceMm: distance };
  });
}

function planOpticalOutput({ mode = 'standard-3d', calibration = {} } = {}) {
  const supported = new Set(['standard-3d','stereo-spatial','cone-reflector-4view','cone-reflector-8view','lenticular-multiview','light-field-multiview','xr-spatial']);
  const selected = supported.has(mode) ? mode : 'standard-3d';
  const defaults = selected === 'cone-reflector-8view' ? 8 : selected === 'cone-reflector-4view' ? 4 : selected.includes('multiview') ? 8 : selected === 'stereo-spatial' ? 2 : 1;
  const viewCount = Math.max(1, Math.min(32, Number(calibration.viewCount) || defaults));
  return {
    mode: selected,
    trueHolographicHardwareRequired: selected.includes('light-field') || selected.includes('cone-reflector') || selected.includes('lenticular'),
    views: createCameraRig({ viewCount, viewConeDegrees: calibration.viewConeDegrees || 30, viewerDistanceMm: calibration.viewerDistanceMm || 600 }),
    packing: selected.startsWith('cone-reflector') ? { type: 'radial-sectors', reflectorCount: Number(calibration.reflectorCount) || 4 } : selected.includes('multiview') ? { type: 'interlaced-multiview' } : { type: 'single-or-stereo-frame' },
    compensation: { brightness: clamp(calibration.brightnessCompensation ?? 1, 0.1, 2), gamma: clamp(calibration.gammaCompensation ?? 1, 0.5, 3) },
    fallbackMode: 'standard-3d'
  };
}

module.exports = { createCameraRig, planOpticalOutput };
