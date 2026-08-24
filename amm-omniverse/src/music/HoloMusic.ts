export type HoloMusicContext = 'streetverse'|'my-world'|'kingdom'|'after-dark'|'creator-studio'|'live'|'store'|'vehicle';

export type HoloMusicTrack = {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  artworkUrl?: string;
  audioUrl?: string;
  durationMs?: number;
  licensedFor: HoloMusicContext[];
  productIds?: string[];
  worldLocationIds?: string[];
  creatorAttributionId?: string;
};

export type HoloMusicSession = {
  context: HoloMusicContext;
  trackId?: string;
  startedAt?: string;
  positionMs: number;
  playing: boolean;
  volume: number;
  spatial: boolean;
  quantumBeatSync: boolean;
};

export const HOLO_MUSIC_FLOW = [
  'DISCOVER TRACK',
  'VERIFY RIGHTS/ENTITLEMENT',
  'PLAY IN WORLD / VEHICLE / CREATOR STUDIO',
  'QUANTUM BEAT SYNC AUDIO + VISUAL + HAPTIC TIMING',
  'TAG ARTIST / PRODUCT / LOCATION',
  'RECORD REEL OR LIVE EVENT',
  'PUBLISH',
  'ATTRIBUTION',
  'VERIFIED PURCHASE / STREAM EVENT',
  'LEDGER',
] as const;

export function createHoloMusicSession(context:HoloMusicContext):HoloMusicSession {
  return {context, positionMs:0, playing:false, volume:0.8, spatial:true, quantumBeatSync:true};
}

export function canPlayTrack(track:HoloMusicTrack, context:HoloMusicContext){
  return track.licensedFor.includes(context);
}

export const HOLO_MUSIC_RULES = {
  noUnverifiedRights: true,
  serverAttributionForMoney: true,
  spatialAudioByWorldContext: true,
  vehiclePortalAudioCompatible: true,
  creatorProductAndLocationTags: true,
  quantumBeatRequiredForCrossDeviceSync: true,
} as const;
