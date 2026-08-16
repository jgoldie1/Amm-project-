export type LeagueLane='mens'|'womens'|'mixed'
export type SportId='basketball'|'boxing'|'mma'|'football'|'baseball'|'soccer'|'hockey'|'track'

export type SportsTitle={
 id:string
 sport:SportId
 lane:LeagueLane
 title:string
 description:string
 modes:string[]
 sharedAthleteRig:boolean
 sourceAssetId?:string
}

export const sportsCatalog:SportsTitle[]=[
 {id:'court-kings-men',sport:'basketball',lane:'mens',title:'Court Kings Men',description:'Original 5v5 and street basketball career/franchise game.',modes:['quick-play','career','franchise','street-3v3','tournament','online'],sharedAthleteRig:true,sourceAssetId:'athlete'},
 {id:'court-kings-women',sport:'basketball',lane:'womens',title:'Court Queens',description:'Original women’s basketball league with full parity of gameplay systems.',modes:['quick-play','career','franchise','street-3v3','tournament','online'],sharedAthleteRig:true,sourceAssetId:'athlete'},
 {id:'court-kings-mixed',sport:'basketball',lane:'mixed',title:'Court Kings Mixed League',description:'Original mixed-league basketball mode with customizable rosters.',modes:['quick-play','career','street-3v3','tournament'],sharedAthleteRig:true,sourceAssetId:'athlete'},
 {id:'fight-kingdom-men',sport:'boxing',lane:'mens',title:'Fight Kingdom Boxing Men',description:'Original boxing career game with movement, blocking, combinations, stamina, judges and knockdowns.',modes:['exhibition','career','tournament','online'],sharedAthleteRig:true,sourceAssetId:'athlete'},
 {id:'fight-kingdom-women',sport:'boxing',lane:'womens',title:'Fight Kingdom Boxing Women',description:'Original women’s boxing career game with the same full rules and progression stack.',modes:['exhibition','career','tournament','online'],sharedAthleteRig:true,sourceAssetId:'athlete'},
 {id:'combat-arena-men',sport:'mma',lane:'mens',title:'Combat Arena MMA Men',description:'Original MMA game with striking, takedowns, grappling, submissions and referee stoppages.',modes:['exhibition','career','tournament','online'],sharedAthleteRig:true,sourceAssetId:'athlete'},
 {id:'combat-arena-women',sport:'mma',lane:'womens',title:'Combat Arena MMA Women',description:'Original women’s MMA game with shared combat systems and equal feature depth.',modes:['exhibition','career','tournament','online'],sharedAthleteRig:true,sourceAssetId:'athlete'},
 {id:'gridiron-kingdom',sport:'football',lane:'mixed',title:'Gridiron Kingdom',description:'Original football title with formations, routes, tackling, downs, special teams and franchise systems.',modes:['quick-play','career','franchise','online'],sharedAthleteRig:true,sourceAssetId:'athlete'},
 {id:'diamond-kingdom',sport:'baseball',lane:'mixed',title:'Diamond Kingdom',description:'Original baseball/softball framework with pitching, batting, fielding, base running and franchise play.',modes:['quick-play','career','franchise','online'],sharedAthleteRig:true,sourceAssetId:'athlete'},
 {id:'global-kings',sport:'soccer',lane:'mixed',title:'Global Kings Soccer',description:'Original football/soccer title with passing, shooting, tackling, keepers, cards and tournament play.',modes:['quick-play','career','club','online'],sharedAthleteRig:true,sourceAssetId:'athlete'},
 {id:'ice-kingdom',sport:'hockey',lane:'mixed',title:'Ice Kingdom Hockey',description:'Original hockey title with skating, passing, checking, goalies, penalties and power plays.',modes:['quick-play','career','franchise','online'],sharedAthleteRig:true,sourceAssetId:'athlete'},
 {id:'track-field-world',sport:'track',lane:'mixed',title:'Track & Field World',description:'Original track and field package with sprints, relays, hurdles, jumps and throws.',modes:['event','career','meet','online'],sharedAthleteRig:true,sourceAssetId:'athlete'}
]

export const sharedSportsSystems={
 playerCreation:['male','female','mixed-roster','skin-tone','hair','body-frame','left-right-handed','uniforms','accessibility-controls'],
 gameplay:['physics','fatigue','attributes','difficulty','career','franchise','replay','commentary','crowd','controller','online-multiplayer'],
 presentation:['holographic-overlay','quantum-beat','instant-replay','broadcast-camera','halftime-show','creator-music','accessibility'],
 safety:['original-branding-only','no-protected-player-likenesses','no-nba-wnba-nfl-ufc-brand-assets']
}
