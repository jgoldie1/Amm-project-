export type TransportKind = 'car' | 'suv' | 'van' | 'bus' | 'train' | 'plane' | 'boat' | 'rideshare';

export type SeatRole = 'driver' | 'passenger' | 'standing';

export interface TransportSeat {
  id: string;
  role: SeatRole;
  row: number;
  side: 'left' | 'center' | 'right' | 'aisle';
  accessible?: boolean;
}

export interface TransportVisualPolicy {
  fullDetailRadius: number;
  animatedRadius: number;
  impostorRadius: number;
  maxDetailedOccupants: number;
}

export interface TransportManifest {
  transportId: string;
  kind: TransportKind;
  seats: TransportSeat[];
  occupants: Record<string, string | undefined>;
  standingCapacity?: number;
  standingOccupants?: string[];
  standingSlots?: Record<string,string|undefined>;
  nextStandingSlot?: number;
  visualPolicy?: TransportVisualPolicy;
}

export const MOBILE_TRANSPORT_VISUAL_POLICY: TransportVisualPolicy = {
  fullDetailRadius: 28,
  animatedRadius: 65,
  impostorRadius: 140,
  maxDetailedOccupants: 12,
};

export const TRANSPORT_CAPACITIES: Record<TransportKind, { passengers: number; standing: number }> = {
  car: { passengers: 4, standing: 0 },
  rideshare: { passengers: 4, standing: 0 },
  suv: { passengers: 6, standing: 0 },
  van: { passengers: 7, standing: 0 },
  bus: { passengers: 40, standing: 20 },
  train: { passengers: 120, standing: 80 },
  plane: { passengers: 180, standing: 0 },
  boat: { passengers: 24, standing: 8 },
};

export const FIVE_SEAT_CAR: TransportSeat[] = [
  { id: 'front-driver', role: 'driver', row: 0, side: 'left' },
  { id: 'front-passenger', role: 'passenger', row: 0, side: 'right', accessible: true },
  { id: 'rear-left', role: 'passenger', row: 1, side: 'left' },
  { id: 'rear-center', role: 'passenger', row: 1, side: 'center' },
  { id: 'rear-right', role: 'passenger', row: 1, side: 'right' },
];

export function createPassengerSeats(count: number, firstRow = 0): TransportSeat[] {
  return Array.from({ length: Math.max(0, count) }, (_, index) => ({
    id: `passenger-${index + 1}`,
    role: 'passenger' as const,
    row: firstRow + Math.floor(index / 4),
    side: (['left', 'aisle', 'aisle', 'right'] as const)[index % 4],
  }));
}

export function createTransportManifest(
  transportId: string,
  kind: TransportKind,
  passengerCapacity?: number,
  standingCapacity?: number,
): TransportManifest {
  const seats =
    kind === 'car' || kind === 'rideshare'
      ? FIVE_SEAT_CAR
      : [
          { id: 'operator', role: 'driver' as const, row: 0, side: 'left' as const },
          ...createPassengerSeats(passengerCapacity ?? defaultPassengerCapacity(kind), 1),
        ];

  return {
    transportId,
    kind,
    seats,
    occupants: Object.fromEntries(seats.map((seat) => [seat.id, undefined])),
    standingCapacity: standingCapacity ?? TRANSPORT_CAPACITIES[kind].standing,
    standingOccupants: [],
    standingSlots: {},
    nextStandingSlot: 1,
    visualPolicy: MOBILE_TRANSPORT_VISUAL_POLICY,
  };
}

export function defaultPassengerCapacity(kind: TransportKind): number {
  return TRANSPORT_CAPACITIES[kind].passengers;
}

export function availableSeatCount(manifest: TransportManifest): number {
  return manifest.seats.filter((seat) => !manifest.occupants[seat.id]).length;
}

export function canBoardTransport(manifest: TransportManifest): boolean {
  return availableSeatCount(manifest) > 0 ||
    (manifest.standingOccupants?.length ?? 0) < (manifest.standingCapacity ?? 0);
}

export function occupantIds(manifest: TransportManifest): string[] {
  return [
    ...Object.values(manifest.occupants).filter((value): value is string => Boolean(value)),
    ...(manifest.standingOccupants ?? []),
  ];
}

export function boardTransport(
  manifest: TransportManifest,
  actorId: string,
  preferredSeatId?: string,
): string | null {
  const existingSeat=Object.entries(manifest.occupants).find(([,occupant])=>occupant===actorId);
  if(existingSeat)return existingSeat[0];
  const existingStanding=Object.entries(manifest.standingSlots??{}).find(([,occupant])=>occupant===actorId);
  if(existingStanding)return existingStanding[0];

  const preferred = preferredSeatId && manifest.seats.find((seat) => seat.id === preferredSeatId);
  const seat = preferred && !manifest.occupants[preferred.id]
    ? preferred
    : manifest.seats.find((candidate) => candidate.role==='passenger'&&!manifest.occupants[candidate.id]);

  if (seat) {
    manifest.occupants[seat.id] = actorId;
    return seat.id;
  }

  const standing = manifest.standingOccupants ?? (manifest.standingOccupants = []);
  const slots=manifest.standingSlots??(manifest.standingSlots={});
  if (standing.length < (manifest.standingCapacity ?? 0)) {
    const slotId=`standing-${manifest.nextStandingSlot??1}`;
    manifest.nextStandingSlot=(manifest.nextStandingSlot??1)+1;
    standing.push(actorId);
    slots[slotId]=actorId;
    return slotId;
  }
  return null;
}

export function leaveTransport(manifest: TransportManifest, actorId: string): boolean {
  const seat = Object.entries(manifest.occupants).find(([, occupant]) => occupant === actorId);
  if (seat) {
    manifest.occupants[seat[0]] = undefined;
    return true;
  }
  const standing = manifest.standingOccupants ?? [];
  const index = standing.indexOf(actorId);
  if (index >= 0) {
    standing.splice(index, 1);
    const slot=Object.entries(manifest.standingSlots??{}).find(([,occupant])=>occupant===actorId);
    if(slot)delete manifest.standingSlots?.[slot[0]];
    return true;
  }
  return false;
}

export function passengerCount(manifest: TransportManifest): number {
  return Object.values(manifest.occupants).filter(Boolean).length +
    (manifest.standingOccupants?.length ?? 0);
}


export type TransportActorKind = 'player' | 'npc' | 'ai-companion';

export interface TransportPartyMember {
  actorId: string;
  kind: TransportActorKind;
  leader?: boolean;
  preferredSeatId?: string;
}

export interface TransportPartyBoardingResult {
  boarded: Array<{ actorId: string; seatId: string }>;
  waiting: string[];
}

export function boardTransportParty(
  manifest: TransportManifest,
  members: readonly TransportPartyMember[],
): TransportPartyBoardingResult {
  const boarded: Array<{ actorId: string; seatId: string }> = [];
  const waiting: string[] = [];
  const ordered = [...members].sort((a, b) => Number(Boolean(b.leader)) - Number(Boolean(a.leader)));
  for (const member of ordered) {
    const seatId = boardTransport(manifest, member.actorId, member.preferredSeatId);
    if (seatId) boarded.push({ actorId: member.actorId, seatId });
    else waiting.push(member.actorId);
  }
  return { boarded, waiting };
}

export interface TransportSwarmPlan {
  vehicleCount: number;
  assignments: Array<{ transportIndex: number; members: TransportPartyMember[] }>;
  waiting: TransportPartyMember[];
}

export function planTransportSwarm(
  members: readonly TransportPartyMember[],
  kind: TransportKind = 'car',
): TransportSwarmPlan {
  const perVehicle = kind === 'car' || kind === 'rideshare'
    ? FIVE_SEAT_CAR.length
    : defaultPassengerCapacity(kind) + 1;
  const assignments: TransportSwarmPlan['assignments'] = [];
  members.forEach((member, index) => {
    const transportIndex = Math.floor(index / Math.max(1, perVehicle));
    const assignment = assignments[transportIndex] ?? { transportIndex, members: [] };
    assignment.members.push(member);
    assignments[transportIndex] = assignment;
  });
  return {
    vehicleCount: assignments.length,
    assignments,
    waiting: [],
  };
}

export function transportSimulationTier(
  distanceMeters: number,
  policy: TransportVisualPolicy = MOBILE_TRANSPORT_VISUAL_POLICY,
): 'full' | 'animated-lite' | 'impostor' | 'manifest-only' {
  if (distanceMeters <= policy.fullDetailRadius) return 'full';
  if (distanceMeters <= policy.animatedRadius) return 'animated-lite';
  if (distanceMeters <= policy.impostorRadius) return 'impostor';
  return 'manifest-only';
}
