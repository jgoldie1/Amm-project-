'use strict';

/**
 * Browser-native multitrack audio engine for the TryAMM Vocal Studio.
 * This is a foundation, not a full professional DAW.
 */
export class VocalStudioEngine {
  constructor({ maxTracks = 64 } = {}) {
    this.maxTracks = maxTracks;
    this.audioCtx = null;
    this.masterGain = null;
    this.tracks = new Map();
    this.startedAt = 0;
    this.pausedAt = 0;
    this.isPlaying = false;
  }

  async initializeContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error('Web Audio is not supported in this browser.');
      this.audioCtx = new AudioContextClass();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 1;
      this.masterGain.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') await this.audioCtx.resume();
    return this.audioCtx;
  }

  async loadTrackBuffer(trackId, audioUrl, name = trackId) {
    await this.initializeContext();
    if (!trackId) throw new Error('Track ID is required.');
    if (this.tracks.has(trackId)) throw new Error(`Track ${trackId} already exists.`);
    if (this.tracks.size >= this.maxTracks) throw new Error(`Maximum track limit (${this.maxTracks}) reached.`);

    const response = await fetch(audioUrl);
    if (!response.ok) throw new Error(`Unable to load audio track (${response.status}).`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await this.audioCtx.decodeAudioData(arrayBuffer.slice(0));

    const gainNode = this.audioCtx.createGain();
    const panNode = typeof this.audioCtx.createStereoPanner === 'function' ? this.audioCtx.createStereoPanner() : null;
    if (panNode) {
      gainNode.connect(panNode);
      panNode.connect(this.masterGain);
    } else {
      gainNode.connect(this.masterGain);
    }

    this.tracks.set(trackId, {
      id: trackId,
      name,
      buffer,
      gainNode,
      panNode,
      sourceNode: null,
      volume: 1,
      pan: 0,
      muted: false,
      solo: false,
      loop: false
    });
    this.applyMixState();
    return this.getTrack(trackId);
  }

  async addFile(file) {
    if (!(file instanceof Blob)) throw new Error('Select a valid audio file.');
    const id = `track_${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
    const url = URL.createObjectURL(file);
    try {
      await this.loadTrackBuffer(id, url, file.name || id);
      return id;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  createSource(track, offset = 0, startAt = this.audioCtx.currentTime) {
    const source = this.audioCtx.createBufferSource();
    source.buffer = track.buffer;
    source.loop = track.loop;
    source.connect(track.gainNode);
    source.onended = () => {
      if (track.sourceNode === source) track.sourceNode = null;
    };
    source.start(startAt, Math.min(offset, Math.max(0, track.buffer.duration - 0.001)));
    track.sourceNode = source;
  }

  async playAll() {
    await this.initializeContext();
    if (this.isPlaying || this.tracks.size === 0) return;
    const startAt = this.audioCtx.currentTime + 0.05;
    const offset = this.pausedAt;
    for (const track of this.tracks.values()) this.createSource(track, offset, startAt);
    this.startedAt = startAt - offset;
    this.isPlaying = true;
  }

  pauseAll() {
    if (!this.isPlaying || !this.audioCtx) return;
    this.pausedAt = Math.max(0, this.audioCtx.currentTime - this.startedAt);
    this.stopSources();
    this.isPlaying = false;
  }

  stopAll() {
    this.stopSources();
    this.isPlaying = false;
    this.pausedAt = 0;
    this.startedAt = 0;
  }

  stopSources() {
    for (const track of this.tracks.values()) {
      if (!track.sourceNode) continue;
      try { track.sourceNode.stop(); } catch {}
      try { track.sourceNode.disconnect(); } catch {}
      track.sourceNode = null;
    }
  }

  setVolume(trackId, value) {
    const track = this.requireTrack(trackId);
    track.volume = Math.max(0, Math.min(1, Number(value)));
    this.applyMixState();
  }

  setPan(trackId, value) {
    const track = this.requireTrack(trackId);
    track.pan = Math.max(-1, Math.min(1, Number(value)));
    if (track.panNode) track.panNode.pan.setValueAtTime(track.pan, this.audioCtx.currentTime);
  }

  toggleMute(trackId) {
    const track = this.requireTrack(trackId);
    track.muted = !track.muted;
    this.applyMixState();
    return track.muted;
  }

  toggleSolo(trackId) {
    const track = this.requireTrack(trackId);
    track.solo = !track.solo;
    this.applyMixState();
    return track.solo;
  }

  toggleLoop(trackId) {
    const track = this.requireTrack(trackId);
    track.loop = !track.loop;
    return track.loop;
  }

  setMasterVolume(value) {
    if (!this.masterGain) return;
    this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, Number(value))), this.audioCtx.currentTime);
  }

  applyMixState() {
    if (!this.audioCtx) return;
    const anySolo = [...this.tracks.values()].some((track) => track.solo);
    for (const track of this.tracks.values()) {
      const audible = !track.muted && (!anySolo || track.solo);
      track.gainNode.gain.setValueAtTime(audible ? track.volume : 0, this.audioCtx.currentTime);
    }
  }

  removeTrack(trackId) {
    const track = this.requireTrack(trackId);
    if (track.sourceNode) {
      try { track.sourceNode.stop(); } catch {}
      try { track.sourceNode.disconnect(); } catch {}
    }
    try { track.gainNode.disconnect(); } catch {}
    try { track.panNode?.disconnect(); } catch {}
    this.tracks.delete(trackId);
    this.applyMixState();
  }

  clear() {
    this.stopAll();
    for (const id of [...this.tracks.keys()]) this.removeTrack(id);
  }

  async close() {
    this.clear();
    if (this.audioCtx && this.audioCtx.state !== 'closed') await this.audioCtx.close();
    this.audioCtx = null;
    this.masterGain = null;
  }

  getTrack(trackId) {
    const track = this.tracks.get(trackId);
    if (!track) return null;
    return {
      id: track.id,
      name: track.name,
      duration: track.buffer.duration,
      volume: track.volume,
      pan: track.pan,
      muted: track.muted,
      solo: track.solo,
      loop: track.loop
    };
  }

  listTracks() {
    return [...this.tracks.keys()].map((id) => this.getTrack(id));
  }

  requireTrack(trackId) {
    const track = this.tracks.get(trackId);
    if (!track) throw new Error(`Track ${trackId} was not found.`);
    return track;
  }
}