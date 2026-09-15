import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const file = path.join(root, 'src/foundation/visionQaFoundation.ts');
if (!fs.existsSync(file)) throw new Error('Vision QA foundation is missing');

const source = fs.readFileSync(file, 'utf8');

const requiredAreas = [
  'environment-quality',
  'character-model-quality',
  'facial-animation',
  'vehicle-orientation-and-physics',
  'crowd-density-and-behavior',
  'traffic-flow',
  'lighting-and-materials',
  'ui-readability',
  'accessibility-contrast-and-legibility',
  'collision-and-clipping',
  'animation-artifacts',
  'visual-regressions',
];

for (const area of requiredAreas) {
  if (!source.includes(`'${area}'`)) throw new Error(`Missing Vision QA area: ${area}`);
}

if (!source.includes('VISION_QA_CAN_MUTATE_COMMERCE_TRUTH = false')) {
  throw new Error('Vision QA must never be authoritative for commerce truth');
}

if (!source.includes('countCriticalVisionFindings(run) === 0')) {
  throw new Error('Critical visual findings must block the visual release gate');
}

console.log('Vision QA foundation contract passed');
