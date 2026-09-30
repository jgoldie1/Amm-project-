import {describe,expect,it} from 'vitest'
import {findMedicalDistrictLandmark,UIC_MEDICAL_DISTRICT_LANDMARKS} from '../src/data/streetVerseUicMedicalDistrict'

describe('UIC Medical District StreetVerse layer',()=>{
  it('keeps current and historic Cook County hospital layers distinct',()=>{
    expect(findMedicalDistrictLandmark('stroger-hospital')?.kind).toBe('hospital')
    expect(findMedicalDistrictLandmark('old-cook-county-hospital')?.kind).toBe('historic-hospital')
  })
  it('provides deterministic Cartesian anchors',()=>{
    expect(UIC_MEDICAL_DISTRICT_LANDMARKS.every(x=>Number.isFinite(x.position.x)&&Number.isFinite(x.position.z))).toBe(true)
  })
})
