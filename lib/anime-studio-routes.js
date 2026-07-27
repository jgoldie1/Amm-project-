const crypto = require('crypto');
const CATALOG = require('../data/anime-studio-catalog.json');
const { renderProject } = require('./anime-local-renderer');
const { buildProductionPlan } = require('./anime-production-planner');
const { readProviderConfig, chooseProvider } = require('./anime-provider-registry');
const { moderateProject, estimateCredits } = require('./anime-studio-guardrails');
const { writeManifest } = require('./anime-studio-manifest');
const { createStore } = require('./anime-studio-store');

function isCatalogValue(group, value) {
  return Array.isArray(CATALOG[group]) && CATALOG[group].includes(value);
}

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function requestOwner(req) {
  return cleanText(req.user?.id || req.headers['x-user-id'] || 'demo-user', 120);
}

function owns(resource, ownerId) {
  return resource && resource.ownerId === ownerId;
}

function registerAnimeStudioRoutes({ app }) {
  const store = createStore();
  const { projects, jobs, plans, persist } = store;

  app.get('/api/anime-studio/catalog', (_req, res) => res.json(CATALOG));
  app.get('/api/anime-studio/providers', (_req, res) => res.json({ providers: readProviderConfig() }));

  app.post('/api/anime-studio/projects', (req, res) => {
    const body = req.body || {};
    const project = {
      id: `anime_${crypto.randomUUID()}`,
      ownerId: requestOwner(req),
      title: cleanText(body.title, 120) || 'Untitled Anime Project',
      era: isCatalogValue('eras', body.era) ? body.era : CATALOG.eras[0],
      visualStyle: isCatalogValue('visualStyles', body.visualStyle) ? body.visualStyle : CATALOG.visualStyles[0],
      genre: isCatalogValue('genres', body.genre) ? body.genre : CATALOG.genres[0],
      format: isCatalogValue('formats', body.format) ? body.format : CATALOG.formats[0],
      quality: isCatalogValue('qualityPresets', body.quality) ? body.quality : CATALOG.qualityPresets[0],
      premise: cleanText(body.premise, 3000),
      status: 'draft',
      planId: null,
      outputs: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    projects.set(project.id, project);
    persist();
    res.status(201).json(project);
  });

  app.get('/api/anime-studio/projects/:id', (req, res) => {
    const project = projects.get(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!owns(project, requestOwner(req))) return res.status(403).json({ error: 'Project access denied' });
    res.json(project);
  });

  app.post('/api/anime-studio/projects/:id/moderate', (req, res) => {
    const project = projects.get(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!owns(project, requestOwner(req))) return res.status(403).json({ error: 'Project access denied' });
    res.json(moderateProject(project));
  });

  app.post('/api/anime-studio/projects/:id/estimate', (req, res) => {
    const project = projects.get(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!owns(project, requestOwner(req))) return res.status(403).json({ error: 'Project access denied' });
    const body = req.body || {};
    res.json(estimateCredits({
      providerId: body.provider || 'tryamm-local',
      sceneCount: Number(body.sceneCount) || 4,
      quality: project.quality
    }));
  });

  app.post('/api/anime-studio/projects/:id/plan', (req, res) => {
    const project = projects.get(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!owns(project, requestOwner(req))) return res.status(403).json({ error: 'Project access denied' });
    const moderation = moderateProject(project);
    if (!moderation.allowed) return res.status(422).json({ error: moderation.reason, moderation });
    const plan = { ...buildProductionPlan(project, req.body || {}), ownerId: project.ownerId };
    plans.set(plan.id, plan);
    project.planId = plan.id;
    project.status = 'planned';
    project.updatedAt = new Date().toISOString();
    persist();
    res.status(201).json(plan);
  });

  app.get('/api/anime-studio/plans/:id', (req, res) => {
    const plan = plans.get(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Production plan not found' });
    if (!owns(plan, requestOwner(req))) return res.status(403).json({ error: 'Production plan access denied' });
    res.json(plan);
  });

  app.post('/api/anime-studio/projects/:id/generate', (req, res) => {
    const project = projects.get(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (!owns(project, requestOwner(req))) return res.status(403).json({ error: 'Project access denied' });
    if ([...jobs.values()].some(job => job.projectId === project.id && ['queued', 'running'].includes(job.status))) {
      return res.status(409).json({ error: 'A generation job is already active for this project' });
    }

    const moderation = moderateProject(project);
    if (!moderation.allowed) return res.status(422).json({ error: moderation.reason, moderation });

    let provider;
    try {
      provider = chooseProvider(req.body?.provider, readProviderConfig());
    } catch (error) {
      return res.status(400).json({ error: error.message, providers: readProviderConfig() });
    }

    let plan = project.planId ? plans.get(project.planId) : null;
    if (!plan) {
      plan = { ...buildProductionPlan(project, req.body || {}), ownerId: project.ownerId };
      plans.set(plan.id, plan);
      project.planId = plan.id;
    }

    const credits = estimateCredits({
      providerId: provider.id,
      sceneCount: plan.scenes?.length || Number(req.body?.sceneCount) || 4,
      quality: project.quality
    });
    const now = new Date().toISOString();
    const job = {
      id: `job_${crypto.randomUUID()}`,
      ownerId: project.ownerId,
      projectId: project.id,
      planId: plan.id,
      provider: provider.id,
      moderation,
      credits,
      status: 'queued',
      stage: 'queued',
      progress: 0,
      createdAt: now,
      updatedAt: now,
      error: null,
      outputs: null
    };
    jobs.set(job.id, job);
    project.status = 'queued';
    project.updatedAt = now;
    persist();

    setImmediate(async () => {
      try {
        job.status = 'running';
        job.stage = 'planning';
        job.progress = 15;
        job.updatedAt = new Date().toISOString();
        project.status = 'generating';
        persist();

        if (provider.id !== 'tryamm-local') {
          throw new Error(`${provider.name} adapter is configured but remote execution is not implemented on this server yet`);
        }

        job.stage = 'rendering-key-art';
        job.progress = 45;
        persist();
        const outputs = await renderProject({ ...project, productionPlan: plan });
        job.stage = 'packaging';
        job.progress = 85;
        persist();
        const manifest = await writeManifest({ project, plan, provider, outputs, moderation, credits });
        job.outputs = { ...outputs, manifest, productionPlan: plan, provider };
        job.progress = 100;
        job.stage = 'completed';
        job.status = 'completed';
        job.updatedAt = new Date().toISOString();
        project.status = 'completed';
        project.outputs = job.outputs;
        project.updatedAt = job.updatedAt;
        persist();
      } catch (error) {
        job.status = 'failed';
        job.stage = 'failed';
        job.error = error.message;
        job.updatedAt = new Date().toISOString();
        project.status = 'failed';
        project.updatedAt = job.updatedAt;
        persist();
      }
    });

    res.status(202).json(job);
  });

  app.get('/api/anime-studio/jobs/:id', (req, res) => {
    const job = jobs.get(req.params.id);
    if (!job) return res.status(404).json({ error: 'Generation job not found' });
    if (!owns(job, requestOwner(req))) return res.status(403).json({ error: 'Generation job access denied' });
    res.json(job);
  });
}

module.exports = { registerAnimeStudioRoutes };
