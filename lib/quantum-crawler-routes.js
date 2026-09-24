const { createQuantumCrawler } = require('./quantum-crawler');

function registerQuantumCrawlerRoutes({ app, manager, auth, admin }) {
  const crawler = createQuantumCrawler();
  const adminOnly = [auth, admin].filter(Boolean);
  const lastRunBySource = new Map();
  const enabled = () => String(process.env.QUANTUM_CRAWLER_ENABLED || '').toLowerCase() === 'true';

  app.get('/api/quantum-crawler/status', (_req, res) => {
    res.json({
      name: 'TRYAMM Quantum Crawler',
      status: enabled() ? 'ENABLED_GATED' : 'DISABLED',
      mode: 'metadata-first',
      publishAuthority: false,
      handoff: 'crawler -> Oracle ingest -> verification/editorial queue -> approved product routing',
      protections: [
        'approved-source-only',
        'same-approved-host-only',
        'stored-robots-review-required',
        'no-paywall-or-auth-bypass',
        'no-public-safety-scraping',
        'no-private-network-hosts',
        'no-raw-html-retention',
        'no-full-article-retention',
        'response-size-cap',
        'per-source-run-throttle'
      ]
    });
  });

  app.post('/api/quantum-crawler/plan', ...adminOnly, (req, res) => {
    try {
      const source = manager.getSource(req.body?.sourceId);
      if (!source) return res.status(404).json({ error: 'SOURCE_NOT_FOUND' });
      return res.json(crawler.plan(source, { urls: Array.isArray(req.body?.urls) ? req.body.urls : [] }));
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/quantum-crawler/run-one', ...adminOnly, async (req, res) => {
    if (!enabled()) return res.status(503).json({ error: 'QUANTUM_CRAWLER_DISABLED' });
    try {
      const source = manager.getSource(req.body?.sourceId);
      if (!source) return res.status(404).json({ error: 'SOURCE_NOT_FOUND' });
      const minIntervalMs = Math.max(30, Number(source.scrapePolicy?.minIntervalSeconds) || 300) * 1000;
      const previousRun = Number(lastRunBySource.get(source.id) || 0);
      const now = Date.now();
      if (previousRun && now - previousRun < minIntervalMs) {
        const retryAfterSeconds = Math.ceil((minIntervalMs - (now - previousRun)) / 1000);
        res.setHeader('Retry-After', String(retryAfterSeconds));
        return res.status(429).json({ error: 'CRAWL_SOURCE_RATE_LIMITED', retryAfterSeconds });
      }
      lastRunBySource.set(source.id, now);
      let result;
      try {
        result = await crawler.crawlOne(source, req.body?.url);
      } catch (error) {
        lastRunBySource.delete(source.id);
        throw error;
      }
      const lane = req.body?.lane || source.lanes?.[0] || 'global_international';
      const desk = req.body?.desk || source.desks?.[0] || 'international_news';
      const purposes = Array.isArray(req.body?.purposes) && req.body.purposes.length ? req.body.purposes : source.purposes;
      const ingested = manager.ingest({
        sourceId: source.id,
        headline: result.title,
        summary: result.description,
        url: result.sourceUrl,
        canonicalUrl: result.canonicalUrl,
        publishedAt: result.publishedAt,
        lane,
        desk,
        purposes,
        verificationStatus: 'ingested'
      });
      return res.status(201).json({
        ok: true,
        crawler: {
          sourceUrl: result.sourceUrl,
          canonicalUrl: result.canonicalUrl,
          fetchedAt: result.fetchedAt,
          rawHtmlStored: false,
          fullArticleStored: false
        },
        oracle: ingested
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  });
}

module.exports = { registerQuantumCrawlerRoutes };
