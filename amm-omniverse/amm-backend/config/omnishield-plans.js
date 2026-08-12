const OMNISHIELD_PLANS={
  free:{name:'OmniShield Free',monthlyUsd:0,features:['caller reputation','basic spam block','manual block list','verified TRYAMM caller badge']},
  personal:{name:'OmniShield Personal',monthlyUsd:4.99,features:['real-time scam warnings','unknown caller screening','callback protection','call summaries','synthetic-voice risk alerts']},
  family:{name:'OmniShield Family 360',monthlyUsd:9.99,features:['up to 6 profiles','senior/child protection profiles','family safe contacts','caregiver alerts','shared scam reports']},
  business:{name:'OmniShield Business',monthlyUsd:29.99,features:['verified business identity','call-center protection','queue integrity','employee harassment shield','telecom spend guard','business analytics']},
  enterprise:{name:'OmniShield Enterprise',monthlyUsd:null,features:['API access','carrier/call-center integrations','custom policies','SIEM/webhook integrations','SLA and volume pricing']},
}
module.exports={OMNISHIELD_PLANS}
