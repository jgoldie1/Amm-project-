'use strict';

module.exports = function registerMyWorldUnity({ app, auth, getStore }) {
  app.get('/api/my-world', (_req, res) => res.json({
    platform: 'My World',
    unityLayer: 'We Are One World',
    promise: 'One identity, one accessibility profile, one translation layer and one connected journey across worlds.',
    pillars: ['live','play','travel','create','shop','learn','work','watch'],
    connectedSystems: ['13-living-worlds','starverse','open-city','his-hers-sports','quantum-tag','transit','creator-tools','wallet','university','workforce','marketplace','isaiah-ai-tv']
  }));

  app.get('/api/my-world/journey', auth, (req, res) => {
    const store = getStore();
    res.json({
      user: { id: req.user.id, displayName: req.user.displayName, ageLane: req.user.ageLane || 'adult' },
      continuity: {
        identity: 'shared',
        accessibility: 'shared',
        translation: 'shared',
        wallet: 'shared',
        inventory: 'portable-when-approved',
        progression: 'cross-world'
      },
      path: [
        'Enter Globe',
        'Choose city or Living World',
        'Plan accessible translated travel',
        'Ride local, regional or intercity transit',
        'Play a game or attend an event',
        'Create, learn, work or shop',
        'Save progression and return anywhere'
      ],
      liveRooms: (store.rooms || []).filter(room => room.status === 'live').length
    });
  });
};
