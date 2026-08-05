'use strict';

const supabase = require('./supabase-rest');

module.exports = function registerContentEngine({ app, auth, admin, clean, id, getStore, saveStore }) {
  function fallbackStore() {
    const store = getStore();
    store.contentProjects ||= [];
    store.contentAssets ||= [];
    store.contentOutputs ||= [];
    store.roadmapItems ||= [];
    return store;
  }

  function projectPayload(body, user) {
    return {
      id: id('project'),
      owner_id: user.id,
      title: clean(body.title, 140),
      summary: clean(body.summary, 1000),
      problem_solved: clean(body.problemSolved, 1000),
      status: ['concept', 'prototype', 'alpha', 'beta', 'live'].includes(body.status) ? body.status : 'concept',
      limitation: clean(body.limitation, 1000),
      next_milestone: clean(body.nextMilestone, 1000),
      contributor_name: clean(body.contributorName, 120),
      contributor_role: clean(body.contributorRole, 120),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  function buildOutputs(project) {
    const hook = `${project.title}: ${project.problem_solved || project.summary}`;
    const truth = `Current status: ${project.status}. ${project.limitation ? `Known limitation: ${project.limitation}.` : ''}`;
    const next = project.next_milestone ? `Next: ${project.next_milestone}.` : '';
    const credit = project.contributor_name ? `Built with ${project.contributor_name}${project.contributor_role ? `, ${project.contributor_role}` : ''}.` : '';
    return [
      { channel: 'short-video', title: project.title, body: `${hook}\n\n${truth} ${next} ${credit}\n\nFollow the TRYAMM build.` },
      { channel: 'linkedin', title: `TRYAMM development update: ${project.title}`, body: `${hook}\n\n${truth}\n\n${next}\n\n${credit}` },
      { channel: 'discord', title: `New build update — ${project.title}`, body: `${project.summary}\nStatus: ${project.status}. ${next}` },
      { channel: 'newsletter', title: project.title, body: `${project.summary}\n\nProblem solved: ${project.problem_solved}\n\n${truth} ${next}` }
    ].map(output => ({ ...output, id: id('content'), project_id: project.id, created_at: new Date().toISOString() }));
  }

  app.get('/api/content/projects', auth, async (req, res, next) => {
    try {
      if (supabase.configured()) {
        const ownerFilter = req.user.role === 'admin' ? '' : `&owner_id=eq.${encodeURIComponent(req.user.id)}`;
        const projects = await supabase.select('content_projects', `select=*&order=created_at.desc${ownerFilter}`);
        return res.json({ source: 'supabase', projects });
      }
      const store = fallbackStore();
      const projects = req.user.role === 'admin' ? store.contentProjects : store.contentProjects.filter(p => p.owner_id === req.user.id);
      res.json({ source: 'local-fallback', projects: projects.slice().reverse() });
    } catch (error) { next(error); }
  });

  app.post('/api/content/projects', auth, async (req, res, next) => {
    try {
      const project = projectPayload(req.body, req.user);
      if (!project.title || !project.summary) return res.status(400).json({ error: 'Title and summary are required' });
      const outputs = buildOutputs(project);
      if (supabase.configured()) {
        await supabase.insert('content_projects', project);
        await supabase.insert('content_outputs', outputs);
      } else {
        const store = fallbackStore();
        store.contentProjects.push(project);
        store.contentOutputs.push(...outputs);
        await saveStore();
      }
      res.status(201).json({ project, outputs, source: supabase.configured() ? 'supabase' : 'local-fallback' });
    } catch (error) { next(error); }
  });

  app.get('/api/content/projects/:projectId/outputs', auth, async (req, res, next) => {
    try {
      const projectId = clean(req.params.projectId, 100);
      if (supabase.configured()) {
        const outputs = await supabase.select('content_outputs', `select=*&project_id=eq.${encodeURIComponent(projectId)}&order=created_at.asc`);
        return res.json({ outputs });
      }
      const store = fallbackStore();
      res.json({ outputs: store.contentOutputs.filter(o => o.project_id === projectId) });
    } catch (error) { next(error); }
  });

  app.get('/api/founder/dashboard', auth, async (req, res, next) => {
    try {
      const store = fallbackStore();
      const localProjects = store.contentProjects || [];
      const metrics = {
        projects: localProjects.length,
        liveProjects: localProjects.filter(p => p.status === 'live').length,
        prototypes: localProjects.filter(p => p.status === 'prototype').length,
        generatedOutputs: (store.contentOutputs || []).length,
        creators: (getStore().users || []).filter(u => u.isCreator).length,
        liveRooms: (getStore().rooms || []).filter(r => r.status === 'live').length
      };
      if (supabase.configured()) {
        const [projects, outputs] = await Promise.all([
          supabase.select('content_projects', 'select=id,status'),
          supabase.select('content_outputs', 'select=id')
        ]);
        metrics.projects = projects.length;
        metrics.liveProjects = projects.filter(p => p.status === 'live').length;
        metrics.prototypes = projects.filter(p => p.status === 'prototype').length;
        metrics.generatedOutputs = outputs.length;
      }
      res.json({ metrics, infrastructure: { supabase: supabase.configured(), render: Boolean(process.env.RENDER), replit: Boolean(process.env.REPL_ID), appUrl: process.env.APP_URL || null } });
    } catch (error) { next(error); }
  });
};
