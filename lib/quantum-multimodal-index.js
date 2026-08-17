'use strict';

const crypto = require('crypto');
const MEDIA_TYPES = new Set(['image','video','audio','document','product','vehicle','world3d','model3d','livestream']);

function norm(v,max=5000){ return String(v??'').replace(/\s+/g,' ').trim().slice(0,max); }
function sha256(v){ return crypto.createHash('sha256').update(String(v??'')).digest('hex'); }
function normalizeMediaType(v){ const t=norm(v,40).toLowerCase(); if(!MEDIA_TYPES.has(t)) throw new Error('unsupported_media_type'); return t; }
function normalizeUrl(v){ const u=new URL(v); if(!/^https?:$/.test(u.protocol)) throw new Error('invalid_media_url'); u.hash=''; return u.toString(); }

function makeMediaAsset(input={}){
  const mediaType=normalizeMediaType(input.mediaType);
  const sourceUrl=normalizeUrl(input.sourceUrl);
  const title=norm(input.title||sourceUrl,500);
  const transcript=norm(input.transcript,50000);
  const description=norm(input.description,10000);
  const ocrText=norm(input.ocrText,30000);
  const searchableText=[title,description,transcript,ocrText,(input.tags||[]).join(' ')].filter(Boolean).join('\n');
  const contentFingerprint=norm(input.contentFingerprint,160)||sha256([mediaType,sourceUrl,searchableText,input.durationMs||'',input.width||'',input.height||''].join('|'));
  return {
    id:sha256(`${mediaType}|${sourceUrl}|${contentFingerprint}`),mediaType,sourceUrl,
    canonicalUrl:input.canonicalUrl?normalizeUrl(input.canonicalUrl):sourceUrl,title,description,transcript,ocrText,
    tags:Array.isArray(input.tags)?input.tags.map(x=>norm(x,120)).filter(Boolean).slice(0,100):[],
    language:norm(input.language||'und',20),durationMs:Number(input.durationMs||0)||null,width:Number(input.width||0)||null,height:Number(input.height||0)||null,
    mimeType:norm(input.mimeType,120)||null,contentFingerprint,perceptualFingerprint:norm(input.perceptualFingerprint,500)||null,
    capturedAt:input.capturedAt||new Date().toISOString(),sourceType:norm(input.sourceType||'quantum-media',80),
    provenance:input.provenance&&typeof input.provenance==='object'?input.provenance:{},
    safety:input.safety&&typeof input.safety==='object'?input.safety:{status:'unreviewed'},searchableText
  };
}

function crossModalQuery(input={}){
  return {text:norm(input.text,2000),mediaType:input.mediaType?normalizeMediaType(input.mediaType):null,language:norm(input.language,20)||null,
    imageEmbedding:Array.isArray(input.imageEmbedding)?input.imageEmbedding:null,textEmbedding:Array.isArray(input.textEmbedding)?input.textEmbedding:null,
    audioEmbedding:Array.isArray(input.audioEmbedding)?input.audioEmbedding:null,limit:Math.min(Math.max(Number(input.limit)||20,1),100)};
}

function resultLabel(asset){return ({image:'IMAGE',video:'VIDEO',audio:'AUDIO',document:'DOCUMENT',product:'PRODUCT',vehicle:'VEHICLE',world3d:'WORLD',model3d:'3D ASSET',livestream:'LIVE'})[asset.mediaType]||'MEDIA';}

module.exports={MEDIA_TYPES,makeMediaAsset,crossModalQuery,resultLabel,sha256};
