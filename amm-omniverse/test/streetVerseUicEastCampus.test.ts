import {describe,expect,it} from 'vitest'
import {UIC_EAST_CAMPUS,UIC_TAYLOR_MEDICAL_CONNECTIONS} from '../src/data/streetVerseUicEastCampus'
describe('UIC East Campus StreetVerse layer',()=>{
 it('contains the East Campus gateway landmarks',()=>{
  expect(UIC_EAST_CAMPUS.some(x=>x.id==='student-center-east')).toBe(true)
  expect(UIC_EAST_CAMPUS.some(x=>x.id==='halsted-taylor')).toBe(true)
 })
 it('connects East Campus through Taylor to the medical district',()=>{
  expect(UIC_TAYLOR_MEDICAL_CONNECTIONS.map(x=>x.to)).toContain('chicago-taylor-alpha')
  expect(UIC_TAYLOR_MEDICAL_CONNECTIONS.map(x=>x.to)).toContain('stroger-hospital')
 })
})
