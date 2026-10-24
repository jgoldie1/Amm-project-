// StreetVerse mod manifest validation: data-only; never executes downloaded code.
// Used by future mod loader before assets can be mounted.
const ID=/^[a-z0-9][a-z0-9._-]{1,63}$/;
const VERSION=/^\d+\.\d+\.\d+$/;
const HASH=/^[a-f0-9]{64}$/i;
const MAX_ASSETS=128;
export function validateStreetVerseMod(manifest,{gameVersion,approvedIds=new Set()}={}){
 const errors=[];
 if(!manifest||typeof manifest!=="object"||Array.isArray(manifest)) return {ok:false,errors:["manifest must be an object"]};
 if(!ID.test(manifest.id??""))errors.push("invalid mod id");
 if(!VERSION.test(manifest.version??""))errors.push("invalid version");
 if(!HASH.test(manifest.sha256??""))errors.push("missing or invalid content hash");
 if(!Array.isArray(manifest.assets)||manifest.assets.length===0||manifest.assets.length>MAX_ASSETS)errors.push("invalid asset count");
 else for(const asset of manifest.assets){
   if(typeof asset!=="string"||!/^assets\/[a-zA-Z0-9_./-]+\.(glb|gltf|png|jpg|jpeg|webp|ktx2|ogg|mp3)$/.test(asset)||asset.split("/").includes(".."))errors.push("invalid asset path");
 }
 if(!Array.isArray(manifest.compatibleVersions)||!manifest.compatibleVersions.every(v=>VERSION.test(v)))errors.push("invalid compatibility list");
 if(gameVersion&&!manifest.compatibleVersions?.includes(gameVersion))errors.push("game version incompatible");
 if(!Array.isArray(manifest.dependencies)||!manifest.dependencies.every(v=>ID.test(v)))errors.push("invalid dependencies");
 if(manifest.dependencies?.includes(manifest.id))errors.push("self dependency");
 if(!approvedIds.has(manifest.id))errors.push("mod not approved");
 if(manifest.scripts||manifest.entrypoint||manifest.code)errors.push("executable mods prohibited");
 return {ok:errors.length===0,errors};
}
