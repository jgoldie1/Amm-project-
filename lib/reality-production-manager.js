const crypto = require('crypto');
const manifest = require('../data/reality-production-compliance.json');

function createRealityProductionManager({ io } = {}) {
  const projects = new Map();
  const incidents = new Map();

  function createProject(input = {}) {
    const id = crypto.randomUUID();
    const project = {
      id,
      title: String(input.title || '').trim(),
      producerEntity: input.producerEntity || null,
      productionType: input.productionType || 'unscripted-reality',
      jurisdictions: Array.isArray(input.jurisdictions) ? input.jurisdictions : [],
      shootDates: input.shootDates || null,
      ageRating: input.ageRating || null,
      partnerId: input.partnerId || null,
      status: 'setup',
      checklist: buildChecklist(input),
      documents: [],
      reviews: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!project.title) throw new Error('TITLE_REQUIRED');
    projects.set(id, project);
    io?.emit('reality-production:project', project);
    return project;
  }

  function buildChecklist(input = {}) {
    return manifest.workflow.map((stage) => ({
      stage,
      requirements: manifest.gates[stage] || [],
      status: stage === 'project-setup' ? 'in-progress' : 'blocked',
      notes: []
    }));
  }

  function getProject(id) { return projects.get(id) || null; }
  function listProjects() { return [...projects.values()]; }

  function addDocument(projectId, doc = {}) {
    const project = getProject(projectId);
    if (!project) throw new Error('PROJECT_NOT_FOUND');
    const record = {
      id: crypto.randomUUID(),
      type: doc.type || 'other',
      name: doc.name || null,
      storageRef: doc.storageRef || null,
      expiresAt: doc.expiresAt || null,
      status: doc.status || 'uploaded-unreviewed',
      uploadedAt: new Date().toISOString()
    };
    project.documents.push(record);
    project.updatedAt = new Date().toISOString();
    return record;
  }

  function updateStage(projectId, stage, patch = {}) {
    const project = getProject(projectId);
    if (!project) throw new Error('PROJECT_NOT_FOUND');
    const item = project.checklist.find((x) => x.stage === stage);
    if (!item) throw new Error('UNKNOWN_STAGE');
    if (patch.status) item.status = patch.status;
    if (patch.note) item.notes.push({ text: String(patch.note), at: new Date().toISOString() });
    project.updatedAt = new Date().toISOString();
    return item;
  }

  function addReview(projectId, review = {}) {
    const project = getProject(projectId);
    if (!project) throw new Error('PROJECT_NOT_FOUND');
    const record = {
      id: crypto.randomUUID(),
      type: review.type || 'legal',
      reviewer: review.reviewer || null,
      decision: review.decision || 'pending',
      notes: review.notes || null,
      at: new Date().toISOString()
    };
    project.reviews.push(record);
    project.updatedAt = new Date().toISOString();
    return record;
  }

  function reportIncident(projectId, input = {}) {
    const project = getProject(projectId);
    if (!project) throw new Error('PROJECT_NOT_FOUND');
    const incident = {
      id: crypto.randomUUID(),
      projectId,
      severity: input.severity || 'medium',
      category: input.category || 'other',
      summary: String(input.summary || '').slice(0, 500),
      details: String(input.details || '').slice(0, 5000),
      protectiveActions: input.protectiveActions || [],
      status: 'open',
      createdAt: new Date().toISOString(),
      closedAt: null
    };
    if (!incident.summary) throw new Error('SUMMARY_REQUIRED');
    incidents.set(incident.id, incident);
    io?.emit('reality-production:incident', incident);
    return incident;
  }

  function greenlight(projectId) {
    const project = getProject(projectId);
    if (!project) throw new Error('PROJECT_NOT_FOUND');
    const incomplete = project.checklist.filter((x) => !['complete','approved','not-applicable'].includes(x.status));
    const criticalOpen = [...incidents.values()].filter((x) => x.projectId === projectId && x.status !== 'closed' && ['critical','high'].includes(x.severity));
    const legalApproved = project.reviews.some((r) => r.type === 'legal' && r.decision === 'approved');
    const safetyApproved = project.reviews.some((r) => r.type === 'safety' && r.decision === 'approved');
    const allowed = incomplete.length === 0 && criticalOpen.length === 0 && legalApproved && safetyApproved;
    if (allowed) {
      project.status = 'greenlit';
      project.updatedAt = new Date().toISOString();
    }
    return { allowed, incompleteStages: incomplete.map((x) => x.stage), openCriticalIncidents: criticalOpen.map((x) => x.id), legalApproved, safetyApproved, project };
  }

  return { createProject, getProject, listProjects, addDocument, updateStage, addReview, reportIncident, greenlight, manifest };
}

module.exports = { createRealityProductionManager };
