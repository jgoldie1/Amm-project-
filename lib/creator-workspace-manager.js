const crypto = require("crypto");

function createCreatorWorkspaceManager({ config, io, audit }) {
  const creators = [];
  const projects = [];
  const twins = [];

  const now = () => new Date().toISOString();
  const findCreator = (id) => creators.find((x) => x.id === id) || null;

  function createCreator(input = {}) {
    if (!input.displayName) throw new Error("DISPLAY_NAME_REQUIRED");
    const creator = {
      id: crypto.randomUUID(),
      handle: String(input.handle || input.displayName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      displayName: String(input.displayName).slice(0, 120),
      bio: String(input.bio || "").slice(0, 1000),
      status: "draft",
      surfaces: input.surfaces || ["starverse", "isaiahAiTv", "holoverse", "omniBox"],
      monetization: { enabled: false, methods: [] },
      createdAt: now(), updatedAt: now()
    };
    creators.unshift(creator);
    audit?.({ event: "creator.created", creatorId: creator.id, at: now() });
    io?.emit("creator:update", creator);
    return creator;
  }

  function createProject(creatorId, input = {}) {
    if (!findCreator(creatorId)) throw new Error("CREATOR_NOT_FOUND");
    if (!input.title) throw new Error("TITLE_REQUIRED");
    const project = {
      id: crypto.randomUUID(), creatorId,
      title: String(input.title).slice(0, 200),
      type: input.type || "show",
      destination: input.destination || "omniBox",
      status: "development",
      rights: { basis: input.rightsBasis || "original-work", provenance: input.provenance || [] },
      aiAssist: { enabled: input.aiAssist !== false, tasks: [] },
      createdAt: now(), updatedAt: now()
    };
    projects.unshift(project);
    audit?.({ event: "creator.project.created", projectId: project.id, creatorId, at: now() });
    return project;
  }

  function createTwin(creatorId, input = {}) {
    if (!findCreator(creatorId)) throw new Error("CREATOR_NOT_FOUND");
    if (input.consent !== true) throw new Error("CONSENT_REQUIRED");
    const twin = {
      id: crypto.randomUUID(), creatorId,
      name: input.name || "My Digital Twin",
      mode: input.mode || "avatar-only",
      permissions: input.permissions || { likeness: true, voice: false, games: [], shows: [], ads: false },
      revocable: true,
      status: "configured",
      consentRecordedAt: now(), createdAt: now(), updatedAt: now()
    };
    twins.unshift(twin);
    audit?.({ event: "digital-twin.created", twinId: twin.id, creatorId, at: now() });
    return twin;
  }

  function enableMonetization(creatorId, methods = []) {
    const creator = findCreator(creatorId);
    if (!creator) throw new Error("CREATOR_NOT_FOUND");
    const allowed = new Set(config.monetization || []);
    creator.monetization = { enabled: true, methods: methods.filter((m) => allowed.has(m)) };
    creator.updatedAt = now();
    audit?.({ event: "creator.monetization.updated", creatorId, methods: creator.monetization.methods, at: now() });
    return creator;
  }

  return {
    listCreators: () => creators,
    getCreator: findCreator,
    createCreator,
    listProjects: (creatorId) => projects.filter((x) => !creatorId || x.creatorId === creatorId),
    createProject,
    listTwins: (creatorId) => twins.filter((x) => !creatorId || x.creatorId === creatorId),
    createTwin,
    enableMonetization
  };
}

module.exports = { createCreatorWorkspaceManager };
