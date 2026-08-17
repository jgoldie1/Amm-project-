'use strict';
const assert=require('assert');
const {generateViewCone,selectSpatialRepresentation,makeSpatialPacket,adaptiveProfile}=require('../lib/multiview-3d');
const views=generateViewCone({views:12,arcDegrees:50});assert.equal(views.length,12);assert(views[0].yaw<0&&views.at(-1).yaw>0);
assert.equal(selectSpatialRepresentation({autostereoscopic:true}),'multiview');
assert.equal(selectSpatialRepresentation({lightField:true}),'light-field');
const p=makeSpatialPacket({sceneId:'demo',representation:'multiview',views});assert.equal(p.protocol,'tryamm-spatial-stream/1.0');assert(p.fallbacks.includes('2d'));
const low=adaptiveProfile({bandwidthMbps:8,gpuTier:1,views:20,displayMode:'multiview'});assert(low.maxViews<=4&&low.adaptiveBitrate);
console.log('multiview 3d smoke: PASS');
