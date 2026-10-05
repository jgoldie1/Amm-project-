export type KingdomMissionMode='local'|'external'|'path'
export type KingdomMissionDefinition=Readonly<{
 id:string
 title:string
 district:string
 mode:KingdomMissionMode
 category:'faith'|'study'|'service'|'commerce'|'family'|'farming'|'publishing'|'broadcast'|'journey'
 objective:string
 handoffRoute?:string
 serverRewardAuthority:true
 payoutClaimedByClient:false
}>

export const KINGDOM_YAHISRAEL_MISSIONS:readonly KingdomMissionDefinition[]=[
 {id:'assembly-reflection',title:'Assembly Reflection',district:'Assembly & Prayer Court',mode:'local',category:'faith',objective:'Complete a reflection/prayer interaction at the Assembly Court.',serverRewardAuthority:true,payoutClaimedByClient:false},
 {id:'community-service',title:'Community Service',district:'Servants of Christ Service Center',mode:'external',category:'service',objective:'Choose a teaching, care or community-service mission and continue it through the ministry system.',handoffRoute:'/servants-of-christ',serverRewardAuthority:true,payoutClaimedByClient:false},
 {id:'market-stewardship',title:'Kingdom Market Stewardship',district:'Kingdom Market',mode:'local',category:'commerce',objective:'Complete the market stewardship interaction without inventing a sale or payout.',serverRewardAuthority:true,payoutClaimedByClient:false},
 {id:'family-covenant',title:'Family Covenant + Remembrance',district:'Family Legacy Hall',mode:'external',category:'family',objective:'Continue the Kingdom Workbook family covenant / Book of Remembrance flow.',handoffRoute:'/kingdom-workbook',serverRewardAuthority:true,payoutClaimedByClient:false},
 {id:'metaverse-bible-study',title:'Metaverse Bible Study',district:'Metaverse Bible • Hebrew School',mode:'external',category:'study',objective:'Continue through Scripture Reader, Ethiopian canon metadata, Hebrew/Paleo-Hebrew, Strong’s, KJV 1611 and Faith Chrono.',handoffRoute:'/metaverse-bible',serverRewardAuthority:true,payoutClaimedByClient:false},
 {id:'garden-service',title:'Kingdom Garden Service',district:'Kingdom Garden',mode:'local',category:'farming',objective:'Plant/water the community garden as a service/stewardship interaction.',serverRewardAuthority:true,payoutClaimedByClient:false},
 {id:'publish-remembrance',title:'Publish the Remembrance',district:'Kingdoms Press + AI Café',mode:'external',category:'publishing',objective:'Continue a book, study guide, HoloBook or testimony through the rights/editorial publishing flow.',handoffRoute:'/kingdoms-press',serverRewardAuthority:true,payoutClaimedByClient:false},
 {id:'kingdom-broadcast',title:'Kingdom Broadcast',district:'All American Network Broadcast House',mode:'external',category:'broadcast',objective:'Continue a LIVE teaching, show, Reel or network program through the broadcast surface.',handoffRoute:'/network',serverRewardAuthority:true,payoutClaimedByClient:false},
 {id:'where-heaven-meets-earth-kingdom-path',title:'Where Heaven Meets Earth Kingdom Path',district:'Kingdom of Yahisrael',mode:'path',category:'journey',objective:'Visit Judah Gate, Hebrew School, Servants of Christ, Kingdom Garden and Kingdoms Press.',serverRewardAuthority:true,payoutClaimedByClient:false},
] as const

export const kingdomMissionById=(id:string)=>KINGDOM_YAHISRAEL_MISSIONS.find(x=>x.id===id)
