const { id, now } = require('../../shared/utils');
const USERS = new Map();

exports.signup = (req,res)=>{
  const userId = id();
  USERS.set(userId, {
    userId, email: req.body.email, age: req.body.age || 0,
    parentId: req.body.parentId || null,
    verified:false, trustScore:0, createdAt: now()
  });
  res.json({ok:true, userId});
};

exports.verify = (req,res)=>{
  const u = USERS.get(req.body.userId);
  if(!u) return res.status(404).json({ok:false});
  u.verified = true;
  u.trustScore += 10;
  res.json({ok:true, verified:true});
};
