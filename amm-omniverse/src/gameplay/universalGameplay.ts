export type InteractionVerb =
  | 'OPEN' | 'CLOSE' | 'LOCK' | 'UNLOCK'
  | 'ENTER' | 'EXIT' | 'USE' | 'ACTIVATE'
  | 'PICK_UP' | 'DROP' | 'EQUIP' | 'UNEQUIP'
  | 'BUY' | 'SELL' | 'RENT' | 'LEASE' | 'OWN' | 'TRANSFER'
  | 'TALK' | 'REPAIR' | 'BUILD' | 'DEMOLISH'
  | 'DRIVE' | 'RIDE' | 'PILOT' | 'DOCK' | 'LAND'
  | 'STORE' | 'WITHDRAW';

export type GameplayEventType =
  | 'door_opened' | 'door_closed' | 'door_locked' | 'door_unlocked'
  | 'property_entered' | 'property_exited'
  | 'elevator_used'
  | 'item_picked_up' | 'item_dropped' | 'item_equipped' | 'item_unequipped'
  | 'vehicle_entered' | 'vehicle_exited'
  | 'spacecraft_entered' | 'spacecraft_launched' | 'spacecraft_docked' | 'spacecraft_landed'
  | 'building_stage_changed' | 'building_completed'
  | 'unit_rented' | 'unit_owned'
  | 'mission_objective_progressed' | 'mission_boss_completed';

export interface GameplayEvent {
  type: GameplayEventType;
  actorId: string;
  objectId?: string;
  missionId?: string;
  timestamp: number;
  data?: Record<string, string | number | boolean | null>;
}

export type GameplayEventListener = (event: GameplayEvent) => void;

export class GameplayEventBus {
  private listeners = new Set<GameplayEventListener>();

  subscribe(listener: GameplayEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: Omit<GameplayEvent, 'timestamp'> & { timestamp?: number }): GameplayEvent {
    const normalized: GameplayEvent = { ...event, timestamp: event.timestamp ?? Date.now() };
    this.listeners.forEach(listener => listener(normalized));
    return normalized;
  }
}

export interface InteractionContext {
  actorId: string;
  distance: number;
  permissions: ReadonlySet<string>;
  missionId?: string;
}

export interface InteractionResult {
  ok: boolean;
  verb: InteractionVerb;
  objectId: string;
  message?: string;
  event?: GameplayEvent;
}

export interface Interactable {
  readonly id: string;
  readonly maxInteractionDistance: number;
  availableActions(context: InteractionContext): readonly InteractionVerb[];
  perform(verb: InteractionVerb, context: InteractionContext): InteractionResult;
}

export class InteractionResolver {
  resolve(target: Interactable, verb: InteractionVerb, context: InteractionContext): InteractionResult {
    if (context.distance > target.maxInteractionDistance) {
      return { ok: false, verb, objectId: target.id, message: 'Target is out of interaction range.' };
    }
    if (!target.availableActions(context).includes(verb)) {
      return { ok: false, verb, objectId: target.id, message: 'Action is not currently available.' };
    }
    return target.perform(verb, context);
  }
}

export interface DoorOptions {
  id: string;
  eventBus: GameplayEventBus;
  initiallyOpen?: boolean;
  initiallyLocked?: boolean;
  requiredPermission?: string;
  maxInteractionDistance?: number;
}

export class DoorInteractable implements Interactable {
  readonly id: string;
  readonly maxInteractionDistance: number;
  private isOpen: boolean;
  private isLocked: boolean;
  private readonly requiredPermission?: string;
  private readonly eventBus: GameplayEventBus;

  constructor(options: DoorOptions) {
    this.id = options.id;
    this.eventBus = options.eventBus;
    this.isOpen = options.initiallyOpen ?? false;
    this.isLocked = options.initiallyLocked ?? false;
    this.requiredPermission = options.requiredPermission;
    this.maxInteractionDistance = options.maxInteractionDistance ?? 2.5;
  }

  snapshot() {
    return { id: this.id, isOpen: this.isOpen, isLocked: this.isLocked } as const;
  }

  availableActions(context: InteractionContext): readonly InteractionVerb[] {
    const actions: InteractionVerb[] = [];
    const hasAccess = !this.requiredPermission || context.permissions.has(this.requiredPermission);
    if (this.isLocked) {
      if (hasAccess) actions.push('UNLOCK');
      return actions;
    }
    actions.push(this.isOpen ? 'CLOSE' : 'OPEN');
    if (hasAccess && !this.isOpen) actions.push('LOCK');
    return actions;
  }

  perform(verb: InteractionVerb, context: InteractionContext): InteractionResult {
    const base = { actorId: context.actorId, objectId: this.id, missionId: context.missionId };
    if (verb === 'OPEN' && !this.isLocked && !this.isOpen) {
      this.isOpen = true;
      return { ok: true, verb, objectId: this.id, event: this.eventBus.emit({ ...base, type: 'door_opened' }) };
    }
    if (verb === 'CLOSE' && this.isOpen) {
      this.isOpen = false;
      return { ok: true, verb, objectId: this.id, event: this.eventBus.emit({ ...base, type: 'door_closed' }) };
    }
    if (verb === 'LOCK' && !this.isOpen && !this.isLocked) {
      this.isLocked = true;
      return { ok: true, verb, objectId: this.id, event: this.eventBus.emit({ ...base, type: 'door_locked' }) };
    }
    if (verb === 'UNLOCK' && this.isLocked) {
      this.isLocked = false;
      return { ok: true, verb, objectId: this.id, event: this.eventBus.emit({ ...base, type: 'door_unlocked' }) };
    }
    return { ok: false, verb, objectId: this.id, message: 'Door state rejected that action.' };
  }
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  stackLimit: number;
  equipSlot?: string;
}

export class Inventory {
  private readonly items = new Map<string, InventoryItem>();
  private readonly equipped = new Map<string, string>();

  constructor(
    readonly ownerId: string,
    private readonly eventBus: GameplayEventBus,
    readonly maxUniqueItems = 32,
  ) {}

  snapshot() {
    return {
      ownerId: this.ownerId,
      items: [...this.items.values()].map(item => ({ ...item })),
      equipped: Object.fromEntries(this.equipped),
    };
  }

  add(item: InventoryItem): boolean {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.stackLimit <= 0) return false;
    const existing = this.items.get(item.id);
    if (!existing && this.items.size >= this.maxUniqueItems) return false;
    const nextQuantity = (existing?.quantity ?? 0) + item.quantity;
    if (nextQuantity > item.stackLimit) return false;
    this.items.set(item.id, { ...item, quantity: nextQuantity });
    this.eventBus.emit({ type: 'item_picked_up', actorId: this.ownerId, objectId: item.id, data: { quantity: item.quantity } });
    return true;
  }

  remove(itemId: string, quantity = 1): boolean {
    const existing = this.items.get(itemId);
    if (!existing || !Number.isInteger(quantity) || quantity <= 0 || quantity > existing.quantity) return false;
    const remaining = existing.quantity - quantity;
    if (remaining === 0) {
      this.items.delete(itemId);
      for (const [slot, equippedId] of this.equipped) if (equippedId === itemId) this.equipped.delete(slot);
    } else {
      this.items.set(itemId, { ...existing, quantity: remaining });
    }
    this.eventBus.emit({ type: 'item_dropped', actorId: this.ownerId, objectId: itemId, data: { quantity } });
    return true;
  }

  equip(itemId: string): boolean {
    const item = this.items.get(itemId);
    if (!item?.equipSlot) return false;
    this.equipped.set(item.equipSlot, itemId);
    this.eventBus.emit({ type: 'item_equipped', actorId: this.ownerId, objectId: itemId, data: { slot: item.equipSlot } });
    return true;
  }

  unequip(slot: string): boolean {
    const itemId = this.equipped.get(slot);
    if (!itemId) return false;
    this.equipped.delete(slot);
    this.eventBus.emit({ type: 'item_unequipped', actorId: this.ownerId, objectId: itemId, data: { slot } });
    return true;
  }
}

export interface ElevatorOptions {
  id: string;
  floors: readonly number[];
  initialFloor: number;
  eventBus: GameplayEventBus;
  maxInteractionDistance?: number;
}

export class ElevatorInteractable implements Interactable {
  readonly id: string;
  readonly maxInteractionDistance: number;
  private currentFloor: number;
  private doorsOpen = false;

  constructor(private readonly options: ElevatorOptions) {
    if (!options.floors.includes(options.initialFloor)) throw new Error('Initial elevator floor must be valid.');
    this.id = options.id;
    this.currentFloor = options.initialFloor;
    this.maxInteractionDistance = options.maxInteractionDistance ?? 3;
  }

  snapshot() {
    return { id: this.id, currentFloor: this.currentFloor, doorsOpen: this.doorsOpen, floors: [...this.options.floors] } as const;
  }

  availableActions(): readonly InteractionVerb[] {
    return ['USE'];
  }

  perform(verb: InteractionVerb, context: InteractionContext): InteractionResult {
    if (verb !== 'USE') return { ok: false, verb, objectId: this.id, message: 'Elevator requires USE.' };
    this.doorsOpen = !this.doorsOpen;
    const event = this.options.eventBus.emit({
      type: 'elevator_used', actorId: context.actorId, objectId: this.id, missionId: context.missionId,
      data: { floor: this.currentFloor, doorsOpen: this.doorsOpen },
    });
    return { ok: true, verb, objectId: this.id, event };
  }

  travelTo(floor: number, actorId: string, missionId?: string): boolean {
    if (!this.options.floors.includes(floor)) return false;
    this.doorsOpen = false;
    this.currentFloor = floor;
    this.options.eventBus.emit({ type: 'elevator_used', actorId, objectId: this.id, missionId, data: { floor, doorsOpen: false } });
    return true;
  }
}

export type VehicleKind = 'car' | 'truck' | 'motorcycle' | 'service' | 'spacecraft';

export class VehicleAccessController {
  private occupants = new Map<string, string>();

  constructor(readonly vehicleId: string, readonly kind: VehicleKind, private readonly eventBus: GameplayEventBus) {}

  enter(actorId: string, seat: string): boolean {
    if (this.occupants.has(seat)) return false;
    this.occupants.set(seat, actorId);
    this.eventBus.emit({
      type: this.kind === 'spacecraft' ? 'spacecraft_entered' : 'vehicle_entered',
      actorId, objectId: this.vehicleId, data: { seat },
    });
    return true;
  }

  exit(actorId: string): boolean {
    const entry = [...this.occupants].find(([, occupant]) => occupant === actorId);
    if (!entry) return false;
    this.occupants.delete(entry[0]);
    this.eventBus.emit({ type: 'vehicle_exited', actorId, objectId: this.vehicleId, data: { seat: entry[0] } });
    return true;
  }

  snapshot() {
    return Object.fromEntries(this.occupants);
  }
}

export function createUniversalGameplayFoundation() {
  const eventBus = new GameplayEventBus();
  return {
    eventBus,
    interactionResolver: new InteractionResolver(),
    createInventory: (ownerId: string, capacity?: number) => new Inventory(ownerId, eventBus, capacity),
    createDoor: (options: Omit<DoorOptions, 'eventBus'>) => new DoorInteractable({ ...options, eventBus }),
    createElevator: (options: Omit<ElevatorOptions, 'eventBus'>) => new ElevatorInteractable({ ...options, eventBus }),
    createVehicle: (vehicleId: string, kind: VehicleKind) => new VehicleAccessController(vehicleId, kind, eventBus),
  };
}
