'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function loadRegistry() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'config/news-media.json'), 'utf8'));
}

function normalizeArticle(input, clean, id) {
  const canonicalUrl = clean(input.canonicalUrl, 1200);
  const title = clean(input.title, 240);
  const publisher = clean(input.publisher, 160);
  if (!canonicalUrl || !title || !publisher) throw new Error('canonicalUrl, title and publisher are required');
  const publishedAt = input.publishedAt ? new Date(input.publishedAt).toISOString() : new Date().toISOString();
  const excerpt = clean(input.excerpt, 1200);
  const sourceText = `${canonicalUrl}|${title}|${publisher}|${publishedAt}|${excerpt}`;
  return {
    id: id('news'),
    canonicalUrl,
    title,
    publisher,
    author: clean(input.author, 160) || null,
    publishedAt,
    updatedAt: input.updatedAt ? new Date(input.updatedAt).toISOString() : publishedAt,
    retrievedAt: new Date().toISOString(),
    region: clean(input.region, 80) || 'global',
    scope: clean(input.scope, 40) || 'global',
    topic: clean(input.topic, 80) || 'general',
    language: clean(input.language, 20) || 'en',
    excerpt,
    ingestionMethod: clean(input.ingestionMethod, 40) || 'publisher-submission',
    contentHash: crypto.createHash('sha256').update(sourceText).digest('hex'),
    evidenceState: clean(input.evidenceState, 40) || 'single-source',
    correctionStatus: clean(input.correctionStatus, 40) || 'none',
    contentLabels: Array.isArray(input.contentLabels) ? input.contentLabels.slice(0, 12).map(v => clean(v, 40)) : [],
    opinion: Boolean(input.opinion),
    sponsored: Boolean(input.sponsored),
    aiGenerated: Boolean(input.aiGenerated),
    status: 'published-metadata-only'
  };
}

module.exports = function registerNewsIntelligence({ app, auth, admin, clean, id, getStore, saveStore }) {
  const registry = loadRegistry();

  app.get('/api/news/config', (_req, res) => res.json(registry));

  app.get('/api/news/feed', (req, res) => {
    const store = getStore();
    const scope = clean(req.query.scope, 40).toLowerCase();
    const topic = clean(req.query.topic, 80).toLowerCase();
    const language = clean(req.query.language, 20).toLowerCase();
    const feed = (store.newsArticles || [])
      .filter(item => !scope || String(item.scope).toLowerCase() === scope)
      .filter(item => !topic || String(item.topic).toLowerCase() === topic)
      .filter(item => !language || String(item.language).toLowerCase() === language)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    res.json({
      count: feed.length,
      editorialModel: 'viewpoint-diverse-source-transparent',
      safetyModel: 'lawful-content-with-labels-corrections-and-user-controls',
      articles: feed
    });
  });

  app.post('/api/admin/news/articles', auth, admin, async (req, res) => {
    let article;
    try {
      article = normalizeArticle(req.body || {}, clean, id);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
    const store = getStore();
    store.newsArticles = store.newsArticles || [];
    const duplicate = store.newsArticles.find(item => item.contentHash === article.contentHash || item.canonicalUrl === article.canonicalUrl);
    if (duplicate) return res.status(409).json({ error: 'Duplicate article or canonical URL', existingId: duplicate.id });
    store.newsArticles.push(article);
    await saveStore();
    res.status(201).json({ article });
  });

  app.post('/api/admin/news/sources/validate', auth, admin, (req, res) => {
    const method = clean(req.body?.ingestionMethod, 40);
    const robotsAllowed = req.body?.robotsAllowed !== false;
    const licensed = Boolean(req.body?.licensed);
    const paywallBypass = Boolean(req.body?.paywallBypass);
    const approvedMethods = new Set(['licensed-api', 'official-api', 'rss', 'atom', 'publisher-webhook', 'public-record-feed', 'approved-scraper']);
    const blockers = [];
    if (!approvedMethods.has(method)) blockers.push('unsupported-ingestion-method');
    if (method === 'approved-scraper' && !robotsAllowed) blockers.push('robots-disallow');
    if (paywallBypass) blockers.push('paywall-bypass-prohibited');
    if (method === 'approved-scraper' && !licensed && req.body?.storeFullText) blockers.push('full-text-license-required');
    res.json({ approved: blockers.length === 0, blockers, requirements: registry.ingestion.scraperRules });
  });

  app.post('/api/admin/news/oracle/attest', auth, admin, async (req, res) => {
    const store = getStore();
    const article = (store.newsArticles || []).find(item => item.id === clean(req.body?.articleId, 100));
    if (!article) return res.status(404).json({ error: 'Article not found' });
    const attestation = {
      id: id('oracle'),
      articleId: article.id,
      canonicalUrl: article.canonicalUrl,
      publisher: article.publisher,
      contentHash: article.contentHash,
      publishedAt: article.publishedAt,
      attestedAt: new Date().toISOString(),
      evidenceState: clean(req.body?.evidenceState, 40) || article.evidenceState,
      confirmations: Array.isArray(req.body?.confirmations) ? req.body.confirmations.slice(0, 20) : [],
      oracleProvider: clean(req.body?.oracleProvider, 60) || 'tryamm-provenance-oracle',
      onchainStatus: 'not-submitted'
    };
    store.newsAttestations = store.newsAttestations || [];
    store.newsAttestations.push(attestation);
    await saveStore();
    res.status(201).json({ attestation });
  });

  app.get('/api/news/articles/:articleId/provenance', (req, res) => {
    const store = getStore();
    const article = (store.newsArticles || []).find(item => item.id === req.params.articleId);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    const attestations = (store.newsAttestations || []).filter(item => item.articleId === article.id);
    res.json({ article, attestations, originalSourceRequired: true, platformDoesNotDeclareOpinionAsFact: true });
  });
};
