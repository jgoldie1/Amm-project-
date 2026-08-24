const releaseSha = process.env.TRYAMM_RELEASE_SHA || process.env.VERCEL_GIT_COMMIT_SHA || null;

function syntheticFlywheel() {
  const correlationId = 'tryamm-synthetic-flywheel-v1';
  const stages = [
    { order: 1, id: 'enter-world', status: 'synthetic-green', sessionId: `${correlationId}:session-a`, world: 'streetverse' },
    { order: 2, id: 'play', status: 'synthetic-green', missionId: `${correlationId}:mission-001` },
    { order: 3, id: 'capture', status: 'source-ready', mediaId: `${correlationId}:media-001`, realDeviceRequired: true },
    { order: 4, id: 'edit', status: 'source-ready', editId: `${correlationId}:edit-001`, realDeviceRequired: true },
    { order: 5, id: 'make-reel', status: 'source-ready', reelId: `${correlationId}:reel-001`, realReelRequired: true },
    { order: 6, id: 'save-to-phone', status: 'device-proof-required', reelId: `${correlationId}:reel-001`, realDeviceRequired: true },
    { order: 7, id: 'publish', status: 'device-proof-required', publicationId: `${correlationId}:publication-001`, realDeviceRequired: true },
    { order: 8, id: 'attribution', status: 'synthetic-green', attributionId: `${correlationId}:attribution-001`, creatorContinuity: true },
    { order: 9, id: 'commerce', status: 'synthetic-green', orderId: `${correlationId}:order-001`, realCashMoved: false },
    { order: 10, id: 'money-engine', status: 'synthetic-green', ledgerRef: `${correlationId}:ledger-001`, financialTruthProtected: true, realCashMoved: false },
    { order: 11, id: 'wallet', status: 'synthetic-green', distributionStatus: 'pending', withdrawable: false, realCashMoved: false },
    { order: 12, id: 'ownership-opportunity', status: 'synthetic-green', ownershipStatus: 'proposal-only', realOwnershipSettled: false },
    { order: 13, id: 'reinvest', status: 'synthetic-green', reinvestmentStatus: 'proposal-only', realCashMoved: false },
    { order: 14, id: 'return-to-world', status: 'device-proof-required', sessionId: `${correlationId}:session-b`, world: 'streetverse', continuityPreserved: true, realDeviceRequired: true },
  ];

  const invariants = {
    orderedStages: stages.every((stage, index) => stage.order === index + 1),
    singleCorrelation: stages.every(stage => JSON.stringify(stage).includes(correlationId)),
    creatorAttributionContinuity: stages.find(stage => stage.id === 'attribution')?.creatorContinuity === true,
    financialTruthProtected: stages.find(stage => stage.id === 'money-engine')?.financialTruthProtected === true,
    walletNonWithdrawable: stages.find(stage => stage.id === 'wallet')?.withdrawable === false,
    ownershipProposalOnly: stages.find(stage => stage.id === 'ownership-opportunity')?.realOwnershipSettled === false,
    reinvestmentProposalOnly: stages.find(stage => stage.id === 'reinvest')?.realCashMoved === false,
    returnContinuityPreserved: stages.find(stage => stage.id === 'return-to-world')?.continuityPreserved === true,
    noRealCashMoved: stages.filter(stage => Object.prototype.hasOwnProperty.call(stage, 'realCashMoved')).every(stage => stage.realCashMoved === false),
    noRealOwnershipSettled: stages.find(stage => stage.id === 'ownership-opportunity')?.realOwnershipSettled === false,
  };

  return {
    schema: 'tryamm.flywheel-convergence.v1',
    mode: 'synthetic-non-settling',
    correlationId,
    releaseSha,
    loop: 'ENTER STREETVERSE → PLAY → CAPTURE MOMENT → EDIT → MAKE REEL → SAVE TO PHONE → PUBLISH → ATTRIBUTION → COMMERCE → MONEY ENGINE → WALLET → OWNERSHIP OPPORTUNITY → REINVEST → RETURN TO WORLD',
    stages,
    invariants,
    sourceReady: true,
    syntheticGreen: Object.values(invariants).every(Boolean),
    physicalProof: {
      realDeviceRequired: true,
      realReelRequired: true,
      saveToPhoneRequired: true,
      publishRequired: true,
      returnToWorldRequired: true,
      roundTripGreen: false,
      reason: 'Synthetic convergence cannot substitute for a real Reel, phone save, publish, and return-to-world test on the exact production SHA.',
    },
    financialSafety: {
      realCashMoved: false,
      realOwnershipSettled: false,
      walletDistribution: 'pending-non-withdrawable',
      ownership: 'opportunity/proposal-only',
      reinvestment: 'proposal-only',
    },
  };
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const proof = syntheticFlywheel();
  return res.status(proof.syntheticGreen ? 200 : 503).json({ ok: proof.syntheticGreen, ...proof });
}
