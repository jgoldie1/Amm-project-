import assert from 'node:assert/strict'
import {streetVerseFootSide} from '../src/runtime/StreetVerseBJFootGrounding.ts'
const names=[
 ['mixamorigLeftFoot','left'],
 ['mixamorig:RightFoot','right'],
 ['LeftFoot','left'],
 ['RightFoot','right'],
 ['Foot_L','left'],
 ['Foot_R','right'],
 ['Bip01_L_Foot','left'],
 ['J_Bip_R_Foot','right'],
 ['left_ankle','left'],
 ['Rig_RightAnkle','right'],
 ['LeftToeBase',null],
 ['mixamorigRightHand',null],
 ['Pelvis',null],
 ['',null],
]
for(const [name,expected] of names)assert.equal(streetVerseFootSide(name),expected,`GLB foot classification: ${name}`)
console.log('StreetVerse BJ real-rig foot-name compatibility: '+names.length+' PASS')
