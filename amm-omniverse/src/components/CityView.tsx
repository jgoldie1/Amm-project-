import StreetVerseGeoSpawnBridge from './StreetVerseGeoSpawnBridge'
import { useGameStore } from '../game/state/useGameStore'

export default function CityView(){
  const setScreen=useGameStore(s=>s.setScreen)
  return <StreetVerseGeoSpawnBridge onClose={()=>setScreen('intro')}/>
}
