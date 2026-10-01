import {describe,expect,it} from 'vitest'
import {compileNearWestRoadMeshes,nearestRoadNode} from '../src/data/streetVerseNearWestRoadNetwork'
describe('Near West Side road compiler',()=>{
 it('compiles roads with positive lengths and sidewalks',()=>{const r=compileNearWestRoadMeshes();expect(r.length).toBeGreaterThanOrEqual(5);expect(r.every(x=>x.length>0&&x.sidewalkWidth===3)).toBe(true)})
 it('finds the closest intersection',()=>{expect(nearestRoadNode({x:-650,y:0,z:705})?.id).toBe('taylor-halsted')})
})
