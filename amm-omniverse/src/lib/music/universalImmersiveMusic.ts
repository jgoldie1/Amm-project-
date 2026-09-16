export const MUSIC_PROJECT_TYPES = ['song','album','film-score','stage-musical','ar','vr','mr'] as const;
export const GENRE_PROFILES = ['gospel','rnb-soul','hip-hop-trap','pop','rock','jazz','blues','house-techno-edm','afrobeats','amapiano','reggae-dancehall','funk','country','latin','cinematic-orchestral','musical-theatre','lofi-ambient'] as const;
export type MusicProjectType = typeof MUSIC_PROJECT_TYPES[number];
export type GenreProfile = typeof GENRE_PROFILES[number];

export type CompositionLocks = {
  keyMode?: boolean; tempoMeter?: boolean; chords?: boolean; melody?: boolean;
  lyrics?: boolean; motif?: boolean; arrangement?: boolean;
};

export type SpatialMusicObject = {
  objectId: string; trackId: string; startBar: number; endBar: number;
  x: number; y: number; z: number; distance?: number; azimuth?: number;
  elevation?: number; movementPath?: Array<[number,number,number]>;
  roomZone?: string; visualEventId?: string; lightingEventId?: string;
  interactionRule?: string; stereoFallback: boolean; binauralFallback: boolean;
  accessibilityIntensity?: 'reduced'|'standard'|'enhanced';
};

export type UniversalMusicProject = {
  id: string; title: string; type: MusicProjectType; genre: GenreProfile;
  bpm: number; meter: string; keyMode: string; trackLimit: 64;
  locks: CompositionLocks; spatialObjects: SpatialMusicObject[];
  canonicalSourceId?: string; version: number;
};

export const DEFAULT_COMPOSITION_LOCKS: CompositionLocks = {
  keyMode: true, tempoMeter: true, chords: true, melody: true,
  lyrics: true, motif: true, arrangement: false,
};

export function verifyMusicProject(project: UniversalMusicProject) {
  const errors: string[] = [];
  if (!project.title.trim()) errors.push('title-required');
  if (!(project.bpm > 0 && project.bpm <= 400)) errors.push('invalid-bpm');
  if (project.trackLimit !== 64) errors.push('track-limit-must-be-64');
  for (const object of project.spatialObjects) {
    if (object.endBar < object.startBar) errors.push(`invalid-spatial-range:${object.objectId}`);
  }
  return { ok: errors.length === 0, errors };
}

export type AbletonAgentCommand = {
  projectId: string;
  operation: 'create-track'|'create-midi-clip'|'set-notes'|'set-tempo'|'set-arrangement-marker'|'set-device-parameter'|'read-state';
  payload: Record<string, unknown>;
  expectedVersion: number;
};

export function requireVerifiedAbletonReadback(command: AbletonAgentCommand, readbackVersion?: number) {
  return {
    command,
    verified: typeof readbackVersion === 'number' && readbackVersion >= command.expectedVersion,
    status: typeof readbackVersion === 'number' && readbackVersion >= command.expectedVersion ? 'confirmed' : 'pending-readback',
  } as const;
}
