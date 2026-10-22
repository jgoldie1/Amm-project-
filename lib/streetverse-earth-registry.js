'use strict';
/**
 * Read-only StreetVerse Earth manifest registry. This is not a 3D renderer.
 * Never enables a city solely because a manifest exists.
 */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function readJson(relative){
  if(typeof relative!=='string'||!/^worlds\/streetverse\/[a-z0-9/_-]+\.json$/.test(relative))throw Error('Unsafe manifest path');
  const absolute=path.resolve(root,relative);
  if(!absolute.startsWith(path.join(root,'worlds','streetverse')+path.sep))throw Error('Manifest outside registry');
  return JSON.parse(fs.readFileSync(absolute,'utf8'));
}
function getEarthRegistry(){
  const data=readJson('worlds/streetverse/earth-registry.json');
  if(data.id!=='streetverse-earth'||!Array.isArray(data.regions))throw Error('Invalid Earth registry');
  const ids=new Set();
  for(const city of data.regions){
    if(!city.id||ids.has(city.id))throw Error('Duplicate or missing city ID');
    ids.add(city.id);
  }
  return data;
}
function getCityManifest(cityId){
  const city=getEarthRegistry().regions.find(c=>c.id===cityId);
  if(!city||!city.manifest)return null;
  const manifest=readJson(city.manifest);
  if(manifest.worldId!==('streetverse-'+city.id))throw Error('City manifest ID mismatch');
  return manifest;
}
function listAvailableCities(){
  return getEarthRegistry().regions.map(({id,name,country,status})=>({id,name,country,status,playable:false}));
}
module.exports={getEarthRegistry,getCityManifest,listAvailableCities};
