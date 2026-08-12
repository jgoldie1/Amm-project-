// El Saturn Records 2.0 — next-generation jazz label operating model.
// New works may move under new contracts. Legacy/archival Sun Ra or El Saturn materials remain rights-gated.

export const EL_SATURN_RECORDS_2 = Object.freeze({
  mission: 'Create and distribute original next-generation jazz that combines improvisation, advanced production, spatial performance, education, technology and creator ownership.',
  soundPillars: [
    'cosmic_jazz',
    'future_soul',
    'electronic_jazz',
    'afrofuturist_improvisation',
    'orchestral_hybrid',
    'jazz_hip_hop',
    'gospel_spiritual_jazz',
    'global_diaspora_fusion',
    'ambient_space_music',
    'experimental_acoustic_electronic',
  ],
  creatorStack: [
    'Aniyah_64_track_DAW',
    'Ableton_compatible_workflow',
    'Pro_Tools_compatible_workflow',
    'FL_Studio_compatible_workflow',
    'Korg_plugin_and_hardware_workflow',
    'AI_vocal_coach',
    'mixing_mastering_assistance',
    'spatial_audio',
    'Dolby_Atmos_ready_pipeline',
    'HoloMusic_distribution',
    'Starverse_discovery',
  ],
  revenueStreams: [
    'streaming',
    'downloads',
    'vinyl_and_physical',
    'live_and_holographic_concerts',
    'subscriptions_and_fan_clubs',
    'sync_licensing',
    'publishing',
    'sample_and_stem_licensing',
    'education_and_masterclasses',
    'merchandise',
    'brand_partnerships',
    'spatial_experience_tickets',
    'creator_tools',
    'enterprise_music_licensing',
  ],
  rightsPolicy: {
    newWorks: 'contract_required',
    legacyArchive: 'cleared_rights_only',
    aiTrainingOnLegacy: 'prohibited_without_specific_rights_clearance',
    samples: 'clearance_required',
    artistAccounting: 'transparent_ledger_required',
  },
  artistPrinciples: [
    'clear_contracts',
    'transparent_royalties',
    'creator_portability',
    'human_approval_for_release',
    'no_hidden_ai_voice_cloning',
    'credit_every_contributor',
    'accessible_creation_tools',
  ],
});

export function classifyReleaseRights({ isLegacyAsset = false, rightsCleared = false, newWorkContractSigned = false }) {
  if (isLegacyAsset) {
    return rightsCleared
      ? { status: 'CLEARED', canCommercialize: true }
      : { status: 'HOLD', canCommercialize: false, reason: 'legacy_rights_clearance_required' };
  }
  return newWorkContractSigned
    ? { status: 'CLEARED', canCommercialize: true }
    : { status: 'HOLD', canCommercialize: false, reason: 'new_work_contract_required' };
}

export function buildArtistRevenueMap({ grossRevenueUsd, directCostsUsd = 0, artistShareRate = 0.7, reserveRate = 0.05 }) {
  const gross = Math.max(0, Number(grossRevenueUsd || 0));
  const direct = Math.max(0, Number(directCostsUsd || 0));
  const netReceipts = Math.max(0, gross - direct);
  const reserve = Math.round(netReceipts * Math.max(0, Math.min(1, Number(reserveRate || 0))) * 100) / 100;
  const distributable = Math.max(0, netReceipts - reserve);
  const artistShare = Math.round(distributable * Math.max(0, Math.min(1, Number(artistShareRate || 0))) * 100) / 100;
  const labelShare = Math.round((distributable - artistShare) * 100) / 100;
  return { grossRevenueUsd: gross, netReceiptsUsd: netReceipts, reserveUsd: reserve, artistShareUsd: artistShare, labelShareUsd: labelShare };
}
