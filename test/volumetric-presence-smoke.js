'use strict';
const assert=require('assert');
const {planVolumetricCapture,makeVolumetricFrame,canPublishFrame}=require('../lib/volumetric-presence');
const hi=planVolumetricCapture({depth:true,gpuTier:3,microphones:4,faceTracking:true,bodyTracking:true,handTracking:true},{bandwidthMbps:50},{transport:'webtransport'});
assert.equal(hi.representation,'gaussian-splat'); assert.equal(hi.stream.transport,'webtransport'); assert(hi.audio.spatial); assert(hi.privacy.explicitCameraConsent);
const low=planVolumetricCapture({depth:false,gpuTier:1},{bandwidthMbps:3},{}); assert.equal(low.representation,'flat-video');
const frame=makeVolumetricFrame({presenceId:'p1',representation:'rgb-depth',assetRef:'blob://rgb',depthRef:'blob://depth',consentVerified:true}); assert(canPublishFrame(frame));
const blocked=makeVolumetricFrame({presenceId:'p1',representation:'flat-video',assetRef:'blob://video'}); assert.equal(canPublishFrame(blocked),false);
console.log('volumetric presence smoke: PASS');
