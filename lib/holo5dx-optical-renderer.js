function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value)));
}

function createCameraRig({ viewCount = 4, viewConeDegrees = 30, viewerDistanceMm = 600 } = {}) {
  const count = Math.max(1, Math.min(32, Math.floor(Number(viewCount) || 4)));
  const cone = clamp(viewConeDegrees || 30, 1, 120);
  const distance = Math.max(100, Number(viewerDistanceMm) || 600);
  const views = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const yawDegrees = -cone / 2 + cone * t;
    views.push({ index: i, yawDegrees, viewerDistanceMm: distance });
  }
  return views;
}

function planOpticalOutput({ mode = 'standard-3d', calibration = {} } = {}) {
  const supportedModes = new Set([
    'standard-3d','stereo-spatial','cone-reflector-4view','cone-reflector-8view',
    'lenticular-multiview','light-field-multiview','xr-spatial'
  ]);
  const selected = supportedModes.has(mode) ? mode : 'standard-3d';
  const defaults = selected === 'cone-reflector-8view' ? 8 : selected === 'cone-reflector-4view' ? 4 : selected.includes('multiview') ? 8 : selected === 'stereo-spatial' ? 2 : 1;
  const viewCount = Math.max(1, Math.min(32, Number(calibration.viewCount) || defaults));
  const rig = createCameraRig({ viewCount, viewConeDegrees: calibration.viewConeDegrees || 30, viewerDistanceMm: calibration.viewerDistanceMm || 600 });
  return {
    mode: selected,
    trueHolographicHardwareRequired: selected.includes('light-field') || selected.includes('cone-reflector') || selected.includes('lenticular'),
    views: rig,
    packing: selected.startsWith('cone-reflector') ? { type: 'radial-quadrants-or-sectors', reflectorCount: Number(calibration.reflectorCount) || 4 } : selected.includes('multiview') ? { type: 'interlaced-multiview' } : { type: 'single-or-stereo-frame' },
    compensation: {
      brightness: clamp(calibration.brightnessCompensation ?? 1, 0.1, 2),
      gamma: clamp(calibration.gammaCompensation ?? 1, 0.5, 3)
    },
    fallbackMode: 'standard-3d'
  };
}

module.exports = { createCameraRig, planOpticalOutput };
