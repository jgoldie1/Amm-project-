const { id, now } = require('../../shared/utils');
const TRACKS = new Map();

exports.upload = (req,res)=>{
  const trackId = id();
  TRACKS.set(trackId,{
    trackId, artistId:req.body.artistId,
    title:req.body.title, rate:req.body.rate||0.04,
    remix:req.body.remix||'open', createdAt:now()
  });
  res.json({ok:true, trackId});
};

exports.streamEvent = (req,res)=>{
  // mark a "qualified" stream (you’ll add checks)
  res.json({ok:true, qualified:true});
};
