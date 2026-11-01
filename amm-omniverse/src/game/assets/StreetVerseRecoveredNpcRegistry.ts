/** Read-only provenance catalog for recovered original NPC GLBs.
 * Files must be staged at approved same-origin URLs only after SHA-256 verification.
 * No production asset is overwritten by this registry.
 */
export type RecoveredNpcVariant='adult-man'|'adult-woman'|'youngadult-man'|'youngadult-woman';
export type RecoveredNpcMotion='base'|'walk'|'run';
export type RecoveredNpcAsset={variant:RecoveredNpcVariant;motion:RecoveredNpcMotion;file:string;bytes:number;sha256:string;sourceDriveId:string};
export const RECOVERED_NPC_ASSETS:readonly RecoveredNpcAsset[]=[
 ['adult-man','base','SV_NPC_BLACK_MAN_ADULT_01.glb',12445832,'00103c51becfbb1758f16e592a6595739a2822aba7302c03964cde4aa2e60e5d','1uSFQVJcHhKGa03VwFTOcnYATQhe5pxbz'],
 ['adult-man','walk','SV_NPC_BLACK_MAN_ADULT_01.walk.glb',12425808,'555fe616bbed89df3083da0657286f004fb650bb0332b6dfdef766e7bc857e3f','1sHwz0kvQED8PaEvH4xBN1ltTc95ViOEf'],
 ['adult-man','run','SV_NPC_BLACK_MAN_ADULT_01.run.glb',12415192,'e7c91608cbeadba3e0d7117b9ba28411b147503ff1ab698d62f36815247fbdef','1tGTnpOVne5vjEMh3QtIsT9Gz-mV-EtLz'],
 ['adult-woman','base','SV_NPC_BLACK_WOMAN_ADULT_01.glb',13389964,'768e4a32ffeecebffac05dcf2ebc3c01c392f895987ad1b19e5e7dba114e2afb','1xGPQA0FAvGq6MgB7owupAtGs0KTAaM9w'],
 ['adult-woman','walk','SV_NPC_BLACK_WOMAN_ADULT_01.walk.glb',13369976,'118b4105da288c3c4acf4dc054c625102e9ab7a92b7e751de6a5e8701be8b9cb','1X4Y-JKMvyU7s9qjkhzONtu9O3uAVf0ng'],
 ['adult-woman','run','SV_NPC_BLACK_WOMAN_ADULT_01.run.glb',13359352,'1bd26ae80dcbac58574ba481ae7492badddcc349876b5ef1379a7fdef','1ZW7-sJzIjBaZ2dqJAOlus9KDfgcquFJt'],
 ['youngadult-man','base','SV_NPC_BLACK_MAN_YOUNGADULT_01.glb',12701232,'a8621bdc72b090ef949825630a3c956a40e09bfd95b926d10e7a09a55e69b43b','1jqVlW45Pzfj9-i46k0fj1X0cak3NLMSp'],
 ['youngadult-man','walk','SV_NPC_BLACK_MAN_YOUNGADULT_01.walk.glb',12681392,'880de2daa18cab67f46e778ff7cbaa44c91c8648c0872d7a2452c43ae951a380','1asm_5DR6AHzkLKk7fWN1FboThVZip9hl'],
 ['youngadult-man','run','SV_NPC_BLACK_MAN_YOUNGADULT_01.run.glb',12670800,'693fa32075e50a62886f0f817530f89ac8ac24c10d1c81b5ed9ce7284e51c79f','1dFS2-Ok2R46DLariCR4MrwImEeSj_hEZ'],
 ['youngadult-woman','base','SV_NPC_BLACK_WOMAN_YOUNGADULT_01.glb',11742224,'a123e9d742b45fcadb2378c710055cdcbdeda6514a883779f1a8451f87f53be5','1RsehHQ1Pv3d1leI5jaGqt3XwRH9sSw8H'],
 ['youngadult-woman','walk','SV_NPC_BLACK_WOMAN_YOUNGADULT_01.walk.glb',11722240,'310d6989a06b015f3fe0440032d18c8162f3339b0b98c08704774af0dd31c2cb','1IO1EpfYY9F4H9eGfmbEMSfzROtBIOXOA'],
 ['youngadult-woman','run','SV_NPC_BLACK_WOMAN_YOUNGADULT_01.run.glb',11711604,'27823e7784bcb0aa208321e22df3164395381686c1ad94da585674380a75d30f','1ATTwTov4L0xw3ZGfAan65qGlb7hooXW1']
].map(([variant,motion,file,bytes,sha256,sourceDriveId])=>({variant:variant as RecoveredNpcVariant,motion:motion as RecoveredNpcMotion,file:file as string,bytes:bytes as number,sha256:sha256 as string,sourceDriveId:sourceDriveId as string}));
export function recoveredNpcAsset(variant:RecoveredNpcVariant,motion:RecoveredNpcMotion){
 return RECOVERED_NPC_ASSETS.find(asset=>asset.variant===variant&&asset.motion===motion)??null;
}
