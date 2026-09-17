export type StreetVerseGameId = 'HOLO_HOOPS' | 'STREET_RACE' | 'DELIVERY_RUN' | 'MISSION_HUNT'

export interface PlayableCharacter {
  id: string
  name: string
  role: 'PLAYER' | 'CREATOR' | 'DRIVER' | 'SCOUT' | 'ATHLETE'
  speed: number
  stamina: number
  handling: number
  charisma: number
  starterGame: StreetVerseGameId
  origin?: string
}

export interface StreetVerseGame {
  id: StreetVerseGameId
  name: string
  objective: string
  minPlayers: number
  maxPlayers: number
  rewardXp: number
  playable: true
}

export const STREETVERSE_PLAYABLE_CAST: PlayableCharacter[] = [
  {id:'jay',name:'Jay',role:'PLAYER',speed:7,stamina:8,handling:7,charisma:8,starterGame:'MISSION_HUNT'},
  {id:'nova',name:'Nova',role:'CREATOR',speed:7,stamina:6,handling:6,charisma:10,starterGame:'MISSION_HUNT'},
  {id:'ace',name:'Ace',role:'DRIVER',speed:8,stamina:7,handling:10,charisma:6,starterGame:'STREET_RACE'},
  {id:'sky',name:'Sky',role:'ATHLETE',speed:9,stamina:9,handling:7,charisma:7,starterGame:'HOLO_HOOPS'},
  {id:'miles',name:'Miles',role:'SCOUT',speed:8,stamina:8,handling:8,charisma:7,starterGame:'DELIVERY_RUN'},
  {id:'nikki-france',name:'Nikki France',role:'CREATOR',speed:7,stamina:7,handling:6,charisma:9,starterGame:'MISSION_HUNT',origin:'Detroit'},
  {id:'tae-monroe',name:'Tae Monroe',role:'SCOUT',speed:8,stamina:8,handling:8,charisma:8,starterGame:'DELIVERY_RUN',origin:'Florida'},
]

export const MEET_THE_STUBBS = Object.freeze({
  id: 'MEET_THE_STUBBS',
  name: 'Meet the Stubbs',
  type: 'STORY_HUB',
  objective: 'Meet the family and extended StreetVerse cast, learn their roles, and unlock connected missions across the world.',
  entryGame: 'MISSION_HUNT' as StreetVerseGameId,
  playableCastIds: STREETVERSE_PLAYABLE_CAST.map((character) => character.id),
})

export const STREETVERSE_GAMES: StreetVerseGame[] = [
  {id:'HOLO_HOOPS',name:'Holo Hoops',objective:'Score more baskets before the clock expires.',minPlayers:1,maxPlayers:6,rewardXp:350,playable:true},
  {id:'STREET_RACE',name:'Chicago Street Race',objective:'Complete the checkpoint circuit and finish first.',minPlayers:1,maxPlayers:8,rewardXp:500,playable:true},
  {id:'DELIVERY_RUN',name:'Delivery Run',objective:'Pick up the package and reach the destination before time expires.',minPlayers:1,maxPlayers:4,rewardXp:300,playable:true},
  {id:'MISSION_HUNT',name:'Mission Hunt',objective:'Explore StreetVerse, discover mission markers, and complete the active objective.',minPlayers:1,maxPlayers:4,rewardXp:400,playable:true},
]

export function getPlayableCharacter(id:string){return STREETVERSE_PLAYABLE_CAST.find(character=>character.id===id)}
export function getStreetVerseGame(id:StreetVerseGameId){return STREETVERSE_GAMES.find(game=>game.id===id)}

export function canStartStreetVerseGame(gameId:StreetVerseGameId,playerCount:number){
  const game=getStreetVerseGame(gameId)
  return Boolean(game && playerCount>=game.minPlayers && playerCount<=game.maxPlayers)
}

// XP is progression only. Cash/payable rewards must continue through the authoritative server reward contract.
export const STREETVERSE_GAME_REWARD_POLICY=Object.freeze({
  clientMayAwardXp:true,
  clientMayAwardCash:false,
  clientMayCreatePayableBalance:false,
  cashRewardsRequireServerVerification:true,
  spectatorBettingEnabled:false,
})
