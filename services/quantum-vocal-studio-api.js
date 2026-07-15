const express=require('express');
const supabaseService=require('./supabase');
const studio=require('./quantum-vocal-studio');
const router=express.Router();
async function auth(req,res,next){if(!supabaseService.configured())return res.status(503).json({error:'Supabase is not configured.'});return supabaseService.requireUser(req,res,next);}
router.get('/effects',(req,res)=>res.json(studio.EFFECTS));
router.use(auth);
router.post('/projects',async(req,res,next)=>{try{const project=studio.createProject({...req.body,ownerId:req.user.id});const {data,error}=await supabaseService.admin().from('music_studio_projects').insert({owner_id:req.user.id,title:project.title,track_capacity:project.trackCapacity,sample_rate:project.sampleRate,bit_depth:project.bitDepth,tempo:project.tempo,musical_key:project.musicalKey,buses:project.buses,status:project.status}).select().single();if(error)throw error;res.status(201).json(data);}catch(error){next(error);}});
router.post('/vocal-coach',(req,res)=>res.status(201).json(studio.vocalCoach(req.body)));
router.post('/engineer-chain',(req,res)=>res.status(201).json(studio.engineerChain(req.body)));
router.post('/effects/:name',(req,res)=>res.status(201).json(studio.effectPreset(req.params.name,req.body)));
router.post('/releases',async(req,res,next)=>{try{const release=studio.streamingRelease(req.body);const {data,error}=await supabaseService.admin().from('music_streaming_releases').insert({owner_id:req.user.id,project_id:req.body.projectId||null,title:release.title,artist_name:release.artistName,audio_master_url:release.audioMasterUrl,video_url:release.videoUrl,cover_url:release.coverUrl,rights_confirmed:release.rightsConfirmed,explicit:release.explicit,territories:release.territories,status:release.status}).select().single();if(error)throw error;res.status(201).json(data);}catch(error){next(error);}});
module.exports={router};