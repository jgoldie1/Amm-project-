const crypto = require('crypto');
const CATALOG = require('../data/anime-studio-catalog.json');
const { renderProject } = require('./anime-local-renderer');

function isCatalogValue(group, value) {
  return Array.isArray(CATALOG[group]) && CATALOG[group].includes(value);
}

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function registerAnimeStudioRoutes({ app }) {
  const projects = new Map();
  const jobs = new Map();

  app.get('/api/anime-studio/catalog', (_req, res) => res.json(CATALOG));

  app.post('/api/anime-studio/projects', (req, res) => {
    const body = req.body || {};
    const project = {
      id: `anime_${crypto.randomUUID()}`,
      title: cleanText(body.title, 120) || 'Untitled Anime Project',
      era: isCatalogValue('eras', body.era) ? body.era : CATALOG.eras[0],
      visualStyle: isCatalogValue('visualStyles', body.visualStyle) ? body.visualStyle : CATALOG.visualStyles[0],
      genre: isCatalogValue('genres', body.genre) ? body.genre : CATALOG.genres[0],
      format: isCatalogValue('formats', body.format) ? body.format : CATALOG.formats[0],
      quality: isCatalogValue('qualityPresets', body.quality) ? body.quality : CATALOG.qualityPresets[0],
      premise: cleanText(body.premise, 3000),
      status: 'draft',
      outputs: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    projects.set(project.id, project);
    res.status(201).json(project);
  });

  app.get('/api/anime-studio/projects/:id', (req, res) => {
    const project = projects.get(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  });

  app.post('/api/anime-studio/projects/:id/generate', (req, res) => {
    const project = projects.get(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if ([...jobs.values()].some(job => job.projectId === project.id && ['queued', 'running'].includes(job.status))) {
      return res.status(409).json({ error: 'A generation job is already active for this project' });
    }

    const job = {
      id: `job_${crypto.randomUUID()}`,
      projectId: project.id,
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      error: null,
      outputs: null
    };
    jobs.set(job.id, job);
    project.status = 'queued';
    project.updatedAt = job.updatedAt;

    setImmediate(async () => {
      try {
        job.status = 'running';
        job.progress = 25;
        job.updatedAt = new Date().toISOString();
        project.status = 'generating';
        const outputs = await renderProject(project);
        job.progress = 100;
        job.status = 'completed';
        job.outputs = outputs;
        job.updatedAt = new Date().toISOString();
        project.status = 'completed';
        project.outputs = outputs;
        project.updatedAt = job.updatedAt;
      } catch (error) {
        job.status = 'failed';
        job.error = error.message;
        job.updatedAt = new Date().toISOString();
        project.status = 'failed';
        project.updatedAt = job.updatedAt;
      }
    });

    res.status(202).json(job);
  });

  app.get('/api/anime-studio/jobs/:id', (req, res) => {
    const job = jobs.get(req.params.id);
    if (!job) return res.status(404).json({ error: 'Generation job not found' });
    res.json(job);
  });
}

module.exports = { registerAnimeStudioRoutes };
