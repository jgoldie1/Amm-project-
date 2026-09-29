export type CarShareHostPlan='community'|'balanced'|'max-earnings'

export const STREETVERSE_CAR_SHARE_HOSTING={
  product:'All American Car Share',
  digitalGameVehicleSharing:true,
  realWorldPeerToPeerSharingLive:false,
  hostPlans:{
    community:{hostShareBps:7500,tryammBps:1500,reserveBps:1000},
    balanced:{hostShareBps:8000,tryammBps:1500,reserveBps:500},
    'max-earnings':{hostShareBps:8500,tryammBps:1000,reserveBps:500},
  },
  hostControls:[
    'hourly/daily availability',
    'minimum renter credential',
    'self-drive or passenger-only',
    'vehicle class eligibility',
    'damage-state hold',
    'late return flag',
    'recovery authorization',
  ] as const,
  payoutRule:'host earnings become payable only after a completed verified digital rental',
} as const

export function carShareSplit(grossCents:number,plan:CarShareHostPlan='balanced'){
  const gross=Math.max(0,Math.round(grossCents))
  const p=STREETVERSE_CAR_SHARE_HOSTING.hostPlans[plan]
  const host=Math.floor(gross*p.hostShareBps/10000)
  const tryamm=Math.floor(gross*p.tryammBps/10000)
  return{grossCents:gross,hostCents:host,tryammCents:tryamm,reserveCents:gross-host-tryamm}
}