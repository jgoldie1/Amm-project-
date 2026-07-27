const fs = require('fs/promises');
const path = require('path');

function safeName(value) {
  return String(value || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'project';
}

async function writeManifest({ project, plan, provider, outputs, moderation, credits }) {
  const directory = path.join(process.cwd(), 'public', 'generated', 'anime');
  await fs.mkdir(directory, { recursive: true });
  const filename = `${safeName(project.title)}-${project.id.slice(-8)}-manifest.json`;
  const filePath = path.join(directory, filename);
  const manifest = {
    schemaVersion: '1.0',
    generatedAt: new Date().toISOString(),
    project,
    productionPlan: plan,
    provider: { id: provider.id, name: provider.name, type: provider.type },
    moderation,
    credits,
    assets: outputs,
    rightsNotice: 'Outputs should use original characters and properly licensed or user-owned source materials.'
  };
  await fs.writeFile(filePath, JSON.stringify(manifest, null, 2), 'utf8');
  return { type: 'application/json', url: `/generated/anime/${filename}`, filename };
}

module.exports = { writeManifest };
