export const LEGACY_LIFE_MAP = {
  chicago: {
    sportsLandmarks: ['Guaranteed Rate Field / White Sox ballpark district', 'Wrigley Field / North Side baseball district'],
    education: ['Holy Angels','Holy Family','Holy Name Cathedral','Steinmetz High School','Lincoln Park High School — summer school','University of Illinois Chicago'],
  },
  california: {
    education: ['Andrew Hill High School — San Jose','St. Ignatius','Hollywood High School','Thomas Jefferson High School'],
    memoryDistricts: ['San Jose','Hollywood Boulevard 1992','Hollywood High','studio/production corridors','public-art corridor','television dance-stage memory'],
  },
  indiana: {
    hubs: ['Gary + Northwest Indiana','South Bend','Indianapolis','Fort Wayne','Bloomington','Evansville','Columbus, Indiana'],
  },
} as const

export const LEGACY_CHARACTERS = [
  { id:'raymond-jarreau', name:'Raymond Jarreau', role:'family / Hollywood showcase connector', treatment:'player-authored family character; public claims require evidence' },
  { id:'michael-castner', name:'Michael Castner', role:'Las Vegas chef / life-network character', treatment:'use an original avatar until identity, consent and public-facing biography are confirmed' },
  { id:'alfredo-de-batuc', name:'Alfredo de Batuc', role:'mural artist / historical mentor reference', treatment:'historical reference; likeness/voice remains rights-gated' },
] as const

export const LIFE_TO_GAME_LOOP = [
  'Memory is authored by player',
  'Eve labels confidence and separates memory from verified fact',
  'Evidence can be attached later',
  'Rights engine determines what media/likeness may ship',
  'Asset system reuses safe world kits and Lottie 2.0',
  'World Memory persists choices and relationships',
  'Missions unlock education, art, film, music, sports, travel and family branches',
  'Returning to a place compares past, present and player consequences',
] as const
