const { id, now } = require('../../shared/utils');
const REPORTS = [];
const DMCA = [];
const APPEALS = [];

exports.report = (req,res)=>{
  const r = { id:id(), contentId:req.body.contentId, reason:req.body.reason, at:now(), status:'open' };
  REPORTS.push(r);
  res.json({ok:true, reportId:r.id});
};

exports.dmcaNotice = (req,res)=>{
  const n = { id:id(), claimant:req.body.claimant, contentId:req.body.contentId, at:now(), status:'takedown' };
  DMCA.push(n);
  res.json({ok:true, dmcaId:n.id, action:'content_removed'});
};

exports.appeal = (req,res)=>{
  const a = { id:id(), contentId:req.body.contentId, at:now(), status:'pending' };
  APPEALS.push(a);
  res.json({ok:true, appealId:a.id});
};
