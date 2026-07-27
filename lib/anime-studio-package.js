const fs = require('fs/promises');
const path = require('path');
const archiver = require('archiver');
const { createWriteStream } = require('fs');

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'generated', 'anime');

function safeName(value) {
  return String(value || 'anime-project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'anime-project';
}

function publicUrlToPath(url) {
  const normalized = String(url || '').split('?')[0];
  if (!normalized.startsWith('/generated/anime/')) return null;
  const filename = path.basename(normalized);
  return path.join(OUTPUT_DIR, filename);
}

async function addFileIfPresent(archive, filePath, name) {
  if (!filePath) return false;
  try {
    await fs.access(filePath);
    archive.file(filePath, { name });
    return true;
  } catch {
    return false;
  }
}

async function writeProjectPackage({ project, plan, outputs, manifest }) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const base = `${safeName(project.title)}-${project.id.slice(-8)}`;
  const filename = `${base}-production-package.zip`;
  const filePath = path.join(OUTPUT_DIR, filename);

  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = createWriteStream(filePath);

  const completed = new Promise((resolve, reject) => {
    stream.on('close', resolve);
    stream.on('error', reject);
    archive.on('error', reject);
  });

  archive.pipe(stream);

  await addFileIfPresent(archive, publicUrlToPath(outputs.image?.url), 'art/key-art.svg');
  await addFileIfPresent(archive, publicUrlToPath(outputs.videoPreview?.url), 'animatic/preview.html');
  await addFileIfPresent(archive, publicUrlToPath(manifest?.url), 'production/manifest.json');

  archive.append(JSON.stringify(plan.characterBible || {}, null, 2), { name: 'production/character-bible.json' });
  archive.append(JSON.stringify(plan.scenes || [], null, 2), { name: 'production/scene-and-shot-plan.json' });
  archive.append(`# ${project.title}\n\nTryAMM Universal Anime Studio production package.\n\nIncluded:\n- Original SVG key art\n- Browser-playable HTML animatic\n- Production manifest\n- Character bible\n- Scene and shot plan\n\nThis package does not yet contain an MP4 video. Connect a production video renderer and encoder for final MP4 delivery.\n`, { name: 'README.md' });

  await archive.finalize();
  await completed;

  const stats = await fs.stat(filePath);
  return {
    type: 'application/zip',
    url: `/generated/anime/${filename}`,
    filename,
    sizeBytes: stats.size,
    contents: ['art/key-art.svg', 'animatic/preview.html', 'production/manifest.json', 'production/character-bible.json', 'production/scene-and-shot-plan.json', 'README.md']
  };
}

module.exports = { writeProjectPackage };
