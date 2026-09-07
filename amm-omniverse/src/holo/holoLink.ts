export type HoloLinkDeviceKind =
  | 'gamepad'
  | 'audio-output'
  | 'hearing-device'
  | 'accessibility-switch'
  | 'microphone'
  | 'wearable'
  | 'unknown';

export type HoloLinkDevice = {
  id: string;
  label: string;
  kind: HoloLinkDeviceKind;
  connected: boolean;
};

/**
 * Standards-first peripheral discovery. This intentionally does not claim
 * proprietary Bluetooth radio control; browser/platform permissions remain authoritative.
 */
export function listConnectedGamepads(): HoloLinkDevice[] {
  if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') {
    return [];
  }

  return Array.from(navigator.getGamepads())
    .filter((pad): pad is Gamepad => Boolean(pad))
    .map((pad) => ({
      id: pad.id || `gamepad-${pad.index}`,
      label: pad.id || `Gamepad ${pad.index + 1}`,
      kind: 'gamepad' as const,
      connected: pad.connected,
    }));
}

export function getHoloLinkFeatureState() {
  const nav = typeof navigator === 'undefined'
    ? undefined
    : (navigator as Navigator & { bluetooth?: unknown; mediaDevices?: MediaDevices });

  return {
    gamepads: typeof nav?.getGamepads === 'function',
    bluetoothApiExposed: Boolean(nav && 'bluetooth' in nav),
    microphoneApiExposed: Boolean(nav?.mediaDevices?.getUserMedia),
    permissionRequired: true,
    automaticPairingAllowed: false,
  } as const;
}

export function isConsequentialHoloLinkAction(action: string): boolean {
  return [
    'purchase',
    'delete',
    'publish',
    'grant-camera',
    'grant-microphone',
    'grant-location',
    'identity-change',
    'security-change',
  ].includes(action);
}
