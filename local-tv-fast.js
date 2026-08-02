'use strict';

const fs = require('fs');
const path = require('path');

function loadRegistry() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'config/local-tv-fast.json'), 'utf8'));
}

module.exports = function registerLocalTvFast({ app, auth, clean, getStore }) {
  const registry = loadRegistry();

  app.get('/api/tv/config', (_req, res) => res.json({
    productName: registry.productName,
    model: registry.model,
    distribution: registry.distribution,
    advertising: registry.advertising,
    rightsAndSafety: registry.rightsAndSafety,
    accessibility: registry.accessibility
  }));

  app.get('/api/tv/channels', (req, res) => {
    const region = clean(req.query.region, 80).toLowerCase();
    const scope = clean(req.query.scope, 30).toLowerCase();
    const channels = registry.channels.filter(channel => {
      const regionMatch = !region || channel.regions.some(value => value.toLowerCase().includes(region));
      const scopeMatch = !scope || channel.scope === scope;
      return regionMatch && scopeMatch;
    });
    res.json({ count: channels.length, channels });
  });

  app.get('/api/tv/guide', auth, (req, res) => {
    const store = getStore();
    const liveRooms = (store.rooms || []).filter(room => room.status === 'live');
    const generatedAt = new Date().toISOString();
    const guide = registry.channels.map((channel, index) => ({
      channelId: channel.id,
      channelName: channel.name,
      now: {
        title: index === 0 && liveRooms[0] ? liveRooms[0].title : `${channel.name} Programming`,
        format: liveRooms[0] && index === 0 ? 'live-community-event' : 'scheduled-placeholder',
        startsAt: generatedAt,
        rightsStatus: 'requires-program-level-verification'
      },
      next: {
        title: `${channel.name} Next`,
        format: 'scheduled-placeholder',
        rightsStatus: 'requires-program-level-verification'
      }
    }));
    res.json({
      generatedAt,
      guide,
      warning: 'Schedules remain placeholders until licensed programming, playout and EPG systems are connected.'
    });
  });

  app.get('/api/tv/local/:region', auth, (req, res) => {
    const region = clean(req.params.region, 80).toLowerCase();
    const channels = registry.channels.filter(channel => channel.regions.some(value => value.toLowerCase().includes(region)));
    res.json({
      region,
      channels,
      localServices: ['news', 'weather', 'emergency-alerts', 'public-meetings', 'schools', 'sports', 'businesses', 'creator-programming'],
      accessibility: registry.accessibility,
      translationEnabled: true
    });
  });
};
