import type { GameplayEvent, GameplayEventBus, GameplayEventType } from './universalGameplay';

export interface MissionObjectiveProgress {
  missionId: string;
  objectiveId: string;
  current: number;
  target: number;
  completed: boolean;
}

export interface LivingStoryObjectiveRule {
  id: string;
  eventType: GameplayEventType;
  target: number;
  objectId?: string;
}

export interface LivingStoryRuntimeMission {
  id: string;
  objectives: readonly LivingStoryObjectiveRule[];
}

export type MissionProgressListener = (progress: MissionObjectiveProgress, source: GameplayEvent) => void;

/**
 * Converts low-level world interactions into deterministic Living Story objective progress.
 * Persistence/reward settlement remains server-authoritative; this bridge only produces gameplay progress signals.
 */
export class LivingStoryGameplayBridge {
  private readonly counts = new Map<string, number>();
  private readonly missions = new Map<string, LivingStoryRuntimeMission>();
  private listeners = new Set<MissionProgressListener>();
  private unsubscribe?: () => void;

  constructor(private readonly eventBus: GameplayEventBus) {}

  start(): void {
    if (this.unsubscribe) return;
    this.unsubscribe = this.eventBus.subscribe(event => this.consume(event));
  }

  stop(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  registerMission(mission: LivingStoryRuntimeMission): void {
    this.missions.set(mission.id, mission);
  }

  unregisterMission(missionId: string): void {
    this.missions.delete(missionId);
    for (const key of [...this.counts.keys()]) if (key.startsWith(`${missionId}:`)) this.counts.delete(key);
  }

  subscribe(listener: MissionProgressListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getProgress(missionId: string, objectiveId: string): number {
    return this.counts.get(`${missionId}:${objectiveId}`) ?? 0;
  }

  private consume(event: GameplayEvent): void {
    if (!event.missionId) return;
    const mission = this.missions.get(event.missionId);
    if (!mission) return;

    mission.objectives.forEach(objective => {
      if (objective.eventType !== event.type) return;
      if (objective.objectId && objective.objectId !== event.objectId) return;

      const key = `${mission.id}:${objective.id}`;
      const previous = this.counts.get(key) ?? 0;
      const current = Math.min(objective.target, previous + 1);
      if (current === previous) return;
      this.counts.set(key, current);

      const progress: MissionObjectiveProgress = {
        missionId: mission.id,
        objectiveId: objective.id,
        current,
        target: objective.target,
        completed: current >= objective.target,
      };
      this.listeners.forEach(listener => listener(progress, event));
    });
  }
}

export const verticalSliceMission: LivingStoryRuntimeMission = {
  id: 'sv-universal-gameplay-vertical-slice',
  objectives: [
    { id: 'open-building-door', eventType: 'door_opened', target: 1, objectId: 'vertical-slice-building-door' },
    { id: 'use-elevator', eventType: 'elevator_used', target: 1, objectId: 'vertical-slice-elevator' },
    { id: 'equip-item', eventType: 'item_equipped', target: 1 },
    { id: 'enter-vehicle', eventType: 'vehicle_entered', target: 1, objectId: 'vertical-slice-car' },
  ],
};
