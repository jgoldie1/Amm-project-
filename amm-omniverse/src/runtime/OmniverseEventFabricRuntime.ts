import { installBiometricAvatarPrivacyRuntime } from './BiometricAvatarPrivacyRuntime'
import { installBennyConstructHolographicOverlay } from './BennyConstructHolographicOverlay'
import { installStreetVerseWorldAwareConstructRuntime } from './StreetVerseWorldAwareConstructRuntime'
import { installStreetVerseConstructAutoBridge } from './StreetVerseConstructAutoBridge'
import { installStreetVerseConstructHudRuntime } from './StreetVerseConstructHudRuntime'
import { installStreetVerseFreeSpaceConstruct3D } from './StreetVerseFreeSpaceConstruct3D'
import { installStoryCanonStreetVerseRuntime } from './StoryCanonStreetVerseRuntime'
import { installStreetVerseBuildingLife3D } from './StreetVerseBuildingLife3D'
import { installStreetVerseOpenWorldSystemsRuntime } from './StreetVerseOpenWorldSystemsRuntime'
import { installStreetVerseCityLifeRuntime } from './StreetVerseCityLifeRuntime'
import { installStreetVerseActivityRuntime } from './StreetVerseActivityRuntime'
import { installStreetVerseMiniMapHudRuntime } from './StreetVerseMiniMapHudRuntime'
import { installStreetVersePlayableMilestoneRuntime } from './StreetVersePlayableMilestoneRuntime'
import { installStreetVerseProductionLoopBridge } from './StreetVerseProductionLoopBridge'
import { installStreetVerseMilestoneReceiptRuntime } from './StreetVerseMilestoneReceiptRuntime'
import { installStreetVerseStoryModeRuntime } from './StreetVerseStoryModeRuntime'
import { installStreetVerseBasketballLeagueRuntime } from './StreetVerseBasketballLeagueRuntime'
import { installStreetVerseCasinoRuntime } from './StreetVerseCasinoRuntime'
import { installMetaQuestBridgeRuntime } from './MetaQuestBridgeRuntime'
import { installStreetVerseQuestImmersiveRuntime } from './StreetVerseQuestImmersiveRuntime'
import { installStreetVerseMobilePlayRuntime } from './StreetVerseMobilePlayRuntime'
import { installStreetVerseDesktopRecoveryRuntime } from './StreetVerseDesktopRecoveryRuntime'
import { installStreetVersePlayableCharactersRuntime } from './StreetVersePlayableCharactersRuntime'
import { installStreetVerseChicagoIdentityRuntime } from './StreetVerseChicagoIdentityRuntime'
import { installStreetVerseChicagoTransitDistrictRuntime } from './StreetVerseChicagoTransitDistrictRuntime'
import { installStreetVerseChicagoLivingWorldRuntime } from './StreetVerseChicagoLivingWorldRuntime'
import { installOmniAccessibilityGlobalRuntime } from './OmniAccessibilityGlobalRuntime'
import { installOmniWorldContinuityRuntime } from './OmniWorldContinuityRuntime'
import { installPropertyVerseRuntime } from './PropertyVerseRuntime'
import { installChronoExperienceRuntime } from './ChronoExperienceRuntime'
import { installChronoExperienceHudRuntime } from './ChronoExperienceHudRuntime'
import { installChronoWarpRuntime } from './ChronoWarpRuntime'
import { installProductionTruthRuntime } from './ProductionTruthRuntime'
import { installOmniConnectSocialRuntime } from './OmniConnectSocialRuntime'
export type OmniverseEventChannel='game'|'mission'|'live'|'reel'|'creator'|'ads'|'marketplace'|'ledger'|'broadcast'
export type OmniverseEventEnvelope={id:string;source:string;type:string;title:string;actorId?:string;missionId?:string;amountCents?:number;currency?:string;metadata?:Record<string,unknown>;createdAt:string}
export type OmniverseEventReceipt={eventId:string;channel:OmniverseEventChannel;status:'ready'|'gated';reason?:string}
export type OmniverseFabricState={lastEvent?:OmniverseEventEnvelope;receipts:OmniverseEventReceipt[];completedChannels:OmniverseEventChannel[]}
const STATE_KEY='tryamm_omniverse_event_fabric_v1';const MAX_EVENT_HISTORY=50;let installed=false
const CHANNELS:OmniverseEventChannel[]=['game','mission','live','reel','creator','ads','marketplace','ledger','broadcast']
function now(){return new Date().toISOString()}function makeId(){return `omni_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`}
function readState():OmniverseFabricState{if(typeof localStorage==='undefined')return {receipts:[],completedChannels:[]};try{const raw=localStorage.getItem(STATE_KEY);if(!raw)return {receipts:[],completedChannels:[]};const parsed=JSON.parse(raw) as OmniverseFabricState;return {lastEvent:parsed.lastEvent,receipts:Array.isArray(parsed.receipts)?parsed.receipts.slice(-MAX_EVENT_HISTORY):[],completedChannels:Array.isArray(parsed.completedChannels)?parsed.completedChannels:[]}}catch{return {receipts:[],completedChannels:[]}}}
function writeState(state:OmniverseFabricState){try{localStorage.setItem(STATE_KEY,JSON.stringify(state))}catch{}}function publish(state:OmniverseFabricState){window.dispatchEvent(new CustomEvent<OmniverseFabricState>('tryamm:omniverse-fabric-state',{detail:state}))}
function paymentSafe(envelope:OmniverseEventEnvelope){if(!envelope.amountCents)return true;return envelope.amountCents>0&&Boolean(envelope.currency)&&Boolean(envelope.actorId)}
function route(envelope:OmniverseEventEnvelope):OmniverseEventReceipt[]{const moneySafe=paymentSafe(envelope);return CHANNELS.map(channel=>channel==='ledger'&&!moneySafe?{eventId:envelope.id,channel,status:'gated',reason:'Money events require actorId, positive amountCents and currency.'}:{eventId:envelope.id,channel,status:'ready'})}
function emitChannel(envelope:OmniverseEventEnvelope,receipt:OmniverseEventReceipt){if(receipt.status==='ready')window.dispatchEvent(new CustomEvent(`tryamm:omniverse:${receipt.channel}`,{detail:{envelope,receipt}}))}
export function submitOmniverseEvent(input:Partial<OmniverseEventEnvelope>&Pick<OmniverseEventEnvelope,'type'|'title'>){if(typeof window==='undefined')return;const envelope:OmniverseEventEnvelope={id:input.id||makeId(),source:input.source||'tryamm',type:input.type,title:input.title,actorId:input.actorId,missionId:input.missionId,amountCents:input.amountCents,currency:input.currency,metadata:input.metadata,createdAt:input.createdAt||now()};const receipts=route(envelope);const completedChannels=receipts.filter(r=>r.status==='ready').map(r=>r.channel);const state:OmniverseFabricState={lastEvent:envelope,receipts,completedChannels};writeState(state);receipts.forEach(receipt=>emitChannel(envelope,receipt));publish(state);return state}
export function installOmniverseEventFabricRuntime(){if(installed||typeof window==='undefined')return;installed=true;installBiometricAvatarPrivacyRuntime();installBennyConstructHolographicOverlay();installStreetVerseWorldAwareConstructRuntime();installStreetVerseConstructAutoBridge();installStreetVerseConstructHudRuntime();installStreetVerseFreeSpaceConstruct3D();installStreetVerseBuildingLife3D();installStreetVerseOpenWorldSystemsRuntime();installStreetVerseCityLifeRuntime();installStreetVerseActivityRuntime();installStreetVerseMiniMapHudRuntime();installStreetVersePlayableMilestoneRuntime();installStreetVerseProductionLoopBridge();installStreetVerseMilestoneReceiptRuntime();installStreetVerseStoryModeRuntime();installStreetVerseBasketballLeagueRuntime();installStreetVerseCasinoRuntime();installOmniAccessibilityGlobalRuntime();installOmniWorldContinuityRuntime();installStreetVerseMobilePlayRuntime();installStreetVerseDesktopRecoveryRuntime();installStreetVersePlayableCharactersRuntime();installStreetVerseChicagoIdentityRuntime();installStreetVerseChicagoTransitDistrictRuntime();installStreetVerseChicagoLivingWorldRuntime();installStreetVerseQuestImmersiveRuntime();void installMetaQuestBridgeRuntime();installPropertyVerseRuntime();installChronoExperienceRuntime();installChronoExperienceHudRuntime();installChronoWarpRuntime();installProductionTruthRuntime();installOmniConnectSocialRuntime();installStoryCanonStreetVerseRuntime();queueMicrotask(()=>publish(readState()));window.addEventListener('tryamm:omniverse-submit',(event:Event)=>{const detail=(event as CustomEvent<Partial<OmniverseEventEnvelope>&Pick<OmniverseEventEnvelope,'type'|'title'>>).detail;if(detail?.type&&detail?.title)submitOmniverseEvent(detail)});window.addEventListener('tryamm:mission-completed',(event:Event)=>{const detail=(event as CustomEvent<Record<string,unknown>>).detail||{};submitOmniverseEvent({source:'streetverse',type:'mission.completed',title:String(detail.title||detail.missionTitle||'StreetVerse mission completed'),actorId:typeof detail.actorId==='string'?detail.actorId:undefined,missionId:typeof detail.missionId==='string'?detail.missionId:undefined,amountCents:typeof detail.amountCents==='number'?detail.amountCents:undefined,currency:typeof detail.currency==='string'?detail.currency:undefined,metadata:detail})});window.addEventListener('tryamm:creator-publish',(event:Event)=>{const detail=(event as CustomEvent<Record<string,unknown>>).detail||{};submitOmniverseEvent({source:'creator-studio',type:'creator.published',title:String(detail.title||'Creator publish'),metadata:detail})})}