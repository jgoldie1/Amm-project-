export type DeliveryMode = 'walker' | 'bike' | 'car' | 'van' | 'robot' | 'drone';

export type DeliveryRequest = {
  id: string;
  orderId: string;
  pickup: { label: string; lat?: number; lng?: number };
  dropoff: { label: string; lat?: number; lng?: number };
  packageWeightKg?: number;
  requiresColdChain?: boolean;
  accessibilityNeeds?: string[];
  requestedModes?: DeliveryMode[];
};

export type DeliveryPolicyContext = {
  weatherSafeForDrone?: boolean;
  droneAllowedByProvider?: boolean;
  robotAllowedByProvider?: boolean;
  coldChainModes?: DeliveryMode[];
  maxDroneWeightKg?: number;
};

export type DeliveryEligibility = {
  mode: DeliveryMode;
  eligible: boolean;
  reasons: string[];
};

const ALL_MODES: DeliveryMode[] = ['walker','bike','car','van','robot','drone'];

export function evaluateDeliveryModes(request: DeliveryRequest, context: DeliveryPolicyContext): DeliveryEligibility[] {
  const requested = request.requestedModes?.length ? request.requestedModes : ALL_MODES;
  return requested.map((mode) => {
    const reasons: string[] = [];
    let eligible = true;

    if (request.requiresColdChain && !(context.coldChainModes ?? ['car','van']).includes(mode)) {
      eligible = false;
      reasons.push('Cold-chain capability not confirmed');
    }

    if (mode === 'drone') {
      if (!context.droneAllowedByProvider) {
        eligible = false;
        reasons.push('Approved drone provider not available');
      }
      if (context.weatherSafeForDrone === false) {
        eligible = false;
        reasons.push('Weather not suitable');
      }
      if (request.packageWeightKg != null && context.maxDroneWeightKg != null && request.packageWeightKg > context.maxDroneWeightKg) {
        eligible = false;
        reasons.push('Package exceeds provider weight limit');
      }
    }

    if (mode === 'robot' && !context.robotAllowedByProvider) {
      eligible = false;
      reasons.push('Approved robot provider not available');
    }

    if (eligible && reasons.length === 0) reasons.push('Eligible by current policy context');
    return { mode, eligible, reasons };
  });
}

export type DeliveryStatus = 'requested' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';

export type DeliveryJob = {
  id: string;
  requestId: string;
  providerType: 'internal-test' | 'external';
  providerId?: string;
  mode: DeliveryMode;
  status: DeliveryStatus;
  proofOfDelivery?: { type: 'photo' | 'signature' | 'code' | 'none'; reference?: string };
};
