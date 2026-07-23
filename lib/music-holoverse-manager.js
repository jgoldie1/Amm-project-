const crypto = require('crypto');

function createMusicHoloVerseManager({ manifest, io }) {
  const artists = [];
  const releases = [];
  const usageEvents = [];
  const holoEvents = [];

  function now() { return new Date().toISOString(); }
  function id(prefix) { return `${prefix}_${crypto.randomUUID()}`; }

  return {
    manifest: () => manifest,
    createArtist(input = {}) {
      if (!input.ownerUserId || !input.name) throw new Error('ownerUserId and name are required');
      const artist = {
        id: id('artist'), ownerUserId: input.ownerUserId, name: String(input.name).slice(0, 160),
        bio: String(input.bio || '').slice(0, 4000), genres: Array.isArray(input.genres) ? input.genres.slice(0, 20) : [],
        status: 'draft', createdAt: now(), updatedAt: now()
      };
      artists.unshift(artist); io?.emit('music:artist', artist); return artist;
    },
    listArtists() { return artists; },
    createRelease(input = {}) {
      if (!input.artistId || !input.title || !input.releaseType) throw new Error('artistId, title and releaseType are required');
      if (!artists.some((a) => a.id === input.artistId)) throw new Error('UNKNOWN_ARTIST');
      const release = {
        id: id('release'), artistId: input.artistId, title: String(input.title).slice(0, 200),
        releaseType: input.releaseType, tracks: Array.isArray(input.tracks) ? input.tracks.slice(0, 100) : [],
        rights: input.rights || {}, territories: Array.isArray(input.territories) ? input.territories : [],
        status: 'rights-review', publishedAt: null, createdAt: now(), updatedAt: now()
      };
      releases.unshift(release); io?.emit('music:release', release); return release;
    },
    listReleases() { return releases; },
    updateRelease(idValue, patch = {}) {
      const release = releases.find((r) => r.id === idValue); if (!release) return null;
      const allowed = ['status', 'rights', 'territories', 'tracks', 'publishedAt'];
      for (const key of allowed) if (Object.prototype.hasOwnProperty.call(patch, key)) release[key] = patch[key];
      release.updatedAt = now(); io?.emit('music:release', release); return release;
    },
    recordUsage(input = {}) {
      if (!input.releaseId || !input.usageType) throw new Error('releaseId and usageType are required');
      if (!releases.some((r) => r.id === input.releaseId)) throw new Error('UNKNOWN_RELEASE');
      const event = { id: id('usage'), releaseId: input.releaseId, usageType: input.usageType, userId: input.userId || null, source: input.source || 'unknown', territory: input.territory || null, amount: Number(input.amount || 0), currency: input.currency || null, fraudStatus: 'pending', createdAt: now() };
      usageEvents.unshift(event); if (usageEvents.length > 10000) usageEvents.length = 10000; io?.emit('music:usage', event); return event;
    },
    listUsageEvents() { return usageEvents; },
    createHoloEvent(input = {}) {
      if (!input.title || !input.hostArtistId || !input.eventType) throw new Error('title, hostArtistId and eventType are required');
      if (!artists.some((a) => a.id === input.hostArtistId)) throw new Error('UNKNOWN_ARTIST');
      const event = {
        id: id('holo'), title: String(input.title).slice(0, 200), hostArtistId: input.hostArtistId,
        eventType: input.eventType, startsAt: input.startsAt || null, venueMode: input.venueMode || 'virtual',
        ticketing: input.ticketing || {}, rights: input.rights || {}, status: 'draft', createdAt: now(), updatedAt: now()
      };
      holoEvents.unshift(event); io?.emit('holoverse:event', event); return event;
    },
    listHoloEvents() { return holoEvents; },
    updateHoloEvent(idValue, patch = {}) {
      const event = holoEvents.find((e) => e.id === idValue); if (!event) return null;
      const allowed = ['status', 'startsAt', 'ticketing', 'rights', 'venueMode'];
      for (const key of allowed) if (Object.prototype.hasOwnProperty.call(patch, key)) event[key] = patch[key];
      event.updatedAt = now(); io?.emit('holoverse:event', event); return event;
    }
  };
}

module.exports = { createMusicHoloVerseManager };
