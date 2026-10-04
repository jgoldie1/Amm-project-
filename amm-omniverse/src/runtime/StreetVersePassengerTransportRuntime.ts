export type TransportKind = 'car' | 'suv' | 'van' | 'bus' | 'train' | 'plane' | 'boat' | 'rideshare';

export type SeatRole = 'driver' | 'passenger' | 'standing';

export interface TransportSeat {
  id: string;
  role: SeatRole;
  row: number;
  side: 'left' | 'center' | 'right' | 'aisle';
  accessible?: boolean;
}

export interface TransportManifest {
  transportId: string;
  kind: TransportKind;
  seats: TransportSeat[];
  occupants: Record<string, string | undefined>;
  standingCapacity?: number;
  standingOccupants?: string[];
}

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
  standingCapacity = 0,
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
    standingCapacity,
    standingOccupants: [],
  };
}

export function defaultPassengerCapacity(kind: TransportKind): number {
  switch (kind) {
    case 'suv': return 6;
    case 'van': return 7;
    case 'bus': return 40;
    case 'train': return 120;
    case 'plane': return 180;
    case 'boat': return 24;
    default: return 4;
  }
}

export function boardTransport(
  manifest: TransportManifest,
  actorId: string,
  preferredSeatId?: string,
): string | null {
  const preferred = preferredSeatId && manifest.seats.find((seat) => seat.id === preferredSeatId);
  const seat = preferred && !manifest.occupants[preferred.id]
    ? preferred
    : manifest.seats.find((candidate) => !manifest.occupants[candidate.id]);

  if (seat) {
    manifest.occupants[seat.id] = actorId;
    return seat.id;
  }

  const standing = manifest.standingOccupants ?? (manifest.standingOccupants = []);
  if (standing.length < (manifest.standingCapacity ?? 0)) {
    standing.push(actorId);
    return `standing-${standing.length}`;
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
    return true;
  }
  return false;
}

export function passengerCount(manifest: TransportManifest): number {
  return Object.values(manifest.occupants).filter(Boolean).length +
    (manifest.standingOccupants?.length ?? 0);
}
