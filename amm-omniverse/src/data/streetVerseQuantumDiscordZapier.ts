export type StreetVerseAutomationEvent=
 |'player.joined'|'mission.completed'|'creator.code.created'|'live.started'|'pk.completed'
 |'reel.created'|'vehicle.purchased'|'vehicle.sold'|'business.sale'|'discord.role.changed'

export type StreetVerseAutomationEnvelope=Readonly<{
 id:string;event:StreetVerseAutomationEvent;occurredAt:string;actorId?:string;
 world?:string;payload:Record<string,unknown>;source:'streetverse';
}>

/**
 * Browser code emits requests only. A trusted server validates/signs events, then
 * may fan them out to Quantum Discord and a private Zapier Catch Hook.
 * Never ship Discord bot tokens or Zapier hook URLs in client bundles.
 */
export const requestAutomationEvent=(event:StreetVerseAutomationEvent,payload:Record<string,unknown>={})=>{
 const envelope:StreetVerseAutomationEnvelope={id:crypto.randomUUID?.()||String(Date.now()),event,occurredAt:new Date().toISOString(),world:'streetverse-global',payload,source:'streetverse'}
 return window.dispatchEvent(new CustomEvent('tryamm:automation-event-request',{detail:envelope}))
}
export const STREETVERSE_AUTOMATION_TARGETS={
 quantumDiscord:['live.started','pk.completed','mission.completed','creator.code.created','reel.created'],
 zapier:['player.joined','mission.completed','creator.code.created','live.started','pk.completed','reel.created','vehicle.purchased','vehicle.sold','business.sale'],
 serverOnlySecrets:['DISCORD_BOT_TOKEN','DISCORD_CLIENT_SECRET','ZAPIER_CATCH_HOOK_URL']
} as const
