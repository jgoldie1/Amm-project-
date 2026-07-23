function registerHoloCommercialRoutes({ app, manager, requireInternalSecret, appendAudit }) {
  app.get("/api/holo-commercial", (_req, res) => res.json(manager.getManifest()));

  app.get("/api/holo-commercial/projects", requireInternalSecret, (req, res) => {
    res.json({ projects: manager.listProjects(req.query.ownerId) });
  });

  app.post("/api/holo-commercial/projects", requireInternalSecret, (req, res) => {
    const project = manager.createProject(req.body || {});
    appendAudit({ event: "holo-commercial.project.created", project, at: new Date().toISOString() });
    res.status(201).json(project);
  });

  app.get("/api/holo-commercial/projects/:id", requireInternalSecret, (req, res) => {
    const project = manager.getProject(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  });

  app.post("/api/holo-commercial/projects/:id", requireInternalSecret, (req, res) => {
    const project = manager.updateProject(req.params.id, req.body || {});
    if (!project) return res.status(404).json({ error: "Project not found" });
    appendAudit({ event: "holo-commercial.project.updated", projectId: project.id, snapshot: project, at: new Date().toISOString() });
    res.json(project);
  });

  app.get("/api/holo-commercial/projects/:id/renders", requireInternalSecret, (req, res) => {
    res.json({ renders: manager.listRenders(req.params.id) });
  });

  app.post("/api/holo-commercial/projects/:id/renders", requireInternalSecret, (req, res) => {
    try {
      const render = manager.createRender(req.params.id, req.body || {});
      appendAudit({ event: "holo-commercial.render.created", render, at: new Date().toISOString() });
      res.status(201).json(render);
    } catch (error) {
      if (error.message === "PROJECT_NOT_FOUND") return res.status(404).json({ error: "Project not found" });
      res.status(500).json({ error: "Unable to create render" });
    }
  });

  app.get("/api/holo-commercial/renders/:id", requireInternalSecret, (req, res) => {
    const render = manager.getRender(req.params.id);
    if (!render) return res.status(404).json({ error: "Render not found" });
    res.json(render);
  });

  app.post("/api/holo-commercial/renders/:id", requireInternalSecret, (req, res) => {
    const render = manager.updateRender(req.params.id, req.body || {});
    if (!render) return res.status(404).json({ error: "Render not found" });
    appendAudit({ event: "holo-commercial.render.updated", renderId: render.id, snapshot: render, at: new Date().toISOString() });
    res.json(render);
  });
}

module.exports = { registerHoloCommercialRoutes };
