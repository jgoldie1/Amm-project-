const crypto = require("crypto");

function createHoloCommercialManager({ manifest, motionManifest, io }) {
  const projects = [];
  const renders = [];

  function createProject(input = {}) {
    const project = {
      id: crypto.randomUUID(),
      ownerId: input.ownerId || null,
      name: String(input.name || "Untitled Commercial").slice(0, 120),
      brief: String(input.brief || "").slice(0, 5000),
      durationSeconds: Number(input.durationSeconds || 15),
      aspectRatios: Array.isArray(input.aspectRatios) ? input.aspectRatios.slice(0, 6) : ["9:16"],
      qualityTier: input.qualityTier || "draft",
      destinations: Array.isArray(input.destinations) ? input.destinations.slice(0, 20) : [],
      script: input.script || null,
      scenes: Array.isArray(input.scenes) ? input.scenes : [],
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    projects.unshift(project);
    io?.emit("holo-commercial:project", project);
    return project;
  }

  function getProject(id) { return projects.find((item) => item.id === id) || null; }
  function listProjects(ownerId) { return ownerId ? projects.filter((p) => p.ownerId === ownerId) : projects; }

  function updateProject(id, patch = {}) {
    const project = getProject(id);
    if (!project) return null;
    const allowed = ["name", "brief", "durationSeconds", "aspectRatios", "qualityTier", "destinations", "script", "scenes", "status"];
    for (const key of allowed) if (patch[key] !== undefined) project[key] = patch[key];
    project.updatedAt = new Date().toISOString();
    io?.emit("holo-commercial:project", project);
    return project;
  }

  function createRender(projectId, input = {}) {
    const project = getProject(projectId);
    if (!project) throw new Error("PROJECT_NOT_FOUND");
    const render = {
      id: crypto.randomUUID(),
      projectId,
      provider: input.provider || "unassigned-adapter",
      qualityTier: input.qualityTier || project.qualityTier || "draft",
      aspectRatio: input.aspectRatio || project.aspectRatios?.[0] || "9:16",
      estimatedProviderCostUsd: Number(input.estimatedProviderCostUsd || 0),
      estimatedOmniCredits: Number(input.estimatedOmniCredits || 0),
      status: "queued",
      steps: ["plan", "generate-assets", "compose", "holofx", "audio-caption", "render", "validate"].map((name) => ({ name, status: "pending" })),
      output: null,
      error: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    renders.unshift(render);
    io?.emit("holo-commercial:render", render);
    return render;
  }

  function getRender(id) { return renders.find((item) => item.id === id) || null; }
  function listRenders(projectId) { return projectId ? renders.filter((r) => r.projectId === projectId) : renders; }

  function updateRender(id, patch = {}) {
    const render = getRender(id);
    if (!render) return null;
    for (const key of ["provider", "status", "output", "error", "estimatedProviderCostUsd", "estimatedOmniCredits"]) {
      if (patch[key] !== undefined) render[key] = patch[key];
    }
    if (patch.step && patch.step.name) {
      const step = render.steps.find((s) => s.name === patch.step.name);
      if (step) Object.assign(step, patch.step);
    }
    render.updatedAt = new Date().toISOString();
    io?.emit("holo-commercial:render", render);
    return render;
  }

  function getManifest() { return { studio: manifest, motion: motionManifest }; }

  return { createProject, getProject, listProjects, updateProject, createRender, getRender, listRenders, updateRender, getManifest };
}

module.exports = { createHoloCommercialManager };
