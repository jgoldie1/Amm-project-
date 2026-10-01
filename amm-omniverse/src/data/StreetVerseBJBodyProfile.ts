export const BJ_STUBBS_BODY_PROFILE={
  id:'bj-stubbs',
  heightInches:74,
  heightMeters:1.8796,
  weightLb:175,
  weightKg:79.3787,
  waistInches:36,
  inseamInches:32,
  inseamMeters:0.8128,
  pantsSize:'36W32',
  calibration:{
    preserveLegLength:true,
    preserveInseam:true,
    preserveFootContact:true,
    preservePelvisHeight:true,
    uniformScaleFallbackOnly:true,
  },
  gameplay:{
    strideFromLegLength:true,
    landingCompressionFromImpact:true,
    gateVaultUsesBodyProfile:true,
    oneHandAccessible:true,
  },
} as const

export type BJStubbsBodyProfile=typeof BJ_STUBBS_BODY_PROFILE
