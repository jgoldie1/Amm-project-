import { LIFE_ECONOMY_LOOP, OMNICARE_360, OMNICASH, SERVANTS_OF_CHRIST_MINISTRIES, WFH_AI_CALL_CENTER } from '../../platform/OmniCareCashWorkCenter'

export const LIFE_WORK_BUSINESS_BRIDGE = {
  loop: LIFE_ECONOMY_LOOP,
  starterPaths:[
    {id:'wfh-agent',name:'Work-From-Home AI Call Center Agent',learn:['customer support','sales','accessibility','AI copilot','compliance'],earn:'verified shift/task earnings through Money Engine',worldEcho:'customers remember service quality; promotions and agency opportunities unlock'},
    {id:'care-navigator',name:'OmniCare 360 Navigator',learn:['resource navigation','consent','privacy','licensed-provider escalation'],earn:'eligible employment/service earnings only under approved operating model',worldEcho:'helped households gain trusted-resource reputation'},
    {id:'merchant',name:'All American Marketplace Merchant',learn:['sourcing','landed cost','inventory','storefront','customer service'],earn:'verified marketplace sales less fees/refunds',worldEcho:'store can grow, hire staff, fail, recover or expand cities'},
    {id:'agency-owner',name:'Creator/Mobile Agency Owner',learn:['recruiting','training','campaigns','compliance','ledger splits'],earn:'eligible commissions/rebates after evidence and provider gates',worldEcho:'creators can become managers and open their own agencies'},
    {id:'ministry-service',name:'Servants of Christ Community Service',learn:['outreach','volunteer coordination','events','service referrals'],earn:'separate ministry/service accounting where applicable; volunteer work is never silently treated as paid labor',worldEcho:'community trust, service history and memorial/legacy missions evolve'},
    {id:'holoarena-operator',name:'HoloArena Operator',learn:['XR calibration','safety','accessibility','customer hosting','incident response'],earn:'verified employment/contract earnings',worldEcho:'venue reputation, tournaments and repeat customers evolve'},
  ],
  businessCreation:['choose business type','register profile/storefront','complete required verification/licenses','source products/services','set pricing','hire eligible workers','serve customers','record revenue/costs','pay workers/vendors','reinvest or close','expand city/online'],
  moneyStates:['revenue','cost-of-goods','payroll/contractor-cost','tax/fees-reserve','refunds/chargebacks','profit/loss','cash-reserve','eligible-owner-draw'],
  worldMemory:['job history','skills/credentials','customer reputation','business openings/closures','employees hired/promoted','debts/obligations where simulated','community service','care-navigation milestones','financial choices','city expansion'],
  connectedSystems:{omniCare:OMNICARE_360.name,omniCash:OMNICASH.name,workCenter:WFH_AI_CALL_CENTER.name,ministry:SERVANTS_OF_CHRIST_MINISTRIES.name},
} as const

export const CALL_CENTER_NEXT_LEVEL = {
  inbound:['support number','in-app voice','chat','callback request'],
  outbound:['consented leads','appointments','customer follow-up','eligible campaigns'],
  routing:['intent','language','accessibility','customer tier','risk/regulatory lane','agent skill','availability'],
  antiLoopEscalation:'REPEAT/FAILURE/FRUSTRATION → SUMMARIZE CONTEXT → CHANGE STRATEGY → OFFER HUMAN/CALLBACK/TEXT → TRANSFER WITH CONTEXT → QA REVIEW',
  supervisorTools:['live queue','whisper coaching where lawful','takeover/escalation','QA scorecards','script/version control','DNC/consent audit','incident flags','agent performance','schedule/workforce management'],
  businessTools:['lead CRM','appointments','quotes/orders','customer history','payments handoff','refund/support ticket','knowledge base','campaign attribution','conversion funnel'],
  providerGates:['telephony numbers/porting','STT/TTS','recording consent by jurisdiction','webhooks','production secrets','real-call smoke tests'],
} as const
