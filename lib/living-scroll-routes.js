'use strict';

const SOURCE_TYPES = Object.freeze([
  'scripture',
  'manuscript',
  'language',
  'historical',
  'archaeological',
  'scholarly-interpretation',
  'religious-tradition',
  'educational-reconstruction',
  'seven-lights-fiction'
]);

const GENESIS_1_PILOT = Object.freeze({
  book: { id: 'genesis', name: 'Genesis', torahPosition: 1 },
  chapter: 1,
  title: 'In the Beginning',
  status: 'pilot',
  navigation: ['read', 'listen', 'speak', 'write', 'paleo-hebrew', 'strongs', 'sources', 'atlas', 'timeline', 'scrollverse'],
  verseStudy: {
    reference: 'Genesis 1:1',
    notice: 'Production pilot. Text, lexical data, manuscript claims and pronunciation material must pass source review before publication.',
    sourceLabels: SOURCE_TYPES,
    activities: [
      { id: 'identify-source-type', type: 'source-literacy', title: 'Show Me Your Source' },
      { id: 'hebrew-letter-practice', type: 'language', title: 'Hebrew Letter Practice' },
      { id: 'paleo-hebrew-trace', type: 'writing', title: 'Paleo-Hebrew Trace' },
      { id: 'word-study', type: 'lexical', title: 'Word Study' }
    ]
  }
});

module.exports = function registerLivingScrollRoutes({ app, auth, clean, getStore, saveStore }) {
  function store() {
    const current = getStore();
    current.livingScrollProgress ||= [];
    return current;
  }

  app.get('/api/living-scroll/pilot', (_req, res) => {
    res.json({
      product: 'Living Scroll',
      imprint: 'Living Scroll Press / Kingdoms Press',
      canonBoundary: 'Seven Lights fiction and Living Scroll source study are separate contexts.',
      pilot: GENESIS_1_PILOT
    });
  });

  app.get('/api/living-scroll/source-types', (_req, res) => {
    res.json({ sourceTypes: SOURCE_TYPES });
  });

  app.get('/api/living-scroll/progress', auth, (req, res) => {
    const progress = store().livingScrollProgress.filter(item => item.owner_id === req.user.id);
    res.json({ source: 'local-fallback', progress });
  });

  app.post('/api/living-scroll/progress', auth, async (req, res, next) => {
    try {
      const activityId = clean(req.body.activityId, 100);
      const reference = clean(req.body.reference || 'Genesis 1:1', 100);
      if (!activityId) return res.status(400).json({ error: 'activityId is required' });

      const current = store();
      const existing = current.livingScrollProgress.find(item => item.owner_id === req.user.id && item.activity_id === activityId && item.reference === reference);
      const completedAt = new Date().toISOString();
      if (existing) {
        existing.completed_at = completedAt;
      } else {
        current.livingScrollProgress.push({ owner_id: req.user.id, activity_id: activityId, reference, completed_at: completedAt });
      }
      await saveStore();
      res.status(201).json({ saved: true, activityId, reference, completedAt, source: 'local-fallback' });
    } catch (error) { next(error); }
  });
};

module.exports.SOURCE_TYPES = SOURCE_TYPES;
module.exports.GENESIS_1_PILOT = GENESIS_1_PILOT;
