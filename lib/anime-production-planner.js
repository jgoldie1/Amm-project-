const crypto = require('crypto');

const CAMERA_SET = ['wide establishing', 'medium tracking', 'close emotional', 'low-angle hero', 'overhead tactical', 'silhouette reveal'];
const BEATS = ['world hook', 'character arrival', 'inciting disruption', 'rising conflict', 'power or truth reveal', 'cliffhanger'];

function sentenceSeed(project) {
  const source = String(project.premise || '').replace(/\s+/g, ' ').trim();
  return source || `${project.title} follows an unlikely hero confronting a threat that could transform their world.`;
}

function buildCharacterBible(project) {
  return [
    {
      id: `char_${crypto.randomUUID()}`,
      role: 'protagonist',
      name: 'Lead Hero',
      silhouette: 'recognizable asymmetrical outerwear and strong upright stance',
      palette: ['primary accent', 'dark neutral', 'light highlight'],
      consistencyPrompt: `Original ${project.visualStyle} protagonist for a ${project.genre} story; preserve face shape, hairstyle, wardrobe silhouette, age, skin tone and signature accessory across every shot.`
    },
    {
      id: `char_${crypto.randomUUID()}`,
      role: 'rival-or-ally',
      name: 'Counterforce',
      silhouette: 'contrasting angular profile and restrained posture',
      palette: ['secondary accent', 'deep shadow', 'metallic highlight'],
      consistencyPrompt: `Original contrasting character in ${project.visualStyle}; preserve facial proportions, hairstyle, costume geometry and scale relative to the protagonist.`
    }
  ];
}

function buildScenes(project, sceneCount = 6) {
  const premise = sentenceSeed(project);
  return Array.from({ length: Math.max(3, Math.min(12, sceneCount)) }, (_, index) => ({
    id: `scene_${String(index + 1).padStart(2, '0')}`,
    order: index + 1,
    beat: BEATS[index % BEATS.length],
    durationSeconds: index === 0 ? 4 : 3,
    camera: CAMERA_SET[index % CAMERA_SET.length],
    environmentPrompt: `${project.era}, ${project.visualStyle}, ${project.genre}; original environment supporting ${BEATS[index % BEATS.length]}.`,
    actionPrompt: `${premise} Scene ${index + 1}: emphasize ${BEATS[index % BEATS.length]} with readable staging and cinematic motion.`,
    dialogue: index === 0 ? project.title : '',
    continuityNotes: 'Keep character model, wardrobe, lighting direction, geography and key props consistent with prior scenes.'
  }));
}

function buildProductionPlan(project, options = {}) {
  const scenes = buildScenes(project, Number(options.sceneCount) || 6);
  return {
    id: `plan_${crypto.randomUUID()}`,
    projectId: project.id,
    version: 1,
    title: project.title,
    logline: sentenceSeed(project).slice(0, 240),
    direction: {
      era: project.era,
      visualStyle: project.visualStyle,
      genre: project.genre,
      format: project.format,
      quality: project.quality,
      aspectRatio: options.aspectRatio || '16:9',
      frameRate: Number(options.frameRate) || 24,
      targetDurationSeconds: scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0)
    },
    characters: buildCharacterBible(project),
    scenes,
    negativePrompt: 'copyrighted characters, recognizable franchise costumes, logos, watermarks, inconsistent anatomy, duplicate limbs, unreadable text',
    deliverables: ['key art poster', 'character bible', 'shot list', 'storyboard animatic', 'asset manifest'],
    createdAt: new Date().toISOString()
  };
}

module.exports = { buildProductionPlan };
