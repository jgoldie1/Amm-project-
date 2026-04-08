const { now } = require('../../shared/utils');
const WALLETS = new Map();

function ensure(userId){
  if(!WALLETS.has(userId)){
    WALLETS.set(userId,{userId, balance:0, credits:0, pending:0, updatedAt:now()});
  }
  return WALLETS.get(userId);
}

exports.deposit = (req,res)=>{
  const w = ensure(req.body.userId);
  w.balance += Number(req.body.amount||0);
  w.updatedAt = now();
  res.json({ok:true, wallet:w});
};

exports.transfer = (req,res)=>{
  const from = ensure(req.body.from);
  const to = ensure(req.body.to);
  const amt = Number(req.body.amount||0);
  if(from.balance < amt) return res.status(400).json({ok:false, err:'insufficient'});
  from.balance -= amt;
  to.balance += amt;
  res.json({ok:true});
};

exports.getWallet = (req,res)=>{
  const w = ensure(req.params.userId);
  res.json({ok:true, wallet:w});
};
