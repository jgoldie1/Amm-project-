'use strict';
const fs = require('fs');
const path = require('path');

function assertVector3(value, field) {
  if (!value || !['x','y','z'].every((k) => Number.isFinite(value[k]))) throw new Error(`${field} must contain finite x, y and z numbers`);
}
function validate(entry) {
  const errors=[];
  if (!entry || typeof entry !== 'object') errors.push('entry must be an object');
  else {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug||'')) errors.push('slug must be kebab-case');
    if (!entry.name || entry.name.length < 2) errors.push('name is required');
    if (!['live','planned','disabled'].includes(entry.status)) errors.push('status must be live, planned or disabled');
    if (!Number.isInteger(entry.version) || entry.version < 1) errors.push('version must be a positive integer');
    if (!['all','teen','adult'].includes(entry.ageLane)) errors.push('ageLane is invalid');
    try { assertVector3(entry.spawn,'spawn'); } catch(e){ errors.push(e.message); }
    if (!entry.budget || !Number.isInteger(entry.budget.maxGeometries) || entry.budget.maxGeometries < 1) errors.push('budget.maxGeometries is required');
    if (!entry.budget || !Number.isInteger(entry.budget.maxTextures) || entry.budget.maxTextures < 0) errors.push('budget.maxTextures is required');
    if (!entry.environment || !['primitive','gltf'].includes(entry.environment.kind)) errors.push('environment.kind must be primitive or gltf');
    if (!Array.isArray(entry.portals)) errors.push('portals must be an array');
    else entry.portals.forEach((p,i)=>{ if(!p.id) errors.push(`portals[${i}].id is required`); if(!p.toSlug) errors.push(`portals[${i}].toSlug is required`); try{assertVector3(p.position,`portals[${i}].position`)}catch(e){errors.push(e.message)} if(!(p.radius>0)) errors.push(`portals[${i}].radius must be positive`); });
  }
  if (errors.length) throw new Error(`Invalid world registry entry: ${errors.join('; ')}`);
  return true;
}
function createWorldRegistry(options={}) {
  const file = options.file || path.join(__dirname,'..','..','data','worlds.json');
  const rows = options.worlds || JSON.parse(fs.readFileSync(file,'utf8')).worlds;
  const map = new Map();
  rows.forEach((entry)=>{ validate(entry); if(map.has(entry.slug)) throw new Error(`Duplicate world slug: ${entry.slug}`); map.set(entry.slug,Object.freeze(structuredClone(entry))); });
  for (const world of map.values()) for (const portal of world.portals) if (!map.has(portal.toSlug)) throw new Error(`Portal ${world.slug}/${portal.id} points to missing world ${portal.toSlug}`);
  return { list:()=>[...map.values()], get:(slug)=>map.get(slug)||null, validate };
}
module.exports={createWorldRegistry,validate};
