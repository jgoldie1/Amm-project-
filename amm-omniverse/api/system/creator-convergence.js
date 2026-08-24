export default function handler(_req, res) {
  const proof = {
    schema: 'tryamm.creator-convergence.v1',
    ok: true,
    creatorPipeline: {
      captureOrUpload: 'source-ready',
      edit: 'source-ready',
      effectsGreenScreen: 'source-ready',
      musicCaptionsStickers: 'source-ready',
      verticalRender: 'source-ready',
      publishCloudRecordAttribution: 'source-ready',
    },
    saveToPhone: {
      capabilityContract: true,
      realDeviceProofRequired: true,
      realDeviceCertified: false,
      reason: 'Physical iPhone/Android save-to-Photos-or-Files proof must be recorded for the exact live SHA.',
    },
    realReel: {
      deviceProofRequired: true,
      certified: false,
    },
    fullGreenEligible: false,
  }

  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json(proof)
}
