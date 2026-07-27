const fs = require('fs/promises');
const path = require('path');

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'generated', 'anime');

function escapeXml(value = '') {
  return String(value).replace(/[<>&'\"]/g, char => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '\"': '&quot;'
  })[char]);
}

function slug(value = 'anime-project') {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'anime-project';
}

function paletteFor(project) {
  const source = `${project.era} ${project.visualStyle} ${project.genre}`.toLowerCase();
  if (source.includes('horror') || source.includes('gothic')) return ['#160d1f', '#6e1e44', '#f1d4d4'];
  if (source.includes('cyber') || source.includes('mecha')) return ['#07182b', '#00d9ff', '#ff3cac'];
  if (source.includes('romance') || source.includes('shoujo')) return ['#321b49', '#ff8fcf', '#ffe8f6'];
  if (source.includes('faith') || source.includes('biblical')) return ['#2b1a0a', '#d7a62a', '#fff4c7'];
  if (source.includes('sports')) return ['#10253d', '#ff6b35', '#f7f7f7'];
  return ['#16112d', '#7d5cff', '#f4d35e'];
}

function makePoster(project) {
  const [dark, accent, light] = paletteFor(project);
  const title = escapeXml(project.title);
  const premise = escapeXml(project.premise || 'An original TryAMM anime production.');
  const meta = escapeXml(`${project.era} • ${project.visualStyle} • ${project.genre}`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-labelledby="title desc">
<title id="title">${title}</title><desc id="desc">Original anime concept poster</desc>
<defs>
 <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${dark}"/><stop offset="1" stop-color="#050509"/></linearGradient>
 <radialGradient id="sun"><stop stop-color="${light}"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
 <filter id="glow"><feGaussianBlur stdDeviation="16"/></filter>
</defs>
<rect width="1280" height="720" fill="url(#bg)"/>
<circle cx="930" cy="235" r="250" fill="url(#sun)" opacity=".8"/>
<path d="M0 620 L245 390 430 565 620 315 840 555 1030 350 1280 610V720H0Z" fill="${accent}" opacity=".22"/>
<g transform="translate(870 115)">
 <circle cx="120" cy="95" r="74" fill="${light}"/>
 <path d="M45 325 Q120 170 195 325L230 560H10Z" fill="${accent}"/>
 <path d="M70 75 Q120 0 185 78Q168 18 100 15Q45 25 55 105Z" fill="${dark}"/>
 <path d="M90 95h18M137 95h18" stroke="${dark}" stroke-width="8" stroke-linecap="round"/>
 <path d="M106 132q18 15 36 0" fill="none" stroke="${dark}" stroke-width="6" stroke-linecap="round"/>
 <path d="M20 330L-45 500M220 330l75 160" stroke="${light}" stroke-width="32" stroke-linecap="round"/>
</g>
<rect x="70" y="75" width="690" height="500" rx="34" fill="#000" opacity=".38"/>
<text x="110" y="165" fill="${light}" font-size="34" font-family="Arial, sans-serif" letter-spacing="4">TRYAMM ORIGINAL ANIME</text>
<text x="110" y="265" fill="white" font-size="72" font-weight="800" font-family="Arial, sans-serif">${title.slice(0, 24)}</text>
<text x="110" y="320" fill="${accent}" font-size="26" font-family="Arial, sans-serif">${meta}</text>
<foreignObject x="110" y="365" width="600" height="145"><div xmlns="http://www.w3.org/1999/xhtml" style="color:white;font:26px Arial;line-height:1.35">${premise.slice(0, 220)}</div></foreignObject>
<text x="110" y="650" fill="${light}" font-size="22" font-family="Arial, sans-serif">Concept render • Original design • TryAMM Universal Anime Studio</text>
</svg>`;
}

function makeAnimatic(project, posterUrl) {
  const scenes = [
    ['OPENING', project.premise || 'A new world awakens.'],
    ['THE HERO', `A protagonist rises within the ${project.genre} world.`],
    ['THE CONFLICT', 'A powerful challenge changes everything.'],
    ['THE PROMISE', 'The journey continues in the TryAMM Omniverse.']
  ];
  const cards = scenes.map(([heading, copy], index) => `<section class="scene" style="--i:${index}"><div><h2>${escapeXml(heading)}</h2><p>${escapeXml(copy)}</p></div></section>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeXml(project.title)} Animatic</title><style>
*{box-sizing:border-box}body{margin:0;background:#050509;color:white;font-family:Arial,sans-serif;overflow:hidden}.stage{height:100vh;background:linear-gradient(90deg,rgba(0,0,0,.8),rgba(0,0,0,.2)),url('${posterUrl}') center/cover;position:relative}.scene{position:absolute;inset:0;display:grid;place-items:center;padding:8vw;opacity:0;animation:show 20s infinite;animation-delay:calc(var(--i)*5s)}.scene div{max-width:850px;background:rgba(0,0,0,.65);padding:38px;border-radius:24px;backdrop-filter:blur(8px)}h2{font-size:clamp(36px,7vw,84px);margin:0 0 18px}p{font-size:clamp(20px,3vw,36px);line-height:1.35}.badge{position:absolute;left:24px;bottom:20px;background:#000a;padding:10px 14px;border-radius:20px}@keyframes show{0%,24%{opacity:0;transform:scale(1.04)}3%,21%{opacity:1;transform:scale(1)}25%,100%{opacity:0}}</style></head><body><main class="stage">${cards}<div class="badge">20-second local animatic • TryAMM</div></main></body></html>`;
}

async function renderProject(project) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const base = `${slug(project.title)}-${project.id}`;
  const posterName = `${base}.svg`;
  const animaticName = `${base}-animatic.html`;
  const posterUrl = `/generated/anime/${posterName}`;
  const animaticUrl = `/generated/anime/${animaticName}`;
  await fs.writeFile(path.join(OUTPUT_DIR, posterName), makePoster(project), 'utf8');
  await fs.writeFile(path.join(OUTPUT_DIR, animaticName), makeAnimatic(project, posterUrl), 'utf8');
  return {
    provider: 'tryamm-local-renderer',
    image: { type: 'image/svg+xml', url: posterUrl },
    videoPreview: { type: 'text/html', url: animaticUrl, durationSeconds: 20 },
    note: 'Local original concept render. Connect a production provider for frame-by-frame AI video or MP4 output.'
  };
}

module.exports = { renderProject };
