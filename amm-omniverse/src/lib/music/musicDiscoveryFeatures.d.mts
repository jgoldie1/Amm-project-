import type {ApprovedMusicVideo} from './musicVideoDiscoveryPolicy.mjs';
export const DISCOVERY_PLAYLIST_KEY:string;
export const MUSIC_VIDEO_GENRES:readonly string[];
export const MUSIC_DISCOVERY_CRITERIA:Readonly<{searchable:readonly string[];ranking:string;channels:string;playlists:string;analytics:string;copyright:string;moderation:string}>;
export function searchApprovedVideos(videos:readonly ApprovedMusicVideo[],filters?:{query?:string;genre?:string;artist?:string}):ApprovedMusicVideo[];
export function listArtistChannels(videos:readonly ApprovedMusicVideo[]):string[];
export function sanitizeSavedVideoIds(ids:unknown,approvedVideos:readonly ApprovedMusicVideo[]):string[];
export function readLocalWatchlist(storage:Pick<Storage,'getItem'>,approvedVideos:readonly ApprovedMusicVideo[]):string[];
export function saveLocalWatchlist(storage:Pick<Storage,'setItem'>,ids:string[],approvedVideos:readonly ApprovedMusicVideo[]):string[];
