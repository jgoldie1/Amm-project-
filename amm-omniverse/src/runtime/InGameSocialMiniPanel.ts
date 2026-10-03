export type MiniPanelTab='live'|'party'|'missions'|'social'
export type SocialSignal={contentId:string;viewerId:string;kind:'like'|'follow'|'share'|'comment';verified:boolean;at:number}
export const MINI_PANEL={compact:true,oneHandReachable:true,collapsible:true,doesNotBlockMovement:true,tabs:['live','party','missions','social'] as MiniPanelTab[],showLikes:true,showViewers:true,showParty:true,showMission:true,quickLike:true,quickFollow:true,quickShare:true} as const
export const LIKE_INTEGRITY={oneActiveLikePerViewerPerContent:true,serverDedupRequired:true,rateLimitRequired:true,noPurchasedFakeLikes:true,noBotLikes:true,unlikeSupported:true} as const
export function socialCount(events:SocialSignal[],kind:SocialSignal['kind']){const rows=events.filter(e=>e.verified&&e.kind===kind);if(kind!=='like')return rows.length;return new Set(rows.map(e=>e.contentId+':'+e.viewerId)).size}
export function openMiniPanel(tab:MiniPanelTab='live'){if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:mini-panel-open',{detail:{tab}}));return tab}
