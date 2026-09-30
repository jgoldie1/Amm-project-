export type StreetVerseMeshyAgeLane='child'|'teen'|'young-adult'|'adult'|'senior'
export type StreetVerseMeshyCharacterSlot=Readonly<{
 id:string
 filename:string
 ageLane:StreetVerseMeshyAgeLane
 presentation:'man'|'woman'|'person'
 heritage:string
 rolePool:readonly string[]
 adultLaneEligible:boolean
 targetHeightMeters:number
 fallbackResidentIndex:number
 driveFolder:'Rigged_GLTF_GLB_FBX'
 turnaroundFolder:'Front_Side_Back_Turnarounds'
 outfitFolder:'Outfits_Skins_HoloVariants'
}>

export const STREETVERSE_MESHY_CHARACTER_SLOTS:readonly StreetVerseMeshyCharacterSlot[]=[
 {id:'sv-black-man-youngadult-01',filename:'SV_NPC_BLACK_MAN_YOUNGADULT_01.glb',ageLane:'young-adult',presentation:'man',heritage:'Black',rolePool:['student','resident','creator','athlete','driver'],adultLaneEligible:true,targetHeightMeters:1.80,fallbackResidentIndex:0,driveFolder:'Rigged_GLTF_GLB_FBX',turnaroundFolder:'Front_Side_Back_Turnarounds',outfitFolder:'Outfits_Skins_HoloVariants'},
 {id:'sv-black-woman-youngadult-01',filename:'SV_NPC_BLACK_WOMAN_YOUNGADULT_01.glb',ageLane:'young-adult',presentation:'woman',heritage:'Black',rolePool:['student','resident','creator','merchant','medical-worker'],adultLaneEligible:true,targetHeightMeters:1.68,fallbackResidentIndex:1,driveFolder:'Rigged_GLTF_GLB_FBX',turnaroundFolder:'Front_Side_Back_Turnarounds',outfitFolder:'Outfits_Skins_HoloVariants'},
 {id:'sv-black-man-adult-01',filename:'SV_NPC_BLACK_MAN_ADULT_01.glb',ageLane:'adult',presentation:'man',heritage:'Black',rolePool:['resident','merchant','security','worker','parent'],adultLaneEligible:true,targetHeightMeters:1.82,fallbackResidentIndex:2,driveFolder:'Rigged_GLTF_GLB_FBX',turnaroundFolder:'Front_Side_Back_Turnarounds',outfitFolder:'Outfits_Skins_HoloVariants'},
 {id:'sv-black-woman-adult-01',filename:'SV_NPC_BLACK_WOMAN_ADULT_01.glb',ageLane:'adult',presentation:'woman',heritage:'Black',rolePool:['resident','merchant','worker','parent','community-leader'],adultLaneEligible:true,targetHeightMeters:1.69,fallbackResidentIndex:3,driveFolder:'Rigged_GLTF_GLB_FBX',turnaroundFolder:'Front_Side_Back_Turnarounds',outfitFolder:'Outfits_Skins_HoloVariants'},
 {id:'sv-black-man-senior-01',filename:'SV_NPC_BLACK_MAN_SENIOR_01.glb',ageLane:'senior',presentation:'man',heritage:'Black',rolePool:['senior-resident','mentor','retired-worker'],adultLaneEligible:true,targetHeightMeters:1.76,fallbackResidentIndex:4,driveFolder:'Rigged_GLTF_GLB_FBX',turnaroundFolder:'Front_Side_Back_Turnarounds',outfitFolder:'Outfits_Skins_HoloVariants'},
 {id:'sv-black-woman-senior-01',filename:'SV_NPC_BLACK_WOMAN_SENIOR_01.glb',ageLane:'senior',presentation:'woman',heritage:'Black',rolePool:['senior-resident','mentor','community-member'],adultLaneEligible:true,targetHeightMeters:1.64,fallbackResidentIndex:5,driveFolder:'Rigged_GLTF_GLB_FBX',turnaroundFolder:'Front_Side_Back_Turnarounds',outfitFolder:'Outfits_Skins_HoloVariants'},
 {id:'sv-white-man-youngadult-01',filename:'SV_NPC_WHITE_MAN_YOUNGADULT_01.glb',ageLane:'young-adult',presentation:'man',heritage:'White',rolePool:['student','resident','worker','creator'],adultLaneEligible:true,targetHeightMeters:1.81,fallbackResidentIndex:6,driveFolder:'Rigged_GLTF_GLB_FBX',turnaroundFolder:'Front_Side_Back_Turnarounds',outfitFolder:'Outfits_Skins_HoloVariants'},
 {id:'sv-white-woman-youngadult-01',filename:'SV_NPC_WHITE_WOMAN_YOUNGADULT_01.glb',ageLane:'young-adult',presentation:'woman',heritage:'White',rolePool:['student','resident','worker','creator'],adultLaneEligible:true,targetHeightMeters:1.68,fallbackResidentIndex:7,driveFolder:'Rigged_GLTF_GLB_FBX',turnaroundFolder:'Front_Side_Back_Turnarounds',outfitFolder:'Outfits_Skins_HoloVariants'},
 {id:'sv-latino-man-adult-01',filename:'SV_NPC_LATINO_MAN_ADULT_01.glb',ageLane:'adult',presentation:'man',heritage:'Latino/Hispanic',rolePool:['resident','merchant','worker','driver'],adultLaneEligible:true,targetHeightMeters:1.77,fallbackResidentIndex:0,driveFolder:'Rigged_GLTF_GLB_FBX',turnaroundFolder:'Front_Side_Back_Turnarounds',outfitFolder:'Outfits_Skins_HoloVariants'},
 {id:'sv-latina-woman-adult-01',filename:'SV_NPC_LATINA_WOMAN_ADULT_01.glb',ageLane:'adult',presentation:'woman',heritage:'Latina/Hispanic',rolePool:['resident','merchant','worker','medical-worker'],adultLaneEligible:true,targetHeightMeters:1.65,fallbackResidentIndex:1,driveFolder:'Rigged_GLTF_GLB_FBX',turnaroundFolder:'Front_Side_Back_Turnarounds',outfitFolder:'Outfits_Skins_HoloVariants'},
 {id:'sv-east-asian-youngadult-01',filename:'SV_NPC_EAST_ASIAN_YOUNGADULT_01.glb',ageLane:'young-adult',presentation:'person',heritage:'East Asian',rolePool:['student','resident','creator','worker'],adultLaneEligible:true,targetHeightMeters:1.70,fallbackResidentIndex:2,driveFolder:'Rigged_GLTF_GLB_FBX',turnaroundFolder:'Front_Side_Back_Turnarounds',outfitFolder:'Outfits_Skins_HoloVariants'},
 {id:'sv-south-asian-adult-01',filename:'SV_NPC_SOUTH_ASIAN_ADULT_01.glb',ageLane:'adult',presentation:'person',heritage:'South Asian',rolePool:['resident','professional','merchant','worker'],adultLaneEligible:true,targetHeightMeters:1.72,fallbackResidentIndex:3,driveFolder:'Rigged_GLTF_GLB_FBX',turnaroundFolder:'Front_Side_Back_Turnarounds',outfitFolder:'Outfits_Skins_HoloVariants'},
 {id:'sv-mena-adult-01',filename:'SV_NPC_MENA_ADULT_01.glb',ageLane:'adult',presentation:'person',heritage:'Middle Eastern/North African',rolePool:['resident','merchant','professional','worker'],adultLaneEligible:true,targetHeightMeters:1.73,fallbackResidentIndex:4,driveFolder:'Rigged_GLTF_GLB_FBX',turnaroundFolder:'Front_Side_Back_Turnarounds',outfitFolder:'Outfits_Skins_HoloVariants'},
 {id:'sv-multiracial-youngadult-01',filename:'SV_NPC_MULTIRACIAL_YOUNGADULT_01.glb',ageLane:'young-adult',presentation:'person',heritage:'Multiracial',rolePool:['student','resident','creator','worker'],adultLaneEligible:true,targetHeightMeters:1.72,fallbackResidentIndex:5,driveFolder:'Rigged_GLTF_GLB_FBX',turnaroundFolder:'Front_Side_Back_Turnarounds',outfitFolder:'Outfits_Skins_HoloVariants'},
 {id:'sv-child-01',filename:'SV_NPC_CHILD_01.glb',ageLane:'child',presentation:'person',heritage:'configurable',rolePool:['family','school','playground','sports','community'],adultLaneEligible:false,targetHeightMeters:1.33,fallbackResidentIndex:6,driveFolder:'Rigged_GLTF_GLB_FBX',turnaroundFolder:'Front_Side_Back_Turnarounds',outfitFolder:'Outfits_Skins_HoloVariants'},
 {id:'sv-teen-01',filename:'SV_NPC_TEEN_01.glb',ageLane:'teen',presentation:'person',heritage:'configurable',rolePool:['student','family','sports','creator-safe','community'],adultLaneEligible:false,targetHeightMeters:1.62,fallbackResidentIndex:7,driveFolder:'Rigged_GLTF_GLB_FBX',turnaroundFolder:'Front_Side_Back_Turnarounds',outfitFolder:'Outfits_Skins_HoloVariants'},
] as const

export const STREETVERSE_MESHY_CHARACTER_BASE_PATH='/tryamm-assets/meshy/characters'
export const streetVerseMeshyCharacterUrl=(slot:StreetVerseMeshyCharacterSlot)=>`${STREETVERSE_MESHY_CHARACTER_BASE_PATH}/${slot.filename}`

export const STREETVERSE_MESHY_CHARACTER_POLICY={
 childAndTeenAdultLaneBlocked:true,
 childAndTeenAfterDarkBlocked:true,
 schoolAndFamilySafe:true,
 interchangeableOutfits:true,
 riggedGlbPreferred:true,
 mobileWebOptimizationRequired:true,
 photoLikenessRequiresAuthorization:true,
} as const
