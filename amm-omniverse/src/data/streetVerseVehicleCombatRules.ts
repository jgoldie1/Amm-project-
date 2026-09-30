export const STREETVERSE_VEHICLE_COMBAT_RULES={
 mode:'fictional-gameplay',
 defaultAmmo:12,
 cooldownMs:450,
 aimSides:['left','right'],
 disabledZones:['campus-safe-zone','hospital-safe-zone','faithverse-safe-zone','spawn-safe-zone'],
 hitFx:{default:'cinematic',levels:['off','reduced','cinematic'],maxParticles:9,lifetimeMs:550},
 notes:'No real-world weapon instruction. Server validates cooldown, ammo, target eligibility and safe-zone rules. Hit FX are brief, stylized, bounded particles.'
} as const
