const CATALOG = require('../data/anime-studio-catalog.json');

function registerAnimeStudioRoutes({ app }) {
  const projects = new Map();

  app.get('/api/anime-studio/catalog', (_req, res) => res.json(CATALOG));

  app.post('/api/anime-studio/projects', (req, res) => {
    const id = `anime_${Date.now()}`;
    const project = {
      id,
      title: req.body?.title || 'Untitled Anime Project',
      era: req.body?.era || CATALOG.eras[0],
      visualStyle: req.body?.visualStyle || CATALOG.visualStyles[0],
      genre: req.body?.genre || CATALOG.genres[0],
      format: req.body?.format || CATALOG.formats[0],
      quality: req.body?.quality || 'concept',
      premise: req.body?.premise || '',
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    projects.set(id, project);
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
    res.status(501).json({
      error: 'Generation provider not configured',
      projectId: project.id,
      required: ['image provider API key', 'video provider API key', 'storage', 'database', 'job queue']
    });
  });
}

module.exports = { registerAnimeStudioRoutes };
